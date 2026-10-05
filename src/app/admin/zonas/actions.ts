'use server'
import { prisma } from '@/lib/prisma'
import { requireRole, branchScope } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

// Throws unless the zone exists within the admin's branch scope
async function assertZoneInScope(admin: Awaited<ReturnType<typeof requireRole>>, id: string) {
  const zone = await prisma.deliveryZone.findFirst({ where: { id, ...branchScope(admin) }, select: { id: true } })
  if (!zone) throw new Error('Zona no encontrada')
}

export async function toggleZone(id: string, active: boolean) {
  const admin = await requireRole('ADMIN')
  await assertZoneInScope(admin, id)
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
  const admin = await requireRole('ADMIN')
  const { id, ...rest } = data
  if (id) {
    await assertZoneInScope(admin, id)
    await prisma.deliveryZone.update({ where: { id }, data: rest })
  } else {
    await prisma.deliveryZone.create({ data: { ...rest, branchId: admin.branchId } })
  }
  revalidatePath('/admin/zonas')
}

export async function deleteZone(id: string) {
  const admin = await requireRole('ADMIN')
  await assertZoneInScope(admin, id)
  await prisma.deliveryZone.delete({ where: { id } })
  revalidatePath('/admin/zonas')
}
