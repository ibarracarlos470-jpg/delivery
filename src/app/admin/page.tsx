import { prisma } from '@/lib/prisma'
import { Package, ShoppingBag, Users, DollarSign } from 'lucide-react'

export default async function AdminDashboard() {
  const [totalProducts, totalOrders, totalUsers, revenue] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.user.count(),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { not: 'CANCELLED' } },
    }),
  ])

  const stats = [
    { label: 'Productos', value: totalProducts, icon: Package, color: 'bg-blue-500' },
    { label: 'Pedidos', value: totalOrders, icon: ShoppingBag, color: 'bg-orange-500' },
    { label: 'Usuarios', value: totalUsers, icon: Users, color: 'bg-purple-500' },
    { label: 'Ingresos', value: `$${(revenue._sum.total ?? 0).toFixed(2)}`, icon: DollarSign, color: 'bg-green-500' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(stat => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
            <div className={`${stat.color} text-white p-3 rounded-lg`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
