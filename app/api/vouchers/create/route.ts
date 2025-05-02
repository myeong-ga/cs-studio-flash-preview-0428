import { NextResponse } from "next/server"
import { USER_INFO } from "@/types/chat"

export async function POST(request: Request) {
  try {
    const { user_id, amount, reason } = await request.json()

    // Check if user exists
    if (user_id !== USER_INFO.name && user_id !== "cus_28X44") {
      return NextResponse.json({ error: `User with ID ${user_id} not found` }, { status: 404 })
    }

    // Validate amount
    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Invalid voucher amount" }, { status: 400 })
    }

    // Generate voucher code
    const voucherCode = `VC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    // Return success response
    return NextResponse.json({
      success: true,
      message: `Voucher of ${amount} has been issued to user ${user_id}`,
      user_id: user_id,
      voucher_code: voucherCode,
      amount: amount,
      reason: reason,
      expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      issue_date: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error issuing voucher:", error)
    return NextResponse.json({ error: "Failed to issue voucher" }, { status: 500 })
  }
}
