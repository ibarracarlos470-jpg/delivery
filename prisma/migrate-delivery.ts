import 'dotenv/config'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'

// Load .env.local (Next.js convention, takes priority)
try {
  const content = readFileSync(resolve(process.cwd(), '.env.local'), 'utf-8')
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '')
    if (key) process.env[key] = val
  }
} catch { /* no .env.local */ }

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Running delivery migration...')

  // 1. Add DRIVER to Role enum
  await prisma.$executeRawUnsafe(`ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'DRIVER'`)

  // 2. Add CASH to PaymentMethod enum
  await prisma.$executeRawUnsafe(`ALTER TYPE "PaymentMethod" ADD VALUE IF NOT EXISTS 'CASH'`)

  // 3. Create new OrderStatus enum with delivery states
  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'OrderStatus_new') THEN
        CREATE TYPE "OrderStatus_new" AS ENUM ('PENDING', 'CONFIRMED', 'PREPARING', 'ON_THE_WAY', 'DELIVERED', 'CANCELLED');
      END IF;
    END $$
  `)

  // 4. Alter Order.status to use new enum
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Order" ALTER COLUMN "status" DROP DEFAULT
  `)
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Order" ALTER COLUMN "status" TYPE "OrderStatus_new"
      USING (CASE "status"::text
        WHEN 'PROCESSING' THEN 'CONFIRMED'
        WHEN 'SHIPPED' THEN 'ON_THE_WAY'
        ELSE "status"::text
      END)::"OrderStatus_new"
  `)
  await prisma.$executeRawUnsafe(`ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'PENDING'`)

  // 5. Rename enums
  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'OrderStatus') THEN
        ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
      END IF;
    END $$
  `)
  await prisma.$executeRawUnsafe(`ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus"`)
  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'OrderStatus_old') THEN
        DROP TYPE "OrderStatus_old";
      END IF;
    END $$
  `)

  // 6. Add new columns to Order
  await prisma.$executeRawUnsafe(`ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "deliveryFee" DOUBLE PRECISION NOT NULL DEFAULT 0`)
  await prisma.$executeRawUnsafe(`ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "deliveryNote" TEXT`)
  await prisma.$executeRawUnsafe(`ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0`)
  await prisma.$executeRawUnsafe(`ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "zoneId" TEXT`)

  // Fix subtotal = total for existing orders
  await prisma.$executeRawUnsafe(`UPDATE "Order" SET "subtotal" = "total" WHERE "subtotal" = 0`)

  // 7. Add address to User
  await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "address" TEXT`)

  // 8. Create DeliveryZone table
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "DeliveryZone" (
      "id" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "description" TEXT,
      "deliveryFee" DOUBLE PRECISION NOT NULL,
      "minOrder" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "estimatedMin" INTEGER NOT NULL DEFAULT 30,
      "estimatedMax" INTEGER NOT NULL DEFAULT 60,
      "active" BOOLEAN NOT NULL DEFAULT true,
      CONSTRAINT "DeliveryZone_pkey" PRIMARY KEY ("id")
    )
  `)

  // 9. Add zoneId FK to Order
  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'Order_zoneId_fkey'
      ) THEN
        ALTER TABLE "Order" ADD CONSTRAINT "Order_zoneId_fkey"
          FOREIGN KEY ("zoneId") REFERENCES "DeliveryZone"("id") ON DELETE SET NULL ON UPDATE CASCADE;
      END IF;
    END $$
  `)

  // 10. Create Delivery table
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Delivery" (
      "id" TEXT NOT NULL,
      "orderId" TEXT NOT NULL,
      "driverId" TEXT,
      "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
      "confirmedAt" TIMESTAMP(3),
      "preparedAt" TIMESTAMP(3),
      "pickedUpAt" TIMESTAMP(3),
      "deliveredAt" TIMESTAMP(3),
      "driverNote" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Delivery_pkey" PRIMARY KEY ("id")
    )
  `)
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Delivery_orderId_key" ON "Delivery"("orderId")`)
  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'Delivery_orderId_fkey'
      ) THEN
        ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_orderId_fkey"
          FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
      END IF;
    END $$
  `)
  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'Delivery_driverId_fkey'
      ) THEN
        ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_driverId_fkey"
          FOREIGN KEY ("driverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
      END IF;
    END $$
  `)

  // 11. Seed delivery zones
  const zones = [
    { id: 'zone-1', name: 'Centro', description: 'Área central de la ciudad', deliveryFee: 2.5, minOrder: 10, estimatedMin: 20, estimatedMax: 40 },
    { id: 'zone-2', name: 'Este',   description: 'Zona este', deliveryFee: 3.5, minOrder: 15, estimatedMin: 30, estimatedMax: 50 },
    { id: 'zone-3', name: 'Oeste',  description: 'Zona oeste', deliveryFee: 3.5, minOrder: 15, estimatedMin: 30, estimatedMax: 50 },
    { id: 'zone-4', name: 'Norte',  description: 'Zona norte', deliveryFee: 4.0, minOrder: 20, estimatedMin: 40, estimatedMax: 60 },
    { id: 'zone-5', name: 'Sur',    description: 'Zona sur', deliveryFee: 4.0, minOrder: 20, estimatedMin: 40, estimatedMax: 60 },
  ]
  for (const z of zones) {
    await prisma.$executeRawUnsafe(`
      INSERT INTO "DeliveryZone" ("id","name","description","deliveryFee","minOrder","estimatedMin","estimatedMax","active")
      VALUES ('${z.id}','${z.name}','${z.description}',${z.deliveryFee},${z.minOrder},${z.estimatedMin},${z.estimatedMax},true)
      ON CONFLICT DO NOTHING
    `)
    console.log(`✓ Zone: ${z.name}`)
  }

  console.log('✅ Migration complete')
}

main().catch(console.error).finally(() => prisma.$disconnect())
