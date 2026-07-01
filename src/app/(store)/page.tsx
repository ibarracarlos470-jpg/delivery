export const dynamic = 'force-dynamic'

import Link from 'next/link'
import HeroBanner from '@/components/home/HeroBanner'
import FeaturedProducts from '@/components/home/FeaturedProducts'
import { Truck, Clock, ShieldCheck, Tag } from 'lucide-react'

const categories = [
  { name: 'Salud',     icon: '💊', slug: 'salud-medicamentos', color: 'bg-blue-50   border-blue-100   hover:border-blue-300' },
  { name: 'Belleza',   icon: '💄', slug: 'belleza',            color: 'bg-pink-50   border-pink-100   hover:border-pink-300' },
  { name: 'Bebé',      icon: '🍼', slug: 'cuidado-bebe',       color: 'bg-yellow-50 border-yellow-100 hover:border-yellow-300' },
  { name: 'Personal',  icon: '🧴', slug: 'cuidado-personal',   color: 'bg-purple-50 border-purple-100 hover:border-purple-300' },
  { name: 'Alimentos', icon: '🥑', slug: 'alimentos-bebidas',  color: 'bg-green-50  border-green-100  hover:border-green-300' },
  { name: 'Hogar',     icon: '🏠', slug: 'hogar-mascotas',     color: 'bg-orange-50 border-orange-100 hover:border-orange-300' },
]

const trust = [
  { icon: Truck,       title: 'Delivery rápido',      desc: 'En 30–60 min a tu puerta' },
  { icon: Clock,       title: 'Disponible 24/7',      desc: 'Pedidos a cualquier hora' },
  { icon: ShieldCheck, title: 'Originales',           desc: 'Garantía de calidad' },
  { icon: Tag,         title: 'Mejores precios',      desc: 'Ofertas cada semana' },
]

const steps = [
  { n: '1', title: 'Elige tus productos', desc: 'Explora el catálogo y agrega al carrito lo que necesitas.', emoji: '🛒' },
  { n: '2', title: 'Confirma tu pedido',  desc: 'Ingresa tu dirección y elige tu método de pago.',          emoji: '📋' },
  { n: '3', title: 'Recibe en casa',      desc: 'Tu repartidor lleva el pedido directo a tu puerta.',       emoji: '🏠' },
]

export default function HomePage() {
  return (
    <>
      <HeroBanner />

      {/* Trust bar */}
      <section className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {trust.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-2.5 py-1">
                <div className="bg-green-100 p-2 rounded-lg shrink-0">
                  <Icon size={18} className="text-green-700" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-gray-800 leading-tight">{title}</p>
                  <p className="text-[11px] sm:text-xs text-gray-500 leading-tight">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-6 sm:py-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">Categorías</h2>
          <Link href="/ofertas" className="text-sm text-orange-500 font-semibold hover:text-orange-600">
            Ver ofertas →
          </Link>
        </div>
        {/* Scrollable row on mobile, grid on desktop */}
        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 snap-x snap-mandatory sm:grid sm:grid-cols-6 sm:gap-3 hide-scrollbar">
          {categories.map(cat => (
            <Link key={cat.slug} href={`/categoria/${cat.slug}`}
              className={`flex flex-col items-center gap-1.5 p-3 sm:p-4 rounded-2xl border-2 transition-all snap-start shrink-0 w-20 sm:w-auto ${cat.color}`}>
              <span className="text-2xl sm:text-3xl">{cat.icon}</span>
              <span className="text-[11px] sm:text-xs font-semibold text-gray-700 text-center leading-tight">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Offer banner */}
      <section className="container mx-auto px-4 pb-6">
        <Link href="/ofertas"
          className="flex items-center justify-between bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl px-5 py-4 sm:p-6 hover:opacity-95 active:scale-[0.99] transition-all shadow-md">
          <div>
            <p className="text-xs font-semibold opacity-80 mb-0.5">Esta semana</p>
            <p className="text-lg sm:text-2xl font-extrabold">Ofertas especiales 🔥</p>
            <p className="text-xs sm:text-sm opacity-80 mt-0.5">Hasta 30% de descuento</p>
          </div>
          <span className="text-4xl sm:text-5xl opacity-80">🏷️</span>
        </Link>
      </section>

      {/* Products */}
      <FeaturedProducts />

      {/* How it works */}
      <section className="bg-white border-t mt-6">
        <div className="container mx-auto px-4 py-10 sm:py-14">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 text-center mb-8">¿Cómo funciona?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {steps.map(step => (
              <div key={step.n} className="flex sm:flex-col items-center sm:items-center gap-4 sm:gap-3 bg-gray-50 rounded-2xl p-5 sm:p-6 sm:text-center border">
                <div className="relative shrink-0">
                  <div className="w-12 h-12 bg-green-600 text-white rounded-2xl flex items-center justify-center text-xl font-extrabold shadow-sm">
                    {step.n}
                  </div>
                  <span className="absolute -top-1 -right-1 text-lg">{step.emoji}</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-sm sm:text-base mb-1">{step.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-500">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
