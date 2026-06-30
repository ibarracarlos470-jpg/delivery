import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const StatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PREPARING', 'ON_THE_WAY', 'DELIVERED', 'CANCELLED']),
  driverId: z.string().optional(),
  driverNote: z.string().optional(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user || (user.role !== 'ADMIN' && user.role !== 'DRIVER')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()
  const parsed = StatusSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues }, { status: 400 })

  const { status, driverId, driverNote } = parsed.data

  const now = new Date()
  const deliveryTimestamps: Record<string, Date> = {}
  if (status === 'CONFIRMED') deliveryTimestamps.confirmedAt = now
  if (status === 'PREPARING') deliveryTimestamps.preparedAt = now
  if (status === 'ON_THE_WAY') deliveryTimestamps.pickedUpAt = now
  if (status === 'DELIVERED') deliveryTimestamps.deliveredAt = now

  const [order] = await prisma.$transaction([
    prisma.order.update({
      where: { id },
      data: { status },
    }),
    prisma.delivery.update({
      where: { orderId: id },
      data: {
        status,
        ...deliveryTimestamps,
        ...(driverId ? { driverId } : {}),
        ...(driverNote ? { driverNote } : {}),
      },
    }),
  ])

  return NextResponse.json(order)
}
