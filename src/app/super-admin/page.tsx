import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { MapPin, ShoppingBag, Users, TrendingUp } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function SuperAdminPage() {
  const [branches, orders, users, pendingOrders] = await Promise.all([
    prisma.branch.count({ where: { isActive: true } }),
    prisma.order.count(),
    prisma.user.count(),
    prisma.order.count({ where: { status: 'PENDING' } }),
  ])

  const branchStats = await prisma.branch.findMany({
    where: { isActive: true },
    include: {
      _count: { select: { orders: true, users: true } },
    },
    orderBy: { name: 'asc' },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Global</h1>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Sedes activas', value: branches, icon: MapPin, color: 'bg-purple-100 text-purple-700' },
          { label: 'Total pedidos', value: orders, icon: ShoppingBag, color: 'bg-green-100 text-green-700' },
          { label: 'Usuarios', value: users, icon: Users, color: 'bg-blue-100 text-blue-700' },
          { label: 'Pedidos pendientes', value: pendingOrders, icon: TrendingUp, color: 'bg-orange-100 text-orange-700' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm border">
            <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Sedes */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-5 border-b flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Sedes</h2>
          <Link href="/super-admin/sedes/nueva"
            className="text-sm bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700">
            + Nueva sede
          </Link>
        </div>
        <div className="divide-y">
          {branchStats.map(branch => (
            <div key={branch.id} className="p-5 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{branch.name}</p>
                <p className="text-sm text-gray-500">{branch.city}, {branch.state}</p>
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <span>{branch._count.orders} pedidos</span>
                <span>{branch._count.users} usuarios</span>
                <Link href={`/super-admin/sedes/${branch.id}`}
                  className="text-purple-600 hover:underline font-medium">
                  Gestionar
                </Link>
              </div>
            </div>
          ))}
          {branchStats.length === 0 && (
            <p className="p-5 text-gray-400 text-sm text-center">
              No hay sedes. <Link href="/super-admin/sedes/nueva" className="text-purple-600 hover:underline">Crea la primera</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
