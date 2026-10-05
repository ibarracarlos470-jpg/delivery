'use client'
import { useState } from 'react'
import { Star } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import StarRating, { RATING_LABELS } from './StarRating'

type ExistingRating = { rating: number; comment: string | null }

export default function DeliveryRatingCard({
  orderId,
  existing,
}: {
  orderId: string
  existing: ExistingRating | null
}) {
  const [saved, setSaved] = useState<ExistingRating | null>(existing)
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const [sending, setSending] = useState(false)

  if (saved) {
    return (
      <div className="bg-white rounded-xl border p-5">
        <h2 className="font-semibold mb-2 text-gray-700">Tu evaluación del servicio</h2>
        <div className="flex items-center gap-2">
          <StarRating value={saved.rating} size={20} />
          <span className="text-sm text-gray-500">{RATING_LABELS[saved.rating]}</span>
        </div>
        {saved.comment && <p className="text-sm text-gray-600 mt-2 italic">“{saved.comment}”</p>}
        <p className="text-xs text-green-600 mt-2">¡Gracias por tu opinión!</p>
      </div>
    )
  }

  async function submit() {
    if (!rating) return
    setSending(true)
    try {
      const res = await fetch(`/api/orders/${orderId}/rating`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment: comment.trim() || undefined }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(typeof data.error === 'string' ? data.error : 'No se pudo enviar la evaluación')
        return
      }
      setSaved({ rating, comment: comment.trim() || null })
      toast.success('¡Gracias por evaluar el servicio!')
    } catch {
      toast.error('Error de red, intenta de nuevo')
    } finally {
      setSending(false)
    }
  }

  const shown = hover || rating

  return (
    <div className="bg-amber-50 rounded-xl border border-amber-200 p-5">
      <h2 className="font-semibold text-gray-800">¿Cómo fue tu delivery?</h2>
      <p className="text-sm text-gray-500 mb-3">Califica el servicio de entrega de este pedido</p>

      <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)}
            aria-label={`${n} estrella${n > 1 ? 's' : ''}`}
            className="p-1 transition-transform hover:scale-110"
          >
            <Star
              size={32}
              className={n <= shown ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
            />
          </button>
        ))}
        {shown > 0 && <span className="ml-2 text-sm font-medium text-amber-700">{RATING_LABELS[shown]}</span>}
      </div>

      {rating > 0 && (
        <>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="Cuéntanos más (opcional): puntualidad, trato del repartidor, estado del pedido..."
            className="mt-3 w-full rounded-lg border border-gray-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
          />
          <Button onClick={submit} disabled={sending} className="mt-3 w-full">
            {sending ? 'Enviando...' : 'Enviar evaluación'}
          </Button>
        </>
      )}
    </div>
  )
}
