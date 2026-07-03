'use client'
import { useState, useTransition } from 'react'
import { updateUserRole, updateUserBranch } from './actions'

const ROLES = [
  { value: 'CUSTOMER', label: 'Cliente', color: 'text-blue-700 bg-blue-50' },
  { value: 'DRIVER', label: 'Repartidor', color: 'text-orange-700 bg-orange-50' },
  { value: 'ADMIN', label: 'Admin', color: 'text-purple-700 bg-purple-50' },
  { value: 'SUPER_ADMIN', label: 'Super Admin', color: 'text-violet-800 bg-violet-100' },
] as const

type Branch = { id: string; name: string }

export default function RoleBranchSelect({
  userId,
  currentRole,
  currentBranchId,
  branches,
}: {
  userId: string
  currentRole: string
  currentBranchId: string | null
  branches: Branch[]
}) {
  const [role, setRole] = useState(currentRole)
  const [branchId, setBranchId] = useState(currentBranchId ?? '')
  const [pending, startTransition] = useTransition()

  const current = ROLES.find(r => r.value === role)

  function handleRoleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newRole = e.target.value as (typeof ROLES)[number]['value']
    setRole(newRole)
    startTransition(async () => {
      await updateUserRole(userId, newRole)
    })
  }

  function handleBranchChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newBranchId = e.target.value || null
    setBranchId(newBranchId ?? '')
    startTransition(async () => {
      await updateUserBranch(userId, newBranchId)
    })
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={role}
        onChange={handleRoleChange}
        disabled={pending}
        className={`text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-gray-300 ${current?.color ?? ''} ${pending ? 'opacity-50' : ''}`}>
        {ROLES.map(r => (
          <option key={r.value} value={r.value}>{r.label}</option>
        ))}
      </select>
      <select
        value={branchId}
        onChange={handleBranchChange}
        disabled={pending}
        className="text-xs px-2 py-1 rounded-lg border border-gray-200 text-gray-600 cursor-pointer focus:outline-none focus:ring-1 focus:ring-purple-300 disabled:opacity-50">
        <option value="">Sin sede</option>
        {branches.map(b => (
          <option key={b.id} value={b.id}>{b.name}</option>
        ))}
      </select>
    </div>
  )
}
