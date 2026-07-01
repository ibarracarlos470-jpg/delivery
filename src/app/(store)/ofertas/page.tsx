export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import OfertasClient from './OfertasClient'

export default async function OfertasPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; orden?: string }>
}) {
  const { categoria, orden } = await searchParams

  const products = await prisma.product.findMany({
    where: {
      active: true,
      salePrice: { not: null },
      ...(categoria ? { category: { slug: categoria } } : {}),
    },
    include: {
      brand: { select: { name: true } },
      category: { select: { name: true, slug: true } },
      branch: { select: { city: true, name: true } },
    },
  })

  // Enrich with discount %
  const enriched = products
    .map(p => ({
      ...p,
      discountPct: Math.round((1 - p.salePrice! / p.price) * 100),
    }))
    .sort((a, b) => {
      if (orden === 'precio-asc') return (a.salePrice ?? a.price) - (b.salePrice ?? b.price)
      if (orden === 'precio-desc') return (b.salePrice ?? b.price) - (a.salePrice ?? a.price)
      return b.discountPct - a.discountPct // default: mayor descuento primero
    })

  // Categories that have offers
  const categories = await prisma.category.findMany({
    where: {
      products: {
        some: { active: true, salePrice: { not: null } },
      },
    },
    select: { name: true, slug: true },
    orderBy: { name: 'asc' },
  })

  const savings = enriched.reduce((acc, p) => acc + (p.price - p.salePrice!), 0)

  return (
    <OfertasClient
      products={enriched}
      categories={categories}
      totalSavings={savings}
      currentCategoria={categoria}
      currentOrden={orden}
    />
  )
}
