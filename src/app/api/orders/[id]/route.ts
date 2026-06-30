import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

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
      ...(user.role !== 'ADMIN' && user.role !== 'DRIVER' ? { userId: user.id } : {}),
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
