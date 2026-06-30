'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useCartStore } from '@/store/cart'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useUser } from '@clerk/nextjs'
import { MapPin, Clock, CreditCard, Banknote, Smartphone, CheckCircle } from 'lucide-react'

type Zone = {
  id: string
  name: string
  description: string | null
  deliveryFee: number
  minOrder: number
  estimatedMin: number
  estimatedMax: number
}

const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Efectivo', icon: Banknote },
  { value: 'MOBILE_PAY', label: 'Pago Móvil', icon: Smartphone },
  { value: 'TRANSFER', label: 'Transferencia', icon: CreditCard },
  { value: 'CARD', label: 'Tarjeta', icon: CreditCard },
]

export default function CheckoutPage() {
  const router = useRouter()
  const { user } = useUser()
  const { items, total, clearCart } = useCartStore()
  const [zones, setZones] = useState<Zone[]>([])
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null)
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
  })

  useEffect(() => {
    fetch('/api/delivery/zones').then(r => r.json()).then(setZones)
    if (user) {
      setForm(f => ({
        ...f,
        name: user.fullName ?? '',
        phone: user.primaryPhoneNumber?.phoneNumber ?? '',
      }))
    }
  }, [user])

  if (items.length === 0) {
    router.push('/carrito')
    return null
  }

  const subtotal = total()
  const deliveryFee = selectedZone?.deliveryFee ?? 0
  const grandTotal = subtotal + deliveryFee

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedZone) {
      alert('Selecciona una zona de entrega')
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
          zoneId: selectedZone.id,
          deliveryNote: note,
        }),
      })
      if (!res.ok) throw new Error('Error al crear el pedido')
      const order = await res.json()
      clearCart()
      router.push(`/pedidos/${order.id}`)
    } catch {
      alert('Error al procesar el pedido. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-2xl font-bold mb-6">Finalizar Pedido</h1>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left: form */}
          <div className="lg:col-span-2 space-y-6">

            {/* Delivery data */}
            <div className="bg-white rounded-xl border p-6">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <MapPin size={20} className="text-green-600" /> Datos de Entrega
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nombre completo</Label>
                  <Input id="name" required value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input id="phone" required value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="address">Dirección</Label>
                  <Input id="address" required value={form.address}
                    placeholder="Calle, número, sector..."
                    onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="city">Ciudad / Municipio</Label>
                  <Input id="city" required value={form.city}
                    onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="note">Nota para el repartidor (opcional)</Label>
                  <Input id="note" value={note}
                    placeholder="Portón azul, piso 2..."
                    onChange={e => setNote(e.target.value)} />
                </div>
              </div>
            </div>

            {/* Delivery zones */}
            <div className="bg-white rounded-xl border p-6">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Clock size={20} className="text-green-600" /> Zona de Entrega
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {zones.map(zone => (
                  <button key={zone.id} type="button"
                    onClick={() => setSelectedZone(zone)}
                    className={`text-left border rounded-lg p-4 transition-all ${
                      selectedZone?.id === zone.id
                        ? 'border-green-500 bg-green-50 ring-1 ring-green-400'
                        : 'hover:border-green-300 hover:bg-green-50/50'
                    }`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{zone.name}</p>
                        {zone.description && (
                          <p className="text-sm text-gray-500">{zone.description}</p>
                        )}
                        <p className="text-sm text-gray-500 mt-1">
                          {zone.estimatedMin}–{zone.estimatedMax} min
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-700">${zone.deliveryFee.toFixed(2)}</p>
                        {selectedZone?.id === zone.id && (
                          <CheckCircle size={16} className="text-green-500 mt-1 ml-auto" />
                        )}
                      </div>
                    </div>
                  </button>
                ))}
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
                    className={`flex items-center gap-3 border rounded-lg p-4 transition-all ${
                      paymentMethod === value
                        ? 'border-green-500 bg-green-50 ring-1 ring-green-400'
                        : 'hover:border-green-300'
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
              <div className="space-y-3 max-h-48 overflow-y-auto mb-4">
                {items.map(item => (
                  <div key={item.id} className="flex gap-3 items-center">
                    <div className="relative w-12 h-12 shrink-0 bg-gray-50 rounded">
                      <Image src={item.image} alt={item.name} fill className="object-contain p-1" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm line-clamp-1 text-gray-700">{item.name}</p>
                      <p className="text-xs text-gray-500">x{item.quantity}</p>
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
                  <span className={deliveryFee === 0 ? 'text-gray-400' : 'text-gray-700'}>
                    {selectedZone ? `$${deliveryFee.toFixed(2)}` : '—'}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-base border-t pt-2">
                  <span>Total</span>
                  <span className="text-green-700">${grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <Button type="submit" disabled={loading || !selectedZone}
              className="w-full bg-green-600 hover:bg-green-700 h-12 text-base">
              {loading ? 'Procesando...' : 'Confirmar Pedido'}
            </Button>
            <p className="text-xs text-gray-400 text-center">
              Al confirmar aceptas nuestros términos de servicio
            </p>
          </div>
        </div>
      </form>
    </div>
  )
}
