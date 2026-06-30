import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const productImages: Record<string, string[]> = {
  'aspirina-500mg-20-tab':         ['https://picsum.photos/seed/aspirina/400/400'],
  'paracetamol-1g-10-tab':         ['https://picsum.photos/seed/paracetamol/400/400'],
  'vitamina-c-1000mg-30-tab':      ['https://picsum.photos/seed/vitamina/400/400'],
  'shampoo-pantene-400ml':         ['https://picsum.photos/seed/pantene/400/400'],
  'crema-nivea-aclarante-200ml':   ['https://picsum.photos/seed/nivea/400/400'],
  'panales-pampers-talla2-30':     ['https://picsum.photos/seed/pampers/400/400'],
  'johnson-baby-lotion-200ml':     ['https://picsum.photos/seed/johnson/400/400'],
  'colgate-total-12-150ml':        ['https://picsum.photos/seed/colgate/400/400'],
  'avena-quaker-800g':             ['https://picsum.photos/seed/quaker/400/400'],
  'desinfectante-lysol-1l':        ['https://picsum.photos/seed/lysol/400/400'],
}

async function main() {
  for (const [slug, images] of Object.entries(productImages)) {
    await prisma.product.update({
      where: { slug },
      data: { images },
    })
    console.log(`✓ ${slug}`)
  }
  console.log('✅ Imágenes actualizadas')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
