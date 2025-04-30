"use client"

import { useState, useEffect } from "react"
import { useStore } from "@/lib/store"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

// Cache validation timeout in milliseconds (5 minutes)
const CACHE_VALIDATION_TIMEOUT = 5 * 60 * 1000

// 자동 검증 옵션을 추가하여 훅을 수정합니다
export function useCacheValidation(options = { autoValidate: true }) {
  const [isValidating, setIsValidating] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const { cache, setCacheValidated, resetCache } = useStore()
  const router = useRouter()
  const { toast } = useToast()

  // Validate cache on component mount - 자동 검증 옵션에 따라 동작 변경
  useEffect(() => {
    if (options.autoValidate) {
      // 자동 검증이 활성화된 경우에만 검증 실행
      console.log("[HOOK] Auto-validating cache on mount")
      validateCache(false)
    } else {
      // 자동 검증이 비활성화된 경우 초기화 상태만 해제
      console.log("[HOOK] Auto-validation disabled, skipping initial validation")
      setIsInitializing(false)
    }
  }, [options.autoValidate])

  // validateCache 함수 수정 - 리디렉션 옵션 추가
  const validateCache = async (skipRedirect = false) => {
    console.log(`[HOOK] Validating cache with skipRedirect=${skipRedirect}`)
    setIsValidating(true)
    setIsInitializing(true)

    try {
      // Check if we have a cache name and if it's still valid (not expired)
      if (cache.isCreated && cache.cacheName) {
        const isCacheValid = cache.lastValidated && Date.now() - cache.lastValidated < CACHE_VALIDATION_TIMEOUT

        if (isCacheValid) {
          console.log(
            `[HOOK] Using existing cache: ${cache.cacheName} (validated ${new Date(cache.lastValidated!).toISOString()})`,
          )
          setIsValidating(false)
          setIsInitializing(false)
          return true
        }

        // Cache exists but needs validation
        console.log(`[HOOK] Cache exists but needs validation: ${cache.cacheName}`)

        const response = await fetch("/api/cache/validate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cacheName: cache.cacheName,
          }),
        })

        const result = await response.json()

        if (response.ok && result.valid) {
          console.log("[HOOK] Cache validation successful")
          setCacheValidated(Date.now())
          setIsValidating(false)
          setIsInitializing(false)
          return true
        } else {
          console.log("[HOOK] Cache validation failed")
          // Cache is invalid, redirect to upload page if not skipped
          toast({
            title: "캐시가 유효하지 않습니다",
            description: "파일 업로드 페이지로 이동하여 새 캐시를 생성해주세요.",
            variant: "destructive",
          })

          if (!skipRedirect) {
            console.log("[HOOK] Redirecting to file-upload page due to invalid cache")
            resetCache()
            router.push("/dashboard/file-upload")
          } else {
            console.log("[HOOK] Skipping redirect despite invalid cache")
          }
          return false
        }
      } else {
        // No cache exists, redirect to upload page if not skipped
        toast({
          title: "캐시가 없습니다",
          description: "파일 업로드 페이지로 이동하여 캐시를 생성해주세요.",
          variant: "destructive",
        })

        if (!skipRedirect) {
          console.log("[HOOK] Redirecting to file-upload page due to missing cache")
          router.push("/dashboard/file-upload")
        } else {
          console.log("[HOOK] Skipping redirect despite missing cache")
        }
        return false
      }
    } catch (error) {
      console.error("[HOOK] Error validating cache:", error)
      toast({
        title: "캐시 검증 오류",
        description: "파일 업로드 페이지로 이동하여 새 캐시를 생성해주세요.",
        variant: "destructive",
      })

      if (!skipRedirect) {
        console.log("[HOOK] Redirecting to file-upload page due to validation error")
        resetCache()
        router.push("/dashboard/file-upload")
      } else {
        console.log("[HOOK] Skipping redirect despite validation error")
      }
      return false
    } finally {
      setIsValidating(false)
      setIsInitializing(false)
    }
  }

  return {
    isValidating,
    isInitializing,
    validateCache,
  }
}
