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
    gradient: 'from-green-700 to-emerald-500',
  },
  {
    title: 'Ofertas de la Semana',
    subtitle: 'Hasta 30% de descuento en productos seleccionados',
    cta: 'Ver Ofertas',
    href: '/ofertas',
    badge: '🔥 Descuentos activos',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    title: 'Cuidado del Bebé',
    subtitle: 'Todo lo que tu bebé necesita con la mejor calidad',
    cta: 'Ver Productos',
    href: '/categoria/cuidado-bebe',
    badge: '👶 Para tu familia',
    gradient: 'from-teal-600 to-cyan-400',
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
    }, 250)
  }

  const slide = slides[current]

  return (
    <div className={`relative bg-gradient-to-br ${slide.gradient} text-white overflow-hidden transition-all duration-500`}>
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />

      <div className={`container mx-auto px-4 py-16 md:py-24 flex flex-col items-center text-center relative transition-opacity duration-250 ${fading ? 'opacity-0' : 'opacity-100'}`}>
        <span className="inline-block bg-white/20 backdrop-blur-sm text-sm font-semibold px-4 py-1.5 rounded-full mb-5">
          {slide.badge}
        </span>
        <h1 className="text-3xl md:text-5xl font-extrabold mb-4 max-w-2xl leading-tight">
          {slide.title}
        </h1>
        <p className="text-base md:text-lg text-white/80 mb-8 max-w-lg">
          {slide.subtitle}
        </p>
        <Link href={slide.href}
          className="bg-yellow-400 text-gray-900 font-bold px-8 py-3.5 rounded-full hover:bg-yellow-300 transition-colors shadow-lg">
          {slide.cta}
        </Link>
      </div>

      <button onClick={() => advance(-1)}
        className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2 rounded-full transition-colors">
        <ChevronLeft size={20} />
      </button>
      <button onClick={() => advance(1)}
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2 rounded-full transition-colors">
        <ChevronRight size={20} />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)}
            className={`rounded-full transition-all duration-300 ${i === current ? 'bg-white w-5 h-2' : 'bg-white/40 w-2 h-2'}`} />
        ))}
      </div>
    </div>
  )
}
