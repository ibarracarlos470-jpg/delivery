import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const salud = await prisma.category.upsert({
    where: { slug: 'salud-medicamentos' },
    update: {},
    create: { name: 'Salud y Medicamentos', slug: 'salud-medicamentos' },
  })
  const belleza = await prisma.category.upsert({
    where: { slug: 'belleza' },
    update: {},
    create: { name: 'Belleza', slug: 'belleza' },
  })
  const bebe = await prisma.category.upsert({
    where: { slug: 'cuidado-bebe' },
    update: {},
    create: { name: 'Cuidado del Bebé', slug: 'cuidado-bebe' },
  })
  const personal = await prisma.category.upsert({
    where: { slug: 'cuidado-personal' },
    update: {},
    create: { name: 'Cuidado Personal', slug: 'cuidado-personal' },
  })
  const alimentos = await prisma.category.upsert({
    where: { slug: 'alimentos-bebidas' },
    update: {},
    create: { name: 'Alimentos y Bebidas', slug: 'alimentos-bebidas' },
  })
  const hogar = await prisma.category.upsert({
    where: { slug: 'hogar-mascotas' },
    update: {},
    create: { name: 'Hogar, Mascotas y Otros', slug: 'hogar-mascotas' },
  })

  const bayer = await prisma.brand.upsert({
    where: { slug: 'bayer' },
    update: {},
    create: { name: 'Bayer', slug: 'bayer' },
  })
  const johnson = await prisma.brand.upsert({
    where: { slug: 'johnson-johnson' },
    update: {},
    create: { name: 'Johnson & Johnson', slug: 'johnson-johnson' },
  })

  const products = [
    { name: 'Aspirina 500mg x 20 tab', slug: 'aspirina-500mg-20-tab', price: 2.5, salePrice: 1.99, stock: 100, categoryId: salud.id, brandId: bayer.id, featured: true, images: [] as string[] },
    { name: 'Paracetamol 1g x 10 tab', slug: 'paracetamol-1g-10-tab', price: 1.8, salePrice: null, stock: 200, categoryId: salud.id, brandId: null, featured: true, images: [] as string[] },
    { name: 'Vitamina C 1000mg x 30 tab', slug: 'vitamina-c-1000mg-30-tab', price: 5.99, salePrice: 4.99, stock: 150, categoryId: salud.id, brandId: null, featured: true, images: [] as string[] },
    { name: 'Shampoo Pantene 400ml', slug: 'shampoo-pantene-400ml', price: 3.5, salePrice: null, stock: 80, categoryId: belleza.id, brandId: null, featured: false, images: [] as string[] },
    { name: 'Crema Nivea Aclarante 200ml', slug: 'crema-nivea-aclarante-200ml', price: 4.2, salePrice: 3.5, stock: 60, categoryId: belleza.id, brandId: null, featured: false, images: [] as string[] },
    { name: 'Pañales Pampers Talla 2 x 30', slug: 'panales-pampers-talla2-30', price: 12.0, salePrice: null, stock: 50, categoryId: bebe.id, brandId: null, featured: true, images: [] as string[] },
    { name: 'Johnson Baby Lotion 200ml', slug: 'johnson-baby-lotion-200ml', price: 3.8, salePrice: null, stock: 90, categoryId: bebe.id, brandId: johnson.id, featured: false, images: [] as string[] },
    { name: 'Colgate Total 12 150ml', slug: 'colgate-total-12-150ml', price: 2.9, salePrice: null, stock: 120, categoryId: personal.id, brandId: null, featured: false, images: [] as string[] },
    { name: 'Avena Quaker 800g', slug: 'avena-quaker-800g', price: 2.1, salePrice: null, stock: 70, categoryId: alimentos.id, brandId: null, featured: false, images: [] as string[] },
    { name: 'Desinfectante Lysol 1L', slug: 'desinfectante-lysol-1l', price: 3.2, salePrice: null, stock: 45, categoryId: hogar.id, brandId: null, featured: false, images: [] as string[] },
  ]

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: { ...p, description: `Descripción de ${p.name}` },
    })
  }

  await prisma.banner.createMany({
    skipDuplicates: true,
    data: [
      { title: 'Delivery 24/7', image: '/banners/delivery.jpg', targetUrl: '/', active: true, order: 0 },
      { title: 'Ofertas de la semana', image: '/banners/ofertas.jpg', targetUrl: '/ofertas', active: true, order: 1 },
      { title: 'Programa Cuidamos tu Salud', image: '/banners/salud.jpg', targetUrl: '/categoria/salud-medicamentos', active: true, order: 2 },
    ],
  })

  console.log('✅ Seed completado')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
