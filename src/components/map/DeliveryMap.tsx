'use client'
import { useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'

type Props = {
  driverLat: number
  driverLng: number
  customerLat?: number
  customerLng?: number
  className?: string
}

export default function DeliveryMap({ driverLat, driverLng, customerLat, customerLng, className = '' }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const driverMarkerRef = useRef<any>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    import('leaflet').then(L => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(mapRef.current!, { zoomControl: true }).setView([driverLat, driverLng], 15)
      mapInstanceRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
      }).addTo(map)

      const driverIcon = L.divIcon({
        html: `<div style="background:#f97316;width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 10px rgba(0,0,0,0.3);font-size:20px;">🛵</div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        className: '',
      })
      driverMarkerRef.current = L.marker([driverLat, driverLng], { icon: driverIcon })
        .addTo(map)
        .bindPopup('Repartidor en camino')

      if (customerLat && customerLng) {
        const homeIcon = L.divIcon({
          html: `<div style="background:#16a34a;width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 10px rgba(0,0,0,0.3);font-size:20px;">🏠</div>`,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
          className: '',
        })
        L.marker([customerLat, customerLng], { icon: homeIcon })
          .addTo(map)
          .bindPopup('Tu dirección')
        map.fitBounds([[driverLat, driverLng], [customerLat, customerLng]], { padding: [50, 50] })
      }

      // Force resize after render to fix mobile blank map
      setTimeout(() => map.invalidateSize(), 200)
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        driverMarkerRef.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!driverMarkerRef.current || !mapInstanceRef.current) return
    driverMarkerRef.current.setLatLng([driverLat, driverLng])
    mapInstanceRef.current.panTo([driverLat, driverLng])
  }, [driverLat, driverLng])

  return (
    <div
      ref={mapRef}
      className={`w-full rounded-xl ${className}`}
      style={{ minHeight: '220px', zIndex: 0 }}
    />
  )
}
