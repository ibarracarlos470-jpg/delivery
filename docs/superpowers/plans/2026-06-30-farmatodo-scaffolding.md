# Farmatodo Clone - Full Project Scaffolding Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffoldar una aplicación e-commerce de farmacia completa con Next.js 15, autenticación, base de datos, carrito de compras y panel de administración.

**Architecture:** Next.js 15 App Router con TypeScript como framework principal. PostgreSQL con Prisma como ORM para persistencia. Clerk para autenticación, Zustand para estado del carrito en cliente, Stripe para pagos, y Vercel Blob para almacenamiento de imágenes.

**Tech Stack:** Next.js 15 · TypeScript · Tailwind CSS v4 · shadcn/ui · Prisma · PostgreSQL (Neon) · Clerk · Zustand · Stripe · Vercel Blob · Vercel

## Global Constraints

- Next.js 15.x con App Router (no Pages Router)
- TypeScript strict mode habilitado
- Tailwind CSS v4
- Node.js 24 LTS
- Todas las rutas de admin protegidas con rol "ADMIN"
- Imágenes de producto servidas desde Vercel Blob
- Variables de entorno nunca hardcodeadas

---

### Task 1: Inicializar proyecto Next.js con TypeScript y Tailwind

**Files:**
- Create: `package.json` (generado por CLI)
- Create: `next.config.ts`
- Create: `tailwind.config.ts`
- Create: `.env.local`
- Create: `.env.example`
- Create: `.gitignore`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`

**Interfaces:**
- Produces: Proyecto Next.js 15 corriendo en `http://localhost:3000`

- [ ] **Step 1: Crear el proyecto Next.js**

Ejecutar en `C:\Users\ITC Ventas\Documents\Claude\Proyecto\Delivery`:

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-turbopack
```

- [ ] **Step 2: Verificar que el proyecto corre**

```bash
npm run dev
```

Abrir `http://localhost:3000` — debe mostrar la página default de Next.js.

- [ ] **Step 3: Limpiar la página default**

Reemplazar `src/app/page.tsx`:
```tsx
export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <h1 className="text-4xl font-bold text-green-600">Farmatodo VE</h1>
    </main>
  )
}
```

Reemplazar `src/app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-primary: #00873d;
  --color-primary-dark: #006830;
  --color-secondary: #ffd700;
}

* {
  box-sizing: border-box;
}
```

- [ ] **Step 4: Crear `.env.example`**

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/farmatodo"

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/registro
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
CLERK_WEBHOOK_SECRET=whsec_...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Vercel Blob
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Copiar `.env.example` a `.env.local` y rellenar los valores reales.

- [ ] **Step 5: Actualizar `.gitignore`**

Asegurarse que `.env.local` y `.env.*.local` están en `.gitignore` (create-next-app lo hace automáticamente).

- [ ] **Step 6: Commit**

```bash
git init
git add .
git commit -m "feat: initialize Next.js 15 project with TypeScript and Tailwind"
```

---

### Task 2: Instalar y configurar dependencias

**Files:**
- Modify: `package.json`
- Create: `src/lib/prisma.ts`
- Create: `src/lib/utils.ts`
- Create: `prisma/schema.prisma` (inicializado por CLI)

**Interfaces:**
- Consumes: Proyecto Next.js de Task 1
- Produces: Todas las dependencias instaladas y configuradas; `prisma` singleton exportado desde `@/lib/prisma`; `cn()` exportado desde `@/lib/utils`

- [ ] **Step 1: Instalar dependencias de producción**

```bash
npm install @prisma/client @clerk/nextjs stripe @vercel/blob zustand @tanstack/react-query axios zod react-hook-form @hookform/resolvers lucide-react class-variance-authority clsx tailwind-merge svix sonner
```

- [ ] **Step 2: Instalar dependencias de desarrollo**

```bash
npm install -D prisma ts-node @types/node
```

- [ ] **Step 3: Instalar y configurar shadcn/ui**

```bash
npx shadcn@latest init --defaults
```

Luego instalar los componentes base:
```bash
npx shadcn@latest add button card badge input label sheet dialog dropdown-menu separator skeleton avatar sonner
```

- [ ] **Step 4: Inicializar Prisma**

```bash
npx prisma init
```

Esto crea `prisma/schema.prisma` y añade `DATABASE_URL` al `.env`.

- [ ] **Step 5: Crear singleton de Prisma client**

Crear `src/lib/prisma.ts`:
```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

- [ ] **Step 6: Crear utility cn para shadcn**

Crear `src/lib/utils.ts`:
```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat: install and configure all dependencies (Prisma, Clerk, Stripe, shadcn/ui)"
```

---

### Task 3: Esquema de base de datos con Prisma

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/seed.ts`
- Modify: `package.json` (campo prisma.seed)

**Interfaces:**
- Consumes: `src/lib/prisma.ts` de Task 2, `DATABASE_URL` en `.env.local`
- Produces:
  - Tablas creadas en PostgreSQL
  - Datos semilla: 6 categorías, 2 marcas, 10 productos, 3 banners
  - Tipos Prisma generados: `User`, `Category`, `Brand`, `Product`, `Cart`, `CartItem`, `Order`, `OrderItem`, `Payment`, `Banner`

- [ ] **Step 1: Definir el schema completo**

Reemplazar `prisma/schema.prisma`:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  CUSTOMER
  ADMIN
}

enum OrderStatus {
  PENDING
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}

enum PaymentMethod {
  CARD
  TRANSFER
  MOBILE_PAY
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
}

model User {
  id        String   @id @default(cuid())
  clerkId   String   @unique
  email     String   @unique
  name      String?
  phone     String?
  role      Role     @default(CUSTOMER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  cart   Cart?
  orders Order[]
}

model Category {
  id       String  @id @default(cuid())
  name     String
  slug     String  @unique
  image    String?
  parentId String?

  parent   Category?  @relation("CategoryTree", fields: [parentId], references: [id])
  children Category[] @relation("CategoryTree")
  products Product[]
}

model Brand {
  id       String    @id @default(cuid())
  name     String
  slug     String    @unique
  logo     String?
  products Product[]
}

model Product {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String?
  price       Float
  salePrice   Float?
  stock       Int      @default(0)
  images      String[]
  featured    Boolean  @default(false)
  active      Boolean  @default(true)
  categoryId  String
  brandId     String?

  category   Category    @relation(fields: [categoryId], references: [id])
  brand      Brand?      @relation(fields: [brandId], references: [id])
  cartItems  CartItem[]
  orderItems OrderItem[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Cart {
  id     String @id @default(cuid())
  userId String @unique

  user      User       @relation(fields: [userId], references: [id])
  items     CartItem[]
  updatedAt DateTime   @updatedAt
}

model CartItem {
  id        String @id @default(cuid())
  cartId    String
  productId String
  quantity  Int    @default(1)

  cart    Cart    @relation(fields: [cartId], references: [id], onDelete: Cascade)
  product Product @relation(fields: [productId], references: [id])
}

model Order {
  id              String      @id @default(cuid())
  userId          String
  status          OrderStatus @default(PENDING)
  total           Float
  shippingAddress Json
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  user    User        @relation(fields: [userId], references: [id])
  items   OrderItem[]
  payment Payment?
}

model OrderItem {
  id        String @id @default(cuid())
  orderId   String
  productId String
  quantity  Int
  unitPrice Float

  order   Order   @relation(fields: [orderId], references: [id])
  product Product @relation(fields: [productId], references: [id])
}

model Payment {
  id        String        @id @default(cuid())
  orderId   String        @unique
  method    PaymentMethod
  amount    Float
  status    PaymentStatus @default(PENDING)
  reference String?
  createdAt DateTime      @default(now())

  order Order @relation(fields: [orderId], references: [id])
}

model Banner {
  id        String  @id @default(cuid())
  title     String
  image     String
  targetUrl String?
  active    Boolean @default(true)
  order     Int     @default(0)
}
```

- [ ] **Step 2: Ejecutar migración inicial**

Asegurarse que `DATABASE_URL` en `.env.local` apunta a una base de datos PostgreSQL real (Neon, local Docker, etc.), luego:

```bash
npx prisma migrate dev --name init
```

Expected: Prisma crea las tablas y genera el cliente TypeScript.

- [ ] **Step 3: Crear seed con datos de prueba**

Crear `prisma/seed.ts`:
```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const salud = await prisma.category.upsert({
    where: { slug: 'salud-medicamentos' },
    update: {},
    create: { name: 'Salud y Medicamentos', slug: 'salud-medicamentos' },
  })
  const belleza = await prisma.category.upsert({
    where: { slug: 'belleza' },
    update: {},
    create: { name: 'Belleza', slug: 'belleza' },
  })
  const bebe = await prisma.category.upsert({
    where: { slug: 'cuidado-bebe' },
    update: {},
    create: { name: 'Cuidado del Bebé', slug: 'cuidado-bebe' },
  })
  const personal = await prisma.category.upsert({
    where: { slug: 'cuidado-personal' },
    update: {},
    create: { name: 'Cuidado Personal', slug: 'cuidado-personal' },
  })
  const alimentos = await prisma.category.upsert({
    where: { slug: 'alimentos-bebidas' },
    update: {},
    create: { name: 'Alimentos y Bebidas', slug: 'alimentos-bebidas' },
  })
  const hogar = await prisma.category.upsert({
    where: { slug: 'hogar-mascotas' },
    update: {},
    create: { name: 'Hogar, Mascotas y Otros', slug: 'hogar-mascotas' },
  })

  const bayer = await prisma.brand.upsert({
    where: { slug: 'bayer' },
    update: {},
    create: { name: 'Bayer', slug: 'bayer' },
  })
  const johnson = await prisma.brand.upsert({
    where: { slug: 'johnson-johnson' },
    update: {},
    create: { name: 'Johnson & Johnson', slug: 'johnson-johnson' },
  })

  const products = [
    { name: 'Aspirina 500mg x 20 tab', slug: 'aspirina-500mg-20-tab', price: 2.5, salePrice: 1.99, stock: 100, categoryId: salud.id, brandId: bayer.id, featured: true, images: [] as string[] },
    { name: 'Paracetamol 1g x 10 tab', slug: 'paracetamol-1g-10-tab', price: 1.8, salePrice: null, stock: 200, categoryId: salud.id, brandId: null, featured: true, images: [] as string[] },
    { name: 'Vitamina C 1000mg x 30 tab', slug: 'vitamina-c-1000mg-30-tab', price: 5.99, salePrice: 4.99, stock: 150, categoryId: salud.id, brandId: null, featured: true, images: [] as string[] },
    { name: 'Shampoo Pantene 400ml', slug: 'shampoo-pantene-400ml', price: 3.5, salePrice: null, stock: 80, categoryId: belleza.id, brandId: null, featured: false, images: [] as string[] },
    { name: 'Crema Nivea Aclarante 200ml', slug: 'crema-nivea-aclarante-200ml', price: 4.2, salePrice: 3.5, stock: 60, categoryId: belleza.id, brandId: null, featured: false, images: [] as string[] },
    { name: 'Pañales Pampers Talla 2 x 30', slug: 'panales-pampers-talla2-30', price: 12.0, salePrice: null, stock: 50, categoryId: bebe.id, brandId: null, featured: true, images: [] as string[] },
    { name: 'Johnson Baby Lotion 200ml', slug: 'johnson-baby-lotion-200ml', price: 3.8, salePrice: null, stock: 90, categoryId: bebe.id, brandId: johnson.id, featured: false, images: [] as string[] },
    { name: 'Colgate Total 12 150ml', slug: 'colgate-total-12-150ml', price: 2.9, salePrice: null, stock: 120, categoryId: personal.id, brandId: null, featured: false, images: [] as string[] },
    { name: 'Avena Quaker 800g', slug: 'avena-quaker-800g', price: 2.1, salePrice: null, stock: 70, categoryId: alimentos.id, brandId: null, featured: false, images: [] as string[] },
    { name: 'Desinfectante Lysol 1L', slug: 'desinfectante-lysol-1l', price: 3.2, salePrice: null, stock: 45, categoryId: hogar.id, brandId: null, featured: false, images: [] as string[] },
  ]

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: { ...p, description: `Descripción de ${p.name}` },
    })
  }

  await prisma.banner.createMany({
    skipDuplicates: true,
    data: [
      { title: 'Delivery 24/7', image: '/banners/delivery.jpg', targetUrl: '/', active: true, order: 0 },
      { title: 'Ofertas de la semana', image: '/banners/ofertas.jpg', targetUrl: '/ofertas', active: true, order: 1 },
      { title: 'Programa Cuidamos tu Salud', image: '/banners/salud.jpg', targetUrl: '/categoria/salud-medicamentos', active: true, order: 2 },
    ],
  })

  console.log('✅ Seed completado')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

- [ ] **Step 4: Configurar script de seed en package.json**

Añadir después de la clave `"scripts"` en `package.json`:
```json
"prisma": {
  "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
}
```

- [ ] **Step 5: Ejecutar seed**

```bash
npx prisma db seed
```

Expected output: `✅ Seed completado`

- [ ] **Step 6: Verificar datos en Prisma Studio**

```bash
npx prisma studio
```

Abrir `http://localhost:5555` — verificar que hay registros en Category (6), Product (10), Banner (3).

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat: add Prisma schema with all models and seed data"
```

---

### Task 4: Configurar Clerk Auth y Middleware

**Files:**
- Create: `src/middleware.ts`
- Modify: `src/app/layout.tsx`
- Create: `src/app/(auth)/login/[[...login]]/page.tsx`
- Create: `src/app/(auth)/registro/[[...registro]]/page.tsx`
- Create: `src/app/api/webhooks/clerk/route.ts`

**Interfaces:**
- Consumes: Variables `CLERK_*` de `.env.local`
- Produces:
  - Rutas protegidas (carrito, checkout, pedidos, admin) redirigen a `/login` si no autenticado
  - Páginas `/login` y `/registro` muestran UI de Clerk
  - Webhook `/api/webhooks/clerk` sincroniza usuarios nuevos a la tabla `User`

- [ ] **Step 1: Crear middleware de Clerk**

Crear `src/middleware.ts`:
```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/login(.*)',
  '/registro(.*)',
  '/categoria/(.*)',
  '/producto/(.*)',
  '/buscar(.*)',
  '/ofertas(.*)',
  '/api/webhooks/(.*)',
  '/api/products(.*)',
  '/api/categories(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
```

- [ ] **Step 2: Envolver la app con ClerkProvider**

Reemplazar `src/app/layout.tsx`:
```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Farmatodo VE - Farmacia Online 24/7',
  description: 'Tu farmacia online con delivery 24/7 en Venezuela',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="es">
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  )
}
```

- [ ] **Step 3: Crear página de login**

Crear `src/app/(auth)/login/[[...login]]/page.tsx`:
```tsx
import { SignIn } from '@clerk/nextjs'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <SignIn />
    </div>
  )
}
```

- [ ] **Step 4: Crear página de registro**

Crear `src/app/(auth)/registro/[[...registro]]/page.tsx`:
```tsx
import { SignUp } from '@clerk/nextjs'

export default function RegistroPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <SignUp />
    </div>
  )
}
```

- [ ] **Step 5: Crear webhook de Clerk para sincronizar usuarios a DB**

Crear `src/app/api/webhooks/clerk/route.ts`:
```typescript
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { Webhook } from 'svix'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET
  if (!WEBHOOK_SECRET) return new Response('No webhook secret', { status: 500 })

  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing svix headers', { status: 400 })
  }

  const payload = await req.json()
  const body = JSON.stringify(payload)
  const wh = new Webhook(WEBHOOK_SECRET)
  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch {
    return new Response('Invalid signature', { status: 400 })
  }

  if (evt.type === 'user.created') {
    await prisma.user.create({
      data: {
        clerkId: evt.data.id,
        email: evt.data.email_addresses[0].email_address,
        name: `${evt.data.first_name ?? ''} ${evt.data.last_name ?? ''}`.trim() || null,
      },
    })
  }

  return new Response('OK', { status: 200 })
}
```

- [ ] **Step 6: Verificar auth**

```bash
npm run dev
```

- Navegar a `http://localhost:3000/carrito` → debe redirigir a `/login`
- Navegar a `http://localhost:3000/login` → debe mostrar el formulario de Clerk

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat: configure Clerk auth with middleware and webhook user sync"
```

---

### Task 5: Layout principal — Header, CategoryNav y Footer

**Files:**
- Create: `src/components/layout/Header.tsx`
- Create: `src/components/layout/Footer.tsx`
- Create: `src/components/layout/CategoryNav.tsx`
- Create: `src/app/(store)/layout.tsx`
- Modify: `src/app/(store)/page.tsx` (mover desde `src/app/page.tsx`)

**Interfaces:**
- Consumes: ClerkProvider de Task 4, shadcn/ui de Task 2, `useCartStore()` de Task 6 (importado con lazy, no circular)
- Produces: Layout de tienda con header verde, nav de categorías y footer; ruta `/` carga desde `(store)/page.tsx`

- [ ] **Step 1: Crear el Header**

Crear `src/components/layout/Header.tsx`:
```tsx
'use client'
import Link from 'next/link'
import { Search, ShoppingCart, MapPin } from 'lucide-react'
import { UserButton, SignInButton, useUser } from '@clerk/nextjs'
import { useCartStore } from '@/store/cart'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Header() {
  const { isSignedIn } = useUser()
  const { items } = useCartStore()
  const [query, setQuery] = useState('')
  const router = useRouter()
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) router.push(`/buscar?q=${encodeURIComponent(query)}`)
  }

  return (
    <header className="bg-[#00873d] text-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-2xl font-bold text-white shrink-0">
            FarmaTodo
          </Link>

          <button className="hidden md:flex items-center gap-1 text-sm text-green-100 shrink-0">
            <MapPin size={16} />
            Caracas
          </button>

          <form onSubmit={handleSearch} className="flex-1 flex gap-2 max-w-xl">
            <Input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar productos..."
              className="bg-white text-gray-900 border-0 h-10"
            />
            <Button type="submit" variant="secondary" size="icon" className="h-10 w-10">
              <Search size={18} />
            </Button>
          </form>

          <div className="flex items-center gap-3 ml-auto shrink-0">
            {isSignedIn ? (
              <UserButton afterSignOutUrl="/" />
            ) : (
              <SignInButton mode="modal">
                <Button variant="outline" size="sm" className="border-white text-white hover:bg-green-700">
                  Ingresar
                </Button>
              </SignInButton>
            )}

            <Link href="/carrito" className="relative">
              <ShoppingCart size={24} />
              {totalItems > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-yellow-400 text-black text-xs font-bold">
                  {totalItems}
                </Badge>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
```

- [ ] **Step 2: Crear CategoryNav**

Crear `src/components/layout/CategoryNav.tsx`:
```tsx
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
```

- [ ] **Step 3: Crear Footer**

Crear `src/components/layout/Footer.tsx`:
```tsx
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-bold mb-4">FarmaTodo VE</h3>
            <p className="text-sm">Tu farmacia online de confianza. Delivery 24/7 en Venezuela.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Categorías</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/categoria/salud-medicamentos" className="hover:text-white">Salud</Link></li>
              <li><Link href="/categoria/belleza" className="hover:text-white">Belleza</Link></li>
              <li><Link href="/categoria/cuidado-bebe" className="hover:text-white">Bebé</Link></li>
              <li><Link href="/categoria/cuidado-personal" className="hover:text-white">Personal</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Mi Cuenta</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/perfil" className="hover:text-white">Mi Perfil</Link></li>
              <li><Link href="/pedidos" className="hover:text-white">Mis Pedidos</Link></li>
              <li><Link href="/carrito" className="hover:text-white">Mi Carrito</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Información</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/sobre-nosotros" className="hover:text-white">Sobre Nosotros</Link></li>
              <li><Link href="/terminos" className="hover:text-white">Términos y Condiciones</Link></li>
              <li><Link href="/privacidad" className="hover:text-white">Política de Privacidad</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm">
          <p>© 2026 FarmaTodo VE. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
```

- [ ] **Step 4: Crear layout del grupo (store)**

Crear `src/app/(store)/layout.tsx`:
```tsx
import Header from '@/components/layout/Header'
import CategoryNav from '@/components/layout/CategoryNav'
import Footer from '@/components/layout/Footer'

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <CategoryNav />
      <main className="flex-1 bg-gray-50">{children}</main>
      <Footer />
    </div>
  )
}
```

- [ ] **Step 5: Mover Home al grupo (store)**

Eliminar `src/app/page.tsx` y crear `src/app/(store)/page.tsx`:
```tsx
export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-green-700">Bienvenido a FarmaTodo VE</h1>
      <p className="text-gray-600 mt-2">Tu farmacia online con delivery 24/7</p>
    </div>
  )
}
```

- [ ] **Step 6: Verificar layout**

```bash
npm run dev
```

Navegar a `http://localhost:3000` → debe mostrar header verde, barra de categorías, contenido y footer gris.

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat: add store layout with Header, CategoryNav and Footer"
```

---

### Task 6: Zustand cart store y componentes de producto

**Files:**
- Create: `src/store/cart.ts`
- Create: `src/components/products/ProductCard.tsx`
- Create: `src/components/products/ProductGrid.tsx`
- Create: `src/components/products/AddToCartButton.tsx`
- Create: `src/components/providers/Providers.tsx`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Produces:
  - `useCartStore()` con `{ items: CartItem[], addItem, removeItem, updateQuantity, clearCart, total(), itemCount() }`
  - `CartItem = { id, name, price, salePrice, image, quantity, stock }`
  - `<ProductCard product={...} />` → tarjeta con imagen, precio, badge de descuento, botón agregar
  - `<ProductGrid products={[...]} />` → grid responsive 2→3→4→5 columnas
  - `<AddToCartButton product={...} />` → selector de cantidad + botón (cliente)

- [ ] **Step 1: Crear el cart store con Zustand**

Crear `src/store/cart.ts`:
```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CartItem = {
  id: string
  name: string
  price: number
  salePrice: number | null
  image: string
  quantity: number
  stock: number
}

type CartStore = {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  total: () => number
  itemCount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find(i => i.id === item.id)
          if (existing) {
            return {
              items: state.items.map(i =>
                i.id === item.id
                  ? { ...i, quantity: Math.min(i.quantity + 1, item.stock) }
                  : i
              ),
            }
          }
          return { items: [...state.items, { ...item, quantity: 1 }] }
        })
      },

      removeItem: (id) =>
        set(state => ({ items: state.items.filter(i => i.id !== id) })),

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id)
          return
        }
        set(state => ({
          items: state.items.map(i => (i.id === id ? { ...i, quantity } : i)),
        }))
      },

      clearCart: () => set({ items: [] }),

      total: () =>
        get().items.reduce(
          (acc, item) => acc + (item.salePrice ?? item.price) * item.quantity,
          0
        ),

      itemCount: () =>
        get().items.reduce((acc, item) => acc + item.quantity, 0),
    }),
    { name: 'farmatodo-cart' }
  )
)
```

- [ ] **Step 2: Crear ProductCard**

Crear `src/components/products/ProductCard.tsx`:
```tsx
'use client'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCartStore } from '@/store/cart'
import { toast } from 'sonner'

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

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCartStore()
  const hasDiscount = product.salePrice !== null && product.salePrice < product.price
  const discountPct = hasDiscount
    ? Math.round((1 - product.salePrice! / product.price) * 100)
    : 0

  const handleAdd = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      salePrice: product.salePrice,
      image: product.images[0] ?? '/placeholder.svg',
      stock: product.stock,
    })
    toast.success('Producto agregado al carrito')
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow flex flex-col">
      <Link
        href={`/producto/${product.slug}`}
        className="relative aspect-square overflow-hidden rounded-t-lg bg-gray-100 block"
      >
        {hasDiscount && (
          <Badge className="absolute top-2 left-2 z-10 bg-red-500 text-white">
            -{discountPct}%
          </Badge>
        )}
        <Image
          src={product.images[0] ?? '/placeholder.svg'}
          alt={product.name}
          fill
          className="object-contain p-4"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      </Link>

      <div className="p-3 flex flex-col flex-1">
        {product.brand && (
          <p className="text-xs text-gray-400 mb-1">{product.brand.name}</p>
        )}
        <Link
          href={`/producto/${product.slug}`}
          className="text-sm font-medium text-gray-800 hover:text-green-700 line-clamp-2 flex-1"
        >
          {product.name}
        </Link>

        <div className="mt-2 flex items-end justify-between">
          <div>
            {hasDiscount ? (
              <>
                <p className="text-lg font-bold text-green-700">${product.salePrice!.toFixed(2)}</p>
                <p className="text-xs text-gray-400 line-through">${product.price.toFixed(2)}</p>
              </>
            ) : (
              <p className="text-lg font-bold text-green-700">${product.price.toFixed(2)}</p>
            )}
          </div>

          <Button
            size="sm"
            onClick={handleAdd}
            disabled={product.stock === 0}
            className="bg-green-600 hover:bg-green-700 h-8 w-8 p-0"
          >
            <ShoppingCart size={16} />
          </Button>
        </div>

        {product.stock === 0 && (
          <p className="text-xs text-red-500 mt-1">Agotado</p>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Crear ProductGrid**

Crear `src/components/products/ProductGrid.tsx`:
```tsx
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
```

- [ ] **Step 4: Crear AddToCartButton (client component para detalle de producto)**

Crear `src/components/products/AddToCartButton.tsx`:
```tsx
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
```

- [ ] **Step 5: Crear Providers wrapper con Toaster**

Crear `src/components/providers/Providers.tsx`:
```tsx
'use client'
import { Toaster } from '@/components/ui/sonner'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster position="bottom-right" />
    </>
  )
}
```

- [ ] **Step 6: Añadir Providers al layout raíz**

Reemplazar `src/app/layout.tsx`:
```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import Providers from '@/components/providers/Providers'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Farmatodo VE - Farmacia Online 24/7',
  description: 'Tu farmacia online con delivery 24/7 en Venezuela',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="es">
        <body className={inter.className}>
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  )
}
```

- [ ] **Step 7: Crear placeholder SVG**

Crear `public/placeholder.svg`:
```svg
<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="400" fill="#f3f4f6"/>
  <text x="200" y="210" font-family="Arial" font-size="16" fill="#9ca3af" text-anchor="middle">Sin imagen</text>
</svg>
```

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "feat: add Zustand cart store and ProductCard/ProductGrid/AddToCartButton components"
```

---

### Task 7: API Routes principales

**Files:**
- Create: `src/app/api/products/route.ts`
- Create: `src/app/api/products/[id]/route.ts`
- Create: `src/app/api/categories/route.ts`
- Create: `src/app/api/orders/route.ts`

**Interfaces:**
- Produces:
  - `GET /api/products?category=slug&search=q&featured=true&limit=20&page=1` → `{ products: Product[], total, page, pages }`
  - `GET /api/products/[id]` → `Product` con brand y category incluidos
  - `GET /api/categories` → `Category[]`
  - `POST /api/orders` (auth requerida) → `Order` creada con items y payment
  - `GET /api/orders` (auth requerida) → `Order[]` del usuario autenticado

- [ ] **Step 1: API de listado de productos**

Crear `src/app/api/products/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const search = searchParams.get('search')
  const featured = searchParams.get('featured')
  const limit = parseInt(searchParams.get('limit') ?? '20')
  const page = parseInt(searchParams.get('page') ?? '1')

  const where = {
    active: true,
    ...(category && { category: { slug: category } }),
    ...(search && { name: { contains: search, mode: 'insensitive' as const } }),
    ...(featured === 'true' && { featured: true }),
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        brand: { select: { name: true } },
        category: { select: { name: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: (page - 1) * limit,
    }),
    prisma.product.count({ where }),
  ])

  return NextResponse.json({ products, total, page, pages: Math.ceil(total / limit) })
}
```

- [ ] **Step 2: API de producto individual**

Crear `src/app/api/products/[id]/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const product = await prisma.product.findUnique({
    where: { id },
    include: { brand: true, category: true },
  })
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(product)
}
```

- [ ] **Step 3: API de categorías**

Crear `src/app/api/categories/route.ts`:
```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(categories)
}
```

- [ ] **Step 4: API de órdenes**

Crear `src/app/api/orders/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const OrderSchema = z.object({
  items: z.array(
    z.object({ productId: z.string(), quantity: z.number().int().positive() })
  ),
  shippingAddress: z.object({
    name: z.string(),
    phone: z.string(),
    address: z.string(),
    city: z.string(),
  }),
  paymentMethod: z.enum(['CARD', 'TRANSFER', 'MOBILE_PAY']),
})

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = OrderSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues }, { status: 400 })

  const { items, shippingAddress, paymentMethod } = parsed.data

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const products = await prisma.product.findMany({
    where: { id: { in: items.map(i => i.productId) } },
  })

  const total = items.reduce((acc, item) => {
    const product = products.find(p => p.id === item.productId)!
    return acc + (product.salePrice ?? product.price) * item.quantity
  }, 0)

  const order = await prisma.order.create({
    data: {
      userId: user.id,
      total,
      shippingAddress,
      items: {
        create: items.map(item => {
          const product = products.find(p => p.id === item.productId)!
          return {
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: product.salePrice ?? product.price,
          }
        }),
      },
      payment: {
        create: { method: paymentMethod, amount: total, status: 'PENDING' },
      },
    },
    include: { items: true, payment: true },
  })

  return NextResponse.json(order, { status: 201 })
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) return NextResponse.json([])

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: {
      items: { include: { product: { select: { name: true, images: true } } } },
      payment: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(orders)
}
```

- [ ] **Step 5: Verificar API**

Con el servidor corriendo (`npm run dev`):

```bash
curl http://localhost:3000/api/categories
curl "http://localhost:3000/api/products?featured=true"
```

Expected: JSON con las 6 categorías y los 3 productos con `featured: true` del seed.

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: add REST API routes for products, categories and orders"
```

---

### Task 8: Páginas principales de la tienda

**Files:**
- Modify: `src/app/(store)/page.tsx`
- Create: `src/app/(store)/categoria/[slug]/page.tsx`
- Create: `src/app/(store)/producto/[slug]/page.tsx`
- Create: `src/app/(store)/buscar/page.tsx`
- Create: `src/app/(store)/carrito/page.tsx`
- Create: `src/components/home/HeroBanner.tsx`
- Create: `src/components/home/FeaturedProducts.tsx`

**Interfaces:**
- Consumes: `prisma` de `@/lib/prisma`, `ProductGrid` de Task 6, `AddToCartButton` de Task 6

- [ ] **Step 1: Crear HeroBanner (client component con auto-slide)**

Crear `src/components/home/HeroBanner.tsx`:
```tsx
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
```

- [ ] **Step 2: Crear FeaturedProducts (server component)**

Crear `src/components/home/FeaturedProducts.tsx`:
```tsx
import { prisma } from '@/lib/prisma'
import ProductGrid from '@/components/products/ProductGrid'
import Link from 'next/link'

export default async function FeaturedProducts() {
  const products = await prisma.product.findMany({
    where: { featured: true, active: true },
    include: { brand: { select: { name: true } } },
    take: 10,
  })

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Productos Destacados</h2>
        <Link href="/categoria/salud-medicamentos" className="text-green-700 hover:underline text-sm font-medium">
          Ver todos →
        </Link>
      </div>
      <ProductGrid products={products} />
    </section>
  )
}
```

- [ ] **Step 3: Actualizar Home page**

Reemplazar `src/app/(store)/page.tsx`:
```tsx
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
```

- [ ] **Step 4: Crear página de categoría**

Crear `src/app/(store)/categoria/[slug]/page.tsx`:
```tsx
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import ProductGrid from '@/components/products/ProductGrid'

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const category = await prisma.category.findUnique({ where: { slug } })
  if (!category) notFound()

  const products = await prisma.product.findMany({
    where: { categoryId: category.id, active: true },
    include: { brand: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{category.name}</h1>
      <ProductGrid products={products} />
    </div>
  )
}
```

- [ ] **Step 5: Crear página de detalle de producto**

Crear `src/app/(store)/producto/[slug]/page.tsx`:
```tsx
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import AddToCartButton from '@/components/products/AddToCartButton'

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { brand: true, category: true },
  })
  if (!product || !product.active) notFound()

  const hasDiscount = product.salePrice !== null && product.salePrice < product.price
  const discountPct = hasDiscount ? Math.round((1 - product.salePrice! / product.price) * 100) : 0

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative aspect-square bg-white rounded-xl border overflow-hidden">
          <Image
            src={product.images[0] ?? '/placeholder.svg'}
            alt={product.name}
            fill
            className="object-contain p-8"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          {hasDiscount && (
            <Badge className="absolute top-4 left-4 bg-red-500 text-white text-base px-3 py-1">
              -{discountPct}%
            </Badge>
          )}
        </div>

        <div className="flex flex-col">
          {product.brand && <p className="text-sm text-gray-500 mb-1">{product.brand.name}</p>}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{product.name}</h1>

          <div className="mb-6">
            {hasDiscount ? (
              <div>
                <span className="text-3xl font-bold text-green-700">${product.salePrice!.toFixed(2)}</span>
                <span className="ml-3 text-lg text-gray-400 line-through">${product.price.toFixed(2)}</span>
              </div>
            ) : (
              <span className="text-3xl font-bold text-green-700">${product.price.toFixed(2)}</span>
            )}
          </div>

          {product.description && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Descripción</h3>
              <p className="text-gray-600">{product.description}</p>
            </div>
          )}

          <div className="mt-auto">
            <AddToCartButton product={product} />
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Crear página de búsqueda**

Crear `src/app/(store)/buscar/page.tsx`:
```tsx
import { prisma } from '@/lib/prisma'
import ProductGrid from '@/components/products/ProductGrid'

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const query = q?.trim() ?? ''

  const products = query
    ? await prisma.product.findMany({
        where: { active: true, name: { contains: query, mode: 'insensitive' } },
        include: { brand: { select: { name: true } } },
        take: 50,
      })
    : []

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">
        {query ? `Resultados para "${query}"` : 'Buscar productos'}
      </h1>
      {query && <p className="text-gray-500 mb-6">{products.length} productos encontrados</p>}
      <ProductGrid products={products} />
    </div>
  )
}
```

- [ ] **Step 7: Crear página de carrito**

Crear `src/app/(store)/carrito/page.tsx`:
```tsx
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
```

- [ ] **Step 8: Verificar todas las páginas**

```bash
npm run dev
```

Verificar:
- `http://localhost:3000` → Home con banner animado, iconos de categoría y productos destacados
- `http://localhost:3000/categoria/salud-medicamentos` → Grid de productos de salud
- `http://localhost:3000/producto/aspirina-500mg-20-tab` → Detalle con precio, descuento y botón
- `http://localhost:3000/buscar?q=vitamina` → Resultados de búsqueda
- `http://localhost:3000/carrito` → Carrito (agregar productos primero desde cualquier página)

- [ ] **Step 9: Commit**

```bash
git add .
git commit -m "feat: add Home, Category, Product, Search and Cart pages"
```

---

### Task 9: Panel de Administración

**Files:**
- Create: `src/app/admin/layout.tsx`
- Create: `src/app/admin/page.tsx`
- Create: `src/app/admin/productos/page.tsx`
- Create: `src/app/admin/pedidos/page.tsx`

**Interfaces:**
- Consumes: `prisma`, Clerk `auth()`, `User.role` del schema
- Produces: Panel accesible solo a usuarios con `role === 'ADMIN'`; redirección a `/` para no-admin

- [ ] **Step 1: Crear layout del panel admin**

Crear `src/app/admin/layout.tsx`:
```tsx
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { LayoutDashboard, Package, ShoppingBag, Users } from 'lucide-react'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()
  if (!userId) redirect('/login')

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user || user.role !== 'ADMIN') redirect('/')

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-900 text-white flex flex-col shrink-0">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-xl font-bold">Admin Panel</h1>
          <p className="text-xs text-gray-400 mt-1">FarmaTodo VE</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[
            { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
            { href: '/admin/productos', icon: Package, label: 'Productos' },
            { href: '/admin/pedidos', icon: ShoppingBag, label: 'Pedidos' },
            { href: '/admin/usuarios', icon: Users, label: 'Usuarios' },
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-700">
          <Link href="/" className="text-xs text-gray-400 hover:text-white">
            ← Volver a la Tienda
          </Link>
        </div>
      </aside>
      <main className="flex-1 bg-gray-100 p-8 overflow-auto">{children}</main>
    </div>
  )
}
```

- [ ] **Step 2: Dashboard con métricas**

Crear `src/app/admin/page.tsx`:
```tsx
import { prisma } from '@/lib/prisma'
import { Package, ShoppingBag, Users, DollarSign } from 'lucide-react'

export default async function AdminDashboard() {
  const [totalProducts, totalOrders, totalUsers, revenue] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.user.count(),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { not: 'CANCELLED' } },
    }),
  ])

  const stats = [
    { label: 'Productos', value: totalProducts, icon: Package, color: 'bg-blue-500' },
    { label: 'Pedidos', value: totalOrders, icon: ShoppingBag, color: 'bg-orange-500' },
    { label: 'Usuarios', value: totalUsers, icon: Users, color: 'bg-purple-500' },
    { label: 'Ingresos', value: `$${(revenue._sum.total ?? 0).toFixed(2)}`, icon: DollarSign, color: 'bg-green-500' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(stat => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
            <div className={`${stat.color} text-white p-3 rounded-lg`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Tabla de productos en admin**

Crear `src/app/admin/productos/page.tsx`:
```tsx
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
```

- [ ] **Step 4: Tabla de pedidos en admin**

Crear `src/app/admin/pedidos/page.tsx`:
```tsx
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

const statusLabels: Record<string, string> = {
  PENDING: 'Pendiente',
  PROCESSING: 'Procesando',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
}

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      user: { select: { name: true, email: true } },
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Pedidos</h1>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 font-semibold text-gray-600 text-sm">ID</th>
              <th className="text-left p-4 font-semibold text-gray-600 text-sm">Cliente</th>
              <th className="text-left p-4 font-semibold text-gray-600 text-sm">Items</th>
              <th className="text-left p-4 font-semibold text-gray-600 text-sm">Total</th>
              <th className="text-left p-4 font-semibold text-gray-600 text-sm">Estado</th>
              <th className="text-left p-4 font-semibold text-gray-600 text-sm">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map(order => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="p-4 font-mono text-xs text-gray-500">{order.id.slice(0, 8)}...</td>
                <td className="p-4">
                  <p className="font-medium text-gray-800 text-sm">{order.user.name ?? 'Sin nombre'}</p>
                  <p className="text-xs text-gray-500">{order.user.email}</p>
                </td>
                <td className="p-4 text-gray-600 text-sm">{order._count.items} items</td>
                <td className="p-4 font-bold text-green-700">${order.total.toFixed(2)}</td>
                <td className="p-4">
                  <Badge className={statusColors[order.status]}>
                    {statusLabels[order.status]}
                  </Badge>
                </td>
                <td className="p-4 text-gray-500 text-sm">
                  {order.createdAt.toLocaleDateString('es-VE')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Promover usuario a ADMIN para probar**

```bash
npx prisma studio
```

En la tabla `User`, buscar tu usuario y cambiar el campo `role` de `CUSTOMER` a `ADMIN`.

Luego navegar a `http://localhost:3000/admin` → debe mostrar el dashboard con métricas.

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: add admin panel with dashboard, products and orders management"
```

---

### Task 10: Configuración de Vercel y build de producción

**Files:**
- Modify: `next.config.ts`
- Create: `vercel.json`

**Interfaces:**
- Produces: Build de producción sin errores; configuración lista para deploy en Vercel

- [ ] **Step 1: Actualizar next.config.ts**

Reemplazar `next.config.ts`:
```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
    ],
  },
}

export default nextConfig
```

- [ ] **Step 2: Crear vercel.json**

Crear `vercel.json`:
```json
{
  "buildCommand": "npx prisma generate && npm run build",
  "framework": "nextjs"
}
```

- [ ] **Step 3: Verificar build de producción**

```bash
npm run build
```

Expected: Build exitoso. Corregir cualquier error de TypeScript que aparezca.

- [ ] **Step 4: Añadir script de postinstall para Prisma**

En `package.json`, en la sección `"scripts"`, añadir:
```json
"postinstall": "prisma generate"
```

Esto garantiza que `prisma generate` corre automáticamente después de `npm install` en Vercel.

- [ ] **Step 5: Deploy en Vercel**

Opción A — Vercel CLI (si instalado: `npm i -g vercel`):
```bash
vercel --yes
```

Opción B — Desde vercel.com:
1. Push al repositorio GitHub/GitLab
2. Ir a vercel.com → New Project → importar repo
3. En "Environment Variables", añadir todas las variables de `.env.example`
4. Click Deploy

- [ ] **Step 6: Commit final**

```bash
git add .
git commit -m "feat: add Vercel deployment configuration and postinstall hook"
```

---

## Cobertura del Spec

| Requisito | Task |
|-----------|------|
| Next.js 15 App Router + TypeScript | Task 1 |
| Tailwind CSS + shadcn/ui | Task 2 |
| Prisma + PostgreSQL (Neon) | Tasks 2–3 |
| Schema: User, Category, Brand, Product, Cart, Order, Payment, Banner | Task 3 |
| Seed data (6 categorías, 10 productos, 3 banners) | Task 3 |
| Clerk auth + middleware de rutas protegidas | Task 4 |
| Webhook sync usuario → DB | Task 4 |
| Header con logo, búsqueda, carrito, user | Task 5 |
| CategoryNav + Footer | Task 5 |
| Zustand cart store (persiste en localStorage) | Task 6 |
| ProductCard (imagen, precio, descuento, botón) | Task 6 |
| ProductGrid responsive (2→5 columnas) | Task 6 |
| API GET /api/products (filtros, búsqueda, paginación) | Task 7 |
| API GET /api/categories | Task 7 |
| API POST+GET /api/orders (auth) | Task 7 |
| Home con banner auto-slide + categorías + destacados | Task 8 |
| Página de categoría | Task 8 |
| Detalle de producto con AddToCartButton | Task 8 |
| Búsqueda de productos | Task 8 |
| Página de carrito con resumen | Task 8 |
| Admin layout protegido por rol ADMIN | Task 9 |
| Admin dashboard con métricas | Task 9 |
| Admin tabla de productos | Task 9 |
| Admin tabla de pedidos | Task 9 |
| vercel.json + postinstall + build verificado | Task 10 |

**Fuera del scope de este scaffolding (próxima iteración):**
- Checkout completo con Stripe (requiere credenciales reales)
- Upload de imágenes con Vercel Blob
- Página `/pedidos` del usuario
- Página `/perfil` del usuario
- Filtros avanzados en catálogo
