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
