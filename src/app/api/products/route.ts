import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const search = searchParams.get('search')
  const featured = searchParams.get('featured')
  const limit = parseInt(searchParams.get('limit') ?? '20')
  const page = parseInt(searchParams.get('page') ?? '1')

  // Branch filter: query param > cookie > all
  const cookieStore = await cookies()
  const branchId = searchParams.get('branch') ?? cookieStore.get('tmb')?.value ?? null

  const where = {
    active: true,
    ...(category && { category: { slug: category } }),
    ...(search && { name: { contains: search, mode: 'insensitive' as const } }),
    ...(featured === 'true' && { featured: true }),
    ...(branchId && { OR: [{ branchId }, { branchId: null }] }),
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        brand: { select: { name: true } },
        category: { select: { name: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: (page - 1) * limit,
    }),
    prisma.product.count({ where }),
  ])

  return NextResponse.json({ products, total, page, pages: Math.ceil(total / limit) })
}
