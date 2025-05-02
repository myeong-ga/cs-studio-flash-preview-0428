import { NextResponse } from "next/server"
import { DEMO_ORDERS, USER_INFO } from "@/types/chat"

export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params

    // Check if user exists
    if (userId !== USER_INFO.name && userId !== "cus_28X44") {
      return NextResponse.json({ error: `User with ID ${userId} not found` }, { status: 404 })
    }

    // Return the demo orders as the user's order history
    return NextResponse.json({
      user_id: userId,
      orders: DEMO_ORDERS,
    })
  } catch (error) {
    console.error("Error getting order history:", error)
    return NextResponse.json({ error: "Failed to get order history" }, { status: 500 })
  }
}
