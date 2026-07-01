export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { MapPin, User, Truck, Clock, CreditCard, CheckCircle, AlertTriangle } from 'lucide-react'
import AdminOrderActions from './AdminOrderActions'

const METHOD_LABEL: Record<string, string> = {
  CASH: 'Efectivo',
  MOBILE_PAY: 'Pago Móvil',
  ZELLE: 'Zelle',
  BINANCE: 'Binance Pay',
  TRANSFER: 'Transferencia',
  CARD: 'Tarjeta',
}

const METHOD_COLOR: Record<string, string> = {
  CASH: 'bg-green-100 text-green-800',
  MOBILE_PAY: 'bg-orange-100 text-orange-800',
  ZELLE: 'bg-blue-100 text-blue-800',
  BINANCE: 'bg-yellow-100 text-yellow-800',
  TRANSFER: 'bg-gray-100 text-gray-800',
  CARD: 'bg-purple-100 text-purple-800',
}

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
  const payment = order.payment as (typeof order.payment & { proofUrl?: string | null; paidAt?: Date | null }) | null

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

      {/* Payment verification */}
      {payment && payment.method !== 'CASH' && (
        <div className={`rounded-xl border p-5 ${
          payment.status === 'PAID'
            ? 'bg-green-50 border-green-200'
            : 'bg-amber-50 border-amber-200'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold flex items-center gap-2">
              <CreditCard size={16} />
              Pago — {METHOD_LABEL[payment.method] ?? payment.method}
            </h2>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${METHOD_COLOR[payment.method] ?? 'bg-gray-100 text-gray-700'}`}>
                {METHOD_LABEL[payment.method] ?? payment.method}
              </span>
              {payment.status === 'PAID' ? (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-800 flex items-center gap-1">
                  <CheckCircle size={11} /> Pago verificado
                </span>
              ) : (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
                  <AlertTriangle size={11} /> Pendiente de verificar
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Monto</span>
              <span className="font-semibold">${payment.amount.toFixed(2)}</span>
            </div>
            {payment.reference && (
              <div className="flex justify-between">
                <span className="text-gray-500">Referencia</span>
                <span className="font-mono font-semibold">{payment.reference}</span>
              </div>
            )}
            {payment.paidAt && (
              <div className="flex justify-between">
                <span className="text-gray-500">Verificado</span>
                <span className="text-green-700 font-medium">
                  {new Date(payment.paidAt).toLocaleString('es-VE')}
                </span>
              </div>
            )}
          </div>

          {payment.proofUrl && (
            <div className="mt-4">
              <p className="text-xs text-gray-500 mb-2">Comprobante enviado por el cliente:</p>
              <a href={payment.proofUrl} target="_blank" rel="noopener noreferrer"
                className="block relative w-full max-w-xs rounded-lg overflow-hidden border border-gray-200 hover:opacity-90 transition-opacity">
                <Image
                  src={payment.proofUrl}
                  alt="Comprobante de pago"
                  width={400}
                  height={300}
                  className="object-contain bg-gray-50"
                />
                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                  Ver completo ↗
                </div>
              </a>
            </div>
          )}

          {payment.status === 'PENDING' && (
            <p className="text-xs text-amber-700 mt-3 border-t border-amber-200 pt-3">
              Al hacer clic en <strong>&quot;Confirmar pedido&quot;</strong> arriba, el pago se marcará como verificado y el pedido pasará a preparación.
            </p>
          )}
        </div>
      )}

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
