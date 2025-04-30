import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenAI, type Part } from "@google/genai"

// Initialize Google Generative AI client
const ai = new GoogleGenAI({
  vertexai: false,
  apiKey: process.env.GEMINI_API_KEY || "",
})

// Track cache creation requests to prevent duplicates
const cacheCreationRequests = new Map<string, Promise<any>>()

export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 })
    }

    // Parse the request body
    const body = await request.json()
    const { fileIds } = body

    if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
      return NextResponse.json({ error: "No fileIds provided or invalid format" }, { status: 400 })
    }

    // Create a unique key for this cache creation request
    const requestKey = fileIds.sort().join(",")

    // Check if we're already processing this exact request
    if (cacheCreationRequests.has(requestKey)) {
      console.log("Duplicate cache creation request detected, returning existing promise")
      const existingRequest = cacheCreationRequests.get(requestKey)

      try {
        const result = await existingRequest
        return NextResponse.json(result)
      } catch (error) {
        console.error("Error from existing cache creation request:", error)
        return NextResponse.json(
          { error: error instanceof Error ? error.message : "Failed to create cache" },
          { status: 500 },
        )
      }
    }

    // Create a new promise for this cache creation request
    const cacheCreationPromise = createCache(fileIds)

    // Store the promise in the map
    cacheCreationRequests.set(requestKey, cacheCreationPromise)

    // Set a timeout to remove the promise from the map
    setTimeout(() => {
      cacheCreationRequests.delete(requestKey)
    }, 60000) // Remove after 1 minute

    // Wait for the cache to be created
    const result = await cacheCreationPromise

    // Return the result
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error creating cache:", error)

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create cache" },
      { status: 500 },
    )
  }
}

async function createCache(fileIds: string[]) {
  console.log(`Creating cache for files: ${fileIds.join(", ")}`)

  // Create parts from file URIs
  const cachingParts: Part[] = []

  for (const fileId of fileIds) {
    try {
      // Get file details
      const file = await ai.files.get({ name: fileId })

      if (file.state !== "ACTIVE" && file.state !== "STATE_UNSPECIFIED") {
        console.warn(`File ${fileId} is not in ACTIVE state, skipping`)
        continue
      }

      // Create part from file
      const part: Part = {
        fileData: {
          fileUri: file.uri,
          mimeType: file.mimeType,
        },
      }

      cachingParts.push(part)
    } catch (error) {
      console.error(`Error processing file ${fileId}:`, error)
      // Continue with other files
    }
  }

  if (cachingParts.length === 0) {
    throw new Error("No valid files to cache")
  }

  // Create cache with the parts and system instruction
  const cache = await ai.caches.create({
    model: "gemini-2.0-flash-001",
    config: {
      contents: cachingParts,
      systemInstruction:
        "Answer by referring to the cached content and say you don't know for things not in the cached content.",
    },
  })

  console.log(`Cache created successfully: ${cache.name}`)

  // Return the cache name
  return {
    cacheName: cache.name,
    ttlSeconds: 3600, // Default TTL is 1 hour
    message: "Cache created successfully",
  }
}
