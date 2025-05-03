import type { NextRequest } from "next/server"
import { GoogleGenAI } from "@google/genai"
import { streamText } from "ai"
import { openai } from "@ai-sdk/openai"
import { getOpenAITools } from "@/lib/tools/tools"
import { z } from "zod"
import { getMockResponseByUserMessage } from "@/lib/mock/mock-gemini-responses"
import { NoSuchToolError, InvalidToolArgumentsError, ToolExecutionError } from "ai"

type LanguageModelV1StreamPart =
  | { type: "text"; text: string }
  | { type: "tool_call"; toolCall: any }
  | { type: "metadata"; metadata: any }
  | { type: "error"; error: string }

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

const sessionInfoSchema = z.object({
  userId: z.string(),
  sessionId: z.string().optional(),
})

type ParseResult<T> = { success: true; data: T } | { success: false; error: Error }

const ai = new GoogleGenAI({
  vertexai: false,
  apiKey: process.env.GEMINI_API_KEY || "",
})

export const runtime = "nodejs"

const API_TIMEOUT = 30000

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    }),
  ])
}

export async function POST(request: NextRequest) {
  console.log("[API] Chat request received")
  const startTime = Date.now()

  try {
    const body = await request.json()
    const { messages, cacheName, useMockData, sessionInfo } = body

    const validatedSessionInfo = sessionInfo ? sessionInfoSchema.parse(sessionInfo) : { userId: "cus_28X44" }
    const userId = validatedSessionInfo.userId

    console.log("[API] Request parsed:", {
      messageCount: messages?.length,
      cacheName: cacheName || "none",
      useMockData: !!useMockData,
      userId,
    })

    if (!messages || !Array.isArray(messages)) {
      console.error("[API] Invalid messages format")
      return new Response(JSON.stringify({ error: "No messages provided or invalid format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const lastUserMessage = messages.filter((m: any) => m.role === "user").pop()

    if (!lastUserMessage) {
      console.error("[API] No user message found")
      return new Response(JSON.stringify({ error: "No user message found" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    console.log(`[API] Processing chat request with message: "${lastUserMessage.content.substring(0, 50)}..."`)

    let geminiText = ""

    if (useMockData) {
      console.log("[API] Using mock Gemini response")
      geminiText = getMockResponseByUserMessage(lastUserMessage.content)
      console.log("[API] Mock response generated, length:", geminiText.length)
    } else {
      if (!process.env.GEMINI_API_KEY) {
        console.error("[API] GEMINI_API_KEY is not configured")
        return new Response(JSON.stringify({ error: "GEMINI_API_KEY is not configured" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        })
      }

      const formattedMessages = messages.map((m: any) => ({
        role: m.role,
        parts: [{ text: m.content }],
      }))

      console.log("[API] Calling Gemini API...")
      try {
        const geminiResponse = await withTimeout(
          ai.models.generateContent({
            model: "gemini-2.0-flash-001",
            contents: formattedMessages,
            config: cacheName ? { cachedContent: cacheName } : undefined,
          }),
          API_TIMEOUT,
          "Gemini API request timed out",
        )

        console.log("[API] Gemini API response received")

        if (geminiResponse.candidates?.[0]?.content?.parts?.[0]?.text) {
          geminiText = geminiResponse.candidates[0].content.parts[0].text
          console.log("[API] Extracted text from Gemini response, length:", geminiText.length)
        } else {
          console.error("[API] No text found in Gemini response:", JSON.stringify(geminiResponse).substring(0, 200))
        }
      } catch (error) {
        console.error("[API] Error calling Gemini API:", error)
        return new Response(
          JSON.stringify({ error: `Gemini API error: ${error instanceof Error ? error.message : "Unknown error"}` }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          },
        )
      }
    }

    if (geminiText) {
      const filteredMessages = messages.filter((m: any) => m.role !== "function")

      const openaiMessages = filteredMessages.map((m: any) => {
        const baseMessage: any = {
          role: m.role,
          content: m.content,
        }

        if (m.functionCall) {
          baseMessage.function_call = {
            name: m.functionCall.name,
            arguments: m.functionCall.arguments,
          }
        }

        return baseMessage
      })

      openaiMessages.push({
        role: "system",
        content: `The primary AI suggested the following response: "${geminiText}". 
If this response indicates a need to use tools, please use the appropriate tool.
When you receive function results, incorporate them into your response.
For order details, format the information in a clear, readable way.
For order history, summarize the key information about each order.
The current user ID is ${userId}. Use this ID when calling functions that require a user ID.
Otherwise, you can suggest a response for the human representative to send.`,
      })

      console.log("[API] OpenAI messages prepared:", JSON.stringify(openaiMessages))

      const tools = getOpenAITools()
      console.log("[API] OpenAI tools prepared:", tools.length, "tools available")

      try {
        console.log("[API] Calling OpenAI API...")

        let systemMessage = ""
        const regularMessages = openaiMessages.filter((msg) => {
          if (msg.role === "system") {
            systemMessage += (systemMessage ? "\n" : "") + msg.content
            return false
          }
          return true
        })

        const controller = new AbortController()
        const timeoutId = setTimeout(() => {
          controller.abort()
          console.error("[API] OpenAI request timed out after", API_TIMEOUT, "ms")
        }, API_TIMEOUT)
        let stepCounter = 0;
        const stream = streamText({
          model: openai("gpt-4.1-mini"),
          messages: regularMessages,
          system: systemMessage,
          tools: tools,
          toolChoice: "auto",
          temperature: 0.7,
          maxSteps: 10,
          abortSignal: controller.signal,
          onStepFinish: ({ toolCalls, toolResults, finishReason, usage, text, reasoning }) => {
            stepCounter++;
            console.log(`\n📊 Step ${stepCounter} Finished:`);
            console.log('🏁 Finish Reason:', finishReason);
            console.log('💭 Reasoning:', reasoning);
      
            console.log('💬 Model Response:', text);
            
            if (toolCalls && toolCalls.length > 0) {
              console.log('🛠️ Tool Calls:');
              toolCalls.forEach((call, index) => {
                console.log(`  [${index + 1}] Tool: ${call.toolName}, Arguments:`, call.args);
              });
            }
            
            if (toolResults && toolResults.length > 0) {
              console.log('🔧 Tool Results:');
              toolResults.forEach((result, index) => {
                console.log(`  [${index + 1}] Result:`, typeof result === 'object' ? JSON.stringify(result) : result);
              });
            }
            
            if (usage) {
              console.log('📈 Usage:', usage);
            }
            
            console.log('------------------------');
          },
          onError: (error) => {
            console.error("[API] OpenAI stream error:", error)

            if (NoSuchToolError.isInstance(error)) {
              console.error("[API] No such tool error:", error.message)
            } else if (InvalidToolArgumentsError.isInstance(error)) {
              console.error("[API] Invalid tool arguments error:", error.message)
            } else if (ToolExecutionError.isInstance(error)) {
              console.error("[API] Tool execution error:", error.message)
            } else if (error.name === "AbortError" || error.message?.includes("aborted")) {
              console.error("[API] Request aborted:", error.message)
            } else {
              console.error("[API] Other error:", error.message || "Unknown error")
            }
          },
        })

        clearTimeout(timeoutId)

        console.log("[API] OpenAI stream created successfully")

        const streamSource = new ReadableStream<ParseResult<z.infer<typeof openaiResponsesChunkSchema>>>({
          async start(controller) {
            try {
              console.log("[API] Starting to process text stream")
              for await (const chunk of stream.textStream) {
                console.log("[API] Text chunk received:", chunk.substring(0, 50))
                controller.enqueue({
                  success: true,
                  data: { text: chunk },
                })
              }
              console.log("[API] Text stream completed")

              const toolCalls = await stream.toolCalls
              if (toolCalls && toolCalls.length > 0) {
                console.log("[API] Tool calls received:", toolCalls.length)
                for (const toolCall of toolCalls) {
                  if (
                    toolCall.args &&
                    !toolCall.args.user_id &&
                    (toolCall.toolName === "get_order_history" ||
                      toolCall.toolName === "reset_password" ||
                      toolCall.toolName === "issue_voucher" ||
                      toolCall.toolName === "create_complaint" ||
                      toolCall.toolName === "create_ticket" ||
                      toolCall.toolName === "update_info")
                  ) {
                    toolCall.args.user_id = userId
                    console.log(`[API] Injected userId ${userId} into tool call args`)
                  }

                  controller.enqueue({
                    success: true,
                    data: { toolCall },
                  })
                }
              }

              const finishReason = await stream.finishReason
              const usage = await stream.usage
              console.log("[API] Stream finished:", { finishReason, usage })

              controller.enqueue({
                success: true,
                data: {
                  finishReason,
                  usage,
                },
              })

              controller.close()
              console.log("[API] Stream closed successfully")
            } catch (error) {
              console.error("[API] Error in stream processing:", error)
              controller.enqueue({
                success: false,
                error: error instanceof Error ? error : new Error("Unknown error"),
              })
              controller.close()
            }
          },
        })

        const transformedStream = streamSource.pipeThrough(
          new TransformStream<ParseResult<z.infer<typeof openaiResponsesChunkSchema>>, LanguageModelV1StreamPart>({
            transform(chunk, controller) {
              if (!chunk.success) {
                console.error("[API] Stream error:", chunk.error.message)
                controller.enqueue({
                  type: "error",
                  error: chunk.error.message,
                })
                return
              }

              const data = chunk.data

              if (data.text) {
                controller.enqueue({
                  type: "text",
                  text: data.text,
                })
              }

              if (data.toolCall) {
                controller.enqueue({
                  type: "tool_call",
                  toolCall: data.toolCall,
                })
              }

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

        console.log("[API] Returning stream response, total processing time:", Date.now() - startTime, "ms")
        return new Response(encodedStream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          },
        })
      } catch (error) {
        console.error("[API] Error creating OpenAI stream:", error)
        return new Response(
          JSON.stringify({
            error: `OpenAI API error: ${error instanceof Error ? error.message : "Unknown error"}`,
          }),
          { status: 500, headers: { "Content-Type": "application/json" } },
        )
      }
    } else {
      console.error("[API] No response from Gemini")
      return new Response(JSON.stringify({ error: "No response from Gemini" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }
  } catch (error) {
    console.error("[API] Error in chat API:", error)

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to process chat request",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}
