'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MapPin, Plus, Pencil, Power } from 'lucide-react'
import { toast } from 'sonner'

type Branch = {
  id: string; name: string; slug: string; city: string; state: string
  address: string | null; phone: string | null; email: string | null
  lat: number | null; lng: number | null; isActive: boolean
}

export default function SedesPage() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', slug: '', city: '', state: '', address: '', phone: '', email: '', lat: '', lng: '' })

  async function load() {
    const res = await fetch('/api/branches')
    setBranches(await res.json())
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/branches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        lat: form.lat ? parseFloat(form.lat) : null,
        lng: form.lng ? parseFloat(form.lng) : null,
      }),
    })
    if (res.ok) {
      toast.success('Sede creada')
      setShowForm(false)
      setForm({ name: '', slug: '', city: '', state: '', address: '', phone: '', email: '', lat: '', lng: '' })
      load()
    } else {
      const err = await res.json()
      toast.error(err.error ?? 'Error al crear sede')
    }
  }

  async function toggleActive(id: string) {
    await fetch(`/api/branches/${id}`, { method: 'DELETE' })
    toast.success('Sede desactivada')
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sedes</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm">
          <Plus size={16} /> Nueva sede
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border rounded-xl p-5 mb-6 shadow-sm">
          <h2 className="font-semibold mb-4">Nueva sede</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              ['name', 'Nombre (ej: TuMarca Caracas)', true],
              ['slug', 'Slug URL (ej: caracas)', true],
              ['city', 'Ciudad', true],
              ['state', 'Estado', true],
              ['address', 'Dirección', false],
              ['phone', 'Teléfono', false],
              ['email', 'Email', false],
              ['lat', 'Latitud (ej: 10.9578)', false],
              ['lng', 'Longitud (ej: -63.8672)', false],
            ].map(([key, placeholder, req]) => (
              <input key={key as string}
                placeholder={placeholder as string}
                required={!!req}
                value={form[key as keyof typeof form]}
                onChange={e => setForm(prev => ({ ...prev, [key as string]: e.target.value }))}
                className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
              />
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700">
              Crear sede
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="border px-4 py-2 rounded-lg text-sm">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border divide-y">
        {loading ? (
          <p className="p-5 text-gray-400 text-sm text-center">Cargando...</p>
        ) : branches.length === 0 ? (
          <p className="p-5 text-gray-400 text-sm text-center">No hay sedes</p>
        ) : branches.map(b => (
          <div key={b.id} className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center">
                <MapPin size={16} className="text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{b.name}</p>
                <p className="text-sm text-gray-500">{b.city}, {b.state} · /{b.slug}</p>
                {b.phone && <p className="text-xs text-gray-400">{b.phone}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded-full ${b.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {b.isActive ? 'Activa' : 'Inactiva'}
              </span>
              <Link href={`/super-admin/sedes/${b.id}`}
                className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg">
                <Pencil size={15} />
              </Link>
              {b.isActive && (
                <button onClick={() => toggleActive(b.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                  <Power size={15} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
