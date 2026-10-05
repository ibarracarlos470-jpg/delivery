import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

function accessFilter(user: { id: string; role: string }) {
  if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') return {}
  if (user.role === 'DRIVER') {
    return {
      OR: [
        { delivery: { driverId: user.id } },
        // Same set the driver sees as "available" in /api/driver/orders
        { status: { in: ['CONFIRMED' as const, 'PREPARING' as const] }, delivery: { driverId: null } },
      ],
    }
  }
  return { userId: user.id }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const order = await prisma.order.findFirst({
    where: {
      id,
      ...accessFilter(user),
    },
    include: {
      items: { include: { product: { select: { name: true, images: true, slug: true } } } },
      payment: true,
      zone: true,
      delivery: {
        include: { driver: { select: { name: true, phone: true } } },
      },
    },
  })

  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(order)
}
