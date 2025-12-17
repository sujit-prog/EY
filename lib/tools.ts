import { ChatCompletionTool } from "openai/resources/chat/completions"

export const tools: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "sales_agent",
      description:
        "Negotiate loan amount, tenure and interest rate with the customer",
      parameters: {
        type: "object",
        properties: {
          amount: {
            type: "number",
            description: "Requested loan amount"
          },
          tenure: {
            type: "number",
            description: "Loan tenure in months"
          },
          interestRate: {
            type: "number",
            description: "Negotiated annual interest rate"
          }
        },
        required: ["amount", "tenure"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "verification_agent",
      description:
        "Verify customer KYC details and existing loan history using CRM",
      parameters: {
        type: "object",
        properties: {
          phone: {
            type: "string",
            description: "Customer phone number"
          }
        },
        required: ["phone"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "underwriting_agent",
      description:
        "Evaluate loan eligibility using salary, EMI, and credit score",
      parameters: {
        type: "object",
        properties: {
          amount: {
            type: "number",
            description: "Final approved loan amount"
          },
          interestRate: {
            type: "number",
            description: "Annual interest rate percentage"
          },
          tenure: {
            type: "number",
            description: "Loan tenure in months"
          }
        },
        required: ["amount", "interestRate", "tenure"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "generate_sanction_letter",
      description:
        "Generate a loan sanction letter PDF after approval",
      parameters: {
        type: "object",
        properties: {
          amount: { type: "number" },
          interestRate: { type: "number" },
          tenure: { type: "number" }
        },
        required: ["amount", "interestRate", "tenure"]
      }
    }
  }
]
