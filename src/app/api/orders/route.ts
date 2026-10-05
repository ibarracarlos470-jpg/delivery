import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { cookies } from 'next/headers'

class OutOfStockError extends Error {
  constructor(public productName: string) {
    super(`Out of stock: ${productName}`)
  }
}

function badRequest(error: string) {
  return NextResponse.json({ error }, { status: 400 })
}

const INSTANT_CONFIRM = new Set(['CASH'])

const OrderSchema = z.object({
  items: z.array(
    z.object({ productId: z.string(), quantity: z.number().int().positive().max(100) })
  ).min(1).max(100),
  shippingAddress: z.object({
    name: z.string(),
    phone: z.string(),
    address: z.string(),
    city: z.string(),
  }),
  paymentMethod: z.enum(['CARD', 'TRANSFER', 'MOBILE_PAY', 'CASH', 'ZELLE', 'BINANCE']),
  reference: z.string().optional(),
  proofUrl: z.string().optional(),
  zoneId: z.string().optional(),
  branchId: z.string().optional(),
  deliveryNote: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = OrderSchema.safeParse(body)
  if (!parsed.success) return badRequest('Datos del pedido inválidos')

  const { items, shippingAddress, paymentMethod, reference, proofUrl, zoneId, branchId, deliveryNote } = parsed.data

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

  // Merge repeated products so stock checks see the real total per product
  const quantities = new Map<string, number>()
  for (const item of items) {
    quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity)
  }

  // Branch: explicit > store cookie; must be an active branch
  const cookieStore = await cookies()
  const requestedBranch = branchId ?? cookieStore.get('tmb')?.value ?? null
  const branch = requestedBranch
    ? await prisma.branch.findFirst({ where: { id: requestedBranch, isActive: true }, select: { id: true } })
    : null
  if (branchId && !branch) return badRequest('Sede no válida')

  const products = await prisma.product.findMany({
    where: {
      id: { in: [...quantities.keys()] },
      active: true,
      ...(branch && { OR: [{ branchId: branch.id }, { branchId: null }] }),
    },
  })
  const productById = new Map(products.map(p => [p.id, p]))

  for (const [productId, quantity] of quantities) {
    const product = productById.get(productId)
    if (!product) return badRequest('Uno de los productos ya no está disponible')
    if (product.stock < quantity) {
      return badRequest(`Stock insuficiente para ${product.name} (disponible: ${product.stock})`)
    }
  }

  const lines = [...quantities].map(([productId, quantity]) => {
    const product = productById.get(productId)!
    return { productId, quantity, unitPrice: product.salePrice ?? product.price }
  })
  const subtotal = lines.reduce((acc, l) => acc + l.unitPrice * l.quantity, 0)

  const DEFAULT_DELIVERY_FEE = 3.00
  let deliveryFee = DEFAULT_DELIVERY_FEE
  if (zoneId) {
    const zone = await prisma.deliveryZone.findFirst({ where: { id: zoneId, active: true } })
    if (!zone) return badRequest('Zona de entrega no válida')
    if (subtotal < zone.minOrder) {
      return badRequest(`El pedido mínimo para ${zone.name} es $${zone.minOrder.toFixed(2)}`)
    }
    deliveryFee = zone.deliveryFee
  }

  const total = subtotal + deliveryFee

  // Cash orders confirm immediately; all others wait for payment verification
  const isCash = INSTANT_CONFIRM.has(paymentMethod)
  const orderStatus = isCash ? 'CONFIRMED' : 'PENDING'
  const deliveryStatus = isCash ? 'CONFIRMED' : 'PENDING'

  let order
  try {
    order = await prisma.$transaction(async tx => {
      // Conditional decrement: fails if a concurrent order took the stock first
      for (const line of lines) {
        const { count } = await tx.product.updateMany({
          where: { id: line.productId, stock: { gte: line.quantity } },
          data: { stock: { decrement: line.quantity } },
        })
        if (count === 0) throw new OutOfStockError(productById.get(line.productId)!.name)
      }

      return tx.order.create({
        data: {
          userId: user.id,
          status: orderStatus,
          subtotal,
          deliveryFee,
          total,
          shippingAddress,
          deliveryNote,
          zoneId,
          branchId: branch?.id ?? null,
          items: { create: lines },
          payment: {
            create: {
              method: paymentMethod,
              amount: total,
              status: 'PENDING',
              reference: reference ?? null,
              proofUrl: proofUrl ?? null,
            },
          },
          delivery: {
            create: {
              status: deliveryStatus,
              ...(isCash ? { confirmedAt: new Date() } : {}),
            },
          },
        },
        include: { items: true, payment: true, delivery: true },
      })
    })
  } catch (e) {
    if (e instanceof OutOfStockError) return badRequest(`Stock insuficiente para ${e.productName}`)
    throw e
  }

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
      rating: { select: { rating: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(orders)
}
