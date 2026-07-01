export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import ProductGrid from '@/components/products/ProductGrid'

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const category = await prisma.category.findUnique({ where: { slug } })
  if (!category) notFound()

  const products = await prisma.product.findMany({
    where: { categoryId: category.id, active: true },
    include: { brand: { select: { name: true } }, branch: { select: { city: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{category.name}</h1>
      <ProductGrid products={products} />
    </div>
  )
}
