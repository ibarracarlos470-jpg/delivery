'use client'
import { useState, useTransition } from 'react'
import { updateUserRole } from './actions'

const ROLES = [
  { value: 'CUSTOMER', label: 'Cliente', color: 'text-blue-700 bg-blue-50' },
  { value: 'DRIVER',   label: 'Repartidor', color: 'text-orange-700 bg-orange-50' },
  { value: 'ADMIN',    label: 'Admin', color: 'text-purple-700 bg-purple-50' },
]

export default function RoleSelect({ userId, currentRole }: { userId: string; currentRole: string }) {
  const [role, setRole] = useState(currentRole)
  const [pending, startTransition] = useTransition()

  const current = ROLES.find(r => r.value === role)

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newRole = e.target.value as 'CUSTOMER' | 'DRIVER' | 'ADMIN'
    setRole(newRole)
    startTransition(async () => {
      await updateUserRole(userId, newRole)
    })
  }

  return (
    <select
      value={role}
      onChange={handleChange}
      disabled={pending}
      className={`text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-gray-300 ${current?.color ?? ''} ${pending ? 'opacity-50' : ''}`}>
      {ROLES.map(r => (
        <option key={r.value} value={r.value}>{r.label}</option>
      ))}
    </select>
  )
}
