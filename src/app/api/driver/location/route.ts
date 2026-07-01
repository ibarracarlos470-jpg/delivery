import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Driver sends their location for a specific order
export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { orderId, lat, lng } = await req.json()
  if (!orderId || lat == null || lng == null) {
    return NextResponse.json({ error: 'orderId, lat y lng son requeridos' }, { status: 400 })
  }

  const driver = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!driver || driver.role !== 'DRIVER') {
    return NextResponse.json({ error: 'Solo repartidores' }, { status: 403 })
  }

  const delivery = await prisma.delivery.updateMany({
    where: { orderId, driverId: driver.id },
    data: { driverLat: lat, driverLng: lng, locationAt: new Date() },
  })

  if (delivery.count === 0) {
    return NextResponse.json({ error: 'Entrega no encontrada' }, { status: 404 })
  }

  return NextResponse.json({ ok: true })
}
