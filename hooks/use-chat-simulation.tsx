"use client"

import type React from "react"
import { useState, useCallback, useEffect, useRef } from "react"
import type { Message, SuggestedMessage, Action } from "@/lib/types"
import { useStore } from "@/lib/store"

// 초기 메시지 설정
const initialMessages: Message[] = [
  {
    role: "assistant",
    content: "안녕하세요! CS 센터입니다. 무엇을 도와드릴까요?",
  },
]

export function useChatSimulation() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [customerInput, setCustomerInput] = useState("")
  const [operatorInput, setOperatorInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [suggestedMessage, setSuggestedMessage] = useState<SuggestedMessage | null>(null)
  const [recommendedActions, setRecommendedActions] = useState<Action[]>([])

  // 누적된 응답을 추적하기 위한 ref
  const accumulatedResponseRef = useRef<string>("")

  // 편집 모드 상태와 편집 중인 메시지 내용을 추가합니다
  const [isEditingMessage, setIsEditingMessage] = useState(false)
  const [editedMessageContent, setEditedMessageContent] = useState("")

  // Get cache from store
  const { cache } = useStore()

  // suggestedMessage 변경 시 로그 출력
  useEffect(() => {
    if (suggestedMessage) {
      console.log("[HOOK] Suggested message updated:", {
        id: suggestedMessage.id,
        content:
          suggestedMessage.content
            .map((item) => item.text)
            .join(" ")
            .substring(0, 100) + "...",
      })
    }
  }, [suggestedMessage])

  // 편집 시작 함수 추가
  const handleEditSuggestedMessage = useCallback(() => {
    if (!suggestedMessage) return

    // 현재 제안된 메시지 내용을 편집 상태로 설정
    const messageContent = suggestedMessage.content.map((item) => item.text).join(" ")
    setEditedMessageContent(messageContent)
    setIsEditingMessage(true)
    console.log("[HOOK] Started editing suggested message")
  }, [suggestedMessage])

  // 편집 취소 함수 추가
  const handleCancelEdit = useCallback(() => {
    setIsEditingMessage(false)
    setEditedMessageContent("")
    console.log("[HOOK] Cancelled editing suggested message")
  }, [])

  // 고객 메시지 제출 처리
  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customerInput.trim()) return

    // 사용자 메시지 추가 (Optimistic UI 업데이트)
    const userMessage: Message = {
      role: "user",
      content: customerInput,
    }

    console.log("[HOOK] Customer submitted message:", customerInput)
    setMessages((prev) => [...prev, userMessage])
    setCustomerInput("")
    setIsLoading(true)

    // 응답 누적 ref 초기화
    accumulatedResponseRef.current = ""

    try {
      // API 호출하여 Gemini 응답 가져오기
      console.log("[HOOK] Sending request to API")
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          cacheName: cache.isCreated ? cache.cacheName : undefined,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response from API")
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error("Response body is not readable")

      // 텍스트 디코더 생성
      const decoder = new TextDecoder()
      let buffer = ""

      // Stream 처리
      console.log("[HOOK] Starting to process stream response")
      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          console.log("[HOOK] Stream completed")
          break
        }

        // 새로운 청크를 디코딩
        const chunk = decoder.decode(value, { stream: true })
        buffer += chunk

        console.log("[HOOK] Received chunk:", chunk)

        // 줄 단위로 처리 (각 줄이 완전한 JSON 객체라고 가정)
        const lines = buffer.split("\n")

        // 마지막 줄은 불완전할 수 있으므로 버퍼에 남겨둠
        buffer = lines.pop() || ""

        for (const line of lines) {
          if (line.trim() === "") continue // 빈 줄 무시

          try {
            // 각 줄을 JSON으로 파싱 시도
            const parsedData = JSON.parse(line)
            console.log("[HOOK] Successfully parsed JSON:", parsedData)

            // 텍스트 누적
            if (parsedData.text) {
              accumulatedResponseRef.current += parsedData.text

              // 누적된 전체 응답으로 suggestedMessage 업데이트
              const newSuggestedMessage: SuggestedMessage = {
                type: "message",
                role: "agent",
                id: Date.now().toString(),
                content: [{ text: accumulatedResponseRef.current }],
                status: "pending",
              }

              console.log(
                "[HOOK] Updating suggested message with accumulated text:",
                accumulatedResponseRef.current.substring(0, 50) +
                  (accumulatedResponseRef.current.length > 50 ? "..." : ""),
              )

              setSuggestedMessage(newSuggestedMessage)
            }
          } catch (e) {
            console.error("[HOOK] Error parsing JSON line:", line, e)
          }
        }
      }

      // 버퍼에 남은 내용 처리
      if (buffer.trim() !== "") {
        try {
          const parsedData = JSON.parse(buffer)
          if (parsedData.text) {
            accumulatedResponseRef.current += parsedData.text

            // 최종 메시지 설정
            const finalSuggestedMessage: SuggestedMessage = {
              type: "message",
              role: "agent",
              id: Date.now().toString(),
              content: [{ text: accumulatedResponseRef.current }],
              status: "pending",
            }

            setSuggestedMessage(finalSuggestedMessage)
          }
        } catch (e) {
          console.error("[HOOK] Error parsing final buffer:", buffer, e)
        }
      }

      // 스트림이 완료된 후 최종 메시지 설정
      if (accumulatedResponseRef.current) {
        const finalSuggestedMessage: SuggestedMessage = {
          type: "message",
          role: "agent",
          id: Date.now().toString(),
          content: [{ text: accumulatedResponseRef.current }],
          status: "pending",
        }

        console.log(
          "[HOOK] Setting final suggested message:",
          accumulatedResponseRef.current.substring(0, 50) + (accumulatedResponseRef.current.length > 50 ? "..." : ""),
        )

        setSuggestedMessage(finalSuggestedMessage)
      }
    } catch (error) {
      console.error("[HOOK] Error getting AI response:", error)
      // 에러 발생 시 기본 응답 제공
      setSuggestedMessage({
        type: "message",
        role: "agent",
        id: Date.now().toString(),
        content: [{ text: "죄송합니다. 응답을 처리하는 중 오류가 발생했습니다." }],
        status: "pending",
      })
    } finally {
      setIsLoading(false)
      console.log("[HOOK] Request completed, loading state set to false")
    }
  }

  // 상담사가 제안된 메시지 전송
  const handleSendSuggestedMessage = useCallback(() => {
    if (!suggestedMessage) {
      console.log("[HOOK] No suggested message to send")
      return
    }

    console.log("[HOOK] Sending suggested message")

    // 편집 모드인 경우 편집된 내용을 사용, 아닌 경우 원본 내용 사용
    const messageContent = isEditingMessage
      ? editedMessageContent
      : suggestedMessage.content.map((item) => item.text).join(" ")

    // 채팅 메시지 업데이트
    const assistantMessage: Message = {
      role: "assistant",
      content: messageContent,
    }

    // 채팅 메시지 업데이트
    setMessages((prev) => [...prev, assistantMessage])
    console.log("[HOOK] Messages updated with suggested message")

    // 제안된 메시지 초기화
    setSuggestedMessage(null)
    setIsEditingMessage(false)
    setEditedMessageContent("")
    console.log("[HOOK] Suggested message cleared and edit mode reset")

    // 누적된 응답 초기화
    accumulatedResponseRef.current = ""
  }, [suggestedMessage, isEditingMessage, editedMessageContent])

  // 상담사 메시지 제출 처리
  const handleOperatorSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!operatorInput.trim()) return

    console.log("[HOOK] Operator submitted custom message:", operatorInput)

    // 상담사 메시지 추가
    const assistantMessage: Message = {
      role: "assistant",
      content: operatorInput,
    }

    setMessages((prev) => [...prev, assistantMessage])
    setOperatorInput("")
    console.log("[HOOK] Messages updated with operator's custom message")
  }

  return {
    messages,
    customerInput,
    setCustomerInput,
    operatorInput,
    setOperatorInput,
    handleCustomerSubmit,
    handleOperatorSubmit,
    isLoading,
    suggestedMessage,
    setSuggestedMessage,
    handleSendSuggestedMessage,
    recommendedActions,
    setRecommendedActions,
    isEditingMessage,
    editedMessageContent,
    setEditedMessageContent,
    handleEditSuggestedMessage,
    handleCancelEdit,
  }
}
