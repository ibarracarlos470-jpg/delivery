'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { upsertZone, deleteZone } from './actions'

type Zone = {
  id?: string
  name: string
  description: string
  deliveryFee: number
  minOrder: number
  estimatedMin: number
  estimatedMax: number
}

export default function ZoneForm({ zone }: { zone?: Zone & { id: string } }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [deleting, startDelete] = useTransition()
  const [form, setForm] = useState<Zone>({
    name: zone?.name ?? '',
    description: zone?.description ?? '',
    deliveryFee: zone?.deliveryFee ?? 0,
    minOrder: zone?.minOrder ?? 0,
    estimatedMin: zone?.estimatedMin ?? 30,
    estimatedMax: zone?.estimatedMax ?? 60,
  })

  function set(field: keyof Zone, value: string | number) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function save(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      await upsertZone({ ...form, ...(zone ? { id: zone.id } : {}) })
      router.push('/admin/zonas')
    })
  }

  function handleDelete() {
    if (!zone || !confirm('¿Eliminar esta zona?')) return
    startDelete(async () => {
      await deleteZone(zone.id)
      router.push('/admin/zonas')
    })
  }

  return (
    <form onSubmit={save} className="bg-white rounded-xl border p-6 space-y-5 max-w-lg">
      <div>
        <Label htmlFor="name">Nombre de la zona</Label>
        <Input id="name" required value={form.name}
          onChange={e => set('name', e.target.value)}
          placeholder="Ej: Centro, Este, Norte..." />
      </div>

      <div>
        <Label htmlFor="description">Descripción (opcional)</Label>
        <Input id="description" value={form.description}
          onChange={e => set('description', e.target.value)}
          placeholder="Sectores que cubre esta zona" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="deliveryFee">Tarifa de delivery ($)</Label>
          <Input id="deliveryFee" type="number" step="0.01" min="0" required
            value={form.deliveryFee}
            onChange={e => set('deliveryFee', parseFloat(e.target.value) || 0)} />
        </div>
        <div>
          <Label htmlFor="minOrder">Pedido mínimo ($)</Label>
          <Input id="minOrder" type="number" step="0.01" min="0"
            value={form.minOrder}
            onChange={e => set('minOrder', parseFloat(e.target.value) || 0)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="estimatedMin">Tiempo mín. (min)</Label>
          <Input id="estimatedMin" type="number" min="1" required
            value={form.estimatedMin}
            onChange={e => set('estimatedMin', parseInt(e.target.value) || 30)} />
        </div>
        <div>
          <Label htmlFor="estimatedMax">Tiempo máx. (min)</Label>
          <Input id="estimatedMax" type="number" min="1" required
            value={form.estimatedMax}
            onChange={e => set('estimatedMax', parseInt(e.target.value) || 60)} />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={pending}
          className="flex-1 bg-green-600 hover:bg-green-700">
          {pending ? 'Guardando...' : zone ? 'Guardar cambios' : 'Crear zona'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push('/admin/zonas')}>
          Cancelar
        </Button>
        {zone && (
          <Button type="button" variant="outline" onClick={handleDelete} disabled={deleting}
            className="text-red-600 border-red-200 hover:bg-red-50">
            {deleting ? '...' : 'Eliminar'}
          </Button>
        )}
      </div>
    </form>
  )
}
