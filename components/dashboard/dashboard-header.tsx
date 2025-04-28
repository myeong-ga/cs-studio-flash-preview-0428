"use client"

import { Button } from "@/components/ui/button"
import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"

interface DashboardHeaderProps {
  title: string
  description?: string
}

export function DashboardHeader({ title, description }: DashboardHeaderProps) {
  const { open } = useSidebar()

  return (
    <div className="w-full flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4 mb-6">
      <div className="flex items-center gap-3">
        {!open && <SidebarTrigger className="text-microsoft-blue hover:bg-microsoft-blue-lighter" />}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-microsoft-blue dark:text-blue-400">{title}</h1>
          {description && <p className="text-muted-foreground mt-1">{description}</p>}
        </div>
      </div>
      <ThemeToggle />
    </div>
  )
}

function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="border-microsoft-blue-light hover:bg-microsoft-blue-lighter hover:text-microsoft-blue"
    >
      <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
