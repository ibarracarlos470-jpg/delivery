import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { UserButton } from '@clerk/nextjs'
import { LayoutDashboard, MapPin, Users, Package, ShoppingBag } from 'lucide-react'

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()
  if (!userId) redirect('/login')

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user || user.role !== 'SUPER_ADMIN') redirect('/')

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-purple-900 text-white flex flex-col min-h-screen">
        <div className="px-5 py-4 border-b border-purple-700">
          <p className="font-bold text-lg">TuMarca</p>
          <p className="text-purple-300 text-xs">Super Admin</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {[
            { href: '/super-admin', icon: LayoutDashboard, label: 'Dashboard' },
            { href: '/super-admin/sedes', icon: MapPin, label: 'Sedes' },
            { href: '/super-admin/usuarios', icon: Users, label: 'Usuarios' },
            { href: '/super-admin/pedidos', icon: ShoppingBag, label: 'Todos los pedidos' },
            { href: '/super-admin/productos', icon: Package, label: 'Catálogo global' },
          ].map(item => (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-purple-200 hover:bg-purple-700 hover:text-white transition-colors">
              <item.icon size={16} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-purple-700 flex items-center gap-2">
          <UserButton />
          <span className="text-xs text-purple-300 truncate">{user.name ?? user.email}</span>
        </div>
      </aside>

      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  )
}
