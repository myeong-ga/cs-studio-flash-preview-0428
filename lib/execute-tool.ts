"use server"
import { functionsMap } from "./tools/tools-list"

export async function executeTool(toolName: string, parameters: Record<string, any>): Promise<any> {
  if (!functionsMap[toolName]) {
    throw new Error(`Tool function ${toolName} not found`)
  }

  try {
    console.log(`[SERVER] Executing tool: ${toolName} with parameters:`, parameters)
    const result = await functionsMap[toolName](parameters)
    console.log(`[SERVER] Tool ${toolName} execution result:`, result)
    return {
      success: true,
      result,
      toolName,
      parameters,
    }
  } catch (error) {
    console.error(`[SERVER] Error executing tool ${toolName}:`, error)
    throw error instanceof Error ? error : new Error(`Error executing ${toolName}`)
  }
}
