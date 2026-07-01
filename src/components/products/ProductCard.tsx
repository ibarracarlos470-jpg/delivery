'use client'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCartStore } from '@/store/cart'
import { toast } from 'sonner'
import { useExchangeRate, formatBs } from '@/contexts/ExchangeRateContext'

type Product = {
  id: string
  name: string
  slug: string
  price: number
  salePrice: number | null
  images: string[]
  stock: number
  brand?: { name: string } | null
}

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCartStore()
  const { rate } = useExchangeRate()
  const hasDiscount = product.salePrice !== null && product.salePrice < product.price
  const discountPct = hasDiscount
    ? Math.round((1 - product.salePrice! / product.price) * 100)
    : 0

  const handleAdd = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      salePrice: product.salePrice,
      image: product.images[0] ?? '/placeholder.svg',
      stock: product.stock,
    })
    toast.success('Producto agregado al carrito')
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow flex flex-col">
      <Link
        href={`/producto/${product.slug}`}
        className="relative aspect-square overflow-hidden rounded-t-lg bg-gray-100 block"
      >
        {hasDiscount && (
          <Badge className="absolute top-2 left-2 z-10 bg-red-500 text-white">
            -{discountPct}%
          </Badge>
        )}
        <Image
          src={product.images[0] ?? '/placeholder.svg'}
          alt={product.name}
          fill
          className="object-contain p-4"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      </Link>

      <div className="p-3 flex flex-col flex-1">
        {product.brand && (
          <p className="text-xs text-gray-400 mb-1">{product.brand.name}</p>
        )}
        <Link
          href={`/producto/${product.slug}`}
          className="text-sm font-medium text-gray-800 hover:text-green-700 line-clamp-2 flex-1"
        >
          {product.name}
        </Link>

        <div className="mt-2 flex items-end justify-between gap-1">
          <div className="min-w-0">
            {hasDiscount ? (
              <>
                <p className="text-base font-bold text-green-700">${product.salePrice!.toFixed(2)}</p>
                {rate > 0 && <p className="text-xs text-blue-500 leading-tight truncate">{formatBs(product.salePrice!, rate)}</p>}
                <p className="text-xs text-gray-400 line-through">${product.price.toFixed(2)}</p>
              </>
            ) : (
              <>
                <p className="text-base font-bold text-green-700">${product.price.toFixed(2)}</p>
                {rate > 0 && <p className="text-xs text-blue-500 leading-tight truncate">{formatBs(product.price, rate)}</p>}
              </>
            )}
          </div>

          <Button
            size="sm"
            onClick={handleAdd}
            disabled={product.stock === 0}
            className="bg-green-600 hover:bg-green-700 h-8 w-8 p-0 shrink-0"
          >
            <ShoppingCart size={15} />
          </Button>
        </div>

        {product.stock === 0 && (
          <p className="text-xs text-red-500 mt-1">Agotado</p>
        )}
      </div>
    </div>
  )
}
