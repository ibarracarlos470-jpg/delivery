'use client'
import Image from 'next/image'
import Link from 'next/link'
import { Plus, MapPin } from 'lucide-react'
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
  branch?: { city: string; name: string } | null
}

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCartStore()
  const { rate } = useExchangeRate()
  const hasDiscount = product.salePrice !== null && product.salePrice < product.price
  const discountPct = hasDiscount
    ? Math.round((1 - product.salePrice! / product.price) * 100)
    : 0
  const activePrice = hasDiscount ? product.salePrice! : product.price
  const outOfStock = product.stock === 0

  const handleAdd = () => {
    if (outOfStock) return
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      salePrice: product.salePrice,
      image: product.images[0] ?? '/placeholder.svg',
      stock: product.stock,
    })
    toast.success(`${product.name.slice(0, 30)} agregado`)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-green-200 transition-all duration-200 flex flex-col group">
      {/* Image */}
      <Link href={`/producto/${product.slug}`} className="relative block overflow-hidden rounded-t-xl bg-gray-50">
        <div className="aspect-square relative">
          <Image
            src={product.images[0] ?? '/placeholder.svg'}
            alt={product.name}
            fill
            className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        </div>
        {hasDiscount && (
          <Badge className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-lg shadow">
            -{discountPct}%
          </Badge>
        )}
        {outOfStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="bg-gray-700 text-white text-xs font-bold px-3 py-1 rounded-full">Agotado</span>
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1 gap-1.5">
        <div className="flex items-center justify-between gap-1">
          {product.brand && (
            <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide truncate">{product.brand.name}</p>
          )}
          {product.branch && (
            <span className="shrink-0 flex items-center gap-0.5 text-[10px] text-green-700 bg-green-50 px-1.5 py-0.5 rounded-full font-medium">
              <MapPin size={9} />
              {product.branch.city}
            </span>
          )}
        </div>
        <Link href={`/producto/${product.slug}`}
          className="text-xs sm:text-sm font-medium text-gray-800 hover:text-green-700 line-clamp-2 leading-snug flex-1 transition-colors">
          {product.name}
        </Link>

        {/* Price row */}
        <div className="flex items-end justify-between gap-1 mt-auto pt-1">
          <div className="min-w-0">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-base font-extrabold text-green-700">${activePrice.toFixed(2)}</span>
              {hasDiscount && (
                <span className="text-xs text-gray-400 line-through">${product.price.toFixed(2)}</span>
              )}
            </div>
            {rate > 0 && (
              <p className="text-[11px] text-blue-500 font-medium leading-tight truncate">
                {formatBs(activePrice, rate)}
              </p>
            )}
          </div>

          <button
            onClick={handleAdd}
            disabled={outOfStock}
            className={`shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all active:scale-90 ${
              outOfStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow'
            }`}
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
