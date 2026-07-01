/**
 * Seed: 20 productos farmacéuticos reales para demo
 * Imágenes de Pexels (IDs verificados)
 * Ejecutar: npx ts-node scripts/seed-demo-products.ts
 */
import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'
dotenv.config()

const sql = neon(process.env.DATABASE_URL!)

function img(id: number) {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=600`
}

const CATEGORIES = [
  { name: 'Analgésicos y Antipiréticos', slug: 'analgesicos-antipireticos' },
  { name: 'Vitaminas y Suplementos',     slug: 'vitaminas-suplementos' },
  { name: 'Antibióticos',                slug: 'antibioticos' },
  { name: 'Antihistamínicos',            slug: 'antihistaminicos' },
  { name: 'Gastro e Intestinal',         slug: 'gastro-intestinal' },
  { name: 'Cuidado Personal',            slug: 'cuidado-personal' },
  { name: 'Primeros Auxilios',           slug: 'primeros-auxilios' },
]

const BRANDS = [
  'Bayer', 'MK Medicamentos', 'Pfizer', 'Centrum', 'Nature Made',
  'Nivea', 'Pond\'s', 'Banana Boat', 'Head & Shoulders', 'Betadine',
  '3M', 'Colgate', 'Genérico',
]

const PRODUCTS = [
  // Analgésicos
  { name: 'Aspirina 500mg x 20 tab',       slug: 'aspirina-500mg-20-tab',       desc: 'Analgésico y antipirético. Alivia el dolor de cabeza, muscular y fiebre.', price: 1.99, sale: null,  stock: 150, featured: true,  brand: 'Bayer',            cat: 'analgesicos-antipireticos', img: 3873141 },
  { name: 'Ibuprofeno 400mg x 20 tab',     slug: 'ibuprofeno-400mg-20-tab',     desc: 'Antiinflamatorio no esteroideo. Alivia dolor e inflamación.',               price: 2.99, sale: 2.49, stock: 120, featured: false, brand: 'MK Medicamentos',  cat: 'analgesicos-antipireticos', img: 3873146 },
  { name: 'Paracetamol 500mg x 20 tab',    slug: 'paracetamol-500mg-20-tab',    desc: 'Analgésico y antipirético de amplio uso. Suave con el estómago.',           price: 1.50, sale: null,  stock: 200, featured: false, brand: 'Genérico',         cat: 'analgesicos-antipireticos', img: 3850712 },
  { name: 'Naproxeno 500mg x 10 tab',      slug: 'naproxeno-500mg-10-tab',      desc: 'Antiinflamatorio de larga duración. Ideal para dolores musculares.',         price: 3.50, sale: 2.80, stock: 80,  featured: false, brand: 'Genérico',         cat: 'analgesicos-antipireticos', img: 7034123 },

  // Vitaminas y Suplementos
  { name: 'Vitamina C 1000mg x 30 tab',    slug: 'vitamina-c-1000mg-30-tab',    desc: 'Refuerza el sistema inmune. Antioxidante natural.',                          price: 4.99, sale: 3.99, stock: 90,  featured: true,  brand: 'Centrum',          cat: 'vitaminas-suplementos', img: 8244289 },
  { name: 'Vitamina D3 2000UI x 60 cap',   slug: 'vitamina-d3-2000ui-60-cap',   desc: 'Esencial para la absorción de calcio y salud ósea.',                        price: 7.99, sale: null,  stock: 60,  featured: false, brand: 'Nature Made',      cat: 'vitaminas-suplementos', img: 3923160 },
  { name: 'Zinc 50mg x 60 tab',            slug: 'zinc-50mg-60-tab',            desc: 'Mineral esencial para el sistema inmune y la piel.',                         price: 4.50, sale: null,  stock: 70,  featured: false, brand: 'Genérico',         cat: 'vitaminas-suplementos', img: 3850710 },
  { name: 'Multivitamínico Centrum x 30',  slug: 'multivitaminico-centrum-30',  desc: 'Fórmula completa con 23 vitaminas y minerales esenciales.',                  price: 9.99, sale: 7.99, stock: 45,  featured: true,  brand: 'Centrum',          cat: 'vitaminas-suplementos', img: 7615558 },
  { name: 'Omega-3 1000mg x 30 cap',       slug: 'omega-3-1000mg-30-cap',       desc: 'Ácidos grasos esenciales para el corazón y cerebro.',                        price: 8.99, sale: null,  stock: 55,  featured: false, brand: 'Nature Made',      cat: 'vitaminas-suplementos', img: 7615570 },

  // Antibióticos
  { name: 'Amoxicilina 500mg x 12 cap',    slug: 'amoxicilina-500mg-12-cap',    desc: 'Antibiótico de amplio espectro. Requiere prescripción médica.',              price: 8.99, sale: null,  stock: 40,  featured: false, brand: 'Pfizer',           cat: 'antibioticos', img: 7380393 },

  // Antihistamínicos
  { name: 'Loratadina 10mg x 30 tab',      slug: 'loratadina-10mg-30-tab',      desc: 'Antihistamínico no sedante. Alivia alergias y rinitis.',                     price: 3.50, sale: null,  stock: 100, featured: false, brand: 'Genérico',         cat: 'antihistaminicos', img: 3683073 },

  // Gastro
  { name: 'Omeprazol 20mg x 14 cap',       slug: 'omeprazol-20mg-14-cap',       desc: 'Inhibidor de la bomba de protones. Trata la acidez y gastritis.',            price: 5.50, sale: 4.50, stock: 75,  featured: false, brand: 'Genérico',         cat: 'gastro-intestinal', img: 140123 },

  // Cuidado Personal
  { name: 'Crema Nivea Original 400ml',    slug: 'crema-nivea-original-400ml',  desc: 'Hidratación intensiva 24 horas. Para todo tipo de piel.',                    price: 6.99, sale: null,  stock: 60,  featured: true,  brand: 'Nivea',            cat: 'cuidado-personal', img: 3762875 },
  { name: 'Crema Pond\'s Humectante 200g', slug: 'crema-ponds-humectante-200g', desc: 'Hidratación profunda con vitamina E. Piel suave y tersa.',                   price: 5.99, sale: 4.99, stock: 50,  featured: false, brand: 'Pond\'s',          cat: 'cuidado-personal', img: 6690234 },
  { name: 'Protector Solar SPF50 200ml',   slug: 'protector-solar-spf50-200ml', desc: 'Protección UVA/UVB. Resistente al agua. Ideal para uso diario.',             price: 8.50, sale: null,  stock: 40,  featured: false, brand: 'Banana Boat',      cat: 'cuidado-personal', img: 10897819 },
  { name: 'Shampoo Anticaspa 400ml',       slug: 'shampoo-anticaspa-400ml',     desc: 'Control clínico de la caspa desde la primera lavada.',                       price: 5.99, sale: null,  stock: 55,  featured: false, brand: 'Head & Shoulders', cat: 'cuidado-personal', img: 9774854 },
  { name: 'Pasta Dental Colgate Total 90g',slug: 'pasta-dental-colgate-total-90g', desc: 'Protección completa: caries, encías y aliento. 12 beneficios.',           price: 3.50, sale: null,  stock: 90,  featured: false, brand: 'Colgate',          cat: 'cuidado-personal', img: 9486091 },

  // Primeros Auxilios
  { name: 'Alcohol Antiséptico 70% 1L',    slug: 'alcohol-antiseptico-70-1l',   desc: 'Desinfectante de uso general para piel e instrumental.',                     price: 4.99, sale: null,  stock: 100, featured: false, brand: 'Genérico',         cat: 'primeros-auxilios', img: 9145685 },
  { name: 'Agua Oxigenada 10vol 250ml',     slug: 'agua-oxigenada-10vol-250ml',  desc: 'Antiséptico para limpieza de heridas superficiales.',                        price: 2.50, sale: null,  stock: 110, featured: false, brand: 'Genérico',         cat: 'primeros-auxilios', img: 3962335 },
  { name: 'Vendas Elásticas x2 unid',      slug: 'vendas-elasticas-x2-unid',    desc: 'Vendas de tela elástica para inmovilización y compresión.',                  price: 5.50, sale: 4.50, stock: 65,  featured: false, brand: '3M',               cat: 'primeros-auxilios', img: 5721552 },
]

async function run() {
  console.log('🧹 Limpiando productos existentes...')
  await sql`DELETE FROM "CartItem"`
  await sql`DELETE FROM "OrderItem"`
  await sql`DELETE FROM "Product"`
  await sql`DELETE FROM "Brand"`
  await sql`DELETE FROM "Category"`
  console.log('✓ Productos, marcas y categorías eliminados')

  // Crear categorías
  console.log('\n📂 Creando categorías...')
  const catMap: Record<string, string> = {}
  for (const cat of CATEGORIES) {
    const [row] = await sql`
      INSERT INTO "Category" (id, name, slug)
      VALUES (gen_random_uuid()::text, ${cat.name}, ${cat.slug})
      ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `
    catMap[cat.slug] = row.id
    console.log(`  ✓ ${cat.name}`)
  }

  // Crear marcas
  console.log('\n🏷️  Creando marcas...')
  const brandMap: Record<string, string> = {}
  for (const brand of BRANDS) {
    const slug = brand.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const [row] = await sql`
      INSERT INTO "Brand" (id, name, slug)
      VALUES (gen_random_uuid()::text, ${brand}, ${slug})
      ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `
    brandMap[brand] = row.id
    console.log(`  ✓ ${brand}`)
  }

  // Crear productos
  console.log('\n💊 Creando productos...')
  for (const p of PRODUCTS) {
    await sql`
      INSERT INTO "Product" (
        id, name, slug, description, price, "salePrice",
        stock, images, featured, active,
        "categoryId", "brandId", "branchId",
        "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid()::text,
        ${p.name},
        ${p.slug},
        ${p.desc},
        ${p.price},
        ${p.sale},
        ${p.stock},
        ARRAY[${img(p.img)}]::text[],
        ${p.featured},
        true,
        ${catMap[p.cat]},
        ${brandMap[p.brand]},
        'branch_nueva_esparta',
        NOW(),
        NOW()
      )
      ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        price = EXCLUDED.price,
        "salePrice" = EXCLUDED."salePrice",
        stock = EXCLUDED.stock,
        images = EXCLUDED.images,
        featured = EXCLUDED.featured,
        "brandId" = EXCLUDED."brandId",
        "categoryId" = EXCLUDED."categoryId",
        "branchId" = EXCLUDED."branchId"
    `
    console.log(`  ✓ ${p.name}`)
  }

  console.log(`\n✅ ${PRODUCTS.length} productos cargados correctamente.`)
}

run().catch(e => { console.error(e); process.exit(1) })
