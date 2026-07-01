export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import {
  Package, ShoppingBag, Users, DollarSign,
  Truck, Clock, CheckCircle, XCircle, ChevronRight, TrendingUp,
} from 'lucide-react'

export default async function AdminDashboard() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1)

  const [
    totalProducts,
    totalUsers,
    revenueAll,
    revenueMonth,
    ordersToday,
    ordersByStatus,
    recentOrders,
    topProducts,
  ] = await Promise.all([
    prisma.product.count({ where: { active: true } }),
    prisma.user.count(),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { not: 'CANCELLED' } },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { not: 'CANCELLED' }, createdAt: { gte: thisMonth } },
    }),
    prisma.order.count({ where: { createdAt: { gte: today } } }),
    prisma.order.groupBy({
      by: ['status'],
      _count: { id: true },
    }),
    prisma.order.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        zone: { select: { name: true } },
        delivery: { select: { status: true } },
      },
    }),
    prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    }),
  ])

  const productIds = topProducts.map(p => p.productId)
  const productNames = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true },
  })

  const statusMap: Record<string, number> = {}
  for (const s of ordersByStatus) statusMap[s.status] = s._count.id

  const totalOrders = Object.values(statusMap).reduce((a, b) => a + b, 0)

  const STATUS_META: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
    PENDING:    { label: 'Pendientes',   color: 'text-yellow-700', bg: 'bg-yellow-50',  icon: Clock },
    CONFIRMED:  { label: 'Confirmados',  color: 'text-blue-700',   bg: 'bg-blue-50',    icon: CheckCircle },
    PREPARING:  { label: 'Preparando',   color: 'text-purple-700', bg: 'bg-purple-50',  icon: Package },
    ON_THE_WAY: { label: 'En camino',    color: 'text-orange-700', bg: 'bg-orange-50',  icon: Truck },
    DELIVERED:  { label: 'Entregados',   color: 'text-green-700',  bg: 'bg-green-50',   icon: CheckCircle },
    CANCELLED:  { label: 'Cancelados',   color: 'text-red-700',    bg: 'bg-red-50',     icon: XCircle },
  }

  const DELIVERY_STATUS: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    PREPARING: 'bg-purple-100 text-purple-800',
    ON_THE_WAY: 'bg-orange-100 text-orange-800',
    DELIVERED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  }

  const DELIVERY_LABEL: Record<string, string> = {
    PENDING: 'Pendiente', CONFIRMED: 'Confirmado', PREPARING: 'Preparando',
    ON_THE_WAY: 'En camino', DELIVERED: 'Entregado', CANCELLED: 'Cancelado',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-gray-400">
          {new Date().toLocaleDateString('es-VE', { dateStyle: 'long' })}
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500">Ingresos totales</p>
            <div className="bg-green-100 p-2 rounded-lg"><DollarSign size={18} className="text-green-600" /></div>
          </div>
          <p className="text-2xl font-bold text-gray-800">${(revenueAll._sum.total ?? 0).toFixed(2)}</p>
          <p className="text-xs text-gray-400 mt-1">Este mes: ${(revenueMonth._sum.total ?? 0).toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500">Pedidos hoy</p>
            <div className="bg-orange-100 p-2 rounded-lg"><ShoppingBag size={18} className="text-orange-600" /></div>
          </div>
          <p className="text-2xl font-bold text-gray-800">{ordersToday}</p>
          <p className="text-xs text-gray-400 mt-1">Total acumulado: {totalOrders}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500">Productos activos</p>
            <div className="bg-blue-100 p-2 rounded-lg"><Package size={18} className="text-blue-600" /></div>
          </div>
          <p className="text-2xl font-bold text-gray-800">{totalProducts}</p>
          <Link href="/admin/productos" className="text-xs text-blue-500 hover:underline mt-1 block">Ver catálogo →</Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500">Usuarios</p>
            <div className="bg-purple-100 p-2 rounded-lg"><Users size={18} className="text-purple-600" /></div>
          </div>
          <p className="text-2xl font-bold text-gray-800">{totalUsers}</p>
          <Link href="/admin/usuarios" className="text-xs text-purple-500 hover:underline mt-1 block">Gestionar →</Link>
        </div>
      </div>

      {/* Order status breakdown + top products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Status breakdown */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-green-500" /> Estado de pedidos
          </h2>
          <div className="space-y-3">
            {Object.entries(STATUS_META).map(([key, meta]) => {
              const count = statusMap[key] ?? 0
              const pct = totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0
              const Icon = meta.icon
              return (
                <div key={key} className="flex items-center gap-3">
                  <div className={`${meta.bg} ${meta.color} p-1.5 rounded-lg`}>
                    <Icon size={14} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{meta.label}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-400 rounded-full transition-all"
                        style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 w-8 text-right">{pct}%</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top products */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Package size={16} className="text-blue-500" /> Productos más vendidos
          </h2>
          {topProducts.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Sin datos aún</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, i) => {
                const name = productNames.find(n => n.id === p.productId)?.name ?? p.productId
                const qty = p._sum.quantity ?? 0
                const maxQty = topProducts[0]._sum.quantity ?? 1
                return (
                  <div key={p.productId} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 line-clamp-1">{name}</span>
                        <span className="font-semibold text-gray-800 shrink-0 ml-2">{qty} uds</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-400 rounded-full"
                          style={{ width: `${Math.round((qty / maxQty) * 100)}%` }} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="font-semibold text-gray-700">Pedidos recientes</h2>
          <Link href="/admin/pedidos" className="text-sm text-green-600 hover:underline flex items-center gap-1">
            Ver todos <ChevronRight size={14} />
          </Link>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs">ID</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs">Cliente</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs">Zona</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs">Total</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs">Estado</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {recentOrders.map(order => {
              const status = order.delivery?.status ?? order.status
              return (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-mono text-xs text-gray-400">
                    #{order.id.slice(-6).toUpperCase()}
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-sm font-medium text-gray-800">{order.user.name ?? '—'}</p>
                    <p className="text-xs text-gray-400">{order.user.email}</p>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500">{order.zone?.name ?? '—'}</td>
                  <td className="px-5 py-3 font-bold text-green-700 text-sm">${order.total.toFixed(2)}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${DELIVERY_STATUS[status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {DELIVERY_LABEL[status] ?? status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <Link href={`/admin/pedidos/${order.id}`}
                      className="text-xs text-green-600 hover:underline">
                      Gestionar
                    </Link>
                  </td>
                </tr>
              )
            })}
            {recentOrders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-gray-400 text-sm">
                  No hay pedidos aún
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
