"use client"

import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { SimulationContainer } from "@/components/simulation/simulation-container"
import { useStore } from "@/lib/store"
import { AlertCircle } from "lucide-react"
import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useCacheValidation } from "@/hooks/use-cache-validation"

export default function SimulationPage() {
  const { cache } = useStore()
  const [showAlert, setShowAlert] = useState(false)
  const [bypassCacheCheck, setBypassCacheCheck] = useState(false)
  const router = useRouter()

  // useCacheValidation 훅 사용 - 자동 검증 비활성화
  const { isValidating, isInitializing, validateCache } = useCacheValidation({ autoValidate: false })

  // useRef를 사용하여 타이머 ID를 저장
  const redirectTimerRef = useRef<NodeJS.Timeout | null>(null)

  // 리디렉션 상태를 추적하는 ref
  const isRedirectingRef = useRef(false)

  // 캐시 검증 로직 - bypassCacheCheck 상태에 따라 다르게 처리
  useEffect(() => {
    console.log(`[PAGE] Simulation page mounted, bypassCacheCheck=${bypassCacheCheck}`)

    // 바이패스 모드가 활성화되어 있으면 캐시 검증 건너뛰기
    if (bypassCacheCheck) {
      console.log("[PAGE] Bypassing cache validation")
      setShowAlert(false)
      // 리디렉션 타이머가 있다면 취소
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current)
        redirectTimerRef.current = null
        isRedirectingRef.current = false
      }
      return
    }

    // 바이패스 모드가 아닌 경우에만 캐시 검증 수행
    // 리디렉션을 건너뛰는 옵션으로 캐시 검증 (true 전달)
    console.log("[PAGE] Performing manual cache validation with skipRedirect=true")
    validateCache(true).then((isValid) => {
      console.log(`[PAGE] Cache validation result: ${isValid ? "valid" : "invalid"}`)

      // 캐시가 유효하지 않고 바이패스 모드가 아닌 경우 알림 표시
      if (!isValid && !bypassCacheCheck) {
        setShowAlert(true)
      } else {
        setShowAlert(false)
      }
    })
  }, [bypassCacheCheck, validateCache])

  // 캐시 상태에 따른 알림 및 리디렉션 처리
  useEffect(() => {
    // 이미 리디렉션 중이거나 바이패스 모드인 경우 처리 중단
    if (isRedirectingRef.current || bypassCacheCheck) {
      console.log("[PAGE] Skipping redirect logic - already redirecting or bypass mode active")
      return
    }

    // 캐시 체크 및 알림 표시
    if (!cache.isCreated || !cache.cacheName) {
      console.log("[PAGE] No cache found, showing alert")
      setShowAlert(true)

      // 리디렉션 타이머 설정
      console.log("[PAGE] Setting up redirect timer for 3000ms")

      // 이전 타이머가 있으면 정리
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current)
      }

      // 리디렉션 상태 설정
      isRedirectingRef.current = true

      // 새 타이머 설정 및 ref에 저장
      redirectTimerRef.current = setTimeout(() => {
        // 바이패스 모드가 활성화되었는지 다시 확인
        if (!bypassCacheCheck) {
          console.log("[PAGE] Redirect timer fired, navigating to file-upload")
          router.push("/dashboard/file-upload")
        } else {
          console.log("[PAGE] Redirect cancelled because bypass mode was activated")
          isRedirectingRef.current = false
        }
      }, 3000)
    } else {
      // 캐시가 있으면 알림 숨김
      setShowAlert(false)
    }

    // 클린업 함수
    return () => {
      if (redirectTimerRef.current) {
        console.log("[PAGE] Cleaning up redirect timer")
        clearTimeout(redirectTimerRef.current)
        redirectTimerRef.current = null
      }
    }
  }, [cache.isCreated, cache.cacheName, bypassCacheCheck, router])

  // 캐시 체크 바이패스 처리 함수
  const handleBypassCacheCheck = () => {
    console.log("[PAGE] Bypass cache check requested")

    // 진행 중인 리디렉션 타이머 취소
    if (redirectTimerRef.current) {
      console.log("[PAGE] Cancelling pending redirect timer")
      clearTimeout(redirectTimerRef.current)
      redirectTimerRef.current = null
      isRedirectingRef.current = false
    }

    setBypassCacheCheck(true)
    setShowAlert(false)
    console.log("[PAGE] Bypass mode activated")
  }

  // 로딩 상태 계산 - 캐시 검증 중이고 바이패스 모드가 아닌 경우
  const isLoading = (isValidating || isInitializing) && !bypassCacheCheck

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

      <div className="overflow-auto">
        {(!showAlert || bypassCacheCheck) && (
          <SimulationContainer bypassCacheCheck={bypassCacheCheck} isLoading={isLoading} />
        )}
      </div>
    </div>
  )
}
