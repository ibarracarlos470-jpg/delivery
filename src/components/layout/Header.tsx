'use client'
import Link from 'next/link'
import { Search, ShoppingCart, Package, User, Tag, Menu, X, LogIn } from 'lucide-react'
import { UserButton, SignInButton, useUser } from '@clerk/nextjs'
import { useCartStore } from '@/store/cart'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useExchangeRate } from '@/contexts/ExchangeRateContext'
import BranchSelector from '@/components/store/BranchSelector'

export default function Header() {
  const { isSignedIn } = useUser()
  const { items } = useCartStore()
  const { rate, at } = useExchangeRate()
  const [query, setQuery] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const router = useRouter()
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0)

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
                  <Link href="/pedidos" className="flex items-center gap-1.5 text-sm text-green-100 hover:text-white">
                    <Package size={16} />Mis pedidos
                  </Link>
                  <UserButton />
                </>
              ) : (
                <SignInButton mode="modal">
                  <button className="flex items-center gap-2 bg-white text-[#00873d] font-semibold text-sm px-4 py-2 rounded-full hover:bg-green-50 transition-colors shadow-sm">
                    <LogIn size={16} />
                    Iniciar sesión
                  </button>
                </SignInButton>
              )}
              {/* Branch selector — top right */}
              <div className="border-l border-green-600 pl-3">
                <BranchSelector />
              </div>
            </div>

            {/* Cart + Hamburger */}
            <div className="flex items-center gap-3 shrink-0">
              <Link href="/carrito" className="relative text-white hover:text-green-100">
                <ShoppingCart size={22} />
                {totalItems > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-yellow-400 text-black text-xs font-bold">
                    {totalItems}
                  </Badge>
                )}
              </Link>
              {/* Mobile: show user button or login icon + hamburger */}
              <div className="flex items-center gap-2 md:hidden">
                {isSignedIn ? (
                  <UserButton />
                ) : (
                  <SignInButton mode="modal">
                    <button className="p-1 text-white hover:text-green-100">
                      <User size={22} />
                    </button>
                  </SignInButton>
                )}
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
            {/* Branch selector mobile */}
            <div className="py-2 border-b border-green-700 mb-2">
              <BranchSelector />
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
                  className="w-full mt-2 flex items-center justify-center gap-2 bg-yellow-400 text-gray-900 font-bold py-3 rounded-xl text-sm">
                  <LogIn size={18} />
                  Iniciar sesión / Registrarse
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
