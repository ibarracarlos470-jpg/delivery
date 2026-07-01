'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/store/cart'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useUser } from '@clerk/nextjs'
import { MapPin, CreditCard, Banknote, Smartphone, AlertCircle, Navigation, Loader2 } from 'lucide-react'

const PAYMENT_METHODS = [
  { value: 'CASH',       label: 'Efectivo',     icon: Banknote },
  { value: 'MOBILE_PAY', label: 'Pago Móvil',   icon: Smartphone },
  { value: 'TRANSFER',   label: 'Transferencia', icon: CreditCard },
  { value: 'CARD',       label: 'Tarjeta',       icon: CreditCard },
]

const DELIVERY_FEE = 3.00

export default function CheckoutPage() {
  const router = useRouter()
  const { user } = useUser()
  const { items, total, clearCart } = useCartStore()
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [locating, setLocating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', phone: '', address: '', city: '' })
  const [hydrated, setHydrated] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const unsub = useCartStore.persist.onFinishHydration(() => setHydrated(true))
    if (useCartStore.persist.hasHydrated()) setHydrated(true)
    return unsub
  }, [])

  useEffect(() => {
    if (hydrated && !submitted && items.length === 0) router.replace('/carrito')
  }, [hydrated, submitted, items.length, router])

  useEffect(() => {
    if (user) {
      setForm(f => ({
        ...f,
        name: f.name || user.fullName || '',
        phone: f.phone || user.primaryPhoneNumber?.phoneNumber || '',
      }))
    }
  }, [user])

  function detectLocation() {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`
          )
          const data = await res.json()
          const addr = data.address
          const street = [addr.road, addr.house_number].filter(Boolean).join(' ')
          const city = addr.city || addr.town || addr.village || addr.county || ''
          const suburb = addr.suburb || addr.neighbourhood || ''
          setForm(f => ({
            ...f,
            address: [street, suburb].filter(Boolean).join(', ') || f.address,
            city: city || f.city,
          }))
        } catch { /* silently fail */ }
        setLocating(false)
      },
      () => setLocating(false)
    )
  }

  if (!hydrated) return null   // wait for cart to load from localStorage
  if (items.length === 0) return null

  const subtotal = total()
  const grandTotal = subtotal + DELIVERY_FEE

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!form.name.trim() || !form.address.trim() || !form.city.trim()) {
      setError('Completa tu nombre, dirección y ciudad.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({ productId: i.id, quantity: i.quantity })),
          shippingAddress: form,
          paymentMethod,
          deliveryNote: note,
        }),
      })

      // Read body as text first to avoid json parse errors masking the real issue
      const text = await res.text()
      let data: Record<string, unknown> = {}
      try { data = JSON.parse(text) } catch { data = { error: text.slice(0, 200) } }

      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : `Error ${res.status}: ${text.slice(0, 150)}`)
        return
      }

      setSubmitted(true)
      clearCart()
      router.push(`/pedidos/${data.id as string}`)
    } catch (err) {
      setError(`Error de red: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Finalizar Pedido</h1>

      {error && (
        <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left */}
          <div className="lg:col-span-2 space-y-6">

            {/* Delivery address */}
            <div className="bg-white rounded-xl border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg flex items-center gap-2">
                  <MapPin size={20} className="text-green-600" /> Dirección de Entrega
                </h2>
                <button type="button" onClick={detectLocation} disabled={locating}
                  className="flex items-center gap-1.5 text-sm text-green-600 hover:text-green-700 font-medium disabled:opacity-50">
                  {locating
                    ? <><Loader2 size={15} className="animate-spin" /> Detectando...</>
                    : <><Navigation size={15} /> Usar mi ubicación</>}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nombre completo *</Label>
                  <Input id="name" required value={form.name}
                    placeholder="¿A quién entregamos?"
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="phone">Teléfono de contacto</Label>
                  <Input id="phone" value={form.phone} placeholder="+58 412 000 0000"
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="address">Dirección *</Label>
                  <Input id="address" required value={form.address}
                    placeholder="Calle, número, urbanización, sector..."
                    onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="city">Ciudad / Municipio *</Label>
                  <Input id="city" required value={form.city}
                    placeholder="Caracas, Valencia..."
                    onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="note">Nota para el repartidor</Label>
                  <Input id="note" value={note}
                    placeholder="Portón azul, piso 2, referencia..."
                    onChange={e => setNote(e.target.value)} />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-xl border p-6">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <CreditCard size={20} className="text-green-600" /> Método de Pago
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {PAYMENT_METHODS.map(({ value, label, icon: Icon }) => (
                  <button key={value} type="button"
                    onClick={() => setPaymentMethod(value)}
                    className={`flex items-center gap-3 border-2 rounded-xl p-4 transition-all ${
                      paymentMethod === value
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}>
                    <Icon size={20} className={paymentMethod === value ? 'text-green-600' : 'text-gray-400'} />
                    <span className="font-medium text-sm">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: summary */}
          <div className="h-fit sticky top-20 space-y-4">
            <div className="bg-white rounded-xl border p-5">
              <h2 className="font-bold text-lg mb-4">Resumen</h2>
              <div className="space-y-3 max-h-52 overflow-y-auto mb-4">
                {items.map(item => (
                  <div key={item.id} className="flex gap-3 items-center">
                    <div className="relative w-12 h-12 shrink-0 bg-gray-50 rounded">
                      <Image src={item.image} alt={item.name} fill className="object-contain p-1" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm line-clamp-1 text-gray-700">{item.name}</p>
                      <p className="text-xs text-gray-400">x{item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold">
                      ${((item.salePrice ?? item.price) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="border-t pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span>${DELIVERY_FEE.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-base border-t pt-2">
                  <span>Total</span>
                  <span className="text-green-700">${grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <Button type="submit" disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 h-12 text-base">
              {loading
                ? <><Loader2 size={18} className="animate-spin mr-2" />Procesando...</>
                : 'Confirmar Pedido'}
            </Button>

            <Link href="/carrito" className="block text-center text-sm text-gray-400 hover:text-gray-600">
              ← Volver al carrito
            </Link>
          </div>
        </div>
      </form>
    </div>
  )
}
