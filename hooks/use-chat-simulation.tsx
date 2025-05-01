"use client"

import type React from "react"
import { useState, useCallback, useEffect } from "react"
import type { Message, SuggestedMessage, Action, ToolCall } from "@/types/chat"
import { useStore } from "@/lib/store"
import { requiresConfirmation } from "@/lib/tools/tools"

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
              console.log("[HOOK] text received:", parsedData.text)
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
              toolCalls.push(toolCall)

              if (requiresConfirmation(toolCall.toolName.name)) {
                try {
                  const parsedArgs = JSON.parse(toolCall.args)
                  const action: Action = {
                    name: toolCall.toolName.name,
                    parameters: parsedArgs,
                  }

                  setRecommendedActions((prev) => {
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
    console.log(`[HOOK] Executing tool: ${actionName} with parameters:`, parameters)

    const toolCall = currentToolCalls.find((call) => call.function.name === actionName)

    if (!toolCall) {
      console.error(`[HOOK] No matching tool call found for ${actionName}`)
      return
    }

    try {
      const toolMessage: Message = {
        role: "system",
        content: `Executing ${actionName}...`,
      }

      setMessages((prev) => [...prev, toolMessage])

      setRecommendedActions((prev) => prev.filter((action) => action.name !== actionName))

      const resultMessage: Message = {
        role: "system",
        content: `${actionName} executed successfully with parameters: ${JSON.stringify(parameters)}`,
      }

      setMessages((prev) => [...prev, resultMessage])
    } catch (error) {
      console.error(`[HOOK] Error executing tool ${actionName}:`, error)

      const errorMessage: Message = {
        role: "system",
        content: `Error executing ${actionName}: ${error instanceof Error ? error.message : "Unknown error"}`,
      }

      setMessages((prev) => [...prev, errorMessage])
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

  // Add type for the return value
  return result
}

// Export the return type for type safety
export type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any
