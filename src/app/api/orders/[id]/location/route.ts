import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  const delivery = await prisma.delivery.findUnique({
    where: { orderId: id },
    select: {
      driverLat: true, driverLng: true, locationAt: true, status: true,
      driverId: true, order: { select: { userId: true } },
    },
  })

  if (!delivery) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
  const isOwner = delivery.order.userId === user.id
  const isDriver = delivery.driverId === user.id
  if (!isAdmin && !isOwner && !isDriver) {
    return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  }

  const { driverLat, driverLng, locationAt, status } = delivery
  return NextResponse.json({ driverLat, driverLng, locationAt, status })
}
