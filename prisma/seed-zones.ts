import 'dotenv/config'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'

try {
  const content = readFileSync(resolve(process.cwd(), '.env.local'), 'utf-8')
  for (const line of content.split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const eq = t.indexOf('=')
    if (eq === -1) continue
    const k = t.slice(0, eq).trim()
    const v = t.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
    if (k) process.env[k] = v
  }
} catch { /* no .env.local */ }

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }),
})

const zones = [
  { id: 'zone-1', name: 'Centro',  description: 'Área central de la ciudad', deliveryFee: 2.5, minOrder: 10, estimatedMin: 20, estimatedMax: 40 },
  { id: 'zone-2', name: 'Este',    description: 'Zona este',                 deliveryFee: 3.5, minOrder: 15, estimatedMin: 30, estimatedMax: 50 },
  { id: 'zone-3', name: 'Oeste',   description: 'Zona oeste',                deliveryFee: 3.5, minOrder: 15, estimatedMin: 30, estimatedMax: 50 },
  { id: 'zone-4', name: 'Norte',   description: 'Zona norte',                deliveryFee: 4.0, minOrder: 20, estimatedMin: 40, estimatedMax: 60 },
  { id: 'zone-5', name: 'Sur',     description: 'Zona sur',                  deliveryFee: 4.0, minOrder: 20, estimatedMin: 40, estimatedMax: 60 },
]

async function main() {
  for (const z of zones) {
    await prisma.deliveryZone.upsert({
      where: { id: z.id },
      update: { ...z, active: true },
      create: { ...z, active: true },
    })
    console.log('✓', z.name)
  }
  const total = await prisma.deliveryZone.count()
  console.log(`✅ ${total} zonas en la base de datos`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
