export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'

const STATUS_COLORS: Record<string, string> = {
  PENDING:    'bg-yellow-100 text-yellow-800',
  CONFIRMED:  'bg-blue-100 text-blue-800',
  PREPARING:  'bg-purple-100 text-purple-800',
  ON_THE_WAY: 'bg-orange-100 text-orange-800',
  DELIVERED:  'bg-green-100 text-green-800',
  CANCELLED:  'bg-red-100 text-red-800',
}

const STATUS_LABELS: Record<string, string> = {
  PENDING:    'Pendiente',
  CONFIRMED:  'Confirmado',
  PREPARING:  'Preparando',
  ON_THE_WAY: 'En camino',
  DELIVERED:  'Entregado',
  CANCELLED:  'Cancelado',
}

export default async function SuperAdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      user: { select: { name: true, email: true } },
      branch: { select: { name: true, city: true } },
      zone: { select: { name: true } },
      delivery: { select: { status: true, driver: { select: { name: true } } } },
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Todos los pedidos</h1>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 font-semibold text-gray-600 text-sm">ID</th>
              <th className="text-left p-4 font-semibold text-gray-600 text-sm">Cliente</th>
              <th className="text-left p-4 font-semibold text-gray-600 text-sm">Sede</th>
              <th className="text-left p-4 font-semibold text-gray-600 text-sm">Zona</th>
              <th className="text-left p-4 font-semibold text-gray-600 text-sm">Items</th>
              <th className="text-left p-4 font-semibold text-gray-600 text-sm">Total</th>
              <th className="text-left p-4 font-semibold text-gray-600 text-sm">Estado</th>
              <th className="text-left p-4 font-semibold text-gray-600 text-sm">Repartidor</th>
              <th className="text-left p-4 font-semibold text-gray-600 text-sm">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map(order => {
              const deliveryStatus = order.delivery?.status ?? order.status
              return (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="p-4 font-mono text-xs text-gray-500">#{order.id.slice(-6).toUpperCase()}</td>
                  <td className="p-4">
                    <p className="font-medium text-gray-800 text-sm">{order.user.name ?? 'Sin nombre'}</p>
                    <p className="text-xs text-gray-500">{order.user.email}</p>
                  </td>
                  <td className="p-4 text-gray-600 text-sm">
                    {order.branch ? `${order.branch.name} — ${order.branch.city}` : '—'}
                  </td>
                  <td className="p-4 text-gray-600 text-sm">{order.zone?.name ?? '—'}</td>
                  <td className="p-4 text-gray-600 text-sm">{order._count.items}</td>
                  <td className="p-4 font-bold text-green-700">${order.total.toFixed(2)}</td>
                  <td className="p-4">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[deliveryStatus] ?? 'bg-gray-100 text-gray-600'}`}>
                      {STATUS_LABELS[deliveryStatus] ?? deliveryStatus}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500 text-sm">{order.delivery?.driver?.name ?? '—'}</td>
                  <td className="p-4 text-gray-500 text-sm">
                    {order.createdAt.toLocaleDateString('es-VE', { day: '2-digit', month: 'short' })}
                  </td>
                </tr>
              )
            })}
            {orders.length === 0 && (
              <tr>
                <td colSpan={9} className="p-8 text-center text-gray-400">
                  No hay pedidos registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
