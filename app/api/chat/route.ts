import type { NextRequest } from "next/server"
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
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY is not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Parse the request body
    const body = await request.json()
    const { messages, cacheName } = body

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "No messages provided or invalid format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Extract the last user message
    const lastUserMessage = messages.filter((m: any) => m.role === "user").pop()

    if (!lastUserMessage) {
      return new Response(JSON.stringify({ error: "No user message found" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    console.log(`Processing chat request with message: "${lastUserMessage.content.substring(0, 50)}..."`)

    // Prepare the system prompt
    const systemPrompt = `
      당신은 전자제품 쇼핑몰의 고객 서비스 담당자입니다.
      고객의 문의에 친절하고 전문적으로 응답해주세요.
      배송, 환불, 교환, 취소 등의 문의에 적절히 대응하세요.
      고객의 정보를 확인하고 맞춤형 응답을 제공하세요.
    `

    // Convert messages to Google Generative AI format
    const formattedMessages = messages.map((m: any) => ({
      role: m.role,
      parts: [{ text: m.content }],
    }))

    // Add system prompt if not already present
    // if (!formattedMessages.some((m: any) => m.role === "system")) {
    //   formattedMessages.unshift({
    //     role: "system",
    //     parts: [{ text: systemPrompt }],
    //   })
    // }

    // Generate streaming content
    const responseGenerator = await ai.models.generateContentStream({
      model: "gemini-2.0-flash-001",
      contents: formattedMessages,
      config: cacheName ? { cachedContent: cacheName } : undefined,
    })

    // Create a ReadableStream from the AsyncGenerator
    const stream = new ReadableStream({
      async start(controller) {
        // Store metadata for the final chunk
        let finalCandidate = null
        let finalUsageMetadata = null
        let accumulatedText = ""

        try {
          // Iterate through the AsyncGenerator
          for await (const chunk of responseGenerator) {
            // Store the candidate for the final chunk
            if (chunk.candidates?.[0]) {
              finalCandidate = chunk.candidates[0]
            }

            // Store usage metadata if available
            if (chunk.usageMetadata) {
              finalUsageMetadata = chunk.usageMetadata
            }

            // Extract text from the chunk
            let text = ""
            if (chunk.candidates?.[0]?.content?.parts?.[0]?.text) {
              text = chunk.candidates[0].content.parts[0].text
            }

            // Accumulate text for the suggested message
            accumulatedText += text

            // Only send non-empty text chunks
            if (text) {
              const jsonChunk = JSON.stringify({ text }) + "\n"
              controller.enqueue(new TextEncoder().encode(jsonChunk))
            }
          }

          // Extract usage metadata including cachedContentTokenCount
          const usage = {
            promptTokenCount: finalUsageMetadata?.promptTokenCount,
            candidatesTokenCount: finalUsageMetadata?.candidatesTokenCount,
            totalTokenCount: finalUsageMetadata?.totalTokenCount,
            cachedContentTokenCount: finalUsageMetadata?.cachedContentTokenCount || 0,
          }

          // Log the final usage metadata
          console.log("Stream completed. Usage metadata:", usage)

          // After all chunks are processed, send the finish reason and metadata
          const finalChunk =
            JSON.stringify({
              finishReason: finalCandidate?.finishReason || "STOP",
              completionMetadata: {
                finishReason: finalCandidate?.finishReason || "STOP",
                usage,
                safetyRatings: finalCandidate?.safetyRatings,
              },
            }) + "\n"

          controller.enqueue(new TextEncoder().encode(finalChunk))
          controller.close()
        } catch (error) {
          console.error("Error processing stream:", error)
          controller.enqueue(
            new TextEncoder().encode(
              JSON.stringify({ error: "Error processing stream", finishReason: "ERROR" }) + "\n",
            ),
          )
          controller.close()
        }
      },
    })

    // Return the stream as a response
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("Error in chat API:", error)

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to process chat request",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}
