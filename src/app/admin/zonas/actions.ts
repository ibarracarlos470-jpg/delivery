'use server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function toggleZone(id: string, active: boolean) {
  await requireRole('ADMIN')
  await prisma.deliveryZone.update({ where: { id }, data: { active } })
  revalidatePath('/admin/zonas')
}

export async function upsertZone(data: {
  id?: string
  name: string
  description: string
  deliveryFee: number
  minOrder: number
  estimatedMin: number
  estimatedMax: number
}) {
  await requireRole('ADMIN')
  const { id, ...rest } = data
  if (id) {
    await prisma.deliveryZone.update({ where: { id }, data: rest })
  } else {
    await prisma.deliveryZone.create({ data: rest })
  }
  revalidatePath('/admin/zonas')
}

export async function deleteZone(id: string) {
  await requireRole('ADMIN')
  await prisma.deliveryZone.delete({ where: { id } })
  revalidatePath('/admin/zonas')
}
