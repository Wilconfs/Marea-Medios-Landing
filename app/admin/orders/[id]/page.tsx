import { OrderDetailView } from './_components/order-detail-view'

export const dynamic = 'force-dynamic'

export default function AdminOrderDetailPage({
  params,
}: {
  params: { id: string }
}) {
  return <OrderDetailView orderId={params.id} />
}
