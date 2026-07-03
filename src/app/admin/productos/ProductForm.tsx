'use client'
import { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Trash2, Upload, Plus } from 'lucide-react'
import { upsertProduct, deleteProduct, type ProductInput } from './actions'

type Option = { id: string; name: string }

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default function ProductForm({
  product,
  categories,
  brands,
}: {
  product?: ProductInput & { id: string }
  categories: Option[]
  brands: Option[]
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [deleting, startDelete] = useTransition()
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null)
  const slugTouched = useRef(!!product)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    name: product?.name ?? '',
    slug: product?.slug ?? '',
    description: product?.description ?? '',
    price: product?.price ?? 0,
    salePrice: product?.salePrice ?? null as number | null,
    stock: product?.stock ?? 0,
    images: product?.images?.length ? product.images : [''],
    categoryId: product?.categoryId ?? categories[0]?.id ?? '',
    brandId: product?.brandId ?? null as string | null,
    active: product?.active ?? true,
    featured: product?.featured ?? false,
  })

  function set<K extends keyof typeof form>(field: K, value: (typeof form)[K]) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function handleNameChange(value: string) {
    set('name', value)
    if (!slugTouched.current) set('slug', slugify(value))
  }

  function setImage(idx: number, url: string) {
    setForm(f => ({ ...f, images: f.images.map((img, i) => (i === idx ? url : img)) }))
  }

  function addImage() {
    setForm(f => ({ ...f, images: [...f.images, ''] }))
  }

  function removeImage(idx: number) {
    setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }))
  }

  async function handleUpload(idx: number, file: File) {
    setUploadingIdx(idx)
    try {
      const body = new FormData()
      body.append('file', file)
      const res = await fetch('/api/upload/product-image', { method: 'POST', body })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'Error al subir imagen')
        return
      }
      setImage(idx, data.url)
    } finally {
      setUploadingIdx(null)
    }
  }

  function save(e: React.FormEvent) {
    e.preventDefault()
    const images = form.images.map(i => i.trim()).filter(Boolean)
    if (images.length === 0) {
      toast.error('Agrega al menos una imagen')
      return
    }
    startTransition(async () => {
      const result = await upsertProduct({
        ...form,
        images,
        ...(product ? { id: product.id } : {}),
      })
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success(product ? 'Producto actualizado' : 'Producto creado')
      router.push('/admin/productos')
    })
  }

  function handleDelete() {
    if (!product || !confirm('¿Eliminar este producto? Si tiene pedidos asociados se desactivará en vez de borrarse.')) return
    startDelete(async () => {
      const result = await deleteProduct(product.id)
      toast.success(result.deactivated ? 'Producto desactivado (tiene pedidos asociados)' : 'Producto eliminado')
      router.push('/admin/productos')
    })
  }

  return (
    <form onSubmit={save} className="bg-white rounded-xl border p-6 space-y-5 max-w-2xl">
      <div>
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" required value={form.name}
          onChange={e => handleNameChange(e.target.value)}
          placeholder="Ej: Paracetamol 500mg" />
      </div>

      <div>
        <Label htmlFor="slug">Slug (URL)</Label>
        <Input id="slug" required value={form.slug}
          onChange={e => { slugTouched.current = true; set('slug', e.target.value) }}
          placeholder="paracetamol-500mg" />
      </div>

      <div>
        <Label htmlFor="description">Descripción</Label>
        <textarea id="description" value={form.description}
          onChange={e => set('description', e.target.value)}
          rows={3}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none resize-none"
          placeholder="Descripción del producto" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="price">Precio ($)</Label>
          <Input id="price" type="number" step="0.01" min="0" required
            value={form.price}
            onChange={e => set('price', parseFloat(e.target.value) || 0)} />
        </div>
        <div>
          <Label htmlFor="salePrice">Precio oferta ($)</Label>
          <Input id="salePrice" type="number" step="0.01" min="0"
            value={form.salePrice ?? ''}
            onChange={e => set('salePrice', e.target.value ? parseFloat(e.target.value) : null)}
            placeholder="Opcional" />
        </div>
        <div>
          <Label htmlFor="stock">Stock</Label>
          <Input id="stock" type="number" min="0" required
            value={form.stock}
            onChange={e => set('stock', parseInt(e.target.value) || 0)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="categoryId">Categoría</Label>
          <select id="categoryId" required value={form.categoryId}
            onChange={e => set('categoryId', e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none">
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="brandId">Marca</Label>
          <select id="brandId" value={form.brandId ?? ''}
            onChange={e => set('brandId', e.target.value || null)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none">
            <option value="">Sin marca</option>
            {brands.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <Label>Imágenes</Label>
        <div className="space-y-2 mt-1">
          {form.images.map((img, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className="relative w-10 h-10 bg-gray-100 rounded shrink-0 overflow-hidden">
                {img && <Image src={img} alt="" fill className="object-contain" unoptimized />}
              </div>
              <Input value={img} onChange={e => setImage(idx, e.target.value)}
                placeholder="https://..." className="flex-1" />
              <input ref={idx === form.images.length - 1 ? fileInputRef : undefined}
                type="file" accept="image/*" className="hidden" id={`file-${idx}`}
                onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(idx, f) }} />
              <label htmlFor={`file-${idx}`}
                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg cursor-pointer">
                {uploadingIdx === idx ? '...' : <Upload size={16} />}
              </label>
              {form.images.length > 1 && (
                <button type="button" onClick={() => removeImage(idx)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addImage}
            className="flex items-center gap-1.5 text-sm text-green-600 hover:underline">
            <Plus size={14} /> Añadir imagen
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.active}
            onChange={e => set('active', e.target.checked)}
            className="w-4 h-4 accent-green-600" />
          <span className="text-sm text-gray-700">Activo (visible en tienda)</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.featured}
            onChange={e => set('featured', e.target.checked)}
            className="w-4 h-4 accent-green-600" />
          <span className="text-sm text-gray-700">Destacado</span>
        </label>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={pending}
          className="flex-1 bg-green-600 hover:bg-green-700">
          {pending ? 'Guardando...' : product ? 'Guardar cambios' : 'Crear producto'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push('/admin/productos')}>
          Cancelar
        </Button>
        {product && (
          <Button type="button" variant="outline" onClick={handleDelete} disabled={deleting}
            className="text-red-600 border-red-200 hover:bg-red-50">
            {deleting ? '...' : 'Eliminar'}
          </Button>
        )}
      </div>
    </form>
  )
}
