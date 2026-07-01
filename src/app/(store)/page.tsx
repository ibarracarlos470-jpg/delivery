export const dynamic = 'force-dynamic'

import Link from 'next/link'
import HeroBanner from '@/components/home/HeroBanner'
import FeaturedProducts from '@/components/home/FeaturedProducts'
import { Truck, Clock, ShieldCheck, Tag } from 'lucide-react'

const categories = [
  { name: 'Salud',     icon: '💊', slug: 'salud-medicamentos', color: 'bg-blue-50   border-blue-100' },
  { name: 'Belleza',   icon: '💄', slug: 'belleza',            color: 'bg-pink-50   border-pink-100' },
  { name: 'Bebé',      icon: '🍼', slug: 'cuidado-bebe',       color: 'bg-yellow-50 border-yellow-100' },
  { name: 'Personal',  icon: '🧴', slug: 'cuidado-personal',   color: 'bg-purple-50 border-purple-100' },
  { name: 'Alimentos', icon: '🥑', slug: 'alimentos-bebidas',  color: 'bg-green-50  border-green-100' },
  { name: 'Hogar',     icon: '🏠', slug: 'hogar-mascotas',     color: 'bg-orange-50 border-orange-100' },
]

const trust = [
  { icon: Truck,       title: 'Delivery rápido',   desc: 'En 30–60 minutos a tu puerta' },
  { icon: Clock,       title: 'Disponible 24/7',   desc: 'Pedidos a cualquier hora' },
  { icon: ShieldCheck, title: 'Productos originales', desc: 'Garantía de calidad' },
  { icon: Tag,         title: 'Mejores precios',   desc: 'Ofertas y descuentos cada semana' },
]

const steps = [
  { n: '1', title: 'Elige tus productos', desc: 'Explora nuestro catálogo y agrega al carrito lo que necesitas.' },
  { n: '2', title: 'Confirma tu pedido',  desc: 'Ingresa tu dirección y elige cómo pagar.' },
  { n: '3', title: 'Recibe en casa',      desc: 'Nuestro repartidor lleva tu pedido directo a tu puerta.' },
]

export default function HomePage() {
  return (
    <>
      <HeroBanner />

      {/* Trust bar */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-5 grid grid-cols-2 md:grid-cols-4 gap-4">
          {trust.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-3">
              <div className="bg-green-100 p-2.5 rounded-xl shrink-0">
                <Icon size={20} className="text-green-700" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{title}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Categorías</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {categories.map(cat => (
            <Link key={cat.slug} href={`/categoria/${cat.slug}`}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 hover:border-green-400 hover:shadow-sm transition-all text-center ${cat.color}`}>
              <span className="text-3xl">{cat.icon}</span>
              <span className="text-xs font-semibold text-gray-700">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Offer banner */}
      <section className="container mx-auto px-4 pb-4">
        <Link href="/ofertas"
          className="block bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl p-6 text-center hover:opacity-95 transition-opacity">
          <p className="text-sm font-semibold opacity-80 mb-1">Esta semana</p>
          <p className="text-2xl font-extrabold">Ofertas especiales 🔥</p>
          <p className="text-sm opacity-80 mt-1">Hasta 30% de descuento en productos seleccionados</p>
        </Link>
      </section>

      {/* Products */}
      <FeaturedProducts />

      {/* How it works */}
      <section className="bg-gray-50 border-t mt-4">
        <div className="container mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">¿Cómo funciona?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map(step => (
              <div key={step.n} className="bg-white rounded-2xl p-6 text-center border shadow-sm">
                <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center text-xl font-extrabold mx-auto mb-4">
                  {step.n}
                </div>
                <h3 className="font-bold text-gray-800 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
