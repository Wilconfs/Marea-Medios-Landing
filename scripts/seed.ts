import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const DEFAULT_TENANT_ID = 'cmouehzwk0000eo81fuyf0s37'

async function main() {

  // 1. Crear el primer Cliente/Tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'tienda-uno' },
    update: {},
    create: { name: "Mi Tienda SaaS", slug: "tienda-uno" }
  })

  // 2. Crear el Usuario Admin vinculado a ese cliente
  const hashedPassword = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      name: 'Admin SaaS',
      email: 'admin@test.com',
      passwordHash: hashedPassword,
      role: 'ADMIN',
      tenantId: tenant.id // Esto es clave
    }
  })

  console.log("Seed completado: Cliente y Admin creados.")

  console.log('🌱 Seeding database...')

  // ---- Users ----
  const adminHash = await bcrypt.hash('admin123', 10)
  const testHash = await bcrypt.hash('johndoe123', 10)

  await prisma.user.upsert({
    where: { email: 'admin@ecomdash.com' },
    update: { passwordHash: adminHash, role: 'SUPERADMIN', name: 'Administrador' },
    create: {
      name: 'Administrador',
      email: 'admin@ecomdash.com',
      passwordHash: adminHash,
      role: 'SUPERADMIN',
    },
  })

  await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: { passwordHash: testHash, role: 'SUPERADMIN', name: 'John Doe' },
    create: {
      name: 'John Doe',
      email: 'john@doe.com',
      passwordHash: testHash,
      role: 'SUPERADMIN',
    },
  })

  // ---- Settings ----
  const settings = [
    { key: 'whatsappNumber', value: '573001234567' },
    { key: 'storeName', value: 'EcomDash' },
    { key: 'paymentMethod', value: 'whatsapp' },
    { key: 'currency', value: 'COP' },
  ]
  for (const s of settings) {
  await prisma.setting.upsert({
    where: {
      tenantId_key: {
        tenantId: DEFAULT_TENANT_ID,
        key: s.key,
      },
    },
    update: { value: s.value },
    create: {
      ...s,
      tenantId: DEFAULT_TENANT_ID, // Le pasamos el ID obligatorio para el registro nuevo
    },
  })
}

  // ---- Categories ----
  const categoryData = [
    { name: 'Camisetas', slug: 'camisetas', icon: 'Shirt' },
    { name: 'Chaquetas', slug: 'chaquetas', icon: 'Wind' },
    { name: 'Camisas', slug: 'camisas', icon: 'Layers' },
    { name: 'Jeans', slug: 'jeans', icon: 'Ruler' },
    { name: 'Bolsos', slug: 'bolsos', icon: 'ShoppingBag' },
    { name: 'Zapatos', slug: 'zapatos', icon: 'Footprints' },
  ]

  const categories: Record<string, string> = {}
  for (const c of categoryData) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, icon: c.icon },
      create: c,
    })
    categories[c.slug] = cat.id
  }

  // ---- Products ----
  const productData = [
    {
      slug: 'camiseta-algodon-casual',
      name: 'Camiseta de Algodón Casual',
      description:
        'Camiseta de algodón 100% premium, corte regular y tacto suave. Ideal para uso diario, combinable con cualquier outfit casual o deportivo.',
      price: 59000,
      originalPrice: 89000,
      discount: 34,
      rating: 4.7,
      soldCount: 210,
      stock: 50,
      imageUrl:
        'https://skims.imgix.net/s/files/1/0259/5448/4284/files/SKIMS-LOUNGEWEAR-TP-TSH-5701M-CHK.jpg?v=1738175705&auto=format&q=70&ixlib=react-9.11.0',
      categorySlug: 'camisetas',
      isFlashSale: true,
    },
    {
      slug: 'chaqueta-bomber-invierno',
      name: 'Chaqueta Bomber Invierno',
      description:
        'Chaqueta bomber con forro térmico, perfecta para los días fríos. Diseño moderno y resistente al viento, con bolsillos cómodos.',
      price: 199000,
      originalPrice: 320000,
      discount: 38,
      rating: 4.5,
      soldCount: 145,
      stock: 30,
      imageUrl:
        'https://cdn11.bigcommerce.com/s-luvww1semp/images/stencil/1280x1280/products/2194/13860/alvin-gybk%2520%281%29__81511.1752590280.jpg?c=2',
      categorySlug: 'chaquetas',
      isFlashSale: true,
    },
    {
      slug: 'camisa-elegante-rayas',
      name: 'Camisa Elegante a Rayas',
      description:
        'Camisa de manga larga, ajuste slim, tejido transpirable. Ideal para oficina y eventos casuales-formales. Confección de alta calidad.',
      price: 129000,
      originalPrice: 179000,
      discount: 28,
      rating: 4.6,
      soldCount: 188,
      stock: 40,
      imageUrl:
        'http://www.nimble-made.com/cdn/shop/products/new-striped-blue-white-dress-shirt_9bf4f99c-3308-4910-b57a-d118fb953134.jpg?v=1670899180',
      categorySlug: 'camisas',
      isFlashSale: false,
    },
    {
      slug: 'jeans-slim-fit-azul',
      name: 'Jeans Slim Fit Azul',
      description:
        'Jeans de mezclilla premium, corte slim fit, color azul medio. Material elástico para mayor comodidad durante todo el día.',
      price: 149000,
      originalPrice: 220000,
      discount: 32,
      rating: 4.4,
      soldCount: 320,
      stock: 60,
      imageUrl:
        'https://media.istockphoto.com/id/173239968/photo/skinny-tight-blue-jeans-on-white-background.jpg?s=612x612&w=0&k=20&c=HsI-xC12KkzjeCaFC4eQ33SZuL53EerbfLMkPuLpaVw=',
      categorySlug: 'jeans',
      isFlashSale: true,
    },
    {
      slug: 'bolso-tote-cuero',
      name: 'Bolso Tote de Cuero',
      description:
        'Bolso tote elegante en cuero genuino, espacioso y resistente. Ideal para oficina, viajes o uso diario. Acabados de lujo.',
      price: 289000,
      originalPrice: 450000,
      discount: 36,
      rating: 4.8,
      soldCount: 95,
      stock: 25,
      imageUrl:
        'https://latelierglobal.com/cdn/shop/products/olimpia-leather-tote-608292.jpg?v=1737917924&width=2048',
      categorySlug: 'bolsos',
      isFlashSale: false,
    },
    {
      slug: 'zapatillas-blancas-clasicas',
      name: 'Zapatillas Blancas Clásicas',
      description:
        'Zapatillas blancas atemporales, suela de goma antideslizante, plantilla acolchada. Combinan con todo, máxima comodidad.',
      price: 169000,
      originalPrice: 249000,
      discount: 32,
      rating: 4.6,
      soldCount: 412,
      stock: 80,
      imageUrl:
        'https://nothingnew.com/cdn/shop/products/1024x1024-Mens-Unoriginal-White-090222-3.4_1024x1024.jpg?v=1664821005',
      categorySlug: 'zapatos',
      isFlashSale: true,
    },
    {
      slug: 'oxford-cuero-negro',
      name: 'Zapatos Oxford de Cuero Negro',
      description:
        'Zapatos Oxford clásicos en cuero genuino negro, perfectos para ocasiones formales. Confección artesanal y durabilidad superior.',
      price: 259000,
      originalPrice: 380000,
      discount: 32,
      rating: 4.7,
      soldCount: 132,
      stock: 35,
      imageUrl:
        'https://taftclothing.com/cdn/shop/products/Jack_Black_cropped.jpg?v=1762439486&width=1000',
      categorySlug: 'zapatos',
      isFlashSale: false,
    },
    {
      slug: 'sandalias-tacon-gris',
      name: 'Sandalias de Tacón Gris',
      description:
        'Sandalias elegantes con tacón cómodo de 7cm, color gris claro versátil. Perfectas para eventos especiales y looks sofisticados.',
      price: 179000,
      originalPrice: 270000,
      discount: 34,
      rating: 4.3,
      soldCount: 86,
      stock: 28,
      imageUrl:
        'https://www.piccolashoes.com/cdn/shop/products/joyce-grey-open-toe-heels.png?v=1761084095&width=1024',
      categorySlug: 'zapatos',
      isFlashSale: false,
    },
  ]

  for (const p of productData) {
    const { categorySlug, slug, ...rest } = p
    await prisma.product.upsert({
      where: { id: slug },
      update: { ...rest, categoryId: categories[categorySlug] },
      create: {
        id: slug,
        ...rest,
        categoryId: categories[categorySlug],
      },
    })
  }

  console.log('✅ Seed completed')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

  