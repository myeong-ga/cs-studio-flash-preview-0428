import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { RecentActivities } from "@/components/dashboard/recent-activities"

export default function DashboardPage() {
  return (
    <div className="flex flex-col w-full gap-6 sm:gap-8 md:gap-10 lg:gap-12 py-6">
      <DashboardHeader title="CS Dashboard" description="고객 서비스 관리 대시보드" />
      <DashboardStats />
      <RecentActivities />
    </div>
  )
}
