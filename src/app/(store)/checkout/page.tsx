'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/store/cart'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useUser } from '@clerk/nextjs'
import {
  MapPin, Banknote, Smartphone, AlertCircle, Navigation, Loader2,
  DollarSign, Wallet, Upload, CheckCircle, Clock, X,
} from 'lucide-react'
import { useExchangeRate, formatBs } from '@/contexts/ExchangeRateContext'
import { toast } from 'sonner'

const PAYMENT_METHODS = [
  { value: 'CASH',       label: 'Efectivo',     icon: Banknote,   color: 'text-green-600',  desc: 'Pagas al recibir' },
  { value: 'MOBILE_PAY', label: 'Pago Móvil',   icon: Smartphone, color: 'text-orange-500', desc: 'Bs · Pago Móvil' },
  { value: 'ZELLE',      label: 'Zelle',         icon: DollarSign, color: 'text-blue-500',   desc: 'USD' },
  { value: 'BINANCE',    label: 'Binance Pay',   icon: Wallet,     color: 'text-yellow-500', desc: 'USDT' },
]

const CASH_METHODS = new Set(['CASH'])

const DELIVERY_FEE = 3.00

export default function CheckoutPage() {
  const router = useRouter()
  const { user } = useUser()
  const { items, total, clearCart } = useCartStore()
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [reference, setReference] = useState('')
  const [proofUrl, setProofUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [proofName, setProofName] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [locating, setLocating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', phone: '', address: '', city: '' })
  const { rate } = useExchangeRate()
  const [hydrated, setHydrated] = useState(false)
  const [paymentSettings, setPaymentSettings] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(setPaymentSettings).catch(() => {})
  }, [])

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
    if (!navigator.geolocation) {
      toast.error('Tu navegador no soporta geolocalización')
      return
    }
    setLocating(true)
    toast('Detectando ubicación...', { duration: 3000 })
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(`/api/geocode?lat=${coords.latitude}&lon=${coords.longitude}`)
          if (!res.ok) throw new Error('Sin respuesta del servidor')
          const data = await res.json()
          if (data.error) throw new Error(data.error)
          const addr = data.address ?? {}
          const street = [addr.road, addr.house_number].filter(Boolean).join(' ')
          const city = addr.city || addr.town || addr.village || addr.county || ''
          const suburb = addr.suburb || addr.neighbourhood || addr.quarter || ''
          const fullAddress = [street, suburb].filter(Boolean).join(', ')
          setForm(f => ({
            ...f,
            address: fullAddress || f.address,
            city: city || f.city,
          }))
          if (fullAddress || city) {
            toast.success('Ubicación detectada — verifica que sea correcta')
          } else {
            toast.warning('No se pudo obtener la dirección exacta. Ingrésala manualmente.')
          }
        } catch (e) {
          toast.error(`No se pudo obtener la dirección: ${e instanceof Error ? e.message : 'intenta de nuevo'}`)
        }
        setLocating(false)
      },
      (err) => {
        setLocating(false)
        if (err.code === 1) toast.error('Permiso de ubicación denegado.')
        else if (err.code === 2) toast.error('No se pudo detectar la ubicación.')
        else toast.error('Tardó demasiado. Ingresa la dirección manualmente.')
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    )
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setProofName(file.name)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload/payment-proof', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error al subir')
      setProofUrl(data.url)
      toast.success('Comprobante subido')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al subir la imagen')
      setProofName('')
    } finally {
      setUploading(false)
    }
  }

  function clearProof() {
    setProofUrl('')
    setProofName('')
    if (fileRef.current) fileRef.current.value = ''
  }

  if (!hydrated) return null
  if (items.length === 0) return null

  const subtotal = total()
  const grandTotal = subtotal + DELIVERY_FEE
  const needsProof = !CASH_METHODS.has(paymentMethod)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!form.name.trim() || !form.address.trim() || !form.city.trim()) {
      setError('Completa tu nombre, dirección y ciudad.')
      return
    }

    if (needsProof && !reference.trim()) {
      setError('Ingresa el número de referencia o confirmación del pago.')
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
          reference: reference || undefined,
          proofUrl: proofUrl || undefined,
          deliveryNote: note,
        }),
      })

      const text = await res.text()
      let data: Record<string, unknown> = {}
      try { data = JSON.parse(text) } catch { data = { error: text.slice(0, 200) } }

      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : `Error ${res.status}`)
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
                    placeholder="Porlamar, Caracas..."
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
                <Banknote size={20} className="text-green-600" /> Método de Pago
              </h2>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {PAYMENT_METHODS.map(({ value, label, icon: Icon, color, desc }) => (
                  <button key={value} type="button"
                    onClick={() => setPaymentMethod(value)}
                    className={`flex items-start gap-3 border-2 rounded-xl p-4 transition-all text-left ${
                      paymentMethod === value
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}>
                    <Icon size={20} className={paymentMethod === value ? color : 'text-gray-400'} />
                    <div>
                      <p className="font-semibold text-sm leading-tight">{label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Pago Móvil */}
              {paymentMethod === 'MOBILE_PAY' && (paymentSettings.mobile_phone || paymentSettings.mobile_bank) && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4">
                  <p className="text-sm font-bold text-orange-800 mb-3 flex items-center gap-2">
                    <Smartphone size={15} /> Datos para Pago Móvil
                  </p>
                  <div className="space-y-1.5 text-sm">
                    {paymentSettings.mobile_phone && (
                      <div className="flex justify-between">
                        <span className="text-orange-600">Teléfono</span>
                        <span className="font-mono font-semibold">{paymentSettings.mobile_phone}</span>
                      </div>
                    )}
                    {paymentSettings.mobile_bank && (
                      <div className="flex justify-between">
                        <span className="text-orange-600">Banco</span>
                        <span className="font-semibold">{paymentSettings.mobile_bank}</span>
                      </div>
                    )}
                    {paymentSettings.mobile_id && (
                      <div className="flex justify-between">
                        <span className="text-orange-600">Cédula</span>
                        <span className="font-semibold">{paymentSettings.mobile_id}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Zelle */}
              {paymentMethod === 'ZELLE' && (paymentSettings.zelle_email || paymentSettings.zelle_name) && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                  <p className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2">
                    <DollarSign size={15} /> Datos para Zelle
                  </p>
                  <div className="space-y-1.5 text-sm">
                    {paymentSettings.zelle_email && (
                      <div className="flex justify-between">
                        <span className="text-blue-600">Email / Teléfono</span>
                        <span className="font-semibold">{paymentSettings.zelle_email}</span>
                      </div>
                    )}
                    {paymentSettings.zelle_name && (
                      <div className="flex justify-between">
                        <span className="text-blue-600">Nombre</span>
                        <span className="font-semibold">{paymentSettings.zelle_name}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Binance */}
              {paymentMethod === 'BINANCE' && (paymentSettings.binance_id || paymentSettings.binance_wallet) && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
                  <p className="text-sm font-bold text-yellow-800 mb-3 flex items-center gap-2">
                    <Wallet size={15} /> Datos para Binance Pay
                  </p>
                  <div className="space-y-1.5 text-sm">
                    {paymentSettings.binance_id && (
                      <div className="flex justify-between">
                        <span className="text-yellow-700">Pay ID</span>
                        <span className="font-mono font-semibold">{paymentSettings.binance_id}</span>
                      </div>
                    )}
                    {paymentSettings.binance_wallet && (
                      <div className="flex justify-between gap-4">
                        <span className="text-yellow-700 shrink-0">Wallet USDT</span>
                        <span className="font-mono font-semibold text-xs break-all text-right">{paymentSettings.binance_wallet}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Proof block — non-cash methods */}
              {needsProof && (
                <div className="border border-dashed border-gray-300 rounded-xl p-4 space-y-4 bg-gray-50">
                  <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Clock size={15} className="text-amber-500" />
                    Comprobante de pago
                  </p>
                  <p className="text-xs text-gray-500 -mt-2">
                    Realiza el pago primero y luego envía el pedido con la referencia.
                    El pedido quedará <strong>pendiente de verificación</strong>.
                  </p>

                  <div>
                    <Label htmlFor="reference">Número de referencia / confirmación *</Label>
                    <Input
                      id="reference"
                      value={reference}
                      onChange={e => setReference(e.target.value)}
                      placeholder="Ej: 000123456789"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Captura de pantalla (opcional)</Label>
                    <div className="mt-1">
                      {proofUrl ? (
                        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                          <CheckCircle size={15} />
                          <span className="truncate flex-1">{proofName}</span>
                          <button type="button" onClick={clearProof} className="shrink-0 text-gray-400 hover:text-red-500">
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => fileRef.current?.click()}
                          disabled={uploading}
                          className="flex items-center gap-2 text-sm text-gray-600 border border-gray-300 rounded-lg px-4 py-2 hover:border-green-400 hover:text-green-700 transition-colors disabled:opacity-50 bg-white"
                        >
                          {uploading
                            ? <><Loader2 size={15} className="animate-spin" /> Subiendo...</>
                            : <><Upload size={15} /> Subir imagen del comprobante</>}
                        </button>
                      )}
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </div>
                  </div>
                </div>
              )}
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
                  <div className="text-right">
                    <p>${subtotal.toFixed(2)}</p>
                    {rate > 0 && <p className="text-xs text-blue-500">{formatBs(subtotal, rate)}</p>}
                  </div>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <div className="text-right">
                    <p>${DELIVERY_FEE.toFixed(2)}</p>
                    {rate > 0 && <p className="text-xs text-blue-500">{formatBs(DELIVERY_FEE, rate)}</p>}
                  </div>
                </div>
                <div className="flex justify-between font-bold text-base border-t pt-2">
                  <span>Total</span>
                  <div className="text-right">
                    <p className="text-green-700">${grandTotal.toFixed(2)}</p>
                    {rate > 0 && <p className="text-xs text-blue-500 font-normal">{formatBs(grandTotal, rate)}</p>}
                  </div>
                </div>
                {rate > 0 && (
                  <p className="text-xs text-gray-400 text-center pt-1">Tasa BCV: Bs {rate.toFixed(2)} / $</p>
                )}
              </div>
            </div>

            {needsProof && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
                <Clock size={12} className="inline mr-1" />
                Pedido pendiente hasta confirmar el pago.
              </div>
            )}

            <Button type="submit" disabled={loading || uploading}
              className="w-full bg-green-600 hover:bg-green-700 h-12 text-base">
              {loading
                ? <><Loader2 size={18} className="animate-spin mr-2" />Procesando...</>
                : needsProof ? 'Enviar pedido' : 'Confirmar Pedido'}
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
