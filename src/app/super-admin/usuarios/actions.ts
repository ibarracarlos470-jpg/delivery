'use server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function updateUserRole(userId: string, role: 'CUSTOMER' | 'DRIVER' | 'ADMIN' | 'SUPER_ADMIN') {
  await prisma.user.update({ where: { id: userId }, data: { role } })
  revalidatePath('/super-admin/usuarios')
}

export async function updateUserBranch(userId: string, branchId: string | null) {
  await prisma.user.update({ where: { id: userId }, data: { branchId } })
  revalidatePath('/super-admin/usuarios')
}
