import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

const PAYMENT_KEYS = [
  'transfer_bank',
  'transfer_holder',
  'transfer_account',
  'transfer_type',
  'transfer_rif',
  'mobile_phone',
  'mobile_bank',
  'mobile_id',
]

export const dynamic = 'force-dynamic'

export async function GET() {
  const rows = await prisma.setting.findMany({
    where: { key: { in: PAYMENT_KEYS } },
  })
  const settings: Record<string, string> = {}
  for (const r of rows) settings[r.key] = r.value
  return NextResponse.json(settings)
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Solo administradores' }, { status: 403 })
  }

  const body = await req.json() as Record<string, string>
  const updates = Object.entries(body).filter(([k]) => PAYMENT_KEYS.includes(k))

  for (const [key, value] of updates) {
    await prisma.setting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    })
  }

  return NextResponse.json({ ok: true })
}
