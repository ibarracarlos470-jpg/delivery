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
  const email = process.argv[2]
  const role = process.argv[3] as 'ADMIN' | 'DRIVER' | 'CUSTOMER'
  if (!email || !role) { console.log('Uso: npx tsx prisma/set-role.ts <email> <ADMIN|DRIVER|CUSTOMER>'); return }
  const u = await prisma.user.update({ where: { email }, data: { role } })
  console.log(`✅ ${u.email} → ${u.role}`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
