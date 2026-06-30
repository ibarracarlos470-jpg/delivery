'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

type Driver = { id: string; name: string | null }

const STATUS_FLOW: Record<string, string> = {
  PENDING:    'CONFIRMED',
  CONFIRMED:  'PREPARING',
  PREPARING:  'ON_THE_WAY',
  ON_THE_WAY: 'DELIVERED',
}

const NEXT_LABEL: Record<string, string> = {
  CONFIRMED:  'Confirmar pedido',
  PREPARING:  'Marcar en preparación',
  ON_THE_WAY: 'Asignar y enviar',
  DELIVERED:  'Marcar entregado',
}

const STATUS_LABEL: Record<string, string> = {
  PENDING:    'Pendiente',
  CONFIRMED:  'Confirmado',
  PREPARING:  'Preparando',
  ON_THE_WAY: 'En camino',
  DELIVERED:  'Entregado',
  CANCELLED:  'Cancelado',
}

const STATUS_COLOR: Record<string, string> = {
  PENDING:    'bg-yellow-100 text-yellow-800',
  CONFIRMED:  'bg-blue-100 text-blue-800',
  PREPARING:  'bg-purple-100 text-purple-800',
  ON_THE_WAY: 'bg-orange-100 text-orange-800',
  DELIVERED:  'bg-green-100 text-green-800',
  CANCELLED:  'bg-red-100 text-red-800',
}

export default function AdminOrderActions({
  orderId,
  currentStatus,
  currentDriverId,
  drivers,
}: {
  orderId: string
  currentStatus: string
  currentDriverId: string | null
  drivers: Driver[]
}) {
  const router = useRouter()
  const [selectedDriver, setSelectedDriver] = useState(currentDriverId ?? '')
  const [loading, setLoading] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)

  const nextStatus = STATUS_FLOW[currentStatus]
  const isDone = currentStatus === 'DELIVERED' || currentStatus === 'CANCELLED'

  async function advance() {
    if (!nextStatus) return
    setLoading(true)
    try {
      await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: nextStatus,
          ...(selectedDriver ? { driverId: selectedDriver } : {}),
        }),
      })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  async function cancel() {
    setCancelLoading(true)
    try {
      await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      })
      router.refresh()
    } finally {
      setCancelLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-700">Gestión del pedido</h2>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLOR[currentStatus] ?? 'bg-gray-100 text-gray-600'}`}>
          {STATUS_LABEL[currentStatus] ?? currentStatus}
        </span>
      </div>

      {!isDone && (
        <div className="space-y-3">
          {/* Driver selector for ON_THE_WAY */}
          {(currentStatus === 'PREPARING' || currentStatus === 'ON_THE_WAY') && drivers.length > 0 && (
            <div>
              <label className="text-sm text-gray-600 block mb-1">Asignar repartidor</label>
              <select
                value={selectedDriver}
                onChange={e => setSelectedDriver(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-green-400">
                <option value="">Sin asignar</option>
                {drivers.map(d => (
                  <option key={d.id} value={d.id}>{d.name ?? d.id}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-3">
            {nextStatus && (
              <Button onClick={advance} disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700">
                {loading ? 'Actualizando...' : (NEXT_LABEL[nextStatus] ?? `→ ${nextStatus}`)}
              </Button>
            )}
            <Button onClick={cancel} disabled={cancelLoading} variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50">
              {cancelLoading ? '...' : 'Cancelar'}
            </Button>
          </div>
        </div>
      )}

      {isDone && (
        <p className="text-sm text-gray-400">
          {currentStatus === 'DELIVERED' ? 'Pedido completado exitosamente.' : 'Pedido cancelado.'}
        </p>
      )}
    </div>
  )
}
