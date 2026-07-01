'use client'
import { useState, useEffect } from 'react'
import { MapPin, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'

type Branch = { id: string; name: string; city: string; state: string }

function getCookie(name: string) {
  return document.cookie.split('; ').find(r => r.startsWith(name + '='))?.split('=')[1] ?? null
}

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value};path=/;max-age=${60 * 60 * 24 * 365}`
}

export default function BranchSelector() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [current, setCurrent] = useState<Branch | null>(null)
  const [open, setOpen] = useState(false)
  const [detected, setDetected] = useState(false)

  useEffect(() => {
    fetch('/api/branches').then(r => r.json()).then((list: Branch[]) => {
      setBranches(list)
      const saved = getCookie('tmb')
      const found = list.find(b => b.id === saved)

      if (found) {
        setCurrent(found)
        return
      }

      // Auto-detect
      if (list.length === 1) {
        setCurrent(list[0])
        setCookie('tmb', list[0].id)
        return
      }

      navigator.geolocation?.getCurrentPosition(pos => {
        fetch(`/api/branches/detect?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`)
          .then(r => r.json())
          .then((b: Branch) => {
            if (b) {
              setCurrent(b)
              setCookie('tmb', b.id)
              setDetected(true)
              toast(`Sede detectada: ${b.name}`, { duration: 3000 })
            }
          })
      }, () => {
        // No GPS — show selector if more than one branch
        if (list.length > 1) setOpen(true)
        else if (list.length === 1) { setCurrent(list[0]); setCookie('tmb', list[0].id) }
      })
    })
  }, [])

  function select(b: Branch) {
    setCurrent(b)
    setCookie('tmb', b.id)
    setOpen(false)
    window.location.reload()
  }

  if (!current && branches.length <= 1) return null

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-green-700 transition-colors">
        <MapPin size={14} className="text-green-600" />
        <span className="max-w-[140px] truncate">{current?.city ?? 'Seleccionar sede'}</span>
        <ChevronDown size={13} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-8 left-0 z-50 bg-white rounded-xl shadow-xl border w-64 py-1">
            <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Elige tu sede
            </p>
            {branches.map(b => (
              <button key={b.id} onClick={() => select(b)}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${current?.id === b.id ? 'bg-green-50' : ''}`}>
                <p className={`text-sm font-medium ${current?.id === b.id ? 'text-green-700' : 'text-gray-900'}`}>
                  {b.city}
                </p>
                <p className="text-xs text-gray-400">{b.state}</p>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
