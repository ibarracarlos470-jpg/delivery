export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { Users, Package, ShoppingBag } from 'lucide-react'
import RoleSelect from './RoleSelect'

export default async function AdminUsuariosPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { orders: true } },
    },
  })

  const totals = {
    total: users.length,
    customers: users.filter(u => u.role === 'CUSTOMER').length,
    drivers: users.filter(u => u.role === 'DRIVER').length,
    admins: users.filter(u => u.role === 'ADMIN').length,
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Usuarios</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: totals.total, color: 'text-gray-700' },
          { label: 'Clientes', value: totals.customers, color: 'text-blue-600' },
          { label: 'Repartidores', value: totals.drivers, color: 'text-orange-600' },
          { label: 'Admins', value: totals.admins, color: 'text-purple-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 font-semibold text-gray-600 text-sm">Usuario</th>
              <th className="text-left p-4 font-semibold text-gray-600 text-sm">Teléfono</th>
              <th className="text-left p-4 font-semibold text-gray-600 text-sm">Pedidos</th>
              <th className="text-left p-4 font-semibold text-gray-600 text-sm">Registro</th>
              <th className="text-left p-4 font-semibold text-gray-600 text-sm">Rol</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="p-4">
                  <p className="font-medium text-gray-800">{user.name ?? 'Sin nombre'}</p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </td>
                <td className="p-4 text-gray-500 text-sm">{user.phone ?? '—'}</td>
                <td className="p-4">
                  <span className="flex items-center gap-1 text-sm text-gray-600">
                    <ShoppingBag size={14} />
                    {user._count.orders}
                  </span>
                </td>
                <td className="p-4 text-gray-500 text-sm">
                  {user.createdAt.toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                <td className="p-4">
                  <RoleSelect userId={user.id} currentRole={user.role} />
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-400">
                  No hay usuarios registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
