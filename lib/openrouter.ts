import OpenAI from "openai"

export const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3000", // REQUIRED by OpenRouter
    "X-Title": "Tata Capital Loan Assistant" // Any app name
  }
})
