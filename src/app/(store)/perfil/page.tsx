'use client'
import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { Package, User, ChevronRight, MapPin, Phone, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ProfilePage() {
  const { user, isLoaded } = useUser()
  const [editing, setEditing] = useState(false)
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)

  if (!isLoaded) return null

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-4">Debes iniciar sesión para ver tu perfil</p>
        <Link href="/login"><Button className="bg-green-600 hover:bg-green-700">Iniciar sesión</Button></Link>
      </div>
    )
  }

  async function savePhone() {
    setSaving(true)
    try {
      // Clerk phone update requires verification flow, so we note in metadata
      await user!.update({ unsafeMetadata: { phone } })
      setEditing(false)
    } catch {
      alert('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const displayPhone = (user.unsafeMetadata?.phone as string) ||
    user.primaryPhoneNumber?.phoneNumber || ''

  return (
    <div className="container mx-auto px-4 py-8 max-w-lg space-y-5">
      <h1 className="text-2xl font-bold">Mi Perfil</h1>

      {/* Avatar & clerk manage */}
      <div className="bg-white rounded-xl border p-5 flex items-center gap-4">
        <UserButton />
        <div className="min-w-0">
          <p className="font-semibold text-gray-800 truncate">{user.fullName ?? 'Usuario'}</p>
          <p className="text-sm text-gray-400 truncate">{user.primaryEmailAddress?.emailAddress}</p>
        </div>
      </div>

      {/* Info */}
      <div className="bg-white rounded-xl border p-5 space-y-4">
        <h2 className="font-semibold text-gray-700">Información de contacto</h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3 text-gray-600">
            <Mail size={16} className="text-green-500 shrink-0" />
            <span className="truncate">{user.primaryEmailAddress?.emailAddress}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-600">
            <User size={16} className="text-green-500 shrink-0" />
            <span>{user.fullName ?? '—'}</span>
          </div>
          <div className="flex items-start gap-3">
            <Phone size={16} className="text-green-500 shrink-0 mt-0.5" />
            {editing ? (
              <div className="flex-1 space-y-2">
                <Input value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="+58 412 000 0000" />
                <div className="flex gap-2">
                  <Button size="sm" onClick={savePhone} disabled={saving}
                    className="bg-green-600 hover:bg-green-700">
                    {saving ? 'Guardando...' : 'Guardar'}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex justify-between items-center">
                <span className="text-gray-600">{displayPhone || 'Sin teléfono'}</span>
                <button onClick={() => { setPhone(displayPhone); setEditing(true) }}
                  className="text-xs text-green-600 hover:underline">
                  Editar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="bg-white rounded-xl border divide-y">
        <Link href="/pedidos" className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors">
          <Package size={20} className="text-green-500" />
          <span className="flex-1 font-medium text-gray-700">Mis Pedidos</span>
          <ChevronRight size={16} className="text-gray-400" />
        </Link>
        <Link href="/checkout" className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors">
          <MapPin size={20} className="text-green-500" />
          <span className="flex-1 font-medium text-gray-700">Nueva compra</span>
          <ChevronRight size={16} className="text-gray-400" />
        </Link>
      </div>
    </div>
  )
}
