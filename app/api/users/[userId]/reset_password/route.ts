import { NextResponse } from "next/server"
import { USER_INFO } from "@/types/chat"

export async function POST(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params

    // Check if user exists
    if (userId !== USER_INFO.name && userId !== "cus_28X44") {
      return NextResponse.json({ error: `User with ID ${userId} not found` }, { status: 404 })
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: `Password reset email has been sent to ${USER_INFO.email}`,
      user_id: userId,
      email: USER_INFO.email,
      reset_date: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error resetting password:", error)
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 })
  }
}
