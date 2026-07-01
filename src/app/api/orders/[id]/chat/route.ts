import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
function createId() { return Math.random().toString(36).slice(2) + Date.now().toString(36) }

async function getAuthorizedUser(userId: string, orderId: string) {
  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) return null
  if (user.role === 'ADMIN') return user
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { delivery: { select: { driverId: true } } },
  })
  if (!order) return null
  if (user.role === 'CUSTOMER' && order.userId === user.id) return user
  if (user.role === 'DRIVER' && order.delivery?.driverId === user.id) return user
  return null
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: orderId } = await params
  const user = await getAuthorizedUser(userId, orderId)
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const messages = await prisma.chatMessage.findMany({
    where: { orderId },
    orderBy: { createdAt: 'asc' },
    include: { sender: { select: { name: true } } },
  })

  return NextResponse.json(messages)
}

const SendSchema = z.object({ message: z.string().min(1).max(500) })

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: orderId } = await params
  const user = await getAuthorizedUser(userId, orderId)
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const parsed = SendSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Mensaje inválido' }, { status: 400 })

  const msg = await prisma.chatMessage.create({
    data: {
      id: createId(),
      orderId,
      senderId: user.id,
      senderRole: user.role,
      message: parsed.data.message,
    },
    include: { sender: { select: { name: true } } },
  })

  return NextResponse.json(msg, { status: 201 })
}
