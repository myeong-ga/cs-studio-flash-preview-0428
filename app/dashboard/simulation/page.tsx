"use client"

// Import AlertCircle icon
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { SimulationContainer } from "@/components/simulation/simulation-container"
import { useStore } from "@/lib/store"
import { AlertCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function SimulationPage() {
  const { cache } = useStore()
  const [showAlert, setShowAlert] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if cache exists
    if (!cache.isCreated || !cache.cacheName) {
      setShowAlert(true)

      // Redirect after a short delay to allow the alert to be seen
      const redirectTimer = setTimeout(() => {
        router.push("/dashboard/file-upload")
      }, 3000)

      return () => clearTimeout(redirectTimer)
    }
  }, [cache, router])

  return (
    <div className="flex flex-col gap-6 md:gap-0 py-6 overflow-auto">
      <DashboardHeader title="CS 시뮬레이션" description="Gemini AI를 활용한 고객 서비스 시뮬레이션" />

      {showAlert && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-md mb-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 mr-2" />
            <div>
              <h3 className="font-medium text-amber-800">캐시가 필요합니다</h3>
              <p className="text-amber-700 text-sm mt-1">
                채팅 시뮬레이션을 사용하려면 먼저 파일을 업로드하고 캐시를 생성해야 합니다. 파일 업로드 페이지로
                이동합니다...
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-auto">
        <SimulationContainer />
      </div>
    </div>
  )
}
