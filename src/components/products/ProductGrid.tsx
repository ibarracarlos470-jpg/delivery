import ProductCard from './ProductCard'

type Product = {
  id: string
  name: string
  slug: string
  price: number
  salePrice: number | null
  images: string[]
  stock: number
  brand?: { name: string } | null
}

export default function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="text-lg">No se encontraron productos</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
