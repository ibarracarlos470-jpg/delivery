'use client'
import { useState, useTransition } from 'react'
import { toggleZone } from './actions'

export default function ZoneToggle({ id, active }: { id: string; active: boolean }) {
  const [isActive, setIsActive] = useState(active)
  const [pending, startTransition] = useTransition()

  function toggle() {
    startTransition(async () => {
      await toggleZone(id, !isActive)
      setIsActive(v => !v)
    })
  }

  return (
    <button onClick={toggle} disabled={pending}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        isActive ? 'bg-green-500' : 'bg-gray-300'
      } ${pending ? 'opacity-50' : ''}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
        isActive ? 'translate-x-6' : 'translate-x-1'
      }`} />
    </button>
  )
}
