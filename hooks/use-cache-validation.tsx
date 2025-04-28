"use client"

import { useState, useEffect } from "react"
import { useStore } from "@/lib/store"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

// Cache validation timeout in milliseconds (5 minutes)
const CACHE_VALIDATION_TIMEOUT = 5 * 60 * 1000

export function useCacheValidation() {
  const [isValidating, setIsValidating] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const { cache, setCacheValidated, resetCache } = useStore()
  const router = useRouter()
  const { toast } = useToast()

  // Validate cache on component mount
  useEffect(() => {
    validateCache()
  }, [])

  const validateCache = async () => {
    setIsValidating(true)
    setIsInitializing(true)

    try {
      // Check if we have a cache name and if it's still valid (not expired)
      if (cache.isCreated && cache.cacheName) {
        const isCacheValid = cache.lastValidated && Date.now() - cache.lastValidated < CACHE_VALIDATION_TIMEOUT

        if (isCacheValid) {
          console.log(
            `Using existing cache: ${cache.cacheName} (validated ${new Date(cache.lastValidated!).toISOString()})`,
          )
          setIsValidating(false)
          setIsInitializing(false)
          return true
        }

        // Cache exists but needs validation
        console.log(`Cache exists but needs validation: ${cache.cacheName}`)

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
          console.log("Cache validation successful")
          setCacheValidated(Date.now())
          setIsValidating(false)
          setIsInitializing(false)
          return true
        } else {
          console.log("Cache validation failed")
          // Cache is invalid, redirect to upload page
          toast({
            title: "캐시가 유효하지 않습니다",
            description: "파일 업로드 페이지로 이동하여 새 캐시를 생성해주세요.",
            variant: "destructive",
          })
          resetCache()
          router.push("/dashboard/file-upload")
          return false
        }
      } else {
        // No cache exists, redirect to upload page
        toast({
          title: "캐시가 없습니다",
          description: "파일 업로드 페이지로 이동하여 캐시를 생성해주세요.",
          variant: "destructive",
        })
        router.push("/dashboard/file-upload")
        return false
      }
    } catch (error) {
      console.error("Error validating cache:", error)
      toast({
        title: "캐시 검증 오류",
        description: "파일 업로드 페이지로 이동하여 새 캐시를 생성해주세요.",
        variant: "destructive",
      })
      resetCache()
      router.push("/dashboard/file-upload")
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
