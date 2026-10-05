import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { branchScope } from '@/lib/auth'
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
  // Drivers advance their own deliveries through /api/driver/orders/[id]
  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()
  const parsed = StatusSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues }, { status: 400 })

  const { status, driverId, driverNote } = parsed.data

  const current = await prisma.order.findFirst({
    where: { id, ...branchScope(user) },
    select: { status: true, items: { select: { productId: true, quantity: true } } },
  })
  if (!current) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  // Cancelling returns stock; reopening would need to take it again, so it's final
  if (current.status === 'CANCELLED') {
    return NextResponse.json({ error: 'El pedido está cancelado' }, { status: 409 })
  }

  if (driverId) {
    const driver = await prisma.user.findUnique({ where: { id: driverId }, select: { role: true } })
    if (driver?.role !== 'DRIVER') {
      return NextResponse.json({ error: 'Repartidor inválido' }, { status: 400 })
    }
  }

  const now = new Date()
  const deliveryTimestamps: Record<string, Date> = {}
  if (status === 'CONFIRMED') deliveryTimestamps.confirmedAt = now
  if (status === 'PREPARING') deliveryTimestamps.preparedAt = now
  if (status === 'ON_THE_WAY') deliveryTimestamps.pickedUpAt = now
  if (status === 'DELIVERED') deliveryTimestamps.deliveredAt = now

  const ops = [
    prisma.order.update({ where: { id }, data: { status } }),
    prisma.delivery.update({
      where: { orderId: id },
      data: {
        status,
        ...deliveryTimestamps,
        ...(driverId ? { driverId } : {}),
        ...(driverNote ? { driverNote } : {}),
      },
    }),
    // When admin confirms a pending order, mark the payment as paid
    ...(status === 'CONFIRMED'
      ? [
          prisma.payment.updateMany({
            where: { orderId: id, status: 'PENDING' },
            data: { status: 'PAID', paidAt: now },
          }),
        ]
      : []),
    // Give back the stock reserved when the order was placed
    ...(status === 'CANCELLED'
      ? current.items.map(item =>
          prisma.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          })
        )
      : []),
  ]

  const [order] = await prisma.$transaction(ops)

  return NextResponse.json(order)
}
