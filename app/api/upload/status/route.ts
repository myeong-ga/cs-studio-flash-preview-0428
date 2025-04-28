import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"

// Initialize Google Generative AI client
const ai = new GoogleGenAI({
  vertexai: false,
  apiKey: process.env.GEMINI_API_KEY || "",
})

export async function GET(request: NextRequest) {
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

    // Get the file status from Google Generative AI
    const file = await ai.files.get({ name: fileId })

    // Return the file status
    return NextResponse.json({
      fileId: file.name,
      state: file.state,
      mimeType: file.mimeType,
      displayName: file.displayName,
      createTime: file.createTime,
      updateTime: file.updateTime,
    })
  } catch (error) {
    console.error("Error getting file status:", error)

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get file status" },
      { status: 500 },
    )
  }
}
