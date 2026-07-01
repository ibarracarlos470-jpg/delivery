'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const slides = [
  {
    title: 'Tu farmacia a domicilio',
    subtitle: 'Medicamentos, salud y bienestar entregados en tu puerta',
    cta: 'Comprar Ahora',
    href: '/categoria/salud-medicamentos',
    badge: '🚀 Entrega rápida',
    gradient: 'from-green-700 via-green-600 to-emerald-500',
    emoji: '💊',
  },
  {
    title: 'Ofertas de la Semana',
    subtitle: 'Hasta 30% de descuento en productos seleccionados',
    cta: 'Ver Ofertas',
    href: '/ofertas',
    badge: '🔥 Descuentos activos',
    gradient: 'from-orange-600 via-orange-500 to-red-400',
    emoji: '🏷️',
  },
  {
    title: 'Cuidado del Bebé',
    subtitle: 'Todo lo que tu bebé necesita con la mejor calidad',
    cta: 'Ver Productos',
    href: '/categoria/cuidado-bebe',
    badge: '👶 Para tu familia',
    gradient: 'from-teal-700 via-teal-600 to-cyan-500',
    emoji: '🍼',
  },
]

export default function HeroBanner() {
  const [current, setCurrent] = useState(0)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => advance(1), 5500)
    return () => clearInterval(timer)
  }, [])

  function advance(dir: 1 | -1) {
    setFading(true)
    setTimeout(() => {
      setCurrent(c => (c + dir + slides.length) % slides.length)
      setFading(false)
    }, 220)
  }

  const slide = slides[current]

  return (
    <div className={`relative bg-gradient-to-br ${slide.gradient} text-white overflow-hidden`}>
      {/* Pattern overlay */}
      <div className="absolute inset-0 opacity-[0.07]"
        style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '28px 28px' }} />

      {/* Big emoji decoration */}
      <div className={`absolute right-6 top-1/2 -translate-y-1/2 text-7xl sm:text-9xl opacity-20 select-none transition-opacity duration-300 ${fading ? 'opacity-0' : 'opacity-20'}`}>
        {slide.emoji}
      </div>

      <div className={`relative container mx-auto px-5 py-10 sm:py-16 md:py-20 flex flex-col items-start sm:items-center sm:text-center max-w-3xl transition-opacity duration-220 ${fading ? 'opacity-0' : 'opacity-100'}`}>
        <span className="inline-block bg-white/20 backdrop-blur-sm text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-full mb-4">
          {slide.badge}
        </span>
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold mb-3 leading-tight max-w-xl">
          {slide.title}
        </h1>
        <p className="text-sm sm:text-base text-white/80 mb-6 max-w-sm sm:max-w-lg">
          {slide.subtitle}
        </p>
        <Link href={slide.href}
          className="bg-yellow-400 text-gray-900 font-bold px-6 py-3 sm:px-8 sm:py-3.5 rounded-full hover:bg-yellow-300 active:scale-95 transition-all shadow-lg text-sm sm:text-base">
          {slide.cta} →
        </Link>
      </div>

      {/* Nav arrows */}
      <button onClick={() => advance(-1)}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/35 backdrop-blur-sm p-1.5 sm:p-2 rounded-full transition-colors">
        <ChevronLeft size={18} />
      </button>
      <button onClick={() => advance(1)}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/35 backdrop-blur-sm p-1.5 sm:p-2 rounded-full transition-colors">
        <ChevronRight size={18} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {slides.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)}
            className={`rounded-full transition-all duration-300 ${i === current ? 'bg-white w-6 h-2' : 'bg-white/40 w-2 h-2'}`} />
        ))}
      </div>
    </div>
  )
}
