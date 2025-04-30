import { NextResponse } from "next/server"
import { DEMO_ORDERS } from "@/types/chat"

export async function GET(request: Request, { params }: { params: { orderId: string } }) {
  try {
    const orderId = params.orderId

    // Find the order in the demo orders
    const order = DEMO_ORDERS.find((order) => order.id === orderId)

    if (!order) {
      return NextResponse.json({ error: `Order with ID ${orderId} not found` }, { status: 404 })
    }

    // Simulate a delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    return NextResponse.json(order)
  } catch (error) {
    console.error("Error getting order:", error)
    return NextResponse.json({ error: "Failed to get order details" }, { status: 500 })
  }
}
