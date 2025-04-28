import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, ShoppingCart, Package, AlertCircle } from "lucide-react"

export function DashboardStats() {
  return (
    <div className="w-full flex justify-center">
      <div className="max-w-[1024px] w-full">
  <div className="grid gap-4 sm:gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-4">
      <Card className="microsoft-card border-t-4 border-t-microsoft-blue">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">활성 고객 문의</CardTitle>
          <Users className="h-4 w-4 text-microsoft-blue" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">24</div>
          <p className="text-xs text-muted-foreground">전일 대비 +12% 증가</p>
        </CardContent>
      </Card>
      <Card className="microsoft-card border-t-4 border-t-microsoft-blue">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">오늘의 주문</CardTitle>
          <ShoppingCart className="h-4 w-4 text-microsoft-blue" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">142</div>
          <p className="text-xs text-muted-foreground">전일 대비 +8% 증가</p>
        </CardContent>
      </Card>
      <Card className="microsoft-card border-t-4 border-t-microsoft-blue">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">재고 부족 상품</CardTitle>
          <Package className="h-4 w-4 text-microsoft-blue" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">7</div>
          <p className="text-xs text-muted-foreground">전일 대비 -3 감소</p>
        </CardContent>
      </Card>
      <Card className="microsoft-card border-t-4 border-t-microsoft-blue">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">긴급 처리 필요</CardTitle>
          <AlertCircle className="h-4 w-4 text-microsoft-blue" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">3</div>
          <p className="text-xs text-muted-foreground">전일 대비 +1 증가</p>
        </CardContent>
      </Card>
    </div>
      </div>
    </div>
  )
}
