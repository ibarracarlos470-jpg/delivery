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
    CREATE TABLE IF NOT EXISTS "ChatMessage" (
      "id"         TEXT PRIMARY KEY,
      "orderId"    TEXT NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE,
      "senderId"   TEXT NOT NULL REFERENCES "User"("id"),
      "senderRole" TEXT NOT NULL,
      "message"    TEXT NOT NULL,
      "createdAt"  TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `)
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "ChatMessage_orderId_idx" ON "ChatMessage"("orderId")
  `)
  console.log('✅ ChatMessage table ready')
}

main().catch(console.error).finally(() => prisma.$disconnect())
