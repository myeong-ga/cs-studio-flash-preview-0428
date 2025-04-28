import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"

// Initialize Google Generative AI client
const ai = new GoogleGenAI({
  vertexai: false,
  apiKey: process.env.GEMINI_API_KEY || "",
})

export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 })
    }

    // Parse the request body
    const body = await request.json()
    const { cacheName } = body

    if (!cacheName) {
      return NextResponse.json({ error: "No cacheName provided" }, { status: 400 })
    }

    console.log(`Validating cache: ${cacheName}`)

    try {
      // List all caches that the current user has access to
      const pager = await ai.caches.list()

      // Get the items from the pager
      const cacheItems = pager.page || []

      console.log(`Found ${cacheItems.length} caches`)

      // Check if our cache is in the list
      const foundCache = cacheItems.find((c) => c.name === cacheName)

      if (foundCache) {
        console.log(`Cache ${cacheName} found in list`)
        return NextResponse.json({
          valid: true,
          cache: {
            name: foundCache.name,
            createTime: foundCache.createTime,
            updateTime: foundCache.updateTime,
          },
        })
      } else {
        console.log(`Cache ${cacheName} not found in list`)
        return NextResponse.json({ valid: false })
      }
    } catch (error) {
      console.error("Error validating cache:", error)
      return NextResponse.json({
        valid: false,
        error: "Failed to validate cache",
      })
    }
  } catch (error) {
    console.error("Error in cache validation:", error)

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to validate cache" },
      { status: 500 },
    )
  }
}
