import { NextResponse } from "next/server"
import { USER_INFO } from "@/types/chat"

export async function POST(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params
    const { info } = await request.json()

    // Check if user exists
    if (userId !== USER_INFO.name && userId !== "cus_28X44") {
      return NextResponse.json({ error: `User with ID ${userId} not found` }, { status: 404 })
    }

    // Validate info
    if (!info || !info.field || !info.value) {
      return NextResponse.json({ error: "Invalid information provided" }, { status: 400 })
    }

    // Validate field
    const validFields = ["email", "phone", "address", "name"]
    if (!validFields.includes(info.field)) {
      return NextResponse.json({ error: `Invalid field: ${info.field}` }, { status: 400 })
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: `User information updated successfully`,
      user_id: userId,
      field: info.field,
      old_value: USER_INFO[info.field as keyof typeof USER_INFO] || "N/A",
      new_value: info.value,
      updated_date: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error updating user info:", error)
    return NextResponse.json({ error: "Failed to update user information" }, { status: 500 })
  }
}
