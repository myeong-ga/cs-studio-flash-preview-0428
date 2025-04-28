"use client"
import { CustomerChat } from "@/components/simulation/customer-chat"
import { OperatorChat } from "@/components/simulation/operator-chat"
import { CustomerInfo } from "@/components/simulation/customer-info"
import { useChatSimulation } from "@/hooks/use-chat-simulation"
import { useCacheValidation } from "@/hooks/use-cache-validation"
import { Loader2 } from "lucide-react"

export function SimulationContainer() {
  const chatSimulation = useChatSimulation()
  const { isValidating, isInitializing } = useCacheValidation()

  // Show loading state while validating cache
  if (isValidating || isInitializing) {
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
    <div className="min-w-[1440px] overflow-auto font-geist-mono simulation-theme">
      <div className="grid grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
        {/* Customer View - 1/4 width */}
        <div className="flex flex-col">
          <div className="sim-header py-2 px-4 mb-4 rounded-t-md">
            <h2 className="text-center font-medium">고객 화면</h2>
          </div>
          <div className="flex-1 overflow-hidden">
            <CustomerChat
              messages={chatSimulation.messages}
              input={chatSimulation.customerInput}
              setInput={chatSimulation.setCustomerInput}
              handleSubmit={chatSimulation.handleCustomerSubmit}
              isLoading={chatSimulation.isLoading}
              useSimTheme={true}
            />
          </div>
        </div>

        {/* Representative View - 3/4 width */}
        <div className="col-span-3 flex flex-col">
          <div className="sim-header py-2 px-4 mb-4 rounded-t-md">
            <h2 className="text-center font-medium">상담사 화면</h2>
          </div>
          <div className="grid grid-cols-5 gap-4 h-full">
            {/* Chat Area - 3/5 width */}
            <div className="col-span-3 overflow-hidden">
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
            </div>

            {/* Customer Info Area - 2/5 width */}
            <div className="col-span-2 overflow-auto">
              <CustomerInfo useSimTheme={false} recommendedActions={chatSimulation.recommendedActions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
