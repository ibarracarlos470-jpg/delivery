import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

async function requireSuperAdmin() {
  const { userId } = await auth()
  if (!userId) return null
  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  return user?.role === 'SUPER_ADMIN' ? user : null
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const branch = await prisma.branch.findUnique({ where: { id } })
  if (!branch) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(branch)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireSuperAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const body = await req.json()
  const branch = await prisma.branch.update({ where: { id }, data: body })
  return NextResponse.json(branch)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireSuperAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  await prisma.branch.update({ where: { id }, data: { isActive: false } })
  return NextResponse.json({ ok: true })
}
