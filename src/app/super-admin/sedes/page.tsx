'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { MapPin, Plus, Pencil, Power, Clock } from 'lucide-react'
import { toast } from 'sonner'

type DaySchedule = { open: string; close: string; closed: boolean }
type Schedule = Record<string, DaySchedule>

type Branch = {
  id: string; name: string; slug: string; city: string; state: string
  address: string | null; phone: string | null; email: string | null
  lat: number | null; lng: number | null; isActive: boolean; schedule: Schedule | null
}

const DAYS = [
  { key: 'monday',    label: 'Lunes' },
  { key: 'tuesday',   label: 'Martes' },
  { key: 'wednesday', label: 'Miércoles' },
  { key: 'thursday',  label: 'Jueves' },
  { key: 'friday',    label: 'Viernes' },
  { key: 'saturday',  label: 'Sábado' },
  { key: 'sunday',    label: 'Domingo' },
]

const DEFAULT_SCHEDULE: Schedule = {
  monday:    { open: '08:00', close: '20:00', closed: false },
  tuesday:   { open: '08:00', close: '20:00', closed: false },
  wednesday: { open: '08:00', close: '20:00', closed: false },
  thursday:  { open: '08:00', close: '20:00', closed: false },
  friday:    { open: '08:00', close: '20:00', closed: false },
  saturday:  { open: '09:00', close: '18:00', closed: false },
  sunday:    { open: '09:00', close: '14:00', closed: true },
}

function ScheduleEditor({ value, onChange }: { value: Schedule; onChange: (s: Schedule) => void }) {
  return (
    <div className="border rounded-xl overflow-hidden">
      <div className="grid grid-cols-4 gap-0 bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b">
        <span>Día</span><span>Apertura</span><span>Cierre</span><span>Cerrado</span>
      </div>
      {DAYS.map(({ key, label }) => {
        const day = value[key] ?? { open: '08:00', close: '20:00', closed: false }
        return (
          <div key={key} className={`grid grid-cols-4 gap-3 px-4 py-2.5 border-b last:border-0 items-center ${day.closed ? 'bg-gray-50 opacity-60' : ''}`}>
            <span className="text-sm font-medium text-gray-700">{label}</span>
            <input type="time" value={day.open} disabled={day.closed}
              onChange={e => onChange({ ...value, [key]: { ...day, open: e.target.value } })}
              className="border rounded-lg px-2 py-1 text-sm focus:ring-1 focus:ring-purple-400 outline-none disabled:bg-gray-100" />
            <input type="time" value={day.close} disabled={day.closed}
              onChange={e => onChange({ ...value, [key]: { ...day, close: e.target.value } })}
              className="border rounded-lg px-2 py-1 text-sm focus:ring-1 focus:ring-purple-400 outline-none disabled:bg-gray-100" />
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={day.closed}
                onChange={e => onChange({ ...value, [key]: { ...day, closed: e.target.checked } })}
                className="w-4 h-4 accent-red-500" />
              <span className="text-xs text-gray-500">Cerrado</span>
            </label>
          </div>
        )
      })}
    </div>
  )
}

export default function SedesPage() {
  return (
    <Suspense>
      <SedesPageInner />
    </Suspense>
  )
}

function SedesPageInner() {
  const searchParams = useSearchParams()
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(searchParams.get('new') === '1')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', slug: '', city: '', state: '', address: '', phone: '', email: '', lat: '', lng: '' })
  const [schedule, setSchedule] = useState<Schedule>(DEFAULT_SCHEDULE)

  async function load() {
    const res = await fetch('/api/branches')
    const data: Branch[] = await res.json()
    setBranches(data)
    setLoading(false)

    const editId = searchParams.get('edit')
    if (editId) {
      const target = data.find(b => b.id === editId)
      if (target) {
        setEditingId(editId)
        setSchedule(target.schedule ?? DEFAULT_SCHEDULE)
      }
    }
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
        schedule,
      }),
    })
    if (res.ok) {
      toast.success('Sede creada')
      setShowForm(false)
      setForm({ name: '', slug: '', city: '', state: '', address: '', phone: '', email: '', lat: '', lng: '' })
      setSchedule(DEFAULT_SCHEDULE)
      load()
    } else {
      const err = await res.json()
      toast.error(err.error ?? 'Error al crear sede')
    }
  }

  async function saveSchedule(id: string, s: Schedule) {
    const res = await fetch(`/api/branches/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ schedule: s }),
    })
    if (res.ok) { toast.success('Horario guardado'); setEditingId(null); load() }
    else toast.error('Error al guardar horario')
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

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border rounded-xl p-5 mb-6 shadow-sm space-y-4">
          <h2 className="font-semibold">Nueva sede</h2>
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
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5"><Clock size={14} />Horario de atención</p>
            <ScheduleEditor value={schedule} onChange={setSchedule} />
          </div>
          <div className="flex gap-2">
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
          <div key={b.id}>
            <div className="p-4 flex items-center justify-between">
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
                <button
                  onClick={() => { setEditingId(editingId === b.id ? null : b.id); setSchedule(b.schedule ?? DEFAULT_SCHEDULE) }}
                  className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg"
                  title="Editar horario">
                  <Clock size={15} />
                </button>
                {b.isActive && (
                  <button onClick={() => toggleActive(b.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                    <Power size={15} />
                  </button>
                )}
              </div>
            </div>

            {/* Inline schedule editor */}
            {editingId === b.id && (
              <div className="px-4 pb-4 border-t bg-gray-50">
                <p className="text-sm font-semibold text-gray-700 mt-3 mb-2 flex items-center gap-1.5">
                  <Clock size={14} />Horario de atención — {b.city}
                </p>
                <ScheduleEditor value={schedule} onChange={setSchedule} />
                <div className="flex gap-2 mt-3">
                  <button onClick={() => saveSchedule(b.id, schedule)}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700">
                    Guardar horario
                  </button>
                  <button onClick={() => setEditingId(null)} className="border px-4 py-2 rounded-lg text-sm">
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
