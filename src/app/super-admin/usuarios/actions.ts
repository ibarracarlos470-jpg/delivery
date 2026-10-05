'use server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

const VALID_ROLES = ['CUSTOMER', 'DRIVER', 'ADMIN', 'SUPER_ADMIN'] as const

export async function updateUserRole(userId: string, role: 'CUSTOMER' | 'DRIVER' | 'ADMIN' | 'SUPER_ADMIN') {
  await requireRole('SUPER_ADMIN')
  if (!VALID_ROLES.includes(role)) throw new Error('Rol inválido')
  await prisma.user.update({ where: { id: userId }, data: { role } })
  revalidatePath('/super-admin/usuarios')
}

export async function updateUserBranch(userId: string, branchId: string | null) {
  await requireRole('SUPER_ADMIN')
  await prisma.user.update({ where: { id: userId }, data: { branchId } })
  revalidatePath('/super-admin/usuarios')
}
