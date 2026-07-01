import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user || user.role !== 'DRIVER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const [available, active, history] = await Promise.all([
    // Orders ready to be picked up (no driver assigned yet)
    prisma.order.findMany({
      where: {
        status: { in: ['CONFIRMED', 'PREPARING'] },
        delivery: { driverId: null },
      },
      include: {
        zone: true,
        delivery: true,
        items: { include: { product: { select: { name: true } } } },
        user: { select: { name: true, phone: true } },
      },
      orderBy: { createdAt: 'asc' },
    }),
    // My active deliveries (up to 3)
    prisma.order.findMany({
      where: {
        status: { in: ['CONFIRMED', 'PREPARING', 'ON_THE_WAY'] },
        delivery: { driverId: user.id },
      },
      include: {
        zone: true,
        delivery: true,
        items: { include: { product: { select: { name: true } } } },
        user: { select: { name: true, phone: true } },
      },
      orderBy: { createdAt: 'asc' },
      take: 3,
    }),
    // My completed deliveries (last 20)
    prisma.order.findMany({
      where: {
        status: 'DELIVERED',
        delivery: { driverId: user.id },
      },
      include: {
        zone: { select: { name: true } },
        delivery: { select: { deliveredAt: true } },
        items: { select: { quantity: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 20,
    }),
  ])

  return NextResponse.json({ available, active, history, activeCount: active.length })
}
