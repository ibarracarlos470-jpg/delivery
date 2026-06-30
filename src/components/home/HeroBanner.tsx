'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const slides = [
  { title: 'Delivery 24/7', subtitle: 'Recibe tus medicamentos en casa', cta: 'Comprar Ahora', href: '/categoria/salud-medicamentos', bg: 'bg-green-700' },
  { title: 'Ofertas de la Semana', subtitle: 'Hasta 30% de descuento en productos seleccionados', cta: 'Ver Ofertas', href: '/ofertas', bg: 'bg-emerald-600' },
  { title: 'Cuidado del Bebé', subtitle: 'Todo lo que tu bebé necesita', cta: 'Ver Productos', href: '/categoria/cuidado-bebe', bg: 'bg-teal-600' },
]

export default function HeroBanner() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setCurrent(c => (c + 1) % slides.length), 5000)
    return () => clearInterval(timer)
  }, [])

  const slide = slides[current]

  return (
    <div className={`${slide.bg} text-white transition-colors duration-700`}>
      <div className="container mx-auto px-4 py-16 flex flex-col items-center text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">{slide.title}</h1>
        <p className="text-lg text-green-100 mb-8 max-w-lg">{slide.subtitle}</p>
        <Link
          href={slide.href}
          className="bg-yellow-400 text-gray-900 font-bold px-8 py-3 rounded-full hover:bg-yellow-300 transition-colors"
        >
          {slide.cta}
        </Link>
        <div className="flex gap-2 mt-8">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-colors ${i === current ? 'bg-white' : 'bg-green-400'}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
