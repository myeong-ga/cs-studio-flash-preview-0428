"use client"

import type React from "react"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"

// Update the DashboardLayout component to ensure proper height
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <DashboardSidebar />
        <main className="flex-1 overflow-hidden bg-[#f5f5f5] dark:bg-gray-900">
          <div className="w-full h-full overflow-auto">
            <div className="w-full h-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">{children}</div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
