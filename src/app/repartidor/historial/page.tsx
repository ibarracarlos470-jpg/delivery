'use client'
import { useEffect, useState } from 'react'
import { CheckCircle, Clock, Package } from 'lucide-react'
import StarRating from '@/components/orders/StarRating'

type CompletedOrder = {
  id: string
  total: number
  deliveryFee: number
  zone: { name: string } | null
  delivery: { deliveredAt: string | null } | null
  items: { quantity: number }[]
  rating: { rating: number; comment: string | null } | null
}

export default function DriverHistorialPage() {
  const [history, setHistory] = useState<CompletedOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [ratingAverage, setRatingAverage] = useState<number | null>(null)
  const [ratingCount, setRatingCount] = useState(0)

  useEffect(() => {
    fetch('/api/driver/orders')
      .then(r => r.json())
      .then(data => {
        setHistory(data.history ?? [])
        setRatingAverage(data.ratingAverage ?? null)
        setRatingCount(data.ratingCount ?? 0)
        setLoading(false)
      })
  }, [])

  const totalEarned = history.reduce((a, o) => a + o.deliveryFee, 0)
  const totalDeliveries = history.length

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 animate-pulse h-20" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-800">Mi Historial</h1>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-green-50 rounded-2xl p-4 text-center border border-green-100">
          <p className="text-2xl font-black text-green-700">{totalDeliveries}</p>
          <p className="text-xs text-green-600 mt-1">Entregas completadas</p>
        </div>
        <div className="bg-orange-50 rounded-2xl p-4 text-center border border-orange-100">
          <p className="text-2xl font-black text-orange-600">${totalEarned.toFixed(2)}</p>
          <p className="text-xs text-orange-500 mt-1">En tarifas de delivery</p>
        </div>
      </div>

      <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex items-center justify-between">
        <div>
          <p className="text-xs text-amber-700">Calificación de clientes</p>
          <p className="text-2xl font-black text-amber-600">
            {ratingAverage != null ? ratingAverage.toFixed(1) : '—'}
            <span className="text-sm font-medium text-amber-500"> / 5</span>
          </p>
        </div>
        <div className="text-right">
          <StarRating value={ratingAverage ?? 0} size={18} />
          <p className="text-xs text-amber-600 mt-1">
            {ratingCount} {ratingCount === 1 ? 'evaluación' : 'evaluaciones'}
          </p>
        </div>
      </div>

      {/* List */}
      {history.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center">
          <Package size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Sin entregas aún</p>
          <p className="text-sm text-gray-400 mt-1">Aquí verás tus entregas completadas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map(order => (
            <div key={order.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4">
              <div className="bg-green-100 rounded-full p-2.5 shrink-0">
                <CheckCircle size={20} className="text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800">#{order.id.slice(-6).toUpperCase()}</p>
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                  <Clock size={11} />
                  {order.delivery?.deliveredAt
                    ? new Date(order.delivery.deliveredAt).toLocaleDateString('es-VE', {
                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                      })
                    : '—'}
                  {order.zone && ` · ${order.zone.name}`}
                </p>
                {order.rating && (
                  <div className="mt-1">
                    <StarRating value={order.rating.rating} size={13} />
                    {order.rating.comment && (
                      <p className="text-xs text-gray-500 italic line-clamp-2 mt-0.5">“{order.rating.comment}”</p>
                    )}
                  </div>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-green-700 text-sm">${order.total.toFixed(2)}</p>
                <p className="text-xs text-orange-500">+${order.deliveryFee.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
