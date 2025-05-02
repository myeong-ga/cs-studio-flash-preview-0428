import { NextResponse } from "next/server"
import { DEMO_ORDERS } from "@/types/chat"

export async function POST(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    const { orderId } = await params
    const { amount, reason } = await request.json()

    // Find the order in the demo orders
    const order = DEMO_ORDERS.find((order) => order.id === orderId)

    if (!order) {
      return NextResponse.json({ error: `Order with ID ${orderId} not found` }, { status: 404 })
    }

    // Validate amount
    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Invalid refund amount" }, { status: 400 })
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: `Refund of ${amount} for order ${orderId} has been initiated`,
      order_id: orderId,
      refund_id: `REF-${Math.floor(Math.random() * 10000)}`,
      amount: amount,
      reason: reason,
      status: "processing",
      estimated_completion: "3-5 business days",
      refund_date: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error creating refund:", error)
    return NextResponse.json({ error: "Failed to create refund" }, { status: 500 })
  }
}
