import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

const activities = [
  {
    id: 1,
    customer: "김지민",
    type: "문의",
    status: "진행중",
    time: "10분 전",
    description: "주문한 상품이 아직 배송되지 않았습니다.",
  },
  {
    id: 2,
    customer: "이서준",
    type: "반품",
    status: "대기중",
    time: "30분 전",
    description: "상품 불량으로 인한 반품 요청",
  },
  {
    id: 3,
    customer: "박민지",
    type: "교환",
    status: "완료",
    time: "1시간 전",
    description: "사이즈 교환 처리 완료",
  },
  {
    id: 4,
    customer: "최현우",
    type: "취소",
    status: "완료",
    time: "2시간 전",
    description: "주문 취소 처리 완료",
  },
]

export function RecentActivities() {
  return (
    <div className="w-full flex justify-center">
      <div className="max-w-[1024px] w-full">
    <Card className="microsoft-card">
      <CardHeader className="border-b border-gray-100 dark:border-gray-800">
        <CardTitle className="text-microsoft-blue dark:text-blue-400">최근 활동</CardTitle>
        <CardDescription>최근 고객 서비스 활동 내역</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Avatar className="h-9 w-9 border-2 border-microsoft-blue-light">
                <AvatarImage src={`/placeholder.svg?height=36&width=36`} alt={activity.customer} />
                <AvatarFallback className="bg-microsoft-blue text-white">
                  {activity.customer.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium leading-none">{activity.customer}</p>
                  <Badge
                    variant={
                      activity.status === "진행중" ? "default" : activity.status === "대기중" ? "secondary" : "outline"
                    }
                    className={activity.status === "진행중" ? "bg-microsoft-blue hover:bg-microsoft-blue-dark" : ""}
                  >
                    {activity.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground ml-auto">{activity.time}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-microsoft-blue dark:text-blue-400">{activity.type}:</span>{" "}
                  {activity.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
      </div>
    </div>
  )
}
