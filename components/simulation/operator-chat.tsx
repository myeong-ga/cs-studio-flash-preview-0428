"use client"

import type React from "react"
import { useEffect, useRef } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Loader2, Send, CheckCircle, Edit } from "lucide-react"
import type { Message, SuggestedMessage } from "@/types/chat"

interface OperatorChatProps {
  messages: Message[]
  input: string
  setInput: (input: string) => void
  handleSubmit: (e: React.FormEvent) => void
  isLoading: boolean
  suggestedMessage: SuggestedMessage | null
  handleSendSuggestedMessage: () => void
  useSimTheme?: boolean
  isEditingMessage?: boolean
  editedMessageContent?: string
  setEditedMessageContent?: (content: string) => void
  handleEditSuggestedMessage?: () => void
  handleCancelEdit?: () => void
}

export function OperatorChat({
  messages,
  input,
  setInput,
  handleSubmit,
  isLoading,
  suggestedMessage,
  handleSendSuggestedMessage,
  useSimTheme = false,
  isEditingMessage = false,
  editedMessageContent = "",
  setEditedMessageContent = () => {},
  handleEditSuggestedMessage = () => {},
  handleCancelEdit = () => {},
}: OperatorChatProps) {
  const prevSuggestedMessageRef = useRef<SuggestedMessage | null>(null)
  // Add ref for the message container
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const suggestedMessageRef = useRef<HTMLDivElement>(null)

  // Add auto-scroll effect when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Add auto-scroll effect when suggested message changes
  useEffect(() => {
    if (suggestedMessage) {
      suggestedMessageRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [suggestedMessage])

  // suggestedMessage 변경 시 로그 출력
  useEffect(() => {
    // 이전 값과 현재 값 비교
    if (suggestedMessage !== prevSuggestedMessageRef.current) {
      console.log(
        "[COMPONENT] OperatorChat - suggestedMessage changed:",
        suggestedMessage
          ? {
              id: suggestedMessage.id,
              content:
                suggestedMessage.content
                  .map((item) => item.text)
                  .join(" ")
                  .substring(0, 100) + "...",
              status: suggestedMessage.status,
            }
          : "null",
      )

      // 이전 값 업데이트
      prevSuggestedMessageRef.current = suggestedMessage
    }
  }, [suggestedMessage])

  // 메시지 변경 시 로그 출력
  useEffect(() => {
    console.log("[COMPONENT] OperatorChat - messages updated, count:", messages.length)
  }, [messages])

  const cardClass = useSimTheme
    ? "h-full flex flex-col sim-card rounded-none"
    : "h-full flex flex-col microsoft-card rounded-none"

  const messageUserClass = useSimTheme ? "sim-message-user" : "bg-microsoft-blue-lighter text-gray-800"

  const messageAssistantClass = useSimTheme ? "sim-message-assistant" : "bg-microsoft-blue text-white"

  const inputClass = useSimTheme
    ? "sim-input focus-visible:ring-0"
    : "border-microsoft-blue-light focus-visible:ring-microsoft-blue"

  const buttonClass = useSimTheme ? "sim-button" : "bg-microsoft-blue hover:bg-microsoft-blue-dark"

  const suggestedMessageClass = useSimTheme
    ? "border-2 border-dashed border-amber-400 bg-amber-50 text-gray-800 rounded-sm px-3 py-2 max-w-[80%]"
    : "border-2 border-dashed border-amber-400 bg-amber-50 text-gray-800 rounded-sm px-3 py-2 max-w-[80%]"

  const handleSendClick = () => {
    console.log("[COMPONENT] OperatorChat - Send suggested message button clicked")
    handleSendSuggestedMessage()
  }

  return (
    <Card className={cardClass}>
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 microsoft-scrollbar min-h-0 h-[calc(100%-4rem)]">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === "assistant" ? "justify-end" : "justify-start"} gap-2 items-start`}
          >
            {message.role !== "assistant" && (
              <Avatar className="h-8 w-8 border-2 border-microsoft-blue-light">
                <AvatarImage src="/placeholder.svg?height=32&width=32" />
                <AvatarFallback className="bg-gray-500 text-white">고객</AvatarFallback>
              </Avatar>
            )}
            <div
              className={`rounded-sm px-3 py-2 max-w-[80%] ${
                message.role === "assistant" ? messageAssistantClass : messageUserClass
              }`}
            >
              {message.content}
            </div>
            {message.role === "assistant" && (
              <Avatar className="h-8 w-8 border-2 border-microsoft-blue-light">
                <AvatarImage src="/placeholder.svg?height=32&width=32" />
                <AvatarFallback className="bg-microsoft-blue text-white">CS</AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
        {/* Add ref element for auto-scrolling messages */}
        <div ref={messagesEndRef} />

        {/* 제안된 메시지 표시 */}
        {suggestedMessage && (
          <div className="flex flex-col gap-2 items-end" ref={suggestedMessageRef}>
            <div className={suggestedMessageClass}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-amber-600">AI 제안 메시지</span>
                {suggestedMessage.status && (
                  <span className="text-xs bg-amber-200 px-1.5 py-0.5 rounded-full">
                    {suggestedMessage.status === "pending"
                      ? "대기중"
                      : suggestedMessage.status === "approved"
                        ? "승인됨"
                        : "거부됨"}
                  </span>
                )}
              </div>
              {isEditingMessage ? (
                <textarea
                  value={editedMessageContent}
                  onChange={(e) => setEditedMessageContent(e.target.value)}
                  className="w-full bg-amber-50 text-gray-800 border border-amber-400 rounded-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-amber-400 focus:border-amber-500 resize-none"
                  rows={5}
                  style={{ width: "100%", minHeight: "100px" }}
                />
              ) : (
                suggestedMessage.content.map((item, idx) => <p key={idx}>{item.text}</p>)
              )}
            </div>
            <div className="flex gap-2">
              {isEditingMessage ? (
                <>
                  <Button onClick={handleCancelEdit} className="bg-gray-500 hover:bg-gray-600 text-white" size="sm">
                    취소
                  </Button>
                  <Button
                    onClick={handleSendSuggestedMessage}
                    className="bg-amber-500 hover:bg-amber-600 text-white"
                    size="sm"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    수정 완료
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={handleEditSuggestedMessage}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                    size="sm"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    수정하기
                  </Button>
                  <Button
                    onClick={handleSendSuggestedMessage}
                    className="bg-amber-500 hover:bg-amber-600 text-white"
                    size="sm"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />이 응답 보내기
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t p-4 flex-shrink-0 sticky bottom-0 bg-background">
        <form onSubmit={handleSubmit} className="flex w-full gap-2">
          <Input
            placeholder="메시지를 입력하세요..."
            value={input}
            onChange={(e) => {
              console.log(
                "[COMPONENT] OperatorChat - Input changed:",
                e.target.value.substring(0, 20) + (e.target.value.length > 20 ? "..." : ""),
              )
              setInput(e.target.value)
            }}
            disabled={isLoading}
            className={inputClass}
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={buttonClass}
            onClick={() => console.log("[COMPONENT] OperatorChat - Submit button clicked")}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
