import { prisma } from '@/lib/prisma'
import ProductGrid from '@/components/products/ProductGrid'
import Link from 'next/link'

export default async function FeaturedProducts() {
  const [featured, onSale] = await Promise.all([
    prisma.product.findMany({
      where: { featured: true, active: true },
      include: { brand: { select: { name: true } }, branch: { select: { city: true, name: true } } },
      take: 8,
    }),
    prisma.product.findMany({
      where: { salePrice: { not: null }, active: true },
      include: { brand: { select: { name: true } }, branch: { select: { city: true, name: true } } },
      orderBy: { salePrice: 'asc' },
      take: 4,
    }),
  ])

  return (
    <>
      {onSale.length > 0 && (
        <section className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔥</span>
              <h2 className="text-2xl font-bold text-gray-800">En Oferta</h2>
            </div>
            <Link href="/ofertas" className="text-orange-500 hover:text-orange-600 text-sm font-semibold">
              Ver todas →
            </Link>
          </div>
          <ProductGrid products={onSale} />
        </section>
      )}

      {featured.length > 0 && (
        <section className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⭐</span>
              <h2 className="text-2xl font-bold text-gray-800">Destacados</h2>
            </div>
            <Link href="/categoria/salud-medicamentos" className="text-green-700 hover:text-green-800 text-sm font-semibold">
              Ver todos →
            </Link>
          </div>
          <ProductGrid products={featured} />
        </section>
      )}
    </>
  )
}
