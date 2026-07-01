'use client'
import { useEffect, useState, useCallback } from 'react'
import { MapPin, Phone, Package, Clock, CheckCircle, Truck, RefreshCw, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useUser } from '@clerk/nextjs'
import OrderChat from '@/components/chat/OrderChat'

type OrderItem = { quantity: number; product: { name: string } }
type Zone = { name: string; estimatedMin: number; estimatedMax: number } | null
type Customer = { name: string | null; phone: string | null }

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
  user: Customer
}

type CompletedOrder = {
  id: string
  total: number
  zone: { name: string } | null
  delivery: { deliveredAt: string | null } | null
}

const STATUS_LABEL: Record<string, string> = {
  CONFIRMED: 'Confirmado — listo para recoger',
  PREPARING: 'En preparación',
  ON_THE_WAY: 'En camino',
}

export default function DriverDashboard() {
  const { user } = useUser()
  const [available, setAvailable] = useState<Order[]>([])
  const [active, setActive] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState<string | null>(null)

  const load = useCallback(async () => {
    const res = await fetch('/api/driver/orders')
    const data = await res.json()
    setAvailable(data.available ?? [])
    setActive(data.active ?? null)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    const interval = setInterval(load, 30000)
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

  return (
    <>
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Mis Pedidos</h1>
        <button onClick={load} className="text-gray-400 hover:text-orange-500 transition-colors">
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Active delivery */}
      {active && (
        <div>
          <p className="text-xs font-bold text-orange-600 uppercase tracking-wide mb-2">Entrega activa</p>
          <div className="bg-orange-50 border-2 border-orange-400 rounded-2xl p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-bold text-gray-800">#{active.id.slice(-6).toUpperCase()}</p>
                <p className="text-sm text-orange-600 font-medium mt-0.5">
                  {STATUS_LABEL[active.delivery?.status ?? ''] ?? active.delivery?.status}
                </p>
              </div>
              <p className="font-black text-green-700 text-lg">${active.total.toFixed(2)}</p>
            </div>

            {/* Customer */}
            <div className="bg-white rounded-xl p-3 space-y-1.5 text-sm">
              <p className="flex items-center gap-2 text-gray-700">
                <User size={14} className="text-orange-400 shrink-0" />
                {active.shippingAddress.name}
              </p>
              <a href={`tel:${active.shippingAddress.phone}`}
                className="flex items-center gap-2 text-orange-600 font-medium">
                <Phone size={14} className="shrink-0" />
                {active.shippingAddress.phone}
              </a>
              <p className="flex items-start gap-2 text-gray-600">
                <MapPin size={14} className="text-orange-400 shrink-0 mt-0.5" />
                {active.shippingAddress.address}, {active.shippingAddress.city}
              </p>
              {active.deliveryNote && (
                <p className="text-gray-400 italic text-xs pl-5">"{active.deliveryNote}"</p>
              )}
            </div>

            {/* Items summary */}
            <div className="text-sm text-gray-500">
              <p className="font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Package size={13} /> Productos ({active.items.reduce((a, i) => a + i.quantity, 0)})
              </p>
              <ul className="space-y-0.5 pl-5">
                {active.items.map((item, i) => (
                  <li key={i} className="text-xs">x{item.quantity} {item.product.name}</li>
                ))}
              </ul>
            </div>

            {/* Action button */}
            {active.delivery?.status === 'PREPARING' ? (
              <Button onClick={() => doAction(active.id, 'pickup')}
                disabled={acting === active.id + 'pickup'}
                className="w-full bg-orange-500 hover:bg-orange-600 h-12 text-base gap-2">
                <Truck size={18} />
                {acting === active.id + 'pickup' ? 'Procesando...' : 'Salir a entregar'}
              </Button>
            ) : (
              <Button onClick={() => doAction(active.id, 'deliver')}
                disabled={acting === active.id + 'deliver'}
                className="w-full bg-green-600 hover:bg-green-700 h-12 text-base gap-2">
                <CheckCircle size={18} />
                {acting === active.id + 'deliver' ? 'Procesando...' : 'Marcar como entregado'}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Available orders */}
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
          Pedidos disponibles ({available.length})
        </p>

        {available.length === 0 && !active && (
          <div className="bg-white rounded-2xl p-8 text-center">
            <Clock size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Sin pedidos por ahora</p>
            <p className="text-sm text-gray-400 mt-1">Se actualizará automáticamente cada 30s</p>
          </div>
        )}

        {available.length === 0 && active && (
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
                    {order.zone && ` · ${order.zone.name} · ${order.zone.estimatedMin}–${order.zone.estimatedMax} min`}
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
                <p className="flex items-center gap-2 text-xs text-gray-400 pl-5">
                  {order.items.reduce((a, i) => a + i.quantity, 0)} productos ·
                  {' '}{order.items.slice(0, 2).map(i => i.product.name).join(', ')}
                  {order.items.length > 2 ? '...' : ''}
                </p>
              </div>

              <Button
                onClick={() => doAction(order.id, 'accept')}
                disabled={!!active || acting === order.id + 'accept'}
                className="w-full bg-orange-500 hover:bg-orange-600 h-10 gap-2"
                variant="default">
                <Truck size={16} />
                {acting === order.id + 'accept' ? 'Aceptando...' : 'Aceptar pedido'}
              </Button>

              {active && (
                <p className="text-xs text-center text-gray-400">
                  Entrega tu pedido actual primero
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>

    {active && !['DELIVERED', 'CANCELLED'].includes(active.delivery?.status ?? '') && (
      <OrderChat
        orderId={active.id}
        myRole="DRIVER"
        myName={user?.fullName ?? 'Repartidor'}
      />
    )}
    </>
  )
}
