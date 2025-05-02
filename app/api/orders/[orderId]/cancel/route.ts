import { NextResponse } from "next/server"
import { DEMO_ORDERS } from "@/types/chat"

export async function POST(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    const { orderId } = await params

    // Find the order in the demo orders
    const order = DEMO_ORDERS.find((order) => order.id === orderId)

    if (!order) {
      return NextResponse.json({ error: `Order with ID ${orderId} not found` }, { status: 404 })
    }

    // Check if the order can be cancelled
    if (order.status === "delivered" || order.status === "completed") {
      return NextResponse.json(
        { error: `Order with ID ${orderId} cannot be cancelled as it is already ${order.status}` },
        { status: 400 },
      )
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: `Order ${orderId} has been cancelled successfully`,
      order_id: orderId,
      status: "cancelled",
      cancellation_date: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error cancelling order:", error)
    return NextResponse.json({ error: "Failed to cancel order" }, { status: 500 })
  }
}
