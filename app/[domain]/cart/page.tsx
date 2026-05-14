import { prisma } from '@/lib/db'
import { CartView } from './_components/cart-view'

export const dynamic = 'force-dynamic'

export default async function CartPage() {
  const setting = await prisma.setting.findUnique({
    where: { key: 'whatsappNumber' },
  })
  const whatsappNumber = setting?.value ?? '573001234567'

  return (
    <div className="container-page py-6">
      <CartView whatsappNumber={whatsappNumber} />
    </div>
  )
}
