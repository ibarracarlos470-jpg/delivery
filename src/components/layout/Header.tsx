'use client'
import Link from 'next/link'
import { Search, ShoppingCart, MapPin, Package, User, Tag } from 'lucide-react'
import { UserButton, SignInButton, useUser } from '@clerk/nextjs'
import { useCartStore } from '@/store/cart'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Header() {
  const { isSignedIn } = useUser()
  const { items } = useCartStore()
  const [query, setQuery] = useState('')
  const [cityName, setCityName] = useState('Detectando...')
  const router = useRouter()
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0)

  useEffect(() => {
    if (!navigator.geolocation) { setCityName('Mi ubicación'); return }
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`
          )
          const data = await res.json()
          const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || 'Mi ubicación'
          setCityName(city)
        } catch { setCityName('Mi ubicación') }
      },
      () => setCityName('Mi ubicación')
    )
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) router.push(`/buscar?q=${encodeURIComponent(query)}`)
  }

  return (
    <header className="bg-[#00873d] text-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-2xl font-bold text-white shrink-0">
            TuMarca
          </Link>

          <button className="hidden md:flex items-center gap-1 text-sm text-green-100 shrink-0">
            <MapPin size={16} />
            {cityName}
          </button>

          <Link href="/ofertas" className="hidden md:flex items-center gap-1 text-sm font-semibold text-yellow-300 hover:text-yellow-100 shrink-0">
            <Tag size={15} />
            Ofertas
          </Link>

          <form onSubmit={handleSearch} className="flex-1 flex gap-2 max-w-xl">
            <Input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar productos..."
              className="bg-white text-gray-900 border-0 h-10"
            />
            <Button type="submit" variant="secondary" size="icon" className="h-10 w-10">
              <Search size={18} />
            </Button>
          </form>

          <div className="flex items-center gap-3 ml-auto shrink-0">
            {isSignedIn ? (
              <>
                <Link href="/pedidos" className="hidden md:flex items-center gap-1 text-sm text-green-100 hover:text-white">
                  <Package size={16} />
                  Pedidos
                </Link>
                <Link href="/perfil" className="hidden md:flex items-center gap-1 text-sm text-green-100 hover:text-white">
                  <User size={16} />
                  Perfil
                </Link>
                <UserButton />
              </>
            ) : (
              <SignInButton mode="modal">
                <Button variant="outline" size="sm" className="border-white text-white hover:bg-green-700">
                  Ingresar
                </Button>
              </SignInButton>
            )}

            <Link href="/carrito" className="relative">
              <ShoppingCart size={24} />
              {totalItems > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-yellow-400 text-black text-xs font-bold">
                  {totalItems}
                </Badge>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
