'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { Package, ChevronRight, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

type Order = {
  id: string
  status: string
  total: number
  createdAt: string
  items: Array<{ quantity: number; product: { name: string } }>
  delivery: { status: string } | null
}

const STATUS_LABEL: Record<string, string> = {
  PENDING:    'Pendiente',
  CONFIRMED:  'Confirmado',
  PREPARING:  'En preparación',
  ON_THE_WAY: 'En camino',
  DELIVERED:  'Entregado',
  CANCELLED:  'Cancelado',
}

const STATUS_COLOR: Record<string, string> = {
  PENDING:    'bg-yellow-100 text-yellow-800',
  CONFIRMED:  'bg-blue-100 text-blue-800',
  PREPARING:  'bg-purple-100 text-purple-800',
  ON_THE_WAY: 'bg-orange-100 text-orange-800',
  DELIVERED:  'bg-green-100 text-green-800',
  CANCELLED:  'bg-red-100 text-red-800',
}

export default function OrdersPage() {
  const { isSignedIn } = useUser()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSignedIn) return
    fetch('/api/orders')
      .then(r => r.json())
      .then(setOrders)
      .finally(() => setLoading(false))
  }, [isSignedIn])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border p-5 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-md">
        <Package size={64} className="text-gray-300 mx-auto mb-4" />
        <p className="text-xl font-bold text-gray-600 mb-2">Sin pedidos aún</p>
        <p className="text-gray-400 mb-6">Aquí verás tus pedidos una vez que realices una compra.</p>
        <Link href="/">
          <Button className="bg-green-600 hover:bg-green-700">Ir a comprar</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Mis Pedidos</h1>
      <div className="space-y-3">
        {orders.map(order => {
          const status = order.delivery?.status ?? order.status
          const itemCount = order.items.reduce((a, i) => a + i.quantity, 0)
          const firstItem = order.items[0]?.product.name ?? ''
          return (
            <Link key={order.id} href={`/pedidos/${order.id}`}>
              <div className="bg-white rounded-xl border p-5 hover:border-green-300 hover:shadow-sm transition-all cursor-pointer flex items-center gap-4">
                <div className="bg-green-50 rounded-lg p-3 shrink-0">
                  <Package size={24} className="text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {STATUS_LABEL[status] ?? status}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(order.createdAt).toLocaleDateString('es-VE', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-1">
                    {firstItem}{itemCount > 1 ? ` y ${itemCount - 1} más` : ''}
                  </p>
                  <p className="text-sm font-bold text-green-700 mt-1">${order.total.toFixed(2)}</p>
                </div>
                <ChevronRight size={18} className="text-gray-400 shrink-0" />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
