"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { FileText, Upload, X, CloudUpload } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useStore } from "@/lib/store"
import { Progress } from "@/components/ui/progress"
import { FileState } from "@/lib/types"

interface FileUploadFormProps {
  onUploadStart: () => void
  onUploadComplete: () => void
}

export function FileUploadForm({ onUploadStart, onUploadComplete }: FileUploadFormProps) {
  const { toast } = useToast()
  const [files, setFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { files: storeFiles, addFile, updateFileStatus, setUploadComplete, resetFiles } = useStore()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFiles((prev) => [...prev, ...newFiles])
      const fileArray = Array.from(e.target.files)
      setSelectedFiles(fileArray)
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return

    setUploading(true)
    onUploadStart()
    setProgress(0)

    // Add all files to store with 'STATE_UNSPECIFIED' status
    selectedFiles.forEach((file) => {
      addFile({
        name: file.name,
        status: FileState.STATE_UNSPECIFIED,
      })
    })

    let completedCount = 0

    // Process each file
    for (const file of selectedFiles) {
      try {
        // Create FormData for the file
        const formData = new FormData()
        formData.append("file", file)

        // Update status to PROCESSING (for upload phase)
        updateFileStatus(file.name, FileState.PROCESSING)

        // Upload the file
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        const result = await response.json()

        if (response.ok) {
          // Continue with PROCESSING status during file processing
          updateFileStatus(file.name, FileState.PROCESSING, result.fileId)

          // Poll for file processing status
          let processingComplete = false
          while (!processingComplete) {
            const statusResponse = await fetch(`/api/upload/status?fileId=${result.fileId}`)
            const statusResult = await statusResponse.json()

            // Updated logic to treat STATE_UNSPECIFIED as ACTIVE
            if (statusResult.state === "ACTIVE") {
              updateFileStatus(file.name, FileState.ACTIVE, result.fileId)
              processingComplete = true
            } else if (statusResult.state === "STATE_UNSPECIFIED") {
              updateFileStatus(file.name, FileState.STATE_UNSPECIFIED, result.fileId)
              processingComplete = true
            } else if (statusResult.state === "FAILED") {
              updateFileStatus(file.name, FileState.FAILED, result.fileId, statusResult.error || "Processing failed")
              processingComplete = true
            } else {
              // Still processing, wait 2 seconds before checking again
              await new Promise((resolve) => setTimeout(resolve, 2000))
            }
          }
        } else {
          updateFileStatus(file.name, FileState.FAILED, undefined, result.error || "Upload failed")
        }
      } catch (error) {
        console.error("Error uploading file:", error)
        updateFileStatus(file.name, FileState.FAILED, undefined, "catch error")
      }

      // Update progress
      completedCount++
      setProgress(Math.round((completedCount / selectedFiles.length) * 100))
    }

    setUploading(false)
    setUploadComplete(true)
    onUploadComplete()

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }

    // 업로드가 완료되면 선택된 파일 목록 비우기
    setSelectedFiles([])
    setFiles([]) // 선택된 파일 리스트 비우기

    toast({
      title: "파일 업로드 완료",
      description: "모든 파일이 성공적으로 업로드되었습니다.",
    })
  }

  // Update the resetFiles function to delete files from Gemini
  const handleReset = async () => {
    // First check if there are files to delete in the store
    if (storeFiles.length === 0) {
      // If no files in store but we have local files, just clear local state
      if (files.length > 0) {
        setFiles([])
        setSelectedFiles([])
      }
      return
    }

    setIsUploading(true) // Show loading state

    // Delete each file from Gemini using the store files that have fileId
    for (const file of storeFiles) {
      if (file.fileId) {
        try {
          console.log(`Deleting file: ${file.name} with ID: ${file.fileId}`)
          // Call API to delete the file
          // fileId는 Google Genai API에서 'name' 속성으로 사용됩니다
          const response = await fetch(`/api/upload/delete?fileId=${file.fileId}`, {
            method: "DELETE",
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || "Failed to delete file")
          }
        } catch (error) {
          console.error(`Error deleting file ${file.name}:`, error)
          toast({
            title: "파일 삭제 오류",
            description: `${file.name} 파일 삭제 중 오류가 발생했습니다.`,
            variant: "destructive",
          })
        }
      }
    }

    // Reset store state
    resetFiles()

    // Reset local state
    setFiles([])
    setSelectedFiles([])
    setIsUploading(false)

    toast({
      title: "파일 초기화 완료",
      description: "모든 파일이 성공적으로 삭제되었습니다.",
    })
  }

  return (
    <div>
      <Card className="microsoft-card border-t-4 border-t-microsoft-blue">
        <CardHeader className="border-b border-gray-100 dark:border-gray-800">
          <CardTitle className="text-microsoft-blue dark:text-blue-400">파일 업로드</CardTitle>
          <CardDescription>
            CS 시뮬레이션에 사용할 파일을 업로드하세요. PDF, DOCX, TXT 파일을 지원합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileChange}
                disabled={uploading}
                className="flex-1"
              />
              {/* 디스플레이용 버튼 - 항상 비활성화 상태 */}
              <Button type="button" disabled={true} className="min-w-[120px] opacity-50 cursor-not-allowed">
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </Button>
            </div>

            {selectedFiles.length > 0 && (
              <div className="text-sm text-gray-500">{selectedFiles.length} file(s) selected</div>
            )}

            {uploading && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <div className="text-sm text-gray-500 text-right">{progress}% complete</div>
              </div>
            )}
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              <Label>선택된 파일 ({files.length})</Label>
              <div className="space-y-2 max-h-40 overflow-auto p-2 border rounded-sm microsoft-scrollbar">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-microsoft-blue-lighter p-2 rounded-sm"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-microsoft-blue" />
                      <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                      <span className="text-xs text-muted-foreground">({(file.size / 1024).toFixed(1)} KB)</span>
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeFile(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">설명 (선택사항)</Label>
            <Textarea
              id="description"
              placeholder="파일에 대한 설명을 입력하세요..."
              className="resize-none border-microsoft-blue-light focus-visible:ring-microsoft-blue"
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-microsoft-blue">고급 설정</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="context-length">컨텍스트 길이 최적화</Label>
                  <p className="text-xs text-muted-foreground">긴 문서를 더 효율적으로 처리합니다</p>
                </div>
                <Switch id="context-length" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-summarize">자동 요약 생성</Label>
                  <p className="text-xs text-muted-foreground">업로드된 문서의 요약을 자동으로 생성합니다</p>
                </div>
                <Switch id="auto-summarize" />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t border-gray-100 dark:border-gray-800 pt-4">
          <div className="flex gap-2">
            {/* "Google GenAI 파일 업로드" 버튼은 항상 표시되지만, 파일이 없으면 비활성화 */}
            <Button
              type="button"
              onClick={handleUpload}
              disabled={files.length === 0 || uploading}
              className={`${
                files.length === 0
                  ? "bg-gray-300 hover:bg-gray-300 cursor-not-allowed"
                  : "bg-microsoft-blue hover:bg-microsoft-blue-dark"
              }`}
            >
              <CloudUpload className="mr-2 h-4 w-4" />
              Google GenAI 파일 업로드
            </Button>
          </div>
          <Button
            variant="outline"
            type="button"
            onClick={handleReset}
            className="border-microsoft-blue-light text-microsoft-blue hover:bg-microsoft-blue-lighter"
          >
            파일 초기화
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
