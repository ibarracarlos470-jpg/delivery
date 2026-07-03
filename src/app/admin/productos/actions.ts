'use server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@/generated/prisma/client'
import { revalidatePath } from 'next/cache'

async function requireAdmin() {
  const { userId } = await auth()
  if (!userId) throw new Error('No autorizado')
  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user || user.role !== 'ADMIN') throw new Error('Solo administradores')
  return user
}

export type ProductInput = {
  id?: string
  name: string
  slug: string
  description: string
  price: number
  salePrice: number | null
  stock: number
  images: string[]
  categoryId: string
  brandId: string | null
  active: boolean
  featured: boolean
}

export async function upsertProduct(data: ProductInput): Promise<{ error?: string }> {
  const admin = await requireAdmin()
  const { id, ...rest } = data

  try {
    if (id) {
      await prisma.product.update({ where: { id }, data: rest })
    } else {
      await prisma.product.create({ data: { ...rest, branchId: admin.branchId } })
    }
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return { error: 'Ya existe un producto con ese slug' }
    }
    throw e
  }

  revalidatePath('/admin/productos')
  return {}
}

export async function deleteProduct(id: string) {
  await requireAdmin()

  const orderCount = await prisma.orderItem.count({ where: { productId: id } })
  if (orderCount > 0) {
    // Products referenced in past orders can't be hard-deleted without breaking order history
    await prisma.product.update({ where: { id }, data: { active: false } })
    revalidatePath('/admin/productos')
    return { deactivated: true }
  }

  await prisma.cartItem.deleteMany({ where: { productId: id } })
  await prisma.product.delete({ where: { id } })
  revalidatePath('/admin/productos')
  return { deactivated: false }
}
