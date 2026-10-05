import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const VALID_ROLES = ['SUPER_ADMIN', 'ADMIN', 'DRIVER', 'CUSTOMER'] as const

export async function POST(req: Request) {
  // Self-service role switching is a development tool only; in production any
  // signed-in user could otherwise grant themselves SUPER_ADMIN
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'No disponible' }, { status: 403 })
  }

  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { role } = await req.json()
  if (!VALID_ROLES.includes(role)) {
    return NextResponse.json({ error: 'Rol inválido' }, { status: 400 })
  }

  const updated = await prisma.user.update({
    where: { clerkId: userId },
    data: { role },
  })

  return NextResponse.json({ role: updated.role })
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { role: true, name: true },
  })

  return NextResponse.json(user ?? { role: null })
}
