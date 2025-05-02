import { NextResponse } from "next/server"
import { DEMO_ORDERS } from "@/types/chat"

const USER_INFO = {
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "123-456-7890",
}

export async function GET(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    const { orderId } = await params

    // Find the order in the demo orders
    const order = DEMO_ORDERS.find((order) => order.id === orderId)

    if (!order) {
      return NextResponse.json({ error: `Order with ID ${orderId} not found` }, { status: 404 })
    }

    // Add some additional information for better responses
    const enhancedOrder = {
      ...order,
      customer: USER_INFO.name,
      email: USER_INFO.email,
      phone: USER_INFO.phone,
      total_amount: order.items
        ? order.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)
        : "N/A",
      estimated_delivery: order.status === "shipped" ? "3-5 business days" : "N/A",
      payment_method: "Credit Card (ending in 4567)",
    }

    return NextResponse.json(enhancedOrder)
  } catch (error) {
    console.error("Error getting order:", error)
    return NextResponse.json({ error: "Failed to get order details" }, { status: 500 })
  }
}
