export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import Image from 'next/image'

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { category: { select: { name: true } }, brand: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Productos</h1>
        <Link href="/admin/productos/nuevo">
          <Button className="bg-green-600 hover:bg-green-700">+ Nuevo Producto</Button>
        </Link>
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 font-semibold text-gray-600 text-sm">Producto</th>
              <th className="text-left p-4 font-semibold text-gray-600 text-sm">Categoría</th>
              <th className="text-left p-4 font-semibold text-gray-600 text-sm">Precio</th>
              <th className="text-left p-4 font-semibold text-gray-600 text-sm">Stock</th>
              <th className="text-left p-4 font-semibold text-gray-600 text-sm">Estado</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 bg-gray-100 rounded shrink-0">
                      <Image
                        src={p.images[0] ?? '/placeholder.svg'}
                        alt={p.name}
                        fill
                        className="object-contain p-1"
                      />
                    </div>
                    <span className="font-medium text-gray-800 text-sm line-clamp-1">{p.name}</span>
                  </div>
                </td>
                <td className="p-4 text-gray-600 text-sm">{p.category.name}</td>
                <td className="p-4">
                  <span className="font-semibold text-sm">
                    ${(p.salePrice ?? p.price).toFixed(2)}
                  </span>
                  {p.salePrice && (
                    <span className="ml-2 text-xs text-gray-400 line-through">${p.price.toFixed(2)}</span>
                  )}
                </td>
                <td className="p-4">
                  <span className={`text-sm font-medium ${p.stock < 10 ? 'text-red-600' : 'text-gray-600'}`}>
                    {p.stock}
                  </span>
                </td>
                <td className="p-4">
                  <Badge className={p.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {p.active ? 'Activo' : 'Inactivo'}
                  </Badge>
                </td>
                <td className="p-4">
                  <Link href={`/admin/productos/${p.id}`}>
                    <Button variant="ghost" size="sm">Editar</Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
