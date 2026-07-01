'use client'
import { useEffect, useState, useCallback } from 'react'
import { MapPin, Phone, Package, Clock, CheckCircle, Truck, RefreshCw, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useUser } from '@clerk/nextjs'
import OrderChat from '@/components/chat/OrderChat'

type OrderItem = { quantity: number; product: { name: string } }
type Zone = { name: string; estimatedMin: number; estimatedMax: number } | null

type Order = {
  id: string
  total: number
  deliveryFee: number
  createdAt: string
  shippingAddress: { name: string; phone: string; address: string; city: string }
  deliveryNote: string | null
  zone: Zone
  delivery: { status: string; driverId: string | null } | null
  items: OrderItem[]
  user: { name: string | null; phone: string | null }
}

const STATUS_LABEL: Record<string, string> = {
  CONFIRMED: 'Listo para recoger',
  PREPARING: 'En preparación',
  ON_THE_WAY: 'En camino',
}

const MAX_ACTIVE = 3

export default function DriverDashboard() {
  const { user } = useUser()
  const [available, setAvailable] = useState<Order[]>([])
  const [actives, setActives] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState<string | null>(null)
  const [chatOrderId, setChatOrderId] = useState<string | null>(null)

  const load = useCallback(async () => {
    const res = await fetch('/api/driver/orders')
    const data = await res.json()
    setAvailable(data.available ?? [])
    setActives(data.active ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    const interval = setInterval(load, 5000)
    return () => clearInterval(interval)
  }, [load])

  async function doAction(orderId: string, action: 'accept' | 'pickup' | 'deliver') {
    setActing(orderId + action)
    try {
      const res = await fetch(`/api/driver/orders/${orderId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error ?? 'Error')
        return
      }
      const msgs = { accept: 'Pedido aceptado', pickup: '¡En camino!', deliver: '¡Entregado!' }
      toast.success(msgs[action])
      await load()
    } finally {
      setActing(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 animate-pulse h-36" />
        ))}
      </div>
    )
  }

  const atLimit = actives.length >= MAX_ACTIVE
  const chatOrder = chatOrderId ? actives.find(o => o.id === chatOrderId) ?? actives[0] : actives[0]

  return (
    <>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Mis Pedidos</h1>
            {actives.length > 0 && (
              <p className="text-xs text-orange-500 font-medium mt-0.5">
                {actives.length}/{MAX_ACTIVE} activos
              </p>
            )}
          </div>
          <button onClick={load} className="text-gray-400 hover:text-orange-500 transition-colors">
            <RefreshCw size={18} />
          </button>
        </div>

        {/* Active deliveries */}
        {actives.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-bold text-orange-600 uppercase tracking-wide">
              Entregas activas ({actives.length}/{MAX_ACTIVE})
            </p>
            {actives.map(order => (
              <div key={order.id} className="bg-orange-50 border-2 border-orange-400 rounded-2xl p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-gray-800">#{order.id.slice(-6).toUpperCase()}</p>
                    <p className="text-sm text-orange-600 font-medium mt-0.5">
                      {STATUS_LABEL[order.delivery?.status ?? ''] ?? order.delivery?.status}
                    </p>
                  </div>
                  <p className="font-black text-green-700 text-lg">${order.total.toFixed(2)}</p>
                </div>

                <div className="bg-white rounded-xl p-3 space-y-1.5 text-sm">
                  <p className="flex items-center gap-2 text-gray-700">
                    <User size={14} className="text-orange-400 shrink-0" />
                    {order.shippingAddress.name}
                  </p>
                  {order.shippingAddress.phone && (
                    <a href={`tel:${order.shippingAddress.phone}`}
                      className="flex items-center gap-2 text-orange-600 font-medium">
                      <Phone size={14} className="shrink-0" />
                      {order.shippingAddress.phone}
                    </a>
                  )}
                  <p className="flex items-start gap-2 text-gray-600">
                    <MapPin size={14} className="text-orange-400 shrink-0 mt-0.5" />
                    {order.shippingAddress.address}, {order.shippingAddress.city}
                  </p>
                  {order.deliveryNote && (
                    <p className="text-gray-400 italic text-xs pl-5">"{order.deliveryNote}"</p>
                  )}
                </div>

                <div className="text-sm text-gray-500">
                  <p className="font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Package size={13} /> {order.items.reduce((a, i) => a + i.quantity, 0)} productos
                  </p>
                  <ul className="space-y-0.5 pl-5">
                    {order.items.map((item, i) => (
                      <li key={i} className="text-xs">x{item.quantity} {item.product.name}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-2">
                  {order.delivery?.status === 'PREPARING' ? (
                    <Button onClick={() => doAction(order.id, 'pickup')}
                      disabled={acting === order.id + 'pickup'}
                      className="flex-1 bg-orange-500 hover:bg-orange-600 h-11 gap-2">
                      <Truck size={16} />
                      {acting === order.id + 'pickup' ? 'Procesando...' : 'Salir a entregar'}
                    </Button>
                  ) : (
                    <Button onClick={() => doAction(order.id, 'deliver')}
                      disabled={acting === order.id + 'deliver'}
                      className="flex-1 bg-green-600 hover:bg-green-700 h-11 gap-2">
                      <CheckCircle size={16} />
                      {acting === order.id + 'deliver' ? 'Procesando...' : 'Entregado'}
                    </Button>
                  )}
                  <button onClick={() => setChatOrderId(order.id)}
                    className="px-3 bg-white border-2 border-orange-300 rounded-xl text-orange-500 text-xs font-semibold hover:bg-orange-50 transition-colors">
                    Chat
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Available orders */}
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
            Pedidos disponibles ({available.length})
          </p>

          {available.length === 0 && actives.length === 0 && (
            <div className="bg-white rounded-2xl p-8 text-center">
              <Clock size={40} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Sin pedidos por ahora</p>
              <p className="text-sm text-gray-400 mt-1">Se actualiza automáticamente cada 30s</p>
            </div>
          )}

          {available.length === 0 && actives.length > 0 && (
            <div className="bg-white rounded-2xl p-5 text-center text-sm text-gray-400">
              No hay más pedidos disponibles
            </div>
          )}

          <div className="space-y-3">
            {available.map(order => (
              <div key={order.id} className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-gray-800">#{order.id.slice(-6).toUpperCase()}</p>
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                      <Clock size={11} />
                      {new Date(order.createdAt).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-green-700">${order.total.toFixed(2)}</p>
                    <p className="text-xs text-orange-500 font-medium">Delivery: ${order.deliveryFee.toFixed(2)}</p>
                  </div>
                </div>

                <div className="text-sm text-gray-600 space-y-1">
                  <p className="flex items-center gap-2">
                    <MapPin size={13} className="text-gray-400 shrink-0" />
                    {order.shippingAddress.address}, {order.shippingAddress.city}
                  </p>
                  <p className="text-xs text-gray-400 pl-5">
                    {order.items.reduce((a, i) => a + i.quantity, 0)} productos ·{' '}
                    {order.items.slice(0, 2).map(i => i.product.name).join(', ')}
                    {order.items.length > 2 ? '...' : ''}
                  </p>
                </div>

                <Button onClick={() => doAction(order.id, 'accept')}
                  disabled={atLimit || acting === order.id + 'accept'}
                  className="w-full bg-orange-500 hover:bg-orange-600 h-10 gap-2">
                  <Truck size={16} />
                  {acting === order.id + 'accept' ? 'Aceptando...' : 'Aceptar pedido'}
                </Button>

                {atLimit && (
                  <p className="text-xs text-center text-amber-600 font-medium">
                    Límite de {MAX_ACTIVE} pedidos activos alcanzado
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {chatOrder && !['DELIVERED', 'CANCELLED'].includes(chatOrder.delivery?.status ?? '') && (
        <OrderChat
          orderId={chatOrder.id}
          myRole="DRIVER"
          myName={user?.fullName ?? 'Repartidor'}
        />
      )}
    </>
  )
}
