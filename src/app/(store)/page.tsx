export const dynamic = 'force-dynamic'

import HeroBanner from '@/components/home/HeroBanner'
import FeaturedProducts from '@/components/home/FeaturedProducts'

const categoryLinks = [
  { name: 'Salud', icon: '💊', slug: 'salud-medicamentos' },
  { name: 'Belleza', icon: '💄', slug: 'belleza' },
  { name: 'Bebé', icon: '🍼', slug: 'cuidado-bebe' },
  { name: 'Personal', icon: '🧴', slug: 'cuidado-personal' },
  { name: 'Alimentos', icon: '🥑', slug: 'alimentos-bebidas' },
  { name: 'Hogar', icon: '🏠', slug: 'hogar-mascotas' },
]

export default function HomePage() {
  return (
    <>
      <HeroBanner />
      <section className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {categoryLinks.map(cat => (
            <a
              key={cat.slug}
              href={`/categoria/${cat.slug}`}
              className="flex flex-col items-center gap-2 p-3 bg-white rounded-xl border hover:border-green-500 hover:shadow-sm transition-all text-center"
            >
              <span className="text-3xl">{cat.icon}</span>
              <span className="text-xs font-medium text-gray-700">{cat.name}</span>
            </a>
          ))}
        </div>
      </section>
      <FeaturedProducts />
    </>
  )
}
