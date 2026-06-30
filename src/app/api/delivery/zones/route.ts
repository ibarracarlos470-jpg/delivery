import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const zones = await prisma.deliveryZone.findMany({
    where: { active: true },
    orderBy: { deliveryFee: 'asc' },
  })
  return NextResponse.json(zones)
}
