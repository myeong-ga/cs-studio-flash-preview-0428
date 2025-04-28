"use client"

import type React from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Loader2, Send } from "lucide-react"
import type { Message } from "@/types/chat"

interface CustomerChatProps {
  messages: Message[]
  input: string
  setInput: (input: string) => void
  handleSubmit: (e: React.FormEvent) => void
  isLoading: boolean
  useSimTheme?: boolean
}

export function CustomerChat({
  messages,
  input,
  setInput,
  handleSubmit,
  isLoading,
  useSimTheme = false,
}: CustomerChatProps) {
  const cardClass = useSimTheme
    ? "h-full flex flex-col sim-card border-t-0 rounded-t-none"
    : "h-full flex flex-col microsoft-card border-t-0 rounded-t-none"

  const messageUserClass = useSimTheme ? "sim-message-user" : "bg-microsoft-blue text-white"

  const messageAssistantClass = useSimTheme ? "sim-message-assistant" : "bg-microsoft-blue-lighter text-gray-800"

  const inputClass = useSimTheme
    ? "sim-input focus-visible:ring-0"
    : "border-microsoft-blue-light focus-visible:ring-microsoft-blue"

  const buttonClass = useSimTheme ? "sim-button" : "bg-microsoft-blue hover:bg-microsoft-blue-dark"

  return (
    <Card className={cardClass}>
      <CardContent className="flex-1 overflow-auto p-4 space-y-4 microsoft-scrollbar">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} gap-2 items-start`}
          >
            {message.role !== "user" && (
              <Avatar className="h-8 w-8 border-2 border-microsoft-blue-light">
                <AvatarImage src="/placeholder.svg?height=32&width=32" />
                <AvatarFallback className="bg-microsoft-blue text-white">CS</AvatarFallback>
              </Avatar>
            )}
            <div
              className={`rounded-sm px-3 py-2 max-w-[80%] ${
                message.role === "user" ? messageUserClass : messageAssistantClass
              }`}
            >
              {message.content}
            </div>
            {message.role === "user" && (
              <Avatar className="h-8 w-8 border-2 border-microsoft-blue-light">
                <AvatarImage src="/placeholder.svg?height=32&width=32" />
                <AvatarFallback className="bg-gray-500 text-white">고객</AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
      </CardContent>
      <CardFooter className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex w-full gap-2">
          <Input
            placeholder="메시지를 입력하세요..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className={inputClass}
          />
          <Button type="submit" disabled={isLoading || !input.trim()} className={buttonClass}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
