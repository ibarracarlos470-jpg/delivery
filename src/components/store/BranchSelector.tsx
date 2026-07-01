'use client'
import { useState, useEffect } from 'react'
import { MapPin, ChevronDown, Clock } from 'lucide-react'
import { toast } from 'sonner'

type DaySchedule = { open: string; close: string; closed: boolean }
type Schedule = Record<string, DaySchedule>
type Branch = { id: string; name: string; city: string; state: string; schedule?: Schedule | null }

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

function isOpenNow(schedule?: Schedule | null): boolean | null {
  if (!schedule) return null
  // Venezuela is UTC-4
  const now = new Date(Date.now() - 4 * 60 * 60 * 1000)
  const day = DAYS[now.getUTCDay()]
  const s = schedule[day]
  if (!s || s.closed) return false
  const [oh, om] = s.open.split(':').map(Number)
  const [ch, cm] = s.close.split(':').map(Number)
  const mins = now.getUTCHours() * 60 + now.getUTCMinutes()
  return mins >= oh * 60 + om && mins < ch * 60 + cm
}

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

  useEffect(() => {
    fetch('/api/branches').then(r => r.json()).then((list: Branch[]) => {
      setBranches(list)
      const saved = getCookie('tmb')
      const found = list.find(b => b.id === saved)

      if (found) { setCurrent(found); return }

      if (list.length === 1) { setCurrent(list[0]); setCookie('tmb', list[0].id); return }

      navigator.geolocation?.getCurrentPosition(pos => {
        fetch(`/api/branches/detect?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`)
          .then(r => r.json())
          .then((b: Branch) => {
            if (b) { setCurrent(b); setCookie('tmb', b.id); toast(`Sede detectada: ${b.name}`, { duration: 3000 }) }
          })
      }, () => {
        if (list.length > 1) setOpen(true)
        else if (list.length === 1) { setCurrent(list[0]); setCookie('tmb', list[0].id) }
      })
    })
  }, [])

  function select(b: Branch) {
    setCurrent(b); setCookie('tmb', b.id); setOpen(false); window.location.reload()
  }

  if (!current && branches.length <= 1) return null

  const openStatus = isOpenNow(current?.schedule)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-sm text-green-100 hover:text-white transition-colors">
        <MapPin size={14} className="text-green-200" />
        <span className="max-w-[120px] truncate">{current?.city ?? 'Seleccionar sede'}</span>
        {openStatus !== null && (
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${openStatus ? 'bg-green-400 text-white' : 'bg-red-400 text-white'}`}>
            {openStatus ? 'Abierto' : 'Cerrado'}
          </span>
        )}
        <ChevronDown size={13} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-9 right-0 z-50 bg-white rounded-xl shadow-xl border w-72 py-1">
            <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Elige tu sede
            </p>
            {branches.map(b => {
              const status = isOpenNow(b.schedule)
              return (
                <button key={b.id} onClick={() => select(b)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${current?.id === b.id ? 'bg-green-50' : ''}`}>
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-medium ${current?.id === b.id ? 'text-green-700' : 'text-gray-900'}`}>
                      {b.city}
                    </p>
                    {status !== null && (
                      <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        <Clock size={9} />
                        {status ? 'Abierto' : 'Cerrado'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">{b.state}</p>
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
