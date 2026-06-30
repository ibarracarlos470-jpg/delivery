import Link from 'next/link'

const categories = [
  { name: 'Salud y Medicamentos', slug: 'salud-medicamentos' },
  { name: 'Belleza', slug: 'belleza' },
  { name: 'Bebé', slug: 'cuidado-bebe' },
  { name: 'Cuidado Personal', slug: 'cuidado-personal' },
  { name: 'Alimentos', slug: 'alimentos-bebidas' },
  { name: 'Hogar y Mascotas', slug: 'hogar-mascotas' },
]

export default function CategoryNav() {
  return (
    <nav className="bg-white border-b shadow-sm">
      <div className="container mx-auto px-4">
        <ul className="flex gap-1 overflow-x-auto">
          {categories.map(cat => (
            <li key={cat.name}>
              <Link
                href={`/categoria/${cat.slug}`}
                className="block px-4 py-3 text-sm font-medium text-gray-700 hover:text-green-700 hover:bg-green-50 whitespace-nowrap transition-colors"
              >
                {cat.name}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/ofertas"
              className="block px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 whitespace-nowrap transition-colors"
            >
              Ofertas
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}
