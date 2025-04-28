import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"
import path from "path"

// Initialize Google Generative AI client
const ai = new GoogleGenAI({
  vertexai: false,
  apiKey: process.env.GEMINI_API_KEY || "",
})

// Helper function to determine the correct MIME type based on file extension
function getMimeType(filename: string): string {
  const extension = path.extname(filename).toLowerCase()

  // Map of file extensions to MIME types
  const mimeTypes: Record<string, string> = {
    ".md": "text/markdown",
    ".markdown": "text/markdown",
    ".txt": "text/plain",
    ".html": "text/html",
    ".htm": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".json": "application/json",
    ".pdf": "application/pdf",
    ".doc": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".xls": "application/vnd.ms-excel",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".ppt": "application/vnd.ms-powerpoint",
    ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".webp": "image/webp",
    ".csv": "text/csv",
    ".xml": "application/xml",
    ".zip": "application/zip",
    ".tar": "application/x-tar",
    ".gz": "application/gzip",
  }

  return mimeTypes[extension] || "application/octet-stream"
}

export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 })
    }

    // Parse the form data
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Determine the correct MIME type based on file extension
    const correctMimeType = getMimeType(file.name)
    console.log(`File: ${file.name}, Original MIME: ${file.type}, Corrected MIME: ${correctMimeType}`)

    // Convert file to buffer and then to Blob
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const blob = new Blob([buffer], { type: correctMimeType })

    // Upload the file to Google Generative AI
    const uploadedFile = await ai.files.upload({
      file: blob,
      config: {
        displayName: file.name,
        mimeType: correctMimeType, // Use the corrected MIME type
      },
    })

    // Return the file ID
    return NextResponse.json({
      fileId: uploadedFile.name,
      message: "File uploaded successfully",
      mimeType: correctMimeType,
    })
  } catch (error) {
    console.error("Error uploading file:", error)

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload file" },
      { status: 500 },
    )
  }
}
