"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ClipboardList, FileX, RotateCcw, User, ShoppingBag, AlertTriangle } from "lucide-react"
import { CUSTOMER_DETAILS, USER_INFO, type Action } from "@/types/chat"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface CustomerInfoProps {
  useSimTheme?: boolean
  recommendedActions?: Action[]
  onExecuteTool?: (actionName: string, parameters: any) => void
}

export function CustomerInfo({ useSimTheme = false, recommendedActions = [], onExecuteTool }: CustomerInfoProps) {
  const [selectedAction, setSelectedAction] = useState<Action | null>(null)
  const [actionParameters, setActionParameters] = useState<Record<string, any>>({})
  const [dialogOpen, setDialogOpen] = useState(false)

  // 기본 액션
  const customerActions = [
    {
      id: 1,
      label: "고객 상세",
      icon: User,
      color: useSimTheme ? "" : "bg-microsoft-blue-lighter text-microsoft-blue border-microsoft-blue",
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

  // 액션 선택 핸들러
  const handleActionSelect = (action: Action) => {
    setSelectedAction(action)

    // 파라미터 초기값 설정
    const initialParams: Record<string, any> = {}
    if (action.parameters) {
      Object.keys(action.parameters).forEach((key) => {
        initialParams[key] = action.parameters[key]
      })
    }
    setActionParameters(initialParams)
    setDialogOpen(true)
  }

  // 파라미터 변경 핸들러
  const handleParameterChange = (key: string, value: string) => {
    setActionParameters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  // 액션 실행 핸들러
  const handleExecuteAction = () => {
    if (selectedAction && onExecuteTool) {
      onExecuteTool(selectedAction.name, actionParameters)
      setDialogOpen(false)
    }
  }

  // 툴 이름을 한글로 변환하는 함수
  const getToolDisplayName = (toolName: string) => {
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

    return toolNameMapping[toolName] || toolName
  }

  // 파라미터 레이블 생성 함수
  const getParameterLabel = (key: string) => {
    const parameterLabels: Record<string, string> = {
      user_id: "사용자 ID",
      order_id: "주문 ID",
      product_id: "제품 ID",
      product_ids: "제품 ID 목록",
      amount: "금액",
      reason: "사유",
      type: "유형",
      details: "상세 내용",
      info: "정보",
    }

    return parameterLabels[key] || key
  }

  return (
    <div className="h-full flex flex-col overflow-auto">
      <Card className={cardClass}>
        <CardHeader className={headerClass}>
          <CardTitle className={titleClass}>고객 정보</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-16 w-16 border-2 border-microsoft-blue-light">
              <AvatarImage
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/cs-i-icon-E1sXTYLbmeSj4yIRHz6OwXRgplbKzZ.jpeg"
                alt={CUSTOMER_DETAILS.name}
              />
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

      <Card className={`${cardClass.replace("mb-4", "")} flex-1`}>
        <CardHeader className={headerClass}>
          <CardTitle className={titleClass}>상담 액션</CardTitle>
        </CardHeader>
        <CardContent className="pt-4 overflow-auto">
          <div className="grid grid-cols-2 gap-2">
            {customerActions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                className={
                  useSimTheme
                    ? `flex items-center gap-2 h-auto py-3 justify-start border bg-[#f8f4ea] text-[#6b4226] border-[#d2b48c] hover:bg-[#ebe3d5] dark:bg-[#3a2a1d] dark:text-[#e6d7c3] dark:border-[#8b5a2b] dark:hover:bg-[#4a3828]`
                    : `${buttonClass} ${action.color}`
                }
              >
                <action.icon className="h-4 w-4" />
                <span>{action.label}</span>
              </Button>
            ))}

            {/* 추천 액션 표시 - 다이얼로그 트리거로 변경 */}
            {recommendedActions.map((action, index) => (
              <Dialog
                key={`recommended-${index}`}
                open={dialogOpen && selectedAction?.name === action.name}
                onOpenChange={(open) => {
                  if (!open) setDialogOpen(false)
                }}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className={`flex items-center gap-2 h-auto py-3 justify-start border ${
                      useSimTheme
                        ? "bg-[#f5efe0] text-[#6b4226] border-[#d2b48c] hover:bg-[#ebe3d5]"
                        : "bg-yellow-50 text-yellow-700 border-yellow-300 hover:bg-yellow-100"
                    }`}
                    onClick={() => handleActionSelect(action)}
                  >
                    <AlertTriangle className="h-4 w-4" />
                    <span>{getToolDisplayName(action.name)}</span>
                  </Button>
                </DialogTrigger>
                <DialogContent
                  className={`sm:max-w-[425px] ${
                    useSimTheme
                      ? "bg-[#f8f4ea] text-[#5a3921] border-[#d2b48c] dark:bg-[#3a2a1d] dark:text-[#e6d7c3] dark:border-[#8b5a2b]"
                      : ""
                  }`}
                >
                  <DialogHeader>
                    <DialogTitle className={useSimTheme ? "text-[#6b4226] dark:text-[#e6d7c3]" : ""}>
                      {getToolDisplayName(action.name)} 실행
                    </DialogTitle>
                    <DialogDescription className={useSimTheme ? "text-[#8b6d5c] dark:text-[#c9b8a8]" : ""}>
                      아래 정보를 확인하고 필요한 경우 수정한 후 실행하세요.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    {action.parameters &&
                      Object.entries(action.parameters).map(([key, value]) => (
                        <div key={key} className="grid grid-cols-4 items-center gap-4">
                          <Label
                            htmlFor={key}
                            className={`text-right ${useSimTheme ? "text-[#6b4226] dark:text-[#d2b48c]" : ""}`}
                          >
                            {getParameterLabel(key)}
                          </Label>
                          <Input
                            id={key}
                            value={actionParameters[key] || ""}
                            onChange={(e) => handleParameterChange(key, e.target.value)}
                            className={`col-span-3 ${
                              useSimTheme
                                ? "bg-[#fff8ee] border-[#d2b48c] focus-visible:ring-[#8b5a2b] dark:bg-[#2a1f16] dark:border-[#8b5a2b] dark:text-[#e6d7c3]"
                                : ""
                            }`}
                          />
                        </div>
                      ))}
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      onClick={handleExecuteAction}
                      className={
                        useSimTheme
                          ? "bg-[#8b5a2b] hover:bg-[#6b4226] text-white dark:bg-[#d2b48c] dark:text-[#3a2a1d] dark:hover:bg-[#c9b8a8]"
                          : "bg-microsoft-blue hover:bg-microsoft-blue-dark"
                      }
                    >
                      실행하기
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
