import { NextResponse } from "next/server"
import { DEMO_ORDERS } from "@/types/chat"

export async function POST(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    const { orderId } = await params
    const { product_id } = await request.json()

    // Find the order in the demo orders
    const order = DEMO_ORDERS.find((order) => order.id === orderId)

    if (!order) {
      return NextResponse.json({ error: `Order with ID ${orderId} not found` }, { status: 404 })
    }

    // Check if the product exists in the order
    if (order.items) {
      const productExists = order.items.some((item) => item.product_id === product_id)
      if (!productExists) {
        return NextResponse.json(
          { error: `Product with ID ${product_id} not found in order ${orderId}` },
          { status: 404 },
        )
      }
    } else {
      return NextResponse.json({ error: `Order with ID ${orderId} has no items` }, { status: 400 })
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: `Replacement for product ${product_id} from order ${orderId} has been initiated`,
      order_id: orderId,
      product_id: product_id,
      replacement_id: `REP-${Math.floor(Math.random() * 10000)}`,
      estimated_delivery: "5-7 business days",
      tracking_number: `TRK${Math.floor(Math.random() * 1000000)}`,
    })
  } catch (error) {
    console.error("Error sending replacement:", error)
    return NextResponse.json({ error: "Failed to send replacement" }, { status: 500 })
  }
}
