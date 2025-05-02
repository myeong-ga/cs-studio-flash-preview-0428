import { NextResponse } from "next/server"
import { USER_INFO, DEMO_ORDERS } from "@/types/chat"

export async function POST(request: Request) {
  try {
    const { user_id, type, details, order_id } = await request.json()

    // Check if user exists
    if (user_id !== USER_INFO.name && user_id !== "cus_28X44") {
      return NextResponse.json({ error: `User with ID ${user_id} not found` }, { status: 404 })
    }

    // If order_id is provided, check if it exists
    if (order_id && order_id !== "N/A") {
      const orderExists = DEMO_ORDERS.some((order) => order.id === order_id)
      if (!orderExists) {
        return NextResponse.json({ error: `Order with ID ${order_id} not found` }, { status: 404 })
      }
    }

    // Validate type
    const validTypes = ["product_quality", "order_delay", "delivery_issues", "other"]
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: "Invalid complaint type" }, { status: 400 })
    }

    // Generate complaint ID
    const complaintId = `COMP-${Math.floor(Math.random() * 10000)}`

    // Return success response
    return NextResponse.json({
      success: true,
      message: `Complaint has been registered successfully`,
      complaint_id: complaintId,
      user_id: user_id,
      type: type,
      details: details,
      order_id: order_id || "N/A",
      status: "open",
      priority: type === "product_quality" ? "high" : "medium",
      created_date: new Date().toISOString(),
      estimated_resolution: "48 hours",
    })
  } catch (error) {
    console.error("Error creating complaint:", error)
    return NextResponse.json({ error: "Failed to create complaint" }, { status: 500 })
  }
}
