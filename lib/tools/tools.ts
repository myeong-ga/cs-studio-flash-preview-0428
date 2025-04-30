import { tool } from "ai"
import { toolsList, agentTools, functionsMap } from "./tools-list"
import { z } from "zod"

// Format tools for OpenAI function calling using the tool function from AI SDK
export const getOpenAITools = () => {
  const tools: Record<string, any> = {}

  toolsList.forEach((toolDef) => {
    // Convert the tool parameters to a Zod schema
    const properties: Record<string, any> = {}

    for (const [key, value] of Object.entries(toolDef.parameters)) {
      // Basic type conversion from JSON Schema to Zod
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
          // For simplicity, assume array of strings
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

    // Create a Zod schema for the tool parameters
    const paramSchema = z.object(properties)

    // Use the tool function from AI SDK and add to tools object with the tool name as key
    tools[toolDef.name] = tool({
      description:  `Execute the ${toolDef.name} function`,
      parameters: paramSchema,
      // Execute function is optional, we'll handle execution separately
    })
  })

  return tools
}

// Check if a tool requires human confirmation
export const requiresConfirmation = (toolName: string): boolean => {
  return agentTools.includes(toolName)
}

// Execute a tool function with the given parameters
export const executeTool = async (toolName: string, parameters: Record<string, any>): Promise<any> => {
  if (!functionsMap[toolName]) {
    throw new Error(`Tool function ${toolName} not found`)
  }

  return await functionsMap[toolName](parameters)
}

export { toolsList, agentTools, functionsMap }
