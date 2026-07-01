import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const ActionSchema = z.object({
  action: z.enum(['accept', 'pickup', 'deliver']),
  driverNote: z.string().optional(),
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user || user.role !== 'DRIVER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()
  const parsed = ActionSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues }, { status: 400 })

  const { action, driverNote } = parsed.data
  const now = new Date()

  const delivery = await prisma.delivery.findUnique({ where: { orderId: id } })
  if (!delivery) return NextResponse.json({ error: 'Delivery not found' }, { status: 404 })

  if (action === 'accept') {
    if (delivery.driverId) {
      return NextResponse.json({ error: 'Ya tiene repartidor asignado' }, { status: 409 })
    }
    await prisma.$transaction([
      prisma.order.update({ where: { id }, data: { status: 'PREPARING' } }),
      prisma.delivery.update({
        where: { orderId: id },
        data: {
          driverId: user.id,
          status: 'PREPARING',
          preparedAt: now,
          ...(driverNote ? { driverNote } : {}),
        },
      }),
    ])
  }

  if (action === 'pickup') {
    if (delivery.driverId !== user.id) {
      return NextResponse.json({ error: 'No es tu pedido' }, { status: 403 })
    }
    await prisma.$transaction([
      prisma.order.update({ where: { id }, data: { status: 'ON_THE_WAY' } }),
      prisma.delivery.update({
        where: { orderId: id },
        data: { status: 'ON_THE_WAY', pickedUpAt: now },
      }),
    ])
  }

  if (action === 'deliver') {
    if (delivery.driverId !== user.id) {
      return NextResponse.json({ error: 'No es tu pedido' }, { status: 403 })
    }
    await prisma.$transaction([
      prisma.order.update({ where: { id }, data: { status: 'DELIVERED' } }),
      prisma.delivery.update({
        where: { orderId: id },
        data: { status: 'DELIVERED', deliveredAt: now },
      }),
    ])
  }

  return NextResponse.json({ ok: true })
}
