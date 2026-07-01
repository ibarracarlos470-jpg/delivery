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
  const email = 'ibarracarlos470@gmail.com'

  const user = await prisma.user.findFirst({ where: { email } })
  if (!user) {
    console.log('Usuario no encontrado en la BD. Asegúrate de haber iniciado sesión en la app primero.')
    return
  }

  await prisma.user.update({ where: { id: user.id }, data: { role: 'ADMIN' } })
  console.log(`✅ ${email} → ADMIN`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
