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
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "DeliveryRating" (
      "id"        TEXT PRIMARY KEY,
      "orderId"   TEXT NOT NULL UNIQUE REFERENCES "Order"("id") ON DELETE CASCADE,
      "userId"    TEXT NOT NULL REFERENCES "User"("id"),
      "driverId"  TEXT REFERENCES "User"("id") ON DELETE SET NULL,
      "rating"    INTEGER NOT NULL CHECK ("rating" BETWEEN 1 AND 5),
      "comment"   TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "DeliveryRating_driverId_idx" ON "DeliveryRating"("driverId")
  `)
  console.log('✅ DeliveryRating table ready')
}

main().catch(console.error).finally(() => prisma.$disconnect())
