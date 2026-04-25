import OpenAI from "openai"
import { TOOLS } from "./tools.js"
import { SYSTEM_PROMPT } from "./prompts.js"

const client = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
})

export async function runExtractionAgent(fileBase64, mimeType, onStep) {
  onStep({ type: "start", message: "Sending document to GPT-4o..." })

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: [
        {
          type: "image_url",
          image_url: { url: `data:${mimeType};base64,${fileBase64}` },
        },
        {
          type: "text",
          text: "Please extract the expense data from this receipt or invoice.",
        },
      ],
    },
  ]

  while (true) {
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 1024,
      tools: TOOLS,
      messages,
    })

    const choice = response.choices[0]
    onStep({ type: "llm_response", message: "Model responded", response })

    if (choice.finish_reason === "stop") {
      onStep({ type: "done", message: choice.message.content || "Done." })
      return { success: false, error: "No tool call made — unexpected response" }
    }

    messages.push(choice.message)

    const toolCalls = choice.message.tool_calls || []
    const toolResults = []

    for (const toolCall of toolCalls) {
      const input = JSON.parse(toolCall.function.arguments)

      onStep({
        type: "tool_call",
        message: `Calling tool: ${toolCall.function.name}`,
        tool: toolCall.function.name,
        input,
      })

      if (toolCall.function.name === "extract_receipt_data") {
        onStep({
          type: "tool_result",
          message: `Extracted: ${input.vendor} · ${input.currency} ${input.amount}`,
          result: input,
        })

        toolResults.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify({ status: "success", data: input }),
        })

        if (input.confidence > 0.3) {
          return { success: true, data: input }
        }
      }
    }

    messages.push(...toolResults)
  }
}