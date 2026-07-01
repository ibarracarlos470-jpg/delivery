'use client'
import { useState } from 'react'
import Link from 'next/link'
import { LayoutDashboard, Package, ShoppingBag, Users, MapPin, Settings, Menu, X, LogOut } from 'lucide-react'

const NAV = [
  { href: '/admin',               icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/productos',     icon: Package,         label: 'Productos' },
  { href: '/admin/pedidos',       icon: ShoppingBag,     label: 'Pedidos' },
  { href: '/admin/zonas',         icon: MapPin,          label: 'Zonas delivery' },
  { href: '/admin/usuarios',      icon: Users,           label: 'Usuarios' },
  { href: '/admin/configuracion', icon: Settings,        label: 'Configuración' },
]

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex min-h-screen">
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-gray-900 text-white flex flex-col shrink-0
        transform transition-transform duration-200
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-5 border-b border-gray-700 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Admin Panel</h1>
            <p className="text-xs text-gray-400 mt-0.5">TuMarca</p>
          </div>
          <button onClick={() => setOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors text-sm"
            >
              <item.icon size={17} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <Link href="/" className="flex items-center gap-2 text-xs text-gray-400 hover:text-white">
            <LogOut size={13} /> Volver a la Tienda
          </Link>
        </div>
      </aside>

      {/* Content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <div className="lg:hidden bg-gray-900 text-white px-4 py-3 flex items-center gap-3 sticky top-0 z-20 shadow">
          <button onClick={() => setOpen(true)} className="text-white">
            <Menu size={22} />
          </button>
          <span className="font-bold text-sm">Admin Panel</span>
        </div>

        <main className="flex-1 bg-gray-100 p-4 sm:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
