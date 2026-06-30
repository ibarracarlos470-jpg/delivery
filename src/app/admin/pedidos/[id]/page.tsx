export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { MapPin, Phone, User, Truck, Clock } from 'lucide-react'
import AdminOrderActions from './AdminOrderActions'

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [order, drivers] = await Promise.all([
    prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        zone: true,
        delivery: { include: { driver: { select: { id: true, name: true } } } },
        items: { include: { product: { select: { name: true, images: true } } } },
        payment: true,
      },
    }),
    prisma.user.findMany({ where: { role: 'DRIVER' }, select: { id: true, name: true } }),
  ])

  if (!order) notFound()

  const deliveryStatus = order.delivery?.status ?? order.status
  const addr = order.shippingAddress as { name: string; phone: string; address: string; city: string }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Pedido #{order.id.slice(-6).toUpperCase()}
        </h1>
        <span className="text-sm text-gray-400">
          {order.createdAt.toLocaleDateString('es-VE', { dateStyle: 'long' })}
        </span>
      </div>

      {/* Status management */}
      <AdminOrderActions
        orderId={order.id}
        currentStatus={deliveryStatus}
        currentDriverId={order.delivery?.driverId ?? null}
        drivers={drivers}
      />

      {/* Client & address */}
      <div className="bg-white rounded-xl border p-5 grid sm:grid-cols-2 gap-5">
        <div>
          <h2 className="font-semibold text-gray-600 mb-3 flex items-center gap-2">
            <User size={15} /> Cliente
          </h2>
          <p className="font-medium">{order.user.name ?? 'Sin nombre'}</p>
          <p className="text-sm text-gray-500">{order.user.email}</p>
          {order.user.phone && <p className="text-sm text-gray-500">{order.user.phone}</p>}
        </div>
        <div>
          <h2 className="font-semibold text-gray-600 mb-3 flex items-center gap-2">
            <MapPin size={15} /> Dirección
          </h2>
          <p className="text-sm">{addr.name}</p>
          <p className="text-sm text-gray-500">{addr.phone}</p>
          <p className="text-sm text-gray-500">{addr.address}</p>
          <p className="text-sm text-gray-500">{addr.city}</p>
          {order.deliveryNote && (
            <p className="text-xs text-gray-400 mt-1 italic">Nota: {order.deliveryNote}</p>
          )}
        </div>
      </div>

      {/* Zone & delivery info */}
      {order.zone && (
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-semibold text-gray-600 mb-3 flex items-center gap-2">
            <Truck size={15} /> Zona de delivery
          </h2>
          <div className="flex gap-6 text-sm">
            <div><p className="text-gray-400">Zona</p><p className="font-medium">{order.zone.name}</p></div>
            <div><p className="text-gray-400">Tarifa</p><p className="font-medium">${order.zone.deliveryFee.toFixed(2)}</p></div>
            <div>
              <p className="text-gray-400 flex items-center gap-1"><Clock size={12} /> Estimado</p>
              <p className="font-medium">{order.zone.estimatedMin}–{order.zone.estimatedMax} min</p>
            </div>
          </div>
        </div>
      )}

      {/* Items */}
      <div className="bg-white rounded-xl border p-5">
        <h2 className="font-semibold text-gray-600 mb-4">Productos</h2>
        <div className="space-y-3">
          {order.items.map(item => (
            <div key={item.id} className="flex gap-3 items-center">
              <div className="relative w-12 h-12 shrink-0 bg-gray-50 rounded">
                {item.product.images[0] && (
                  <Image src={item.product.images[0]} alt={item.product.name} fill className="object-contain p-1" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium line-clamp-1">{item.product.name}</p>
                <p className="text-xs text-gray-400">x{item.quantity} — ${item.unitPrice.toFixed(2)}</p>
              </div>
              <p className="font-semibold text-sm">${(item.unitPrice * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>
        <div className="border-t mt-4 pt-4 space-y-1 text-sm">
          <div className="flex justify-between text-gray-500">
            <span>Subtotal</span><span>${order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Delivery</span><span>${order.deliveryFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-base border-t pt-2">
            <span>Total</span><span className="text-green-700">${order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
