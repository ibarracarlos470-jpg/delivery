import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { UserButton } from '@clerk/nextjs'
import { Truck, History, LayoutDashboard } from 'lucide-react'

export default async function DriverLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()
  if (!userId) redirect('/login')

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user || user.role !== 'DRIVER') redirect('/')

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top navbar */}
      <header className="bg-orange-500 text-white shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck size={22} />
            <span className="font-bold text-lg">Panel Repartidor</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-orange-100">{user.name ?? user.email}</span>
            <UserButton />
          </div>
        </div>
      </header>

      {/* Bottom tab nav (mobile-first) */}
      <main className="max-w-2xl mx-auto px-4 py-5 pb-24">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="max-w-2xl mx-auto flex">
          {[
            { href: '/repartidor', icon: LayoutDashboard, label: 'Pedidos' },
            { href: '/repartidor/historial', icon: History, label: 'Historial' },
          ].map(item => (
            <Link key={item.href} href={item.href}
              className="flex-1 flex flex-col items-center gap-1 py-3 text-gray-500 hover:text-orange-500 transition-colors">
              <item.icon size={22} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
}
