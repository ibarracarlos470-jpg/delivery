import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params

  const delivery = await prisma.delivery.findUnique({
    where: { orderId: id },
    select: { driverLat: true, driverLng: true, locationAt: true, status: true },
  })

  if (!delivery) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  return NextResponse.json(delivery)
}
