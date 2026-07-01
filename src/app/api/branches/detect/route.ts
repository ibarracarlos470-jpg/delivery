import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { haversineKm } from '@/lib/branch'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lat = parseFloat(searchParams.get('lat') ?? '')
  const lng = parseFloat(searchParams.get('lng') ?? '')

  const branches = await prisma.branch.findMany({ where: { isActive: true } })

  if (!branches.length) return NextResponse.json(null)

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json(branches[0])
  }

  const nearest = branches
    .filter(b => b.lat !== null && b.lng !== null)
    .map(b => ({ ...b, dist: haversineKm(lat, lng, b.lat!, b.lng!) }))
    .sort((a, b) => a.dist - b.dist)[0]

  return NextResponse.json(nearest ?? branches[0])
}
