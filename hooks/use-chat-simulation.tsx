"use client"

import type React from "react"
import { useState, useCallback, useEffect } from "react"
import type { Message, SuggestedMessage, Action, ToolCall } from "@/types/chat"
import { useStore } from "@/lib/store"
import { requiresConfirmation } from "@/lib/tools/tools"

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
  const [currentToolCalls, setCurrentToolCalls] = useState<ToolCall[]>([])
  const [useMockData, setUseMockData] = useState(false) // 모의 데이터 사용 여부

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

  // 모의 데이터 사용 토글 함수
  const toggleMockData = useCallback(() => {
    setUseMockData((prev) => !prev)
    console.log(`[HOOK] Mock data ${!useMockData ? "enabled" : "disabled"}`)
  }, [useMockData])

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

    try {
      // API 호출하여 응답 가져오기
      console.log("[HOOK] Sending request to API")
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          cacheName: cache.isCreated ? cache.cacheName : undefined,
          useMockData, // 모의 데이터 사용 여부 전달
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
      const toolCalls: ToolCall[] = []
      let messageContent = ""

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

            // Handle text chunks
            if (parsedData.text) {
              messageContent += parsedData.text

              // Update suggested message with the content
              setSuggestedMessage({
                type: "message",
                role: "agent",
                id: Date.now().toString(),
                content: [{ text: messageContent }],
                status: "pending",
              })
            }

            // Handle tool calls
            if (parsedData.toolCall) {
              console.log("[HOOK] Tool call received:", parsedData.toolCall)

              const toolCall = parsedData.toolCall
              toolCalls.push(toolCall)

              // Create action from tool call if it requires confirmation
              if (requiresConfirmation(toolCall.function.name)) {
                try {
                  const parsedArgs = JSON.parse(toolCall.function.arguments)
                  const action: Action = {
                    name: toolCall.function.name,
                    parameters: parsedArgs,
                  }

                  // Update recommended actions
                  setRecommendedActions((prev) => {
                    // Check if this action already exists
                    const exists = prev.some((a) => a.name === action.name)
                    if (!exists) {
                      return [...prev, action]
                    }
                    return prev
                  })
                } catch (e) {
                  console.error("[HOOK] Error parsing tool call arguments:", e)
                }
              }
            }
          } catch (e) {
            console.error("[HOOK] Error parsing JSON line:", line, e)
          }
        }
      }

      // Process any remaining buffer
      if (buffer.trim()) {
        try {
          const parsedData = JSON.parse(buffer)
          if (parsedData.text) {
            messageContent += parsedData.text
            setSuggestedMessage({
              type: "message",
              role: "agent",
              id: Date.now().toString(),
              content: [{ text: messageContent }],
              status: "pending",
            })
          }
        } catch (e) {
          console.error("[HOOK] Error parsing final buffer:", e)
        }
      }

      // Store current tool calls for later use
      if (toolCalls.length > 0) {
        setCurrentToolCalls(toolCalls)
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

  // Handle executing a tool
  const handleExecuteTool = async (actionName: string, parameters: any) => {
    console.log(`[HOOK] Executing tool: ${actionName} with parameters:`, parameters)

    // Find the matching tool call\
    const toolCall = currentToolCalls.find((call) => call.function.name === actionName)

    if (!toolCall) {
      console.error(`[HOOK] No matching tool call found for ${actionName}`)
      return
    }

    try {
      // Here you would actually execute the tool
      // For now, we'll just simulate a response

      // Add a message indicating the tool is being executed
      const toolMessage: Message = {
        role: "system",
        content: `Executing ${actionName}...`,
      }

      setMessages((prev) => [...prev, toolMessage])

      // Remove the action from recommended actions
      setRecommendedActions((prev) => prev.filter((action) => action.name !== actionName))

      // In a real implementation, you would call the actual tool function here
      // const result = await executeTool(actionName, parameters)

      // For now, simulate a response
      const resultMessage: Message = {
        role: "system",
        content: `${actionName} executed successfully with parameters: ${JSON.stringify(parameters)}`,
      }

      setMessages((prev) => [...prev, resultMessage])
    } catch (error) {
      console.error(`[HOOK] Error executing tool ${actionName}:`, error)

      // Add error message
      const errorMessage: Message = {
        role: "system",
        content: `Error executing ${actionName}: ${error instanceof Error ? error.message : "Unknown error"}`,
      }

      setMessages((prev) => [...prev, errorMessage])
    }
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
    handleExecuteTool,
    useMockData,
    toggleMockData,
  }
}
