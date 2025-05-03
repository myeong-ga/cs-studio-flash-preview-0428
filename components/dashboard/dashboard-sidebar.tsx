"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, FileText, Headphones, Home, Package, ShoppingCart, Users } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const menuItems = [
  {
    title: "대시보드",
    icon: Home,
    href: "/dashboard",
  },
  {
    title: "CS 시뮬레이션",
    icon: Headphones,
    href: "/dashboard/simulation",
  },
  {
    title: "파일 업로드",
    icon: FileText,
    href: "/dashboard/file-upload",
  },
  {
    title: "주문 관리",
    icon: ShoppingCart,
    href: "/dashboard/orders",
  },
  {
    title: "재고 관리",
    icon: Package,
    href: "/dashboard/inventory",
  },
  {
    title: "고객 관리",
    icon: Users,
    href: "/dashboard/customers",
  },
  {
    title: "통계 분석",
    icon: BarChart3,
    href: "/dashboard/analytics",
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const { open } = useSidebar()

  return (
    <Sidebar className="border-r border-gray-200 dark:border-gray-800">
      <SidebarHeader className="flex items-center justify-between p-4 bg-microsoft-blue text-white">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-lg">
          <Headphones className="h-6 w-6" />
          <span>CS Manager</span>
        </Link>
        {open && <SidebarTrigger className="text-white hover:bg-microsoft-blue-dark ml-2" />}
      </SidebarHeader>
      <SidebarContent className="microsoft-scrollbar">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={item.title}
                className={`hover:bg-microsoft-blue-lighter ${
                  pathname === item.href ? "bg-microsoft-blue-light text-microsoft-blue font-medium" : ""
                }`}
              >
                <Link href={item.href}>
                  <item.icon className={`h-5 w-5 ${pathname === item.href ? "text-microsoft-blue" : ""}`} />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-gray-200 dark:border-gray-800">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-2 hover:bg-microsoft-blue-lighter">
              <Avatar className="h-6 w-6">
                 <AvatarImage
                                  src="/images/cs-icon.png"   
                                  alt="CS"
                                />
                <AvatarFallback>CS</AvatarFallback>
              </Avatar>
              <span>CS 매니저</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>내 계정</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>프로필 설정</DropdownMenuItem>
            <DropdownMenuItem>로그아웃</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
