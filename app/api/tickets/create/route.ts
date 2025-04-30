import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { user_id, type, details, order_id } = await request.json()
    // Simulate ticket creation
    return NextResponse.json({
      message: `Ticket created for user ${user_id}`,
      type,
      details,
      order_id,
    })
  } catch (error) {
    console.error("Error creating ticket:", error)
    return NextResponse.json({ error: "Error creating ticket" }, { status: 500 })
  }
}
