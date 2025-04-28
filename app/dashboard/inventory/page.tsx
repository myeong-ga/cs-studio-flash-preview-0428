import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { InventoryTable } from "@/components/inventory/inventory-table"

export default function InventoryPage() {
  return (
    <div className="flex flex-col gap-6 sm:gap-8 md:gap-10 lg:gap-12 py-6">
      <DashboardHeader title="재고 관리" description="상품 재고 현황 및 관리" />
      <InventoryTable />
    </div>
  )
}
