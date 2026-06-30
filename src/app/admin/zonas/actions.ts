'use server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function toggleZone(id: string, active: boolean) {
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
  const { id, ...rest } = data
  if (id) {
    await prisma.deliveryZone.update({ where: { id }, data: rest })
  } else {
    await prisma.deliveryZone.create({ data: rest })
  }
  revalidatePath('/admin/zonas')
}

export async function deleteZone(id: string) {
  await prisma.deliveryZone.delete({ where: { id } })
  revalidatePath('/admin/zonas')
}
