import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { LayoutDashboard, Package, ShoppingBag, Users } from 'lucide-react'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()
  if (!userId) redirect('/login')

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user || user.role !== 'ADMIN') redirect('/')

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-900 text-white flex flex-col shrink-0">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-xl font-bold">Admin Panel</h1>
          <p className="text-xs text-gray-400 mt-1">TuMarca</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[
            { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
            { href: '/admin/productos', icon: Package, label: 'Productos' },
            { href: '/admin/pedidos', icon: ShoppingBag, label: 'Pedidos' },
            { href: '/admin/usuarios', icon: Users, label: 'Usuarios' },
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-700">
          <Link href="/" className="text-xs text-gray-400 hover:text-white">
            ← Volver a la Tienda
          </Link>
        </div>
      </aside>
      <main className="flex-1 bg-gray-100 p-8 overflow-auto">{children}</main>
    </div>
  )
}
