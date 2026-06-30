'use client'
import { useState } from 'react'
import { Minus, Plus, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/store/cart'
import { toast } from 'sonner'

type Product = {
  id: string
  name: string
  price: number
  salePrice: number | null
  images: string[]
  stock: number
}

export default function AddToCartButton({ product }: { product: Product }) {
  const [qty, setQty] = useState(1)
  const { addItem } = useCartStore()

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        salePrice: product.salePrice,
        image: product.images[0] ?? '/placeholder.svg',
        stock: product.stock,
      })
    }
    toast.success(`${qty} ${qty === 1 ? 'unidad agregada' : 'unidades agregadas'} al carrito`)
  }

  if (product.stock === 0) {
    return <Button disabled className="w-full">Agotado</Button>
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={() => setQty(q => Math.max(1, q - 1))}>
          <Minus size={16} />
        </Button>
        <span className="text-xl font-semibold w-8 text-center">{qty}</span>
        <Button variant="outline" size="icon" onClick={() => setQty(q => Math.min(product.stock, q + 1))}>
          <Plus size={16} />
        </Button>
      </div>
      <Button onClick={handleAdd} className="w-full bg-green-600 hover:bg-green-700 h-12 text-base">
        <ShoppingCart className="mr-2" size={20} />
        Agregar al Carrito
      </Button>
    </div>
  )
}
