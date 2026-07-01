import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const OrderSchema = z.object({
  items: z.array(
    z.object({ productId: z.string(), quantity: z.number().int().positive() })
  ),
  shippingAddress: z.object({
    name: z.string(),
    phone: z.string(),
    address: z.string(),
    city: z.string(),
  }),
  paymentMethod: z.enum(['CARD', 'TRANSFER', 'MOBILE_PAY', 'CASH']),
  zoneId: z.string().optional(),
  deliveryNote: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = OrderSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues }, { status: 400 })

  const { items, shippingAddress, paymentMethod, zoneId, deliveryNote } = parsed.data

  let user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) {
    const clerk = await clerkClient()
    const clerkUser = await clerk.users.getUser(userId)
    user = await prisma.user.create({
      data: {
        clerkId: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress ?? '',
        name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || null,
        role: 'CUSTOMER',
      },
    })
  }

  const products = await prisma.product.findMany({
    where: { id: { in: items.map(i => i.productId) } },
  })

  const subtotal = items.reduce((acc, item) => {
    const product = products.find(p => p.id === item.productId)!
    return acc + (product.salePrice ?? product.price) * item.quantity
  }, 0)

  const DEFAULT_DELIVERY_FEE = 3.00
  let deliveryFee = DEFAULT_DELIVERY_FEE
  if (zoneId) {
    const zone = await prisma.deliveryZone.findUnique({ where: { id: zoneId } })
    deliveryFee = zone?.deliveryFee ?? DEFAULT_DELIVERY_FEE
  }

  const total = subtotal + deliveryFee

  const order = await prisma.order.create({
    data: {
      userId: user.id,
      status: 'CONFIRMED',
      subtotal,
      deliveryFee,
      total,
      shippingAddress,
      deliveryNote,
      zoneId,
      items: {
        create: items.map(item => {
          const product = products.find(p => p.id === item.productId)!
          return {
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: product.salePrice ?? product.price,
          }
        }),
      },
      payment: {
        create: { method: paymentMethod, amount: total, status: 'PENDING' },
      },
      delivery: {
        create: { status: 'CONFIRMED', confirmedAt: new Date() },
      },
    },
    include: { items: true, payment: true, delivery: true },
  })

  return NextResponse.json(order, { status: 201 })
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) return NextResponse.json([])

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: {
      items: { include: { product: { select: { name: true, images: true } } } },
      payment: true,
      zone: true,
      delivery: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(orders)
}
