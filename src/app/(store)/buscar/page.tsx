export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import ProductGrid from '@/components/products/ProductGrid'

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const query = q?.trim() ?? ''

  const products = query
    ? await prisma.product.findMany({
        where: { active: true, name: { contains: query, mode: 'insensitive' } },
        include: {
          brand: { select: { name: true } },
          branch: { select: { city: true, name: true } },
        },
        take: 50,
      })
    : []

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">
        {query ? `Resultados para "${query}"` : 'Buscar productos'}
      </h1>
      {query && <p className="text-gray-500 mb-6">{products.length} productos encontrados</p>}
      <ProductGrid products={products} />
    </div>
  )
}
