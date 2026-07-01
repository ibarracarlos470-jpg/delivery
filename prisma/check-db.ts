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
  const cols = await prisma.$queryRawUnsafe(`
    SELECT column_name::text, udt_name::text
    FROM information_schema.columns
    WHERE table_name = 'Delivery'
    ORDER BY ordinal_position
  `) as Array<{ column_name: string; udt_name: string }>
  console.log('Delivery columns:', cols)

  const enums = await prisma.$queryRawUnsafe(`
    SELECT t.typname::text, e.enumlabel::text
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname ILIKE '%status%'
    ORDER BY t.typname, e.enumsortorder
  `) as Array<{ typname: string; enumlabel: string }>
  console.log('Status enums:', enums)

  const tables = await prisma.$queryRawUnsafe(`
    SELECT tablename::text FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename
  `) as Array<{ tablename: string }>
  console.log('Tables:', tables.map((t: { tablename: string }) => t.tablename))
}

main().catch(console.error).finally(() => prisma.$disconnect())
