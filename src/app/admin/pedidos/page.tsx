import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

const statusLabels: Record<string, string> = {
  PENDING: 'Pendiente',
  PROCESSING: 'Procesando',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
}

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      user: { select: { name: true, email: true } },
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Pedidos</h1>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 font-semibold text-gray-600 text-sm">ID</th>
              <th className="text-left p-4 font-semibold text-gray-600 text-sm">Cliente</th>
              <th className="text-left p-4 font-semibold text-gray-600 text-sm">Items</th>
              <th className="text-left p-4 font-semibold text-gray-600 text-sm">Total</th>
              <th className="text-left p-4 font-semibold text-gray-600 text-sm">Estado</th>
              <th className="text-left p-4 font-semibold text-gray-600 text-sm">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map(order => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="p-4 font-mono text-xs text-gray-500">{order.id.slice(0, 8)}...</td>
                <td className="p-4">
                  <p className="font-medium text-gray-800 text-sm">{order.user.name ?? 'Sin nombre'}</p>
                  <p className="text-xs text-gray-500">{order.user.email}</p>
                </td>
                <td className="p-4 text-gray-600 text-sm">{order._count.items} items</td>
                <td className="p-4 font-bold text-green-700">${order.total.toFixed(2)}</td>
                <td className="p-4">
                  <Badge className={statusColors[order.status]}>
                    {statusLabels[order.status]}
                  </Badge>
                </td>
                <td className="p-4 text-gray-500 text-sm">
                  {order.createdAt.toLocaleDateString('es-VE')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
