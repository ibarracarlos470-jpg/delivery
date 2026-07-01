import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const branches = await prisma.branch.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(branches)
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user || user.role !== 'SUPER_ADMIN')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { name, slug, city, state, address, phone, email, lat, lng } = body

  if (!name || !slug || !city || !state)
    return NextResponse.json({ error: 'name, slug, city y state son requeridos' }, { status: 400 })

  const branch = await prisma.branch.create({
    data: { name, slug, city, state, address, phone, email, lat, lng },
  })
  return NextResponse.json(branch, { status: 201 })
}
