import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@/generated/prisma/client'
import { z } from 'zod'

const RatingSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(500).optional(),
})

// The order's customer rates the delivery once it has been delivered
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const parsed = RatingSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'La calificación debe ser de 1 a 5 estrellas' }, { status: 400 })
  }

  const order = await prisma.order.findFirst({
    where: { id, userId: user.id },
    select: { status: true, delivery: { select: { driverId: true } } },
  })
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (order.status !== 'DELIVERED') {
    return NextResponse.json({ error: 'Solo puedes calificar pedidos entregados' }, { status: 409 })
  }

  try {
    const rating = await prisma.deliveryRating.create({
      data: {
        orderId: id,
        userId: user.id,
        driverId: order.delivery?.driverId ?? null,
        rating: parsed.data.rating,
        comment: parsed.data.comment || null,
      },
    })
    return NextResponse.json(rating, { status: 201 })
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return NextResponse.json({ error: 'Este pedido ya fue calificado' }, { status: 409 })
    }
    throw e
  }
}
