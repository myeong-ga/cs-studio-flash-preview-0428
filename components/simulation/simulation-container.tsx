"use client"
import { CustomerChat } from "@/components/simulation/customer-chat"
import { OperatorChat } from "@/components/simulation/operator-chat"
import { CustomerInfo } from "@/components/simulation/customer-info"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { useMemo } from "react"
import type { ReturnType } from "@/hooks/use-chat-simulation"

interface SimulationContainerProps {
  bypassCacheCheck?: boolean
  isLoading?: boolean
  chatSimulation: ReturnType<typeof import("@/hooks/use-chat-simulation").useChatSimulation>
}

export function SimulationContainer({
  bypassCacheCheck = false,
  isLoading = false,
  chatSimulation,
}: SimulationContainerProps) {
  // Memoize components based on their dependencies to prevent unnecessary re-renders

  // Mock data toggle is memoized based on useMockData state
  const mockDataToggle = useMemo(
    () => (
      <div className="flex items-center justify-end mb-4 gap-2">
        <Label htmlFor="mock-data-toggle" className="text-sm font-medium">
          모의 데이터 사용
        </Label>
        <Switch
          id="mock-data-toggle"
          checked={chatSimulation.useMockData}
          onCheckedChange={chatSimulation.toggleMockData}
        />
        {chatSimulation.useMockData && (
          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">모의 데이터 활성화됨</span>
        )}
      </div>
    ),
    [chatSimulation.useMockData, chatSimulation.toggleMockData],
  )

  // Customer chat is memoized based on messages and input state
  const customerChatComponent = useMemo(
    () => (
      <CustomerChat
        messages={chatSimulation.messages}
        input={chatSimulation.customerInput}
        setInput={chatSimulation.setCustomerInput}
        handleSubmit={chatSimulation.handleCustomerSubmit}
        isLoading={chatSimulation.isLoading}
        useSimTheme={true}
      />
    ),
    [
      chatSimulation.messages,
      chatSimulation.customerInput,
      chatSimulation.setCustomerInput,
      chatSimulation.handleCustomerSubmit,
      chatSimulation.isLoading,
    ],
  )

  // Operator chat is memoized based on its dependencies
  const operatorChatComponent = useMemo(
    () => (
      <OperatorChat
        messages={chatSimulation.messages}
        input={chatSimulation.operatorInput}
        setInput={chatSimulation.setOperatorInput}
        handleSubmit={chatSimulation.handleOperatorSubmit}
        isLoading={chatSimulation.isLoading}
        suggestedMessage={chatSimulation.suggestedMessage}
        handleSendSuggestedMessage={chatSimulation.handleSendSuggestedMessage}
        useSimTheme={true}
        isEditingMessage={chatSimulation.isEditingMessage}
        editedMessageContent={chatSimulation.editedMessageContent}
        setEditedMessageContent={chatSimulation.setEditedMessageContent}
        handleEditSuggestedMessage={chatSimulation.handleEditSuggestedMessage}
        handleCancelEdit={chatSimulation.handleCancelEdit}
      />
    ),
    [
      chatSimulation.messages,
      chatSimulation.operatorInput,
      chatSimulation.setOperatorInput,
      chatSimulation.handleOperatorSubmit,
      chatSimulation.isLoading,
      chatSimulation.suggestedMessage,
      chatSimulation.handleSendSuggestedMessage,
      chatSimulation.isEditingMessage,
      chatSimulation.editedMessageContent,
      chatSimulation.setEditedMessageContent,
      chatSimulation.handleEditSuggestedMessage,
      chatSimulation.handleCancelEdit,
    ],
  )

  // Customer info is memoized based on recommended actions
  const customerInfoComponent = useMemo(
    () => (
      <CustomerInfo
        useSimTheme={true}
        recommendedActions={chatSimulation.recommendedActions}
        onExecuteTool={chatSimulation.handleExecuteTool}
      />
    ),
    [chatSimulation.recommendedActions, chatSimulation.handleExecuteTool],
  )

  // Loading state component
  if (isLoading && !bypassCacheCheck) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium">캐시 검증 중...</p>
          <p className="text-sm text-gray-500 mt-2">잠시만 기다려주세요</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-[calc(100vh-12rem)] overflow-auto  font-geist-mono simulation-theme flex flex-col">
      {/* Mock data toggle switch - memoized */}
      <div className="flex-shrink-0">{mockDataToggle}</div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
        {/* Customer View - 1/4 width on large screens, full width on small screens */}
        <div className="flex flex-col h-full">
          <div className="sim-header py-2 px-4 rounded-t-md flex-shrink-0 sticky top-0 z-10">
            <h2 className="text-center font-medium">고객 화면</h2>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">{customerChatComponent}</div>
        </div>

        {/* Representative View - 3/4 width on large screens, full width on small screens */}
        <div className="lg:col-span-3 flex flex-col h-full">
          <div className="sim-header py-2 px-4 rounded-t-md flex-shrink-0 sticky top-0 z-10">
            <h2 className="text-center font-medium">상담사 화면</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 h-full min-h-0">
            {/* Chat Area - 3/5 width on large screens, full width on small screens */}
            <div className="lg:col-span-3 h-full min-h-0 overflow-hidden flex flex-col">{operatorChatComponent}</div>

            {/* Customer Info Area - 2/5 width on large screens, full width on small screens */}
            <div className="lg:col-span-2 h-full min-h-0 overflow-auto">{customerInfoComponent}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
