import { put } from '@vercel/blob'
import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: 'Blob storage not configured' }, { status: 503 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'El archivo no puede superar 5 MB' }, { status: 400 })
  }

  const ext = file.name.split('.').pop() ?? 'jpg'
  const blob = await put(`payment-proofs/${Date.now()}.${ext}`, file, {
    access: 'public',
  })

  return NextResponse.json({ url: blob.url })
}
