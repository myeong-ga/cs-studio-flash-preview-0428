"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { FileUploadForm } from "@/components/file-upload/file-upload-form"
import { FileStatusList } from "@/components/file-upload/file-status-list"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, RefreshCw, CheckCircle, AlertCircle, Info } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function FileUploadPage() {
  const { files, uploadComplete, cache, setCacheCreated, setCacheValidated, resetCache } = useStore()
  const [isCreatingCache, setIsCreatingCache] = useState(false)
  const [isValidatingCache, setIsValidatingCache] = useState(false)
  const [cacheError, setCacheError] = useState<string | null>(null)
  const { toast } = useToast()

  // Validate cache on component mount if cache exists
  useEffect(() => {
    if (cache.isCreated && cache.cacheName) {
      validateCache()
    }
  }, [])

  const handleUploadStart = () => {
    // Reset cache when starting a new upload
    resetCache()
    // 에러 상태도 초기화
    setCacheError(null)
  }

  const handleUploadComplete = () => {
    toast({
      title: "Upload complete",
      description: "All files have been uploaded successfully.",
    })
  }

  const createCache = async () => {
    if (files.length === 0) {
      toast({
        title: "No files to cache",
        description: "Please upload files first.",
        variant: "destructive",
      })
      return
    }

    // 캐시 생성 시작 시 에러 상태 초기화
    setCacheError(null)
    setIsCreatingCache(true)

    try {
      // Get all active file IDs
      const activeFileIds = files
        .filter((file) => file.status === "ACTIVE" && file.fileId)
        .map((file) => file.fileId as string)

      if (activeFileIds.length === 0) {
        toast({
          title: "No active files",
          description: "There are no active files to create a cache from.",
          variant: "destructive",
        })
        setIsCreatingCache(false)
        return
      }

      // Create cache
      const response = await fetch("/api/cache", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileIds: activeFileIds,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setCacheCreated(true, result.cacheName)
        toast({
          title: "Cache created",
          description: `Cache created successfully with name: ${result.cacheName}`,
        })
      } else {
        // API 응답이 실패한 경우 에러 메시지 설정
        setCacheError(result.error || "Failed to create cache")
        toast({
          title: "Failed to create cache",
          description: result.error || "An unknown error occurred",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating cache:", error)
      // 에러 메시지 설정
      setCacheError(error instanceof Error ? error.message : "An unknown error occurred while creating the cache")
      toast({
        title: "Error",
        description: "An error occurred while creating the cache.",
        variant: "destructive",
      })
    } finally {
      setIsCreatingCache(false)
    }
  }

  const validateCache = async () => {
    if (!cache.cacheName) {
      toast({
        title: "No cache to validate",
        description: "Please create a cache first.",
        variant: "destructive",
      })
      return
    }

    setIsValidatingCache(true)
    // 검증 시작 시 에러 상태 초기화
    setCacheError(null)

    try {
      // Validate cache
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
        setCacheValidated(Date.now())
        toast({
          title: "Cache validated",
          description: "The cache is valid and ready to use.",
        })
      } else {
        resetCache()
        // 캐시 검증 실패 시 에러 메시지 설정
        setCacheError(result.error || "Cache is no longer valid")
        toast({
          title: "Cache invalid",
          description: "The cache is no longer valid. Please create a new cache.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error validating cache:", error)
      // 에러 메시지 설정
      setCacheError(error instanceof Error ? error.message : "An unknown error occurred while validating the cache")
      toast({
        title: "Error",
        description: "An error occurred while validating the cache.",
        variant: "destructive",
      })
    } finally {
      setIsValidatingCache(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 sm:gap-8 md:gap-10 lg:gap-12 py-6 md:max-w-3xl">
      <DashboardHeader title="파일 업로드" description="CS 시뮬레이션에 사용할 파일 업로드" />

      {uploadComplete && files.length > 0 && !cache.isCreated && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-md">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 mr-2" />
            <div>
              <h3 className="font-medium text-amber-800">캐시 생성 필요</h3>
              <p className="text-amber-700 text-sm mt-1">
                채팅 시뮬레이션을 계속하려면 먼저 캐시를 생성해야 합니다. 아래의 "Google GenAI 캐시 생성" 버튼을
                클릭하여 캐시를 생성해주세요.
              </p>
            </div>
          </div>
        </div>
      )}

      <Card className="microsoft-card border-t-4 border-t-microsoft-blue">
        <CardHeader className="border-b border-gray-100 dark:border-gray-800">
          <CardTitle className="text-microsoft-blue dark:text-blue-400">파일 업로드</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <FileUploadForm onUploadStart={handleUploadStart} onUploadComplete={handleUploadComplete} />

          {files.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3">Uploaded Files</h3>
              <FileStatusList files={files} />
            </div>
          )}

          {uploadComplete && files.length > 0 && (
            <div className="mt-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Cache Management</h3>
                {cache.isCreated && cache.lastValidated && (
                  <div className="flex items-center text-sm text-gray-500">
                    <span>Last validated: {new Date(cache.lastValidated).toLocaleTimeString()}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={createCache}
                  disabled={isCreatingCache || files.length === 0}
                  className="bg-microsoft-blue hover:bg-microsoft-blue-dark"
                >
                  {isCreatingCache ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Google GenAI 캐시 생성중...
                    </>
                  ) : cache.isCreated ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Google GenAI 캐시 다시 생성
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Google GenAI 캐시 생성
                    </>
                  )}
                </Button>

                {cache.isCreated && (
                  <Button
                    onClick={validateCache}
                    disabled={isValidatingCache || !cache.cacheName}
                    variant="outline"
                    className="border-microsoft-blue-light text-microsoft-blue hover:bg-microsoft-blue-lighter"
                  >
                    {isValidatingCache ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Validating...
                      </>
                    ) : (
                      <>
                        <AlertCircle className="mr-2 h-4 w-4" />
                        Validate Cache
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* 캐시 생성 중 주의 문구 */}
              {isCreatingCache && (
                <div className="flex items-start p-3 bg-blue-50 border-l-4 border-blue-400 rounded-md">
                  <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-sm text-blue-700">
                    파일 용량에 따라 캐시생성시간이 길어질 수 있습니다. 모델의 상황에 따라 캐시생성이 어려운 경우가 있을
                    수 있습니다.
                  </p>
                </div>
              )}

              {/* 캐시 생성 에러 메시지 */}
              {cacheError && (
                <div className="p-4 bg-red-50 border border-red-300 rounded-md">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-red-800">캐시 생성 오류</h4>
                      <p className="text-sm text-red-700 mt-1">{cacheError}</p>
                    </div>
                  </div>
                </div>
              )}

              {cache.isCreated && cache.cacheName && (
                <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                  <p className="text-sm font-medium">Cache Name:</p>
                  <p className="text-xs font-mono mt-1 break-all">{cache.cacheName}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
