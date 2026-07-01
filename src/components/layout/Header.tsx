'use client'
import Link from 'next/link'
import { Search, ShoppingCart, MapPin, Package, User, Tag, Menu, X } from 'lucide-react'
import { UserButton, SignInButton, useUser } from '@clerk/nextjs'
import { useCartStore } from '@/store/cart'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useExchangeRate } from '@/contexts/ExchangeRateContext'

export default function Header() {
  const { isSignedIn } = useUser()
  const { items } = useCartStore()
  const { rate, at } = useExchangeRate()
  const [query, setQuery] = useState('')
  const [cityName, setCityName] = useState('Mi ubicación')
  const [mobileOpen, setMobileOpen] = useState(false)
  const router = useRouter()
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0)

  useEffect(() => {
    if (!navigator.geolocation) return
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
      () => {}
    )
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) { router.push(`/buscar?q=${encodeURIComponent(query)}`); setMobileOpen(false) }
  }

  const rateDate = at
    ? new Date(at).toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : null

  return (
    <>
      <header className="bg-[#00873d] text-white sticky top-0 z-50">
        {/* BCV rate bar */}
        {rate > 0 && (
          <div className="bg-[#005c29] text-green-100 text-xs text-center py-1 px-4">
            <span className="font-semibold text-white">Tasa BCV:</span>
            {' '}1 $ = Bs {new Intl.NumberFormat('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(rate)}
            {rateDate && <span className="ml-2 text-green-300 hidden sm:inline">· Actualizada {rateDate}</span>}
          </div>
        )}

        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <Link href="/" className="text-xl sm:text-2xl font-bold text-white shrink-0">
              TuMarca
            </Link>

            {/* City — desktop only */}
            <button className="hidden md:flex items-center gap-1 text-sm text-green-100 shrink-0">
              <MapPin size={15} />
              <span className="max-w-[120px] truncate">{cityName}</span>
            </button>

            {/* Ofertas — desktop only */}
            <Link href="/ofertas" className="hidden md:flex items-center gap-1 text-sm font-semibold text-yellow-300 hover:text-yellow-100 shrink-0">
              <Tag size={15} />
              Ofertas
            </Link>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 flex gap-2 max-w-xl">
              <Input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Buscar productos..."
                className="bg-white text-gray-900 border-0 h-10 text-sm"
              />
              <Button type="submit" variant="secondary" size="icon" className="h-10 w-10 shrink-0">
                <Search size={17} />
              </Button>
            </form>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-3 shrink-0">
              {isSignedIn ? (
                <>
                  <Link href="/pedidos" className="flex items-center gap-1 text-sm text-green-100 hover:text-white">
                    <Package size={16} />Pedidos
                  </Link>
                  <Link href="/perfil" className="flex items-center gap-1 text-sm text-green-100 hover:text-white">
                    <User size={16} />Perfil
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
            </div>

            {/* Cart + Hamburger */}
            <div className="flex items-center gap-3 shrink-0">
              <Link href="/carrito" className="relative">
                <ShoppingCart size={22} />
                {totalItems > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-yellow-400 text-black text-xs font-bold">
                    {totalItems}
                  </Badge>
                )}
              </Link>
              {/* Mobile: show user button + hamburger */}
              <div className="flex items-center gap-2 md:hidden">
                {isSignedIn && <UserButton />}
                <button onClick={() => setMobileOpen(o => !o)} className="text-white p-1">
                  {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-[#006b30] border-t border-green-700 px-4 py-3 space-y-1">
            <div className="flex items-center gap-2 text-sm text-green-200 py-2 border-b border-green-700 mb-2">
              <MapPin size={14} />{cityName}
            </div>
            {isSignedIn ? (
              <>
                <Link href="/pedidos" onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 py-2.5 text-white hover:text-yellow-300">
                  <Package size={18} /><span className="font-medium">Mis Pedidos</span>
                </Link>
                <Link href="/perfil" onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 py-2.5 text-white hover:text-yellow-300">
                  <User size={18} /><span className="font-medium">Mi Perfil</span>
                </Link>
              </>
            ) : (
              <SignInButton mode="modal">
                <button onClick={() => setMobileOpen(false)}
                  className="w-full mt-2 bg-yellow-400 text-gray-900 font-bold py-2.5 rounded-xl">
                  Ingresar
                </button>
              </SignInButton>
            )}
            <Link href="/ofertas" onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 py-2.5 text-yellow-300 hover:text-yellow-200">
              <Tag size={18} /><span className="font-bold">Ofertas</span>
            </Link>
          </div>
        )}
      </header>
    </>
  )
}
