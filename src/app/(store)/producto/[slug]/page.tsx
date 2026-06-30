import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import AddToCartButton from '@/components/products/AddToCartButton'

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { brand: true, category: true },
  })
  if (!product || !product.active) notFound()

  const hasDiscount = product.salePrice !== null && product.salePrice < product.price
  const discountPct = hasDiscount ? Math.round((1 - product.salePrice! / product.price) * 100) : 0

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative aspect-square bg-white rounded-xl border overflow-hidden">
          <Image
            src={product.images[0] ?? '/placeholder.svg'}
            alt={product.name}
            fill
            className="object-contain p-8"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          {hasDiscount && (
            <Badge className="absolute top-4 left-4 bg-red-500 text-white text-base px-3 py-1">
              -{discountPct}%
            </Badge>
          )}
        </div>

        <div className="flex flex-col">
          {product.brand && <p className="text-sm text-gray-500 mb-1">{product.brand.name}</p>}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{product.name}</h1>

          <div className="mb-6">
            {hasDiscount ? (
              <div>
                <span className="text-3xl font-bold text-green-700">${product.salePrice!.toFixed(2)}</span>
                <span className="ml-3 text-lg text-gray-400 line-through">${product.price.toFixed(2)}</span>
              </div>
            ) : (
              <span className="text-3xl font-bold text-green-700">${product.price.toFixed(2)}</span>
            )}
          </div>

          {product.description && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Descripción</h3>
              <p className="text-gray-600">{product.description}</p>
            </div>
          )}

          <div className="mt-auto">
            <AddToCartButton product={product} />
          </div>
        </div>
      </div>
    </div>
  )
}
