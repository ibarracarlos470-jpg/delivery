'use client'
import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/store/cart'

export default function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCartStore()

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-2xl font-bold text-gray-600 mb-4">Tu carrito está vacío</p>
        <Link href="/">
          <Button className="bg-green-600 hover:bg-green-700">Ir a Comprar</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Mi Carrito</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-lg border p-4 flex gap-4 items-center">
              <div className="relative w-20 h-20 shrink-0 bg-gray-50 rounded">
                <Image src={item.image} alt={item.name} fill className="object-contain p-1" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 line-clamp-2">{item.name}</p>
                <p className="text-green-700 font-bold mt-1">${(item.salePrice ?? item.price).toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                  <Minus size={14} />
                </Button>
                <span className="w-6 text-center font-semibold">{item.quantity}</span>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                  <Plus size={14} />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700" onClick={() => removeItem(item.id)}>
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg border p-6 h-fit sticky top-20">
          <h2 className="text-lg font-bold mb-4">Resumen del Pedido</h2>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal ({items.reduce((a, i) => a + i.quantity, 0)} items)</span>
              <span>${total().toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Envío</span>
              <span className="text-green-600">Gratis</span>
            </div>
          </div>
          <div className="border-t pt-4 mb-6">
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-green-700">${total().toFixed(2)}</span>
            </div>
          </div>
          <Link href="/checkout">
            <Button className="w-full bg-green-600 hover:bg-green-700 h-12 text-base">
              Proceder al Pago
            </Button>
          </Link>
          <Link href="/" className="block text-center text-sm text-gray-500 hover:text-gray-700 mt-3">
            Seguir comprando
          </Link>
        </div>
      </div>
    </div>
  )
}
