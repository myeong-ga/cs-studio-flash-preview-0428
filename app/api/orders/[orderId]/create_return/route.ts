import { NextResponse } from "next/server"
import { DEMO_ORDERS } from "@/types/chat"

export async function POST(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    const { orderId } = await params
    const { product_ids } = await request.json()

    // Find the order in the demo orders
    const order = DEMO_ORDERS.find((order) => order.id === orderId)

    if (!order) {
      return NextResponse.json({ error: `Order with ID ${orderId} not found` }, { status: 404 })
    }

    // Validate product_ids
    if (!Array.isArray(product_ids) || product_ids.length === 0) {
      return NextResponse.json({ error: "Invalid product IDs" }, { status: 400 })
    }

    // Check if the products exist in the order
    if (order.items) {
      const validProducts = product_ids.filter((pid) => order.items.some((item) => item.product_id === pid))
      if (validProducts.length !== product_ids.length) {
        const invalidProducts = product_ids.filter((pid) => !validProducts.includes(pid))
        return NextResponse.json(
          { error: `Products with IDs ${invalidProducts.join(", ")} not found in order ${orderId}` },
          { status: 404 },
        )
      }
    } else {
      return NextResponse.json({ error: `Order with ID ${orderId} has no items` }, { status: 400 })
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: `Return for products ${product_ids.join(", ")} from order ${orderId} has been initiated`,
      order_id: orderId,
      return_id: `RET-${Math.floor(Math.random() * 10000)}`,
      product_ids: product_ids,
      return_label_url: "https://example.com/return-label.pdf",
      instructions: "Please use the provided return label and ship the items within 14 days",
      status: "initiated",
      created_date: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error creating return:", error)
    return NextResponse.json({ error: "Failed to create return" }, { status: 500 })
  }
}
