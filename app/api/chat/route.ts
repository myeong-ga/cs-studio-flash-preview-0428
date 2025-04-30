import type { NextRequest } from "next/server"
import { GoogleGenAI } from "@google/genai"
import { streamText } from "ai"
import { openai } from "@ai-sdk/openai"
import { getOpenAITools } from "@/lib/tools/tools"
import { z } from "zod"
import { getMockResponseByUserMessage } from "@/lib/mock/mock-gemini-responses"

// 스트림 파트 타입 정의
type LanguageModelV1StreamPart =
  | { type: "text"; text: string }
  | { type: "tool_call"; toolCall: any }
  | { type: "metadata"; metadata: any }
  | { type: "error"; error: string }

// 응답 청크 스키마 정의
const openaiResponsesChunkSchema = z.object({
  text: z.string().optional(),
  toolCall: z.any().optional(),
  finishReason: z.string().optional(),
  usage: z
    .object({
      promptTokens: z.number().optional(),
      completionTokens: z.number().optional(),
      totalTokens: z.number().optional(),
    })
    .optional(),
  error: z.string().optional(),
})

// ParseResult 타입 정의
type ParseResult<T> = { success: true; data: T } | { success: false; error: Error }

// Initialize Google Generative AI client
const ai = new GoogleGenAI({
  vertexai: false,
  apiKey: process.env.GEMINI_API_KEY || "",
})

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json()
    const { messages, cacheName, useMockData } = body

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

    // 모의 데이터 사용 여부 확인
    let geminiText = ""

    if (useMockData) {
      // 모의 데이터 사용
      console.log("Using mock Gemini response")
      geminiText = getMockResponseByUserMessage(lastUserMessage.content)
    } else {
      // 실제 Gemini API 사용
      // API 키가 없으면 에러 반환
      if (!process.env.GEMINI_API_KEY) {
        return new Response(JSON.stringify({ error: "GEMINI_API_KEY is not configured" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        })
      }

      // Convert messages to Google Generative AI format
      const formattedMessages = messages.map((m: any) => ({
        role: m.role,
        parts: [{ text: m.content }],
      }))

      // Use non-streaming generateContent instead of generateContentStream
      const geminiResponse = await ai.models.generateContent({
        model: "gemini-2.0-flash-001",
        contents: formattedMessages,
        config: cacheName ? { cachedContent: cacheName } : undefined,
      })

      // Extract the text from the Gemini response
      if (geminiResponse.candidates?.[0]?.content?.parts?.[0]?.text) {
        geminiText = geminiResponse.candidates[0].content.parts[0].text
      }
    }

    console.log("Gemini response received, length:", geminiText.length)
    console.log("Gemini response received:", geminiText)
    // If we have a Gemini response, process it with OpenAI
    if (geminiText) {
      // Convert messages to OpenAI format
      const openaiMessages = messages.map((m: any) => ({
        role: m.role,
        content: m.content,
      }))

      // Add the Gemini response as a system message
      openaiMessages.push({
        role: "system",
        content: `The primary AI suggested the following response: "${geminiText}". 
        If this response indicates a need to use tools, please use the appropriate tool.
        Otherwise, you can suggest a response for the human representative to send.`,
      })

      // Get OpenAI tools
      const tools = getOpenAITools()

      console.log("OpenAI tools:", tools)
      console.log("OpenAI messages:", openaiMessages)
      
      // Create a stream from OpenAI
      const stream = await streamText({
        model: openai("gpt-4o-mini"),
        messages: openaiMessages,
        tools: tools,
        toolChoice: "auto",
        temperature: 0.7,
      })

      // 스트림 소스 생성
      const streamSource = new ReadableStream<ParseResult<z.infer<typeof openaiResponsesChunkSchema>>>({
        async start(controller) {
          try {
            // 텍스트 스트림 처리
            for await (const chunk of stream.textStream) {
              controller.enqueue({
                success: true,
                data: { text: chunk },
              })
            }

            // 도구 호출 처리 - await로 Promise 해결
            const toolCalls = await stream.toolCalls
            if (toolCalls && toolCalls.length > 0) {
              for (const toolCall of toolCalls) {
                controller.enqueue({
                  success: true,
                  data: { toolCall },
                })
              }
            }

            // 완료 메타데이터 전송
            controller.enqueue({
              success: true,
              data: {
                finishReason: await stream.finishReason,
                usage: await stream.usage,
              },
            })

            // 스트림 종료
            controller.close()
          } catch (error) {
            console.error("Error in stream processing:", error)
            controller.enqueue({
              success: false,
              error: error instanceof Error ? error : new Error("Unknown error"),
            })
            controller.close()
          }
        },
      })

      // TransformStream을 사용하여 스트림 변환
      const transformedStream = streamSource.pipeThrough(
        new TransformStream<ParseResult<z.infer<typeof openaiResponsesChunkSchema>>, LanguageModelV1StreamPart>({
          transform(chunk, controller) {
            if (!chunk.success) {
              controller.enqueue({
                type: "error",
                error: chunk.error.message,
              })
              return
            }

            const data = chunk.data

            // 텍스트 청크 처리
            if (data.text) {
              controller.enqueue({
                type: "text",
                text: data.text,
              })
            }

            // 도구 호출 처리
            if (data.toolCall) {
              controller.enqueue({
                type: "tool_call",
                toolCall: data.toolCall,
              })
            }

            // 메타데이터 처리
            if (data.finishReason) {
              controller.enqueue({
                type: "metadata",
                metadata: {
                  finishReason: data.finishReason,
                  usage: data.usage,
                },
              })
            }
          },
        }),
      )

      // 최종 스트림을 텍스트 인코딩하여 클라이언트에 전송
      const encodedStream = transformedStream.pipeThrough(
        new TransformStream<LanguageModelV1StreamPart, Uint8Array>({
          transform(part, controller) {
            let chunk: string

            switch (part.type) {
              case "text":
                chunk = JSON.stringify({ text: part.text })
                break
              case "tool_call":
                chunk = JSON.stringify({ toolCall: part.toolCall })
                break
              case "metadata":
                chunk = JSON.stringify(part.metadata)
                break
              case "error":
                chunk = JSON.stringify({ error: part.error })
                break
              default:
                return
            }

            controller.enqueue(new TextEncoder().encode(chunk + "\n"))
          },
        }),
      )

      // 응답 반환
      return new Response(encodedStream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      })
    } else {
      // If no Gemini response, return an error
      return new Response(JSON.stringify({ error: "No response from Gemini" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }
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
