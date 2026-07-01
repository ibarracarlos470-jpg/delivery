'use client'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Banknote, Smartphone, Save, Loader2 } from 'lucide-react'

type Settings = Record<string, string>

const TRANSFER_TYPES = ['Corriente', 'Ahorro']

export default function PaymentConfigPage() {
  const [settings, setSettings] = useState<Settings>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(d => setSettings(d))
      .finally(() => setLoading(false))
  }, [])

  function set(key: string, value: string) {
    setSettings(s => ({ ...s, [key]: value }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      if (!res.ok) throw new Error()
      toast.success('Configuración guardada')
    } catch {
      toast.error('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-gray-500">Cargando configuración...</div>
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Configuración de Pagos</h1>

      <form onSubmit={handleSave} className="space-y-6">

        {/* Transferencia Bancaria */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Banknote size={20} className="text-green-600" />
            Transferencia Bancaria
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Banco</Label>
              <Input
                value={settings.transfer_bank ?? ''}
                onChange={e => set('transfer_bank', e.target.value)}
                placeholder="Ej: Banesco, BDV, Mercantil..."
              />
            </div>
            <div>
              <Label>Tipo de cuenta</Label>
              <select
                value={settings.transfer_type ?? 'Corriente'}
                onChange={e => set('transfer_type', e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm h-10"
              >
                {TRANSFER_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <Label>Número de cuenta</Label>
              <Input
                value={settings.transfer_account ?? ''}
                onChange={e => set('transfer_account', e.target.value)}
                placeholder="0000-0000-00-0000000000"
              />
            </div>
            <div>
              <Label>Titular</Label>
              <Input
                value={settings.transfer_holder ?? ''}
                onChange={e => set('transfer_holder', e.target.value)}
                placeholder="Nombre del titular"
              />
            </div>
            <div>
              <Label>RIF / CI</Label>
              <Input
                value={settings.transfer_rif ?? ''}
                onChange={e => set('transfer_rif', e.target.value)}
                placeholder="J-00000000-0 o V-00000000"
              />
            </div>
          </div>
        </div>

        {/* Pago Móvil */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Smartphone size={20} className="text-green-600" />
            Pago Móvil
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Teléfono</Label>
              <Input
                value={settings.mobile_phone ?? ''}
                onChange={e => set('mobile_phone', e.target.value)}
                placeholder="0412-0000000"
              />
            </div>
            <div>
              <Label>Banco</Label>
              <Input
                value={settings.mobile_bank ?? ''}
                onChange={e => set('mobile_bank', e.target.value)}
                placeholder="Ej: Banesco, BDV..."
              />
            </div>
            <div>
              <Label>Cédula del titular</Label>
              <Input
                value={settings.mobile_id ?? ''}
                onChange={e => set('mobile_id', e.target.value)}
                placeholder="V-00000000"
              />
            </div>
          </div>
        </div>

        <Button type="submit" disabled={saving} className="bg-green-600 hover:bg-green-700 h-11 px-8">
          {saving
            ? <><Loader2 size={16} className="animate-spin mr-2" />Guardando...</>
            : <><Save size={16} className="mr-2" />Guardar configuración</>}
        </Button>
      </form>
    </div>
  )
}
