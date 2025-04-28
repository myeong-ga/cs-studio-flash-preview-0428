import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Edit } from "lucide-react"

const inventory = [
  {
    id: "PRD-001",
    name: "프리미엄 티셔츠",
    category: "의류",
    price: "29,000원",
    stock: 45,
    status: "정상",
  },
  {
    id: "PRD-002",
    name: "슬림핏 청바지",
    category: "의류",
    price: "59,000원",
    stock: 12,
    status: "부족",
  },
  {
    id: "PRD-003",
    name: "캐주얼 셔츠",
    category: "의류",
    price: "39,000원",
    stock: 28,
    status: "정상",
  },
  {
    id: "PRD-004",
    name: "가죽 지갑",
    category: "액세서리",
    price: "45,000원",
    stock: 8,
    status: "부족",
  },
  {
    id: "PRD-005",
    name: "스마트 워치",
    category: "전자기기",
    price: "129,000원",
    stock: 0,
    status: "품절",
  },
  {
    id: "PRD-006",
    name: "무선 이어폰",
    category: "전자기기",
    price: "89,000원",
    stock: 15,
    status: "정상",
  },
  {
    id: "PRD-007",
    name: "여행용 백팩",
    category: "가방",
    price: "79,000원",
    stock: 5,
    status: "부족",
  },
  {
    id: "PRD-008",
    name: "스포츠 양말 세트",
    category: "의류",
    price: "15,000원",
    stock: 32,
    status: "정상",
  },
]

export function InventoryTable() {
  return (
    <Card className="microsoft-card border-t-4 border-t-microsoft-blue">
      <CardHeader className="border-b border-gray-100 dark:border-gray-800">
        <CardTitle className="text-microsoft-blue dark:text-blue-400">재고 목록</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="microsoft-scrollbar overflow-auto">
          <Table>
            <TableHeader className="bg-microsoft-blue-lighter">
              <TableRow>
                <TableHead className="font-semibold text-microsoft-blue">상품코드</TableHead>
                <TableHead className="font-semibold text-microsoft-blue">상품명</TableHead>
                <TableHead className="font-semibold text-microsoft-blue">카테고리</TableHead>
                <TableHead className="font-semibold text-microsoft-blue">가격</TableHead>
                <TableHead className="font-semibold text-microsoft-blue">재고</TableHead>
                <TableHead className="font-semibold text-microsoft-blue">상태</TableHead>
                <TableHead className="text-right font-semibold text-microsoft-blue">액션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.map((item) => (
                <TableRow key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <TableCell className="font-medium">{item.id}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.price}</TableCell>
                  <TableCell>{item.stock}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        item.status === "정상" ? "outline" : item.status === "부족" ? "secondary" : "destructive"
                      }
                      className={item.status === "정상" ? "border-green-500 text-green-600" : ""}
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-microsoft-blue-lighter hover:text-microsoft-blue"
                    >
                      <Edit className="h-4 w-4" />
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
