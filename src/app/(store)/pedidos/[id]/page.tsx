'use client'
import { useEffect, useState, useRef, use } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Package, CheckCircle, Clock, Truck, MapPin, User, Phone, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUser } from '@clerk/nextjs'
import OrderChat from '@/components/chat/OrderChat'
import { toast } from 'sonner'
import { useExchangeRate, formatBs } from '@/contexts/ExchangeRateContext'

type OrderDetail = {
  id: string
  status: string
  subtotal: number
  deliveryFee: number
  total: number
  createdAt: string
  shippingAddress: { name: string; phone: string; address: string; city: string }
  deliveryNote: string | null
  zone: { name: string; estimatedMin: number; estimatedMax: number } | null
  delivery: {
    status: string
    confirmedAt: string | null
    preparedAt: string | null
    pickedUpAt: string | null
    deliveredAt: string | null
    driverNote: string | null
    driver: { name: string | null; phone: string | null } | null
  } | null
  items: Array<{
    id: string
    quantity: number
    unitPrice: number
    product: { name: string; images: string[]; slug: string }
  }>
  payment: { method: string; status: string; amount: number } | null
}

const STEPS = [
  { key: 'CONFIRMED',  label: 'Pedido recibido', icon: Package },
  { key: 'PREPARING',  label: 'Preparando',       icon: Clock },
  { key: 'ON_THE_WAY', label: 'En camino',        icon: Truck },
  { key: 'DELIVERED',  label: 'Entregado',        icon: CheckCircle },
]

const STATUS_ORDER = ['CONFIRMED', 'PREPARING', 'ON_THE_WAY', 'DELIVERED']

const PAYMENT_LABEL: Record<string, string> = {
  CASH: 'Efectivo', MOBILE_PAY: 'Pago Móvil', TRANSFER: 'Transferencia', CARD: 'Tarjeta',
}

const STATUS_MESSAGES: Record<string, string> = {
  CONFIRMED:  '✅ Pedido recibido y confirmado',
  PREPARING:  '📦 Tu pedido está siendo preparado',
  ON_THE_WAY: '🛵 ¡Tu repartidor está en camino!',
  DELIVERED:  '🎉 ¡Pedido entregado! Gracias por tu compra',
  CANCELLED:  '❌ Pedido cancelado',
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user } = useUser()
  const { rate } = useExchangeRate()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const prevStatusRef = useRef<string | null>(null)

  useEffect(() => {
    async function fetchOrder(initial = false) {
      try {
        const res = await fetch(`/api/orders/${id}`)
        const o: OrderDetail = await res.json()
        const newStatus = o.delivery?.status ?? o.status

        if (!initial && prevStatusRef.current && prevStatusRef.current !== newStatus) {
          const msg = STATUS_MESSAGES[newStatus]
          if (msg) toast(msg, { duration: 5000 })
        }
        prevStatusRef.current = newStatus
        setOrder(o)
      } finally {
        if (initial) setLoading(false)
      }
    }

    fetchOrder(true)

    // Poll every 5s while active, stop when done
    const interval = setInterval(async () => {
      const res = await fetch(`/api/orders/${id}`)
      const o: OrderDetail = await res.json()
      const newStatus = o.delivery?.status ?? o.status

      if (prevStatusRef.current && prevStatusRef.current !== newStatus) {
        const msg = STATUS_MESSAGES[newStatus]
        if (msg) toast(msg, { duration: 6000 })
      }
      prevStatusRef.current = newStatus
      setOrder(o)

      if (newStatus === 'DELIVERED' || newStatus === 'CANCELLED') clearInterval(interval)
    }, 5000)

    return () => clearInterval(interval)
  }, [id])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-32 bg-gray-100 rounded-xl" />
          <div className="h-48 bg-gray-100 rounded-xl" />
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-4">Pedido no encontrado</p>
        <Link href="/pedidos"><Button variant="outline">Mis pedidos</Button></Link>
      </div>
    )
  }

  const currentStatus = order.delivery?.status ?? order.status
  const currentStep = STATUS_ORDER.indexOf(currentStatus)
  const isCancelled = currentStatus === 'CANCELLED'

  return (
    <>
    <div className="container mx-auto px-4 py-8 max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/pedidos">
          <Button variant="ghost" size="icon"><ChevronLeft size={20} /></Button>
        </Link>
        <div>
          <h1 className="font-bold text-xl">Pedido #{order.id.slice(-6).toUpperCase()}</h1>
          <p className="text-sm text-gray-500">
            {new Date(order.createdAt).toLocaleDateString('es-VE', { dateStyle: 'long' })}
          </p>
        </div>
      </div>

      {/* Tracker */}
      {!isCancelled && (
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-semibold mb-5 text-gray-700">Estado del pedido</h2>
          <div className="relative">
            {/* Progress line */}
            <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200">
              <div
                className="h-full bg-green-500 transition-all duration-500"
                style={{ width: currentStep <= 0 ? '0%' : `${(currentStep / (STEPS.length - 1)) * 100}%` }}
              />
            </div>
            <div className="flex justify-between relative">
              {STEPS.map((step, i) => {
                const Icon = step.icon
                const done = i <= currentStep
                const active = i === currentStep
                return (
                  <div key={step.key} className="flex flex-col items-center gap-2 w-16">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all z-10 bg-white ${
                      done ? 'border-green-500 bg-green-500' : 'border-gray-300'
                    } ${active ? 'ring-4 ring-green-100' : ''}`}>
                      <Icon size={16} className={done ? 'text-white' : 'text-gray-400'} />
                    </div>
                    <p className={`text-xs text-center leading-tight ${done ? 'text-green-700 font-medium' : 'text-gray-400'}`}>
                      {step.label}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
          {order.zone && currentStatus !== 'DELIVERED' && (
            <p className="text-sm text-gray-500 text-center mt-4">
              Tiempo estimado: {order.zone.estimatedMin}–{order.zone.estimatedMax} min
            </p>
          )}
          {order.delivery?.driver && (
            <div className="mt-4 bg-green-50 rounded-lg p-3 flex items-center gap-3">
              <div className="bg-green-100 rounded-full p-2">
                <Truck size={16} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-800">
                  {order.delivery.driver.name ?? 'Tu repartidor'}
                </p>
                {order.delivery.driver.phone && (
                  <p className="text-xs text-green-600">{order.delivery.driver.phone}</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {isCancelled && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <p className="text-red-700 font-semibold">Pedido cancelado</p>
        </div>
      )}

      {/* Delivery address */}
      <div className="bg-white rounded-xl border p-5">
        <h2 className="font-semibold mb-3 flex items-center gap-2 text-gray-700">
          <MapPin size={16} className="text-green-600" /> Dirección de entrega
        </h2>
        <div className="space-y-1 text-sm text-gray-600">
          <p className="flex items-center gap-2"><User size={14} /> {order.shippingAddress.name}</p>
          <p className="flex items-center gap-2"><Phone size={14} /> {order.shippingAddress.phone}</p>
          <p className="flex items-center gap-2"><MapPin size={14} /> {order.shippingAddress.address}, {order.shippingAddress.city}</p>
          {order.deliveryNote && (
            <p className="text-gray-400 italic mt-1">Nota: {order.deliveryNote}</p>
          )}
          {order.zone && (
            <p className="mt-1 text-xs bg-green-50 text-green-700 inline-block px-2 py-0.5 rounded-full">
              Zona {order.zone.name}
            </p>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-xl border p-5">
        <h2 className="font-semibold mb-4 text-gray-700">Productos</h2>
        <div className="space-y-3">
          {order.items.map(item => (
            <div key={item.id} className="flex gap-3 items-center">
              <div className="relative w-14 h-14 shrink-0 bg-gray-50 rounded-lg overflow-hidden">
                {item.product.images[0] && (
                  <Image src={item.product.images[0]} alt={item.product.name} fill className="object-contain p-1" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium line-clamp-1">{item.product.name}</p>
                <p className="text-xs text-gray-400">x{item.quantity} — ${item.unitPrice.toFixed(2)} c/u</p>
              </div>
              <p className="text-sm font-semibold text-gray-800">
                ${(item.unitPrice * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl border p-5">
        <h2 className="font-semibold mb-3 text-gray-700">Resumen de pago</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-500">
            <span>Subtotal</span>
            <div className="text-right">
              <p>${order.subtotal.toFixed(2)}</p>
              {rate > 0 && <p className="text-xs text-blue-500">{formatBs(order.subtotal, rate)}</p>}
            </div>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Delivery</span>
            <div className="text-right">
              <p>${order.deliveryFee.toFixed(2)}</p>
              {rate > 0 && <p className="text-xs text-blue-500">{formatBs(order.deliveryFee, rate)}</p>}
            </div>
          </div>
          <div className="flex justify-between font-bold text-base border-t pt-2">
            <span>Total</span>
            <div className="text-right">
              <p className="text-green-700">${order.total.toFixed(2)}</p>
              {rate > 0 && <p className="text-xs text-blue-500 font-normal">{formatBs(order.total, rate)}</p>}
            </div>
          </div>
          {rate > 0 && (
            <p className="text-xs text-gray-400 text-center pt-1">Tasa BCV: Bs {rate.toFixed(2)} / $</p>
          )}
          {order.payment && (
            <div className="flex justify-between text-gray-400 text-xs pt-1">
              <span>Método</span>
              <span>{PAYMENT_LABEL[order.payment.method] ?? order.payment.method}</span>
            </div>
          )}
        </div>
      </div>

      <Link href="/" className="block">
        <Button variant="outline" className="w-full">Seguir comprando</Button>
      </Link>
    </div>

    {order.delivery?.driver && !['DELIVERED', 'CANCELLED'].includes(order.status) && (
      <OrderChat
        orderId={id}
        myRole="CUSTOMER"
        myName={user?.fullName ?? 'Cliente'}
      />
    )}
    </>
  )
}
