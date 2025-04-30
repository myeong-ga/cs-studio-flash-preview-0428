"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ClipboardList, FileX, RotateCcw, User, ShoppingBag, AlertTriangle } from "lucide-react"
import { CUSTOMER_DETAILS, USER_INFO, type Action } from "@/types/chat"

interface CustomerInfoProps {
  useSimTheme?: boolean
  recommendedActions?: Action[]
  onExecuteTool?: (actionName: string, parameters: any) => void
}

export function CustomerInfo({ useSimTheme = false, recommendedActions = [], onExecuteTool }: CustomerInfoProps) {
  // 기본 액션
  const customerActions = [
    {
      id: 1,
      label: "고객 상세",
      icon: User,
      color: useSimTheme ? "" : "bg-microsoft-blue-lighter text-microsoft-blue border-microsoft-blue",
    },
    {
      id: 2,
      label: "주문 취소",
      icon: FileX,
      color: useSimTheme ? "" : "bg-red-50 text-red-600 border-red-200",
    },
    {
      id: 3,
      label: "반품 진행",
      icon: RotateCcw,
      color: useSimTheme ? "" : "bg-amber-50 text-amber-600 border-amber-200",
    },
    {
      id: 4,
      label: "클레임 등록",
      icon: AlertTriangle,
      color: useSimTheme ? "" : "bg-purple-50 text-purple-600 border-purple-200",
    },
    {
      id: 5,
      label: "주문 내역",
      icon: ShoppingBag,
      color: useSimTheme ? "" : "bg-green-50 text-green-600 border-green-200",
    },
    {
      id: 6,
      label: "메모 작성",
      icon: ClipboardList,
      color: useSimTheme ? "" : "bg-gray-50 text-gray-600 border-gray-200",
    },
  ]

  const cardClass = useSimTheme ? "sim-card mb-4" : "microsoft-card border-t-4 border-t-microsoft-blue mb-4"

  const headerClass = useSimTheme
    ? "pb-2 border-b border-gray-100 dark:border-gray-800"
    : "pb-2 border-b border-gray-100 dark:border-gray-800"

  const titleClass = useSimTheme ? "text-lg" : "text-lg text-microsoft-blue dark:text-blue-400"

  const buttonClass = useSimTheme
    ? "flex items-center gap-2 h-auto py-3 justify-start border sim-button-secondary"
    : "flex items-center gap-2 h-auto py-3 justify-start border"

  // Handle tool execution
  const handleToolExecution = (action: Action) => {
    if (onExecuteTool) {
      onExecuteTool(action.name, action.parameters)
    }
  }

  return (
    <>
      <Card className={cardClass}>
        <CardHeader className={headerClass}>
          <CardTitle className={titleClass}>고객 정보</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-16 w-16 border-2 border-microsoft-blue-light">
              <AvatarImage src="/placeholder.svg?height=64&width=64" />
              <AvatarFallback className={useSimTheme ? "sim-header" : "bg-microsoft-blue text-white"}>
                {CUSTOMER_DETAILS.name.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-lg">{CUSTOMER_DETAILS.name}</h3>
              <p className={useSimTheme ? "text-sm sim-muted-text" : "text-sm text-muted-foreground"}>VIP 회원</p>
              <p className={useSimTheme ? "text-sm sim-muted-text" : "text-sm text-muted-foreground"}>
                가입일: {CUSTOMER_DETAILS.signupDate}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className={useSimTheme ? "sim-muted-text" : "text-muted-foreground"}>이메일</span>
              <span>{USER_INFO.email}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className={useSimTheme ? "sim-muted-text" : "text-muted-foreground"}>전화번호</span>
              <span>{USER_INFO.phone}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className={useSimTheme ? "sim-muted-text" : "text-muted-foreground"}>최근 주문</span>
              <span>3일 전</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className={useSimTheme ? "sim-muted-text" : "text-muted-foreground"}>총 주문 횟수</span>
              <span>{CUSTOMER_DETAILS.orderNb}회</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={cardClass.replace("mb-4", "")}>
        <CardHeader className={headerClass}>
          <CardTitle className={titleClass}>상담 액션</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 gap-2">
            {customerActions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                className={useSimTheme ? buttonClass : `${buttonClass} ${action.color}`}
              >
                <action.icon className="h-4 w-4" />
                <span>{action.label}</span>
              </Button>
            ))}

            {/* 추천 액션 표시 */}
            {recommendedActions.map((action, index) => (
              <Button
                key={`recommended-${index}`}
                variant="outline"
                className="flex items-center gap-2 h-auto py-3 justify-start border bg-yellow-50 text-yellow-700 border-yellow-300 hover:bg-yellow-100"
                onClick={() => handleToolExecution(action)}
              >
                <AlertTriangle className="h-4 w-4" />
                <span>{action.name}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  )
}
