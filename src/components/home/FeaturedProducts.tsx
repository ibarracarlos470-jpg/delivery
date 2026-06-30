import { prisma } from '@/lib/prisma'
import ProductGrid from '@/components/products/ProductGrid'
import Link from 'next/link'

export default async function FeaturedProducts() {
  const products = await prisma.product.findMany({
    where: { featured: true, active: true },
    include: { brand: { select: { name: true } } },
    take: 10,
  })

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Productos Destacados</h2>
        <Link href="/categoria/salud-medicamentos" className="text-green-700 hover:underline text-sm font-medium">
          Ver todos →
        </Link>
      </div>
      <ProductGrid products={products} />
    </section>
  )
}
