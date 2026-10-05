'use server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

const ASSIGNABLE_ROLES = ['CUSTOMER', 'DRIVER', 'ADMIN'] as const

export async function updateUserRole(userId: string, role: 'CUSTOMER' | 'DRIVER' | 'ADMIN') {
  await requireRole('ADMIN')
  if (!ASSIGNABLE_ROLES.includes(role)) throw new Error('Rol inválido')

  // An admin must not be able to demote or modify a super admin
  const target = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } })
  if (!target || target.role === 'SUPER_ADMIN') throw new Error('Usuario no modificable')

  await prisma.user.update({ where: { id: userId }, data: { role } })
  revalidatePath('/admin/usuarios')
}
