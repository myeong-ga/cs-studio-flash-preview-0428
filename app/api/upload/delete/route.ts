import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"

// Initialize Google Generative AI client
const ai = new GoogleGenAI({
  vertexai: false,
  apiKey: process.env.GEMINI_API_KEY || "",
})

export async function DELETE(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 })
    }

    // Get the fileId from the query parameters
    const fileId = request.nextUrl.searchParams.get("fileId")

    if (!fileId) {
      return NextResponse.json({ error: "No fileId provided" }, { status: 400 })
    }

    // Delete the file from Google Generative AI
    // fileId 매개변수를 name으로 전달합니다.
    // 기존 코드:
    // await ai.files.delete({ name: fileId })

    // 수정된 코드:
    // fileId 매개변수를 name으로 전달합니다.
    await ai.files.delete({ name: fileId })

    // 이 부분은 이미 올바르게 구현되어 있습니다.
    // Google Genai API는 파일 식별자를 'name'이라고 부르지만,
    // 우리 코드에서는 이를 'fileId'로 저장하고 있습니다.
    // API 호출 시 이 'fileId'를 'name' 매개변수로 전달하는 것이 올바른 방식입니다.

    // Return success response
    return NextResponse.json({
      success: true,
      message: "File deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting file:", error)

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete file" },
      { status: 500 },
    )
  }
}
