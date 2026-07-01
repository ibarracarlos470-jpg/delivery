'use client'
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Tag, Flame, SlidersHorizontal, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/store/cart'
import { toast } from 'sonner'

type Product = {
  id: string
  name: string
  slug: string
  price: number
  salePrice: number | null
  images: string[]
  stock: number
  discountPct: number
  brand: { name: string } | null
  category: { name: string; slug: string }
}

type Category = { name: string; slug: string }

const ORDEN_OPTIONS = [
  { value: '', label: 'Mayor descuento' },
  { value: 'precio-asc', label: 'Menor precio' },
  { value: 'precio-desc', label: 'Mayor precio' },
]

export default function OfertasClient({
  products,
  categories,
  totalSavings,
  currentCategoria,
  currentOrden,
}: {
  products: Product[]
  categories: Category[]
  totalSavings: number
  currentCategoria?: string
  currentOrden?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { addItem } = useCartStore()

  function navigate(params: Record<string, string>) {
    const sp = new URLSearchParams()
    if (params.categoria) sp.set('categoria', params.categoria)
    if (params.orden) sp.set('orden', params.orden)
    router.push(`${pathname}?${sp.toString()}`)
  }

  function handleAdd(p: Product) {
    addItem({
      id: p.id,
      name: p.name,
      price: p.price,
      salePrice: p.salePrice,
      image: p.images[0] ?? '/placeholder.svg',
      stock: p.stock,
    })
    toast.success('Agregado al carrito')
  }

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white">
        <div className="container mx-auto px-4 py-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Flame size={24} className="text-yellow-300" />
                <span className="text-sm font-semibold text-red-100 uppercase tracking-wide">Ofertas especiales</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black mb-1">
                {products.length} productos en oferta
              </h1>
              <p className="text-red-100 text-sm">
                Ahorra hasta ${totalSavings.toFixed(2)} en total
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center border border-white/20">
              <p className="text-3xl font-black text-yellow-300">
                {products.length > 0 ? Math.max(...products.map(p => p.discountPct)) : 0}%
              </p>
              <p className="text-xs text-red-100 mt-1">Descuento máximo</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6 items-center">
          <div className="flex items-center gap-1 text-gray-500 text-sm">
            <SlidersHorizontal size={15} /> Filtrar:
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate({ orden: currentOrden ?? '' })}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                !currentCategoria
                  ? 'bg-red-500 text-white border-red-500'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-red-300'
              }`}>
              Todas
            </button>
            {categories.map(cat => (
              <button
                key={cat.slug}
                onClick={() => navigate({ categoria: cat.slug, orden: currentOrden ?? '' })}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  currentCategoria === cat.slug
                    ? 'bg-red-500 text-white border-red-500'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-red-300'
                }`}>
                {cat.name}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select
            value={currentOrden ?? ''}
            onChange={e => navigate({ categoria: currentCategoria ?? '', orden: e.target.value })}
            className="ml-auto border rounded-lg px-3 py-1.5 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-red-300">
            {ORDEN_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Grid */}
        {products.length === 0 ? (
          <div className="text-center py-16">
            <Tag size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">No hay ofertas en esta categoría</p>
            <Link href="/ofertas">
              <Button variant="outline" className="mt-4">Ver todas las ofertas</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map(p => (
              <div key={p.id}
                className="bg-white rounded-xl border hover:shadow-md transition-shadow flex flex-col group">
                <Link href={`/producto/${p.slug}`}
                  className="relative aspect-square bg-gray-50 rounded-t-xl overflow-hidden block">
                  {/* Discount badge */}
                  <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs font-black px-2 py-1 rounded-lg shadow">
                    -{p.discountPct}%
                  </div>
                  <Image
                    src={p.images[0] ?? '/placeholder.svg'}
                    alt={p.name}
                    fill
                    className="object-contain p-3 group-hover:scale-105 transition-transform duration-200"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                </Link>

                <div className="p-3 flex flex-col flex-1">
                  {p.brand && (
                    <p className="text-xs text-gray-400 mb-0.5">{p.brand.name}</p>
                  )}
                  <Link href={`/producto/${p.slug}`}
                    className="text-sm font-medium text-gray-800 hover:text-red-600 line-clamp-2 flex-1 leading-tight">
                    {p.name}
                  </Link>

                  <div className="mt-2">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-black text-red-600">${p.salePrice!.toFixed(2)}</span>
                      <span className="text-xs text-gray-400 line-through">${p.price.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-green-600 font-medium">
                      Ahorras ${(p.price - p.salePrice!).toFixed(2)}
                    </p>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => handleAdd(p)}
                    disabled={p.stock === 0}
                    className="mt-2 w-full bg-red-500 hover:bg-red-600 h-8 text-xs gap-1">
                    <ShoppingCart size={13} />
                    {p.stock === 0 ? 'Agotado' : 'Agregar'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
