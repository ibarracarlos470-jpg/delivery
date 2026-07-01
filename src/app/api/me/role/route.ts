import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const VALID_ROLES = ['SUPER_ADMIN', 'ADMIN', 'DRIVER', 'CUSTOMER'] as const

export async function POST(req: Request) {
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
