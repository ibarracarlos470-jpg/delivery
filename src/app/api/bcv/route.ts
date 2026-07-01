import { NextResponse } from 'next/server'

let cached: { rate: number; at: string; ts: number } | null = null
const TTL = 60 * 60 * 1000 // 1 hour

export async function GET() {
  if (cached && Date.now() - cached.ts < TTL) {
    return NextResponse.json(cached, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200' },
    })
  }

  try {
    const res = await fetch('https://ve.dolarapi.com/v1/dolares/oficial', {
      next: { revalidate: 3600 },
    })
    if (!res.ok) throw new Error('API error')
    const data = await res.json()
    const rate = data.promedio as number
    cached = { rate, at: data.fechaActualizacion ?? new Date().toISOString(), ts: Date.now() }
    return NextResponse.json(cached, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200' },
    })
  } catch {
    // Fallback to cached value even if stale, or default
    if (cached) return NextResponse.json(cached)
    return NextResponse.json({ rate: 0, at: null, ts: 0 })
  }
}
