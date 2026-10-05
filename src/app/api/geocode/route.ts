import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lat = Number(searchParams.get('lat'))
  const lon = Number(searchParams.get('lon'))

  if (!searchParams.get('lat') || !searchParams.get('lon') ||
      !Number.isFinite(lat) || !Number.isFinite(lon) ||
      Math.abs(lat) > 90 || Math.abs(lon) > 180) {
    return NextResponse.json({ error: 'lat/lon required' }, { status: 400 })
  }

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=es`,
      {
        headers: {
          'User-Agent': 'TuMarca-Delivery-App/1.0 (contact@tumarca.ve)',
          'Accept': 'application/json',
        },
        next: { revalidate: 0 },
      }
    )
    if (!res.ok) throw new Error(`Nominatim ${res.status}`)
    const data = await res.json()
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 502 })
  }
}
