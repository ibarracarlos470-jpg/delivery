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
  const driver = await prisma.user.upsert({
    where: { email: 'driver.prueba@tumarca.com' },
    update: { role: 'DRIVER' },
    create: {
      clerkId: 'driver_test_001',
      email: 'driver.prueba@tumarca.com',
      name: 'Carlos Repartidor',
      phone: '+58 412 000 0001',
      role: 'DRIVER',
    },
  })
  console.log(`✅ Driver creado: ${driver.name} (${driver.email}) — id: ${driver.id}`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
