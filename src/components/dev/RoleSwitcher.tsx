'use client'
import { useState, useEffect, useRef } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Truck, ShieldCheck, User, ChevronUp, Loader2 } from 'lucide-react'

const ROLES = [
  { value: 'ADMIN',    label: 'Admin',      icon: ShieldCheck, color: 'text-purple-600', bg: 'bg-purple-100 hover:bg-purple-200', badge: 'bg-purple-600' },
  { value: 'DRIVER',   label: 'Repartidor', icon: Truck,       color: 'text-orange-600', bg: 'bg-orange-100 hover:bg-orange-200', badge: 'bg-orange-500' },
  { value: 'CUSTOMER', label: 'Cliente',    icon: User,        color: 'text-green-600',  bg: 'bg-green-100  hover:bg-green-200',  badge: 'bg-green-600'  },
]

const ROLE_REDIRECTS: Record<string, string> = {
  ADMIN:    '/admin',
  DRIVER:   '/repartidor',
  CUSTOMER: '/',
}

export default function RoleSwitcher() {
  const { isSignedIn } = useUser()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [currentRole, setCurrentRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isSignedIn) return
    fetch('/api/me/role').then(r => r.json()).then(d => setCurrentRole(d.role)).catch(() => {})
  }, [isSignedIn])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  if (!isSignedIn || !currentRole) return null

  const current = ROLES.find(r => r.value === currentRole)

  async function switchRole(role: string) {
    if (role === currentRole || loading) return
    setLoading(true)
    setOpen(false)
    try {
      const res = await fetch('/api/me/role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      })
      if (res.ok) {
        setCurrentRole(role)
        router.push(ROLE_REDIRECTS[role])
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div ref={ref} className="fixed bottom-6 right-4 z-50 flex flex-col items-end gap-2">
      {/* Role options */}
      {open && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-2 flex flex-col gap-1 w-44 mb-1">
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider px-2 pb-1">Cambiar rol</p>
          {ROLES.map(role => {
            const Icon = role.icon
            const isActive = role.value === currentRole
            return (
              <button key={role.value} onClick={() => switchRole(role.value)}
                disabled={isActive || loading}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive ? 'opacity-50 cursor-default bg-gray-50' : role.bg + ' cursor-pointer'
                } ${role.color}`}>
                <Icon size={16} />
                {role.label}
                {isActive && <span className="ml-auto text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full">Activo</span>}
              </button>
            )
          })}
        </div>
      )}

      {/* Toggle button */}
      <button onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-white text-sm font-semibold shadow-lg transition-all active:scale-95 ${current?.badge ?? 'bg-gray-600'}`}>
        {loading
          ? <Loader2 size={15} className="animate-spin" />
          : current && <current.icon size={15} />}
        {loading ? 'Cambiando...' : (current?.label ?? 'Rol')}
        <ChevronUp size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
    </div>
  )
}
