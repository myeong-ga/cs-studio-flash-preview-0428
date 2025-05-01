import { tool } from "ai"
import { toolsList, agentTools, functionsMap } from "./tools-list"
import { z } from "zod"

export const getOpenAITools = () => {
  const tools: Record<string, any> = {}

  toolsList.forEach((toolDef) => {
    const properties: Record<string, any> = {}

    for (const [key, value] of Object.entries(toolDef.parameters)) {
      switch (value.type) {
        case "string":
          properties[key] = value.enum
            ? z.enum(value.enum as [string, ...string[]]).describe(value.description || "")
            : z.string().describe(value.description || "")
          break
        case "number":
          properties[key] = z.number().describe(value.description || "")
          break
        case "boolean":
          properties[key] = z.boolean().describe(value.description || "")
          break
        case "array":
          properties[key] = z.array(z.string()).describe(value.description || "")
          break
        case "object":
          if (value.properties) {
            const objectProperties: Record<string, any> = {}
            for (const [objKey, objValue] of Object.entries(value.properties)) {
              objectProperties[objKey] = z.string().describe((objValue as any).description || "")
            }
            properties[key] = z.object(objectProperties).describe(value.description || "")
          } else {
            properties[key] = z.record(z.any()).describe(value.description || "")
          }
          break
        default:
          properties[key] = z.any().describe(value.description || "")
      }
    }

    const paramSchema = z.object(properties)

    const needsConfirmation = agentTools.includes(toolDef.name)

    if (needsConfirmation) {
      tools[toolDef.name] = tool({
        description: toolDef.description || `Execute the ${toolDef.name} function`,
        parameters: paramSchema,
      })
    } else {
      tools[toolDef.name] = tool({
        description: toolDef.description || `Execute the ${toolDef.name} function`,
        parameters: paramSchema,
        execute: async (params) => {
          try {
            const result = await functionsMap[toolDef.name](params)
            return result
          } catch (error) {
            throw error instanceof Error ? error : new Error(`Error executing ${toolDef.name}`)
          }
        },
      })
    }
  })

  return tools
}

export const requiresConfirmation = (toolName: string): boolean => {
  return agentTools.includes(toolName)
}

export const executeTool = async (toolName: string, parameters: Record<string, any>): Promise<any> => {
  if (!functionsMap[toolName]) {
    throw new Error(`Tool function ${toolName} not found`)
  }

  try {
    console.log(`[TOOLS] Executing tool: ${toolName} with parameters:`, parameters)
    const result = await functionsMap[toolName](parameters)
    console.log(`[TOOLS] Tool ${toolName} execution result:`, result)
    return result
  } catch (error) {
    console.error(`[TOOLS] Error executing tool ${toolName}:`, error)
    throw error
  }
}

export { toolsList, agentTools, functionsMap }
