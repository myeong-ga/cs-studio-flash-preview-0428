import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { OrdersTable } from "@/components/orders/orders-table"

export default function OrdersPage() {
  return (
    <div className="flex flex-col gap-6 sm:gap-8 md:gap-10 lg:gap-12 py-6">
      <DashboardHeader title="주문 관리" description="고객 주문 내역 관리" />
      <OrdersTable />
    </div>
  )
}
