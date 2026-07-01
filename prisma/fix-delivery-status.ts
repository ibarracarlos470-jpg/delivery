import { readFileSync } from 'fs'
import { resolve } from 'path'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'

try {
  const c = readFileSync(resolve(process.cwd(), '.env.local'), 'utf-8')
  for (const line of c.split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const eq = t.indexOf('=')
    if (eq === -1) continue
    const k = t.slice(0, eq).trim()
    const v = t.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
    if (k) process.env[k] = v
  }
} catch { /* */ }

const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })

async function main() {
  console.log('Migrating Delivery.status from OrderStatus_old to OrderStatus...')

  // Step 1: drop defaults so the type cast is allowed
  await prisma.$executeRawUnsafe(`ALTER TABLE "Delivery" ALTER COLUMN "status" DROP DEFAULT`)
  console.log('✓ Dropped Delivery.status default')

  // Step 2: cast the column to the correct enum
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Delivery"
      ALTER COLUMN "status" TYPE "OrderStatus"
      USING "status"::text::"OrderStatus"
  `)
  console.log('✓ Delivery.status type changed to OrderStatus')

  // Step 3: restore the default
  await prisma.$executeRawUnsafe(`ALTER TABLE "Delivery" ALTER COLUMN "status" SET DEFAULT 'PENDING'::"OrderStatus"`)
  console.log('✓ Restored Delivery.status default')

  // Same for Order.status if needed
  const orderCols = await prisma.$queryRawUnsafe(`
    SELECT column_name::text, udt_name::text
    FROM information_schema.columns
    WHERE table_name = 'Order' AND column_name = 'status'
  `) as Array<{ column_name: string; udt_name: string }>
  console.log('Order.status type:', orderCols)

  if (orderCols[0]?.udt_name === 'OrderStatus_old') {
    await prisma.$executeRawUnsafe(`ALTER TABLE "Order" ALTER COLUMN "status" DROP DEFAULT`)
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Order"
        ALTER COLUMN "status" TYPE "OrderStatus"
        USING "status"::text::"OrderStatus"
    `)
    await prisma.$executeRawUnsafe(`ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'PENDING'::"OrderStatus"`)
    console.log('✓ Order.status migrated to OrderStatus')
  }

  // Now try to drop the old enum (should work now)
  try {
    await prisma.$executeRawUnsafe(`DROP TYPE IF EXISTS "OrderStatus_old"`)
    console.log('✓ OrderStatus_old enum dropped')
  } catch (e) {
    console.log('Could not drop OrderStatus_old (may still be in use):', (e as Error).message)
  }

  console.log('✅ Migration complete')
}

main().catch(console.error).finally(() => prisma.$disconnect())
