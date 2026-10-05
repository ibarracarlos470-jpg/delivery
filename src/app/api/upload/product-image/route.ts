import { put, BlobError } from '@vercel/blob'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

const IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'Solo administradores' }, { status: 403 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'El archivo no puede superar 5 MB' }, { status: 400 })
  }

  const ext = IMAGE_TYPES[file.type]
  if (!ext) {
    return NextResponse.json({ error: 'Solo se permiten imágenes JPG, PNG o WEBP' }, { status: 400 })
  }

  try {
    const blob = await put(`product-images/${Date.now()}.${ext}`, file, {
      access: 'public',
      addRandomSuffix: true,
    })
    return NextResponse.json({ url: blob.url })
  } catch (e) {
    if (e instanceof BlobError) {
      return NextResponse.json({ error: 'Blob storage not configured' }, { status: 503 })
    }
    throw e
  }
}
