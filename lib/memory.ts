export type Stage = 
  | "welcome" 
  | "phone_request" 
  | "otp_verification" 
  | "discovery" 
  | "sales" 
  | "verification" 
  | "underwriting" 
  | "sanctioned" 
  | "rejected"

export type ActiveAgent = 
  | "welcome" 
  | "master" 
  | "sales" 
  | "verification" 
  | "underwriting" 
  | "sanction"

export interface ConversationMessage {
  role: "user" | "assistant"
  content: string
  timestamp?: number
}

export interface SelectedPlan {
  tenure: number
  emi: number
  totalInterest: number
  totalPayable: number
}

export interface ChatMemory {
  // Stage tracking
  stage?: Stage
  activeAgent?: ActiveAgent
  
  // Authentication
  phone?: string
  expectedOTP?: string
  otpVerified?: boolean
  phoneAsked?: boolean
  welcomed?: boolean
  verificationStarted?: boolean
  
  // User profile
  userProfile?: {
    name: string
    age: number
    location: string
    phone: string
    email?: string
    salary: number
    creditScore: number
    preApprovedLimit: number
    previousLoans?: any[]
  }
  
  // Discovery phase (Master Agent)
  userName?: string
  loanType?: "personal" | "car" | "home" | "education"
  loanPurpose?: string
  amount?: number
  purpose?: string
  
  // Sales phase (Sales Agent)
  tenure?: number
  interestRate?: number
  currentEMI?: number
  
  // Final agreed terms
  finalTenure?: number
  finalEMI?: number
  
  // Verification phase
  kycVerified?: boolean
  documentsUploaded?: string[]
  
  // Underwriting phase
  creditCheckPassed?: boolean
  policyCheckPassed?: boolean
  salarySlipChecked?: boolean
  salarySlipUploaded?: boolean
  
  // Sanction phase
  loanId?: string
  sanctionDate?: string
  
  // Rejection tracking
  rejectionReason?: string
  
  // Conversation history
  conversationHistory?: ConversationMessage[]
  
  // Legacy support
  selectedPlan?: SelectedPlan
  emi?: number
}

export const memory: Record<string, ChatMemory> = {}

// Helper function to add message to history
export function addToHistory(sessionId: string, role: "user" | "assistant", content: string) {
  if (!memory[sessionId]) {
    memory[sessionId] = { conversationHistory: [] }
  }
  
  if (!memory[sessionId].conversationHistory) {
    memory[sessionId].conversationHistory = []
  }
  
  memory[sessionId].conversationHistory!.push({
    role,
    content,
    timestamp: Date.now()
  })
}

// Helper function to get recent history
export function getRecentHistory(sessionId: string, count: number = 6): ConversationMessage[] {
  if (!memory[sessionId]?.conversationHistory) {
    return []
  }
  
  return memory[sessionId].conversationHistory!.slice(-count)
}

// Helper function to clear session
export function clearSession(sessionId: string) {
  delete memory[sessionId]
}