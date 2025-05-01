"use client"

import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { SimulationContainer } from "@/components/simulation/simulation-container"
import { useStore } from "@/lib/store"
import { AlertCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useCacheValidation } from "@/hooks/use-cache-validation"
import { useChatSimulation } from "@/hooks/use-chat-simulation"

// Update the SimulationPage component to ensure proper height and responsiveness
export default function SimulationPage() {
  const { cache } = useStore()
  const [showAlert, setShowAlert] = useState(false)
  const [bypassCacheCheck, setBypassCacheCheck] = useState(false)
  const router = useRouter()

  // Create a single instance of the chat simulation hook
  const chatSimulation = useChatSimulation()

  const { isValidating, isInitializing, validateCache } = useCacheValidation({ autoValidate: false })

  // Consolidated cache validation logic
  useEffect(() => {
    console.log(`[PAGE] Simulation page mounted, bypassCacheCheck=${bypassCacheCheck}`)

    // Skip all validation if bypass mode is active
    if (bypassCacheCheck) {
      console.log("[PAGE] Bypassing cache validation")
      setShowAlert(false)
      return
    }

    // First check if cache exists at all
    if (!cache.isCreated || !cache.cacheName) {
      console.log("[PAGE] No cache found, showing alert")
      setShowAlert(true)
      return
    }

    // If cache exists, validate it
    console.log("[PAGE] Cache exists, performing validation")
    validateCache(true).then((isValid) => {
      console.log(`[PAGE] Cache validation result: ${isValid ? "valid" : "invalid"}`)

      if (!isValid) {
        console.log("[PAGE] Cache is invalid, showing alert")
        setShowAlert(true)
      } else {
        console.log("[PAGE] Cache is valid, hiding alert")
        setShowAlert(false)
      }
    })
  }, [bypassCacheCheck, validateCache, cache.isCreated, cache.cacheName])

  const handleBypassCacheCheck = () => {
    console.log("[PAGE] Bypass cache check requested")
    chatSimulation.enableMockData()
    setBypassCacheCheck(true)
    setShowAlert(false)
    console.log("[PAGE] Bypass mode activated")
  }

  const isLoading = (isValidating || isInitializing) && !bypassCacheCheck

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      <div className="flex-shrink-0">
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
                <div className="mt-2">
                  <Button
                    onClick={handleBypassCacheCheck}
                    variant="outline"
                    size="sm"
                    className="bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200"
                  >
                    모의 데이터로 계속하기
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        {(!showAlert || bypassCacheCheck) && (
          <SimulationContainer
            bypassCacheCheck={bypassCacheCheck}
            isLoading={isLoading}
            chatSimulation={chatSimulation}
          />
        )}
      </div>
    </div>
  )
}
