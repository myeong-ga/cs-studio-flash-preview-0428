import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye } from "lucide-react"

const orders = [
  {
    id: "ORD-001",
    customer: "김지민",
    date: "2023-04-15",
    total: "89,000원",
    status: "배송완료",
  },
  {
    id: "ORD-002",
    customer: "이서준",
    date: "2023-04-14",
    total: "45,000원",
    status: "배송중",
  },
  {
    id: "ORD-003",
    customer: "박민지",
    date: "2023-04-14",
    total: "120,000원",
    status: "결제완료",
  },
  {
    id: "ORD-004",
    customer: "최현우",
    date: "2023-04-13",
    total: "67,500원",
    status: "취소",
  },
  {
    id: "ORD-005",
    customer: "정소율",
    date: "2023-04-12",
    total: "32,000원",
    status: "배송완료",
  },
  {
    id: "ORD-006",
    customer: "강도윤",
    date: "2023-04-12",
    total: "78,000원",
    status: "배송중",
  },
  {
    id: "ORD-007",
    customer: "윤지우",
    date: "2023-04-11",
    total: "54,000원",
    status: "결제완료",
  },
  {
    id: "ORD-008",
    customer: "임하은",
    date: "2023-04-10",
    total: "96,000원",
    status: "배송완료",
  },
]

export function OrdersTable() {
  return (
    <Card className="microsoft-card border-t-4 border-t-microsoft-blue">
      <CardHeader className="border-b border-gray-100 dark:border-gray-800">
        <CardTitle className="text-microsoft-blue dark:text-blue-400">주문 목록</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="microsoft-scrollbar overflow-auto">
          <Table>
            <TableHeader className="bg-microsoft-blue-lighter">
              <TableRow>
                <TableHead className="font-semibold text-microsoft-blue">주문번호</TableHead>
                <TableHead className="font-semibold text-microsoft-blue">고객명</TableHead>
                <TableHead className="font-semibold text-microsoft-blue">주문일자</TableHead>
                <TableHead className="font-semibold text-microsoft-blue">주문금액</TableHead>
                <TableHead className="font-semibold text-microsoft-blue">상태</TableHead>
                <TableHead className="text-right font-semibold text-microsoft-blue">액션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>{order.total}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        order.status === "배송완료"
                          ? "outline"
                          : order.status === "배송중"
                            ? "default"
                            : order.status === "결제완료"
                              ? "secondary"
                              : "destructive"
                      }
                      className={order.status === "배송중" ? "bg-microsoft-blue hover:bg-microsoft-blue-dark" : ""}
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-microsoft-blue-lighter hover:text-microsoft-blue"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
