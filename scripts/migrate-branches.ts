import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'
dotenv.config()

const sql = neon(process.env.DATABASE_URL!)

async function main() {
  console.log('Migrando: multi-sede (Branch)...')

  await sql`ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'SUPER_ADMIN'`
  console.log('✓ Rol SUPER_ADMIN agregado')

  await sql`
    CREATE TABLE IF NOT EXISTS "Branch" (
      "id"        TEXT NOT NULL,
      "name"      TEXT NOT NULL,
      "slug"      TEXT NOT NULL,
      "city"      TEXT NOT NULL,
      "state"     TEXT NOT NULL,
      "address"   TEXT,
      "phone"     TEXT,
      "email"     TEXT,
      "lat"       DOUBLE PRECISION,
      "lng"       DOUBLE PRECISION,
      "isActive"  BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
    )
  `
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS "Branch_slug_key" ON "Branch"("slug")`
  console.log('✓ Tabla Branch creada')

  await sql`ALTER TABLE "User"         ADD COLUMN IF NOT EXISTS "branchId" TEXT`
  await sql`ALTER TABLE "Product"      ADD COLUMN IF NOT EXISTS "branchId" TEXT`
  await sql`ALTER TABLE "Order"        ADD COLUMN IF NOT EXISTS "branchId" TEXT`
  await sql`ALTER TABLE "DeliveryZone" ADD COLUMN IF NOT EXISTS "branchId" TEXT`
  console.log('✓ Columnas branchId agregadas')

  // Foreign keys (ignora si ya existen)
  for (const [table] of [['User'], ['Product'], ['Order'], ['DeliveryZone']]) {
    try {
      await sql.unsafe(`
        ALTER TABLE "${table}" ADD CONSTRAINT "${table}_branchId_fkey"
        FOREIGN KEY ("branchId") REFERENCES "Branch"("id")
        ON DELETE SET NULL ON UPDATE CASCADE
      `)
    } catch { /* ya existe */ }
  }
  console.log('✓ Foreign keys creadas')

  // Seed: primera sede
  const existing = await sql`SELECT id FROM "Branch" WHERE slug = 'nueva-esparta'`
  if (existing.length === 0) {
    await sql`
      INSERT INTO "Branch" ("id","name","slug","city","state","lat","lng","updatedAt")
      VALUES (
        'branch_nueva_esparta',
        'TuMarca Nueva Esparta',
        'nueva-esparta',
        'Porlamar',
        'Nueva Esparta',
        10.9578,
        -63.8672,
        CURRENT_TIMESTAMP
      )
    `
    console.log('✓ Sede Nueva Esparta creada')
  }

  console.log('\n✅ Migración completada')
}

main().catch(e => { console.error(e); process.exit(1) })
