import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import type { Role } from '@/generated/prisma/client'

export async function getCurrentUser() {
  const { userId } = await auth()
  if (!userId) return null
  return prisma.user.findUnique({ where: { clerkId: userId } })
}

// For server actions: throws if the caller doesn't have one of the given roles
export async function requireRole(...roles: Role[]) {
  const user = await getCurrentUser()
  if (!user) throw new Error('No autorizado')
  if (!roles.includes(user.role)) throw new Error('Permisos insuficientes')
  return user
}

// Prisma `where` fragment limiting a branch admin to their branch's records plus
// global ones (branchId null). Super admins and admins without a branch see all.
export function branchScope(user: { role: Role; branchId: string | null }) {
  if (user.role !== 'ADMIN' || !user.branchId) return {}
  return { AND: [{ OR: [{ branchId: user.branchId }, { branchId: null }] }] }
}
