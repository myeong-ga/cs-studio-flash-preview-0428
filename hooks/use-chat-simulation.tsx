"use client"

import type React from "react"
import { useState, useCallback, useEffect } from "react"
import type { Message, SuggestedMessage, Action, ToolCall } from "@/types/chat"
import { useStore } from "@/lib/store"
import { requiresConfirmation } from "@/lib/tools/tools"
import { executeTool } from "@/lib/execute-tool"
import { useSession, updateActivity } from "@/lib/session"

// 도구 이름을 한글로 매핑하는 객체
const toolNameMapping: Record<string, string> = {
  get_order: "주문 조회",
  get_order_history: "주문 내역 조회",
  cancel_order: "주문 취소",
  reset_password: "비밀번호 재설정",
  send_replacement: "제품 교체",
  create_refund: "환불 처리",
  issue_voucher: "바우처 발급",
  create_return: "반품 신청",
  create_complaint: "불만 접수",
  create_ticket: "티켓 생성",
  update_info: "정보 업데이트",
}

// 현재 시간을 포맷팅하는 함수
const formatCurrentTime = (): string => {
  const now = new Date()
  const month = now.getMonth() + 1
  const day = now.getDate()
  const hours = now.getHours()
  const minutes = now.getMinutes()

  return `${month}월 ${day}일 ${hours}시 ${minutes}분`
}

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
  const [useMockData, setUseMockData] = useState(false)

  const [isEditingMessage, setIsEditingMessage] = useState(false)
  const [editedMessageContent, setEditedMessageContent] = useState("")

  const { cache } = useStore()
  const session = useSession()

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

  const toggleMockData = useCallback(() => {
    setUseMockData((prev) => {
      const newValue = !prev
      console.log(`[HOOK] Mock data ${newValue ? "enabled" : "disabled"}`)
      return newValue
    })
  }, [])

  const enableMockData = useCallback(() => {
    if (!useMockData) {
      setUseMockData(true)
      console.log("[HOOK] Mock data enabled")
    }
  }, [useMockData])

  const handleEditSuggestedMessage = useCallback(() => {
    if (!suggestedMessage) return
    const messageContent = suggestedMessage.content.map((item) => item.text).join(" ")
    setEditedMessageContent(messageContent)
    setIsEditingMessage(true)
    console.log("[HOOK] Started editing suggested message")
  }, [suggestedMessage])

  const handleCancelEdit = useCallback(() => {
    setIsEditingMessage(false)
    setEditedMessageContent("")
    console.log("[HOOK] Cancelled editing suggested message")
  }, [])

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customerInput.trim()) return

    updateActivity()

    const userMessage: Message = {
      role: "user",
      content: customerInput,
    }

    console.log("[HOOK] Customer submitted message:", customerInput)
    setMessages((prev) => [...prev, userMessage])
    setCustomerInput("")
    setIsLoading(true)

    try {
      console.log("[HOOK] Sending request to API")
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          cacheName: cache.isCreated ? cache.cacheName : undefined,
          useMockData,
          sessionInfo: {
            userId: session.userId,
            sessionId: session.sessionId,
          },
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response from API")
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error("Response body is not readable")

      const decoder = new TextDecoder()
      let buffer = ""
      const toolCalls: ToolCall[] = []
      let messageContent = ""

      console.log("[HOOK] Starting to process stream response")
      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          console.log("[HOOK] Stream completed")
          break
        }

        const chunk = decoder.decode(value, { stream: true })
        buffer += chunk

        const lines = buffer.split("\n")

        buffer = lines.pop() || ""

        for (const line of lines) {
          if (line.trim() === "") continue

          try {
            const parsedData = JSON.parse(line)
            console.log("[HOOK] Successfully parsed JSON:", parsedData)

            if (parsedData.text) {
              console.log("[HOOK] text received:", messageContent)
              messageContent += parsedData.text

              setSuggestedMessage({
                type: "message",
                role: "agent",
                id: Date.now().toString(),
                content: [{ text: messageContent }],
                status: "pending",
              })
            }

            if (parsedData.toolCall) {
              console.log("[HOOK] Tool call received:", parsedData.toolCall)

              const toolCall = parsedData.toolCall

              if (
                toolCall.args &&
                !toolCall.args.user_id &&
                (toolCall.toolName === "get_order_history" ||
                  toolCall.toolName === "reset_password" ||
                  toolCall.toolName === "issue_voucher" ||
                  toolCall.toolName === "create_complaint" ||
                  toolCall.toolName === "create_ticket" ||
                  toolCall.toolName === "update_info")
              ) {
                toolCall.args.user_id = session.userId
                console.log(`[HOOK] Injected userId ${session.userId} into tool call`)
              }

              toolCalls.push(toolCall)

              // 도구 이름을 한글로 변환
              const koreanToolName = toolNameMapping[toolCall.toolName] || toolCall.toolName

              // 현재 시간 포맷팅
              const formattedTime = formatCurrentTime()

              // 새로운 형식의 메시지 생성
              const toolCallDescription = `고객님께서는 ${formattedTime}에 ${koreanToolName}을(를) 요청하셨습니다.
매개변수: ${JSON.stringify(toolCall.args, null, 2)}`

              setSuggestedMessage({
                type: "message",
                role: "agent",
                id: Date.now().toString(),
                content: [{ text: toolCallDescription }],
                status: "pending",
              })

              // confirm이 필요한 경우에만 recommendedActions에 추가
              if (requiresConfirmation(toolCall.toolName)) {
                try {
                  const action: Action = {
                    name: toolCall.toolName,
                    parameters: toolCall.args,
                  }

                  setRecommendedActions((prev) => {
                    const exists = prev.some((a) => a.name === action.name)
                    if (!exists) {
                      return [...prev, action]
                    }
                    return prev
                  })
                } catch (e) {
                  console.error("[HOOK] Error processing tool call:", e)
                }
              }
            }
          } catch (e) {
            console.error("[HOOK] Error parsing JSON line:", line, e)
          }
        }
      }

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

      if (toolCalls.length > 0) {
        setCurrentToolCalls(toolCalls)
      }
    } catch (error) {
      console.error("[HOOK] Error getting AI response:", error)
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

  const handleSendSuggestedMessage = useCallback(() => {
    if (!suggestedMessage) {
      console.log("[HOOK] No suggested message to send")
      return
    }

    updateActivity()
    console.log("[HOOK] Sending suggested message")

    const messageContent = isEditingMessage
      ? editedMessageContent
      : suggestedMessage.content.map((item) => item.text).join(" ")

    const assistantMessage: Message = {
      role: "assistant",
      content: messageContent,
    }

    setMessages((prev) => [...prev, assistantMessage])
    console.log("[HOOK] Messages updated with suggested message")

    setSuggestedMessage(null)
    setIsEditingMessage(false)
    setEditedMessageContent("")
    console.log("[HOOK] Suggested message cleared and edit mode reset")
  }, [suggestedMessage, isEditingMessage, editedMessageContent])

  const handleOperatorSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!operatorInput.trim()) return

    updateActivity()
    console.log("[HOOK] Operator submitted custom message:", operatorInput)

    const assistantMessage: Message = {
      role: "assistant",
      content: operatorInput,
    }

    setMessages((prev) => [...prev, assistantMessage])
    setOperatorInput("")
    console.log("[HOOK] Messages updated with operator's custom message")
  }

  const handleExecuteTool = async (actionName: string, parameters: any) => {
    updateActivity()
    console.log(`[HOOK] Executing tool: ${actionName} with parameters:`, parameters)

    const toolCall = currentToolCalls.find((call) => call.toolName === actionName)

    if (!toolCall) {
      console.error(`[HOOK] No matching tool call found for ${actionName}`)
      return
    }

    const toolParameters = { ...parameters }
    if (
      !toolParameters.user_id &&
      (actionName === "get_order_history" ||
        actionName === "reset_password" ||
        actionName === "issue_voucher" ||
        actionName === "create_complaint" ||
        actionName === "create_ticket" ||
        actionName === "update_info")
    ) {
      toolParameters.user_id = session.userId
      console.log(`[HOOK] Injected userId ${session.userId} into manual tool execution`)
    }

    try {
      setIsLoading(true)

      // 서버 함수 직접 호출
      const result = await executeTool(actionName, toolParameters)
      console.log(`[HOOK] Tool ${actionName} execution result:`, result)

      // 함수 호출 메시지 추가
      const functionCallMessage: Message = {
        role: "assistant",
        content: "",
        functionCall: {
          name: toolCall.toolName,
          arguments: JSON.stringify(toolParameters),
        },
      }

      // 함수 결과 메시지 추가
      const resultMessage: Message = {
        role: "function",
        content: JSON.stringify(result.result),
        name: actionName,
      }

      // 메시지 배열에 추가
      //setMessages((prev) => [...prev, functionCallMessage, resultMessage])

      // 추천 액션에서 제거
      setRecommendedActions((prev) => prev.filter((action) => action.name !== actionName))

      // 현재 툴 콜 초기화
      setCurrentToolCalls([])

      // 결과를 Suggested Message로 표시
      const koreanToolName = toolNameMapping[actionName] || actionName
      const resultContent =
        typeof result.result === "object" ? JSON.stringify(result.result, null, 2) : result.result.toString()

      setSuggestedMessage({
        type: "message",
        role: "agent",
        id: Date.now().toString(),
        content: [{ text: `${koreanToolName} 실행 결과:\n${resultContent}` }],
        status: "pending",
      })
    } catch (error) {
      console.error(`[HOOK] Error executing tool ${actionName}:`, error)

      setSuggestedMessage({
        type: "message",
        role: "agent",
        id: Date.now().toString(),
        content: [
          {
            text: `${actionName} 실행 중 오류가 발생했습니다: ${error instanceof Error ? error.message : "알 수 없는 오류"}`,
          },
        ],
        status: "pending",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const result = {
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
    enableMockData,
  }

  return result
}

export type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any
