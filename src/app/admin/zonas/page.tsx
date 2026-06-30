export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Plus, Pencil, ToggleLeft, ToggleRight } from 'lucide-react'
import ZoneToggle from './ZoneToggle'

export default async function AdminZonasPage() {
  const zones = await prisma.deliveryZone.findMany({ orderBy: { deliveryFee: 'asc' } })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Zonas de Delivery</h1>
        <Link href="/admin/zonas/nueva"
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> Nueva zona
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 font-semibold text-gray-600 text-sm">Zona</th>
              <th className="text-left p-4 font-semibold text-gray-600 text-sm">Descripción</th>
              <th className="text-left p-4 font-semibold text-gray-600 text-sm">Tarifa</th>
              <th className="text-left p-4 font-semibold text-gray-600 text-sm">Pedido mín.</th>
              <th className="text-left p-4 font-semibold text-gray-600 text-sm">Tiempo est.</th>
              <th className="text-left p-4 font-semibold text-gray-600 text-sm">Estado</th>
              <th className="text-left p-4 font-semibold text-gray-600 text-sm"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {zones.map(zone => (
              <tr key={zone.id} className="hover:bg-gray-50">
                <td className="p-4 font-semibold text-gray-800">{zone.name}</td>
                <td className="p-4 text-gray-500 text-sm">{zone.description ?? '—'}</td>
                <td className="p-4 font-bold text-green-700">${zone.deliveryFee.toFixed(2)}</td>
                <td className="p-4 text-gray-600 text-sm">${zone.minOrder.toFixed(2)}</td>
                <td className="p-4 text-gray-600 text-sm">{zone.estimatedMin}–{zone.estimatedMax} min</td>
                <td className="p-4">
                  <ZoneToggle id={zone.id} active={zone.active} />
                </td>
                <td className="p-4">
                  <Link href={`/admin/zonas/${zone.id}/editar`}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:underline font-medium">
                    <Pencil size={13} /> Editar
                  </Link>
                </td>
              </tr>
            ))}
            {zones.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-400">
                  No hay zonas configuradas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
