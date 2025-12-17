// api/chat/route.ts
import { NextRequest, NextResponse } from "next/server"
import { users } from "@/lib/users"
import { memory } from "@/lib/memory"
import { loanConfigs } from "@/lib/loanConfig"
import { calculateEMI, calculateTotalInterest } from "@/lib/emi"
import { generateSanctionPDF } from "@/lib/pdf"
import { openrouter } from "@/lib/openrouter"
import { 
  welcomePrompt,
  masterAgentPrompt, 
  salesAgentPrompt, 
  verificationAgentPrompt,
  underwritingAgentPrompt,
  intentDetectionPrompt
} from "@/lib/prompts"

type Stage = "welcome" | "otp_verification" | "discovery" | "sales" | "verification" | "underwriting" | "sanctioned"

// Generate dummy OTP
function generateOTP(): string {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

// Detect user intent
async function detectIntent(message: string, currentStage: string): Promise<{
  isAgreement: boolean
  isRejection: boolean
  wantsMoreInfo: boolean
  extractedTenure?: number
  extractedAmount?: number
}> {
  const completion = await openrouter.chat.completions.create({
    model: "google/gemini-2.5-flash-lite",
    messages: [
      {
        role: "system",
        content: intentDetectionPrompt(currentStage)
      },
      { role: "user", content: message }
    ],
    temperature: 0.3
  })

  const response = completion.choices[0].message.content || "{}"
  
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
  } catch (e) {
    console.error("Intent detection error:", e)
  }

  // Fallback
  const isAgreement = /\b(yes|yeah|sure|okay|ok|fine|proceed|agree|let'?s go|sounds? good|perfect|great|go ahead)\b/i.test(message)
  const isRejection = /\b(no|not interested|maybe later|reject|decline|cancel)\b/i.test(message)
  const wantsMoreInfo = /\b(tell me more|explain|what about|how|why|details|information|confused)\b/i.test(message)

  return { isAgreement, isRejection, wantsMoreInfo }
}

export async function POST(req: NextRequest) {
  const { message, sessionId } = await req.json()
  
  if (!memory[sessionId]) {
    memory[sessionId] = {
      stage: "welcome",
      conversationHistory: []
    }
  }

  const mem = memory[sessionId]
  mem.conversationHistory = mem.conversationHistory || []
  mem.conversationHistory.push({ role: "user", content: message })

  // ============================================
  // STAGE 0: WELCOME
  // ============================================
  if (mem.stage === "welcome") {
    const phoneMatch = message.match(/\b[6-9]\d{9}\b/)
    
    if (!mem.phoneAsked && !phoneMatch) {
      const completion = await openrouter.chat.completions.create({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: welcomePrompt() },
          { role: "user", content: message }
        ],
        temperature: 0.7
      })

      const reply = completion.choices[0].message.content
      mem.phoneAsked = true
      mem.conversationHistory.push({ role: "assistant", content: reply! })
      return NextResponse.json({ reply })
    }

    if (phoneMatch) {
      const phone = phoneMatch[0]
      const user = users[phone]

      if (!user) {
        return NextResponse.json({ 
          reply: "I apologize, but I couldn't find your details. Please try a different number or contact support." 
        })
      }

      const otp = generateOTP()
      mem.phone = phone
      mem.expectedOTP = otp
      mem.userName = user.name
      mem.stage = "otp_verification"
      
      const reply = `Thank you! I've sent a verification code to ${phone}. Please enter the 4-digit OTP to proceed.\n\n(Demo OTP: ${otp})`
      mem.conversationHistory.push({ role: "assistant", content: reply })

      return NextResponse.json({ reply, demoOTP: otp })
    }
  }

  // ============================================
  // STAGE 1: OTP VERIFICATION
  // ============================================
  if (mem.stage === "otp_verification") {
    const otpMatch = message.match(/\b\d{4}\b/)
    
    if (otpMatch && otpMatch[0] === mem.expectedOTP) {
      mem.otpVerified = true
      mem.stage = "discovery"
      
      const user = users[mem.phone!]
      mem.userProfile = user

      const reply = `Perfect! Welcome ${user.name}! 🎉\n\nI can see you have a credit score of ${user.creditScore}/900 and you're pre-approved for up to ₹${(user.preApprovedLimit / 100000).toFixed(1)} lakhs.\n\nHow can I assist you with your financial goals today?`
      
      mem.conversationHistory.push({ role: "assistant", content: reply })

      return NextResponse.json({ 
        reply,
        stage: "discovery",
        userProfile: {
          name: user.name,
          creditScore: user.creditScore,
          preApprovedLimit: user.preApprovedLimit
        }
      })
    } else {
      return NextResponse.json({ 
        reply: "The OTP doesn't match. Please check and try again." 
      })
    }
  }

  // ============================================
  // STAGE 2: DISCOVERY
  // ============================================
  if (mem.stage === "discovery") {
    const user = mem.userProfile!

    // Extract amount (improved parsing)
    if (!mem.amount) {
      const amountMatch = message.match(/(\d+)\s*(lakh|lakhs|L|k)?/i)
      if (amountMatch) {
        let num = Number(amountMatch[1].replace(/,/g, ''))
        if (amountMatch[2] && /lakh|L/i.test(amountMatch[2])) {
          num = num * 100000
        } else if (amountMatch[2] && /k/i.test(amountMatch[2])) {
          num = num * 1000
        } else if (num < 1000) {
          num = num * 100000 // Assume lakhs if small number
        }
        mem.amount = num
      }
    }

    // Extract tenure (improved parsing)
    if (!mem.tenure) {
      const tenureMatch = message.match(/(\d+)\s*(year|years|month|months)/i)
      if (tenureMatch) {
        const num = Number(tenureMatch[1])
        mem.tenure = tenureMatch[2].toLowerCase().includes("year") ? num * 12 : num
      }
    }

    const completion = await openrouter.chat.completions.create({
      model: "google/gemini-2.5-flash-lite",
      messages: [
        {
          role: "system",
          content: masterAgentPrompt({
            userName: mem.userName,
            amount: mem.amount,
            tenure: mem.tenure,
            salary: user.salary,
            creditScore: user.creditScore,
            preApprovedLimit: user.preApprovedLimit,
            hasAmount: !!mem.amount
          })
        },
        ...mem.conversationHistory.slice(-6)
      ],
      temperature: 0.7
    })

    const reply = completion.choices[0].message.content
    mem.conversationHistory.push({ role: "assistant", content: reply! })

    // Check if ready for sales stage
    if (mem.amount && mem.amount >= 50000) {
      const intent = await detectIntent(message, mem.stage)
      
      // Only move to sales if user shows readiness
      if (intent.isAgreement || /ready|show|offer|plan|see details|interested/i.test(message)) {
        mem.stage = "sales"
        
        return NextResponse.json({
          reply: reply + "\n\n✨ Let me prepare your personalized loan offer...",
          nextStage: "sales",
          agentTransition: "Routing to Sales Agent"
        })
      }
    }

    return NextResponse.json({ reply })
  }

  // ============================================
  // STAGE 3: SALES
  // ============================================
  if (mem.stage === "sales") {
    const user = mem.userProfile!
    const config = loanConfigs["personal"]
    
    // Update tenure if mentioned
    const tenureMatch = message.match(/(\d+)\s*(month|months|year|years)/i)
    if (tenureMatch) {
      const num = Number(tenureMatch[1])
      mem.tenure = tenureMatch[2].toLowerCase().includes("year") ? num * 12 : num
    }

    // Default to user's requested tenure or 48 months
    if (!mem.tenure) mem.tenure = 48

    // Calculate EMI
    const emi = calculateEMI(mem.amount!, config.interestRate, mem.tenure)
    const totalInterest = calculateTotalInterest(emi, mem.tenure, mem.amount!)
    const totalPayable = mem.amount! + totalInterest
    const emiToSalaryRatio = ((emi / user.salary) * 100).toFixed(1)

    mem.interestRate = config.interestRate
    mem.currentEMI = emi

    // Credit score impact
    const creditScoreImpact = `With timely EMI payments over ${Math.floor(mem.tenure/12)} years, your credit score could improve from ${user.creditScore} to approximately ${Math.min(900, user.creditScore + Math.floor(mem.tenure / 12) * 15)} (+${Math.floor(mem.tenure / 12) * 15} points)!`

    // Alternative tenures
    const alternatives = [24, 36, 48, 60]
      .filter(t => t !== mem.tenure)
      .slice(0, 2)
      .map(t => {
        const altEMI = calculateEMI(mem.amount!, config.interestRate, t)
        const altInterest = calculateTotalInterest(altEMI, t, mem.amount!)
        const altRatio = ((altEMI / user.salary) * 100).toFixed(1)
        return { tenure: t, emi: altEMI, totalInterest: altInterest, ratio: altRatio }
      })

    const completion = await openrouter.chat.completions.create({
      model: "google/gemini-2.5-flash-lite",
      messages: [
        {
          role: "system",
          content: salesAgentPrompt({
            userName: mem.userName,
            salary: user.salary,
            creditScore: user.creditScore,
            amount: mem.amount,
            tenure: mem.tenure,
            interestRate: config.interestRate,
            emi: emi.toFixed(0),
            totalInterest: totalInterest.toFixed(0),
            totalPayable: totalPayable.toFixed(0),
            emiToSalaryRatio,
            creditScoreImpact,
            alternatives,
            preApprovedLimit: user.preApprovedLimit
          })
        },
        ...mem.conversationHistory.slice(-8)
      ],
      temperature: 0.7
    })

    const reply = completion.choices[0].message.content
    mem.conversationHistory.push({ role: "assistant", content: reply! })

    // Check if user agrees to proceed
    const intent = await detectIntent(message, mem.stage)

    if (intent.isAgreement || /proceed|yes|confirm|accept|agree|let'?s do|go ahead/i.test(message)) {
      mem.stage = "verification"
      mem.finalTenure = mem.tenure
      mem.finalEMI = emi
      
      return NextResponse.json({
        reply: reply + "\n\n✅ Excellent! Let's proceed with document verification.",
        nextStage: "verification",
        verificationDocs: getVerificationDocs(),
        agentTransition: "Routing to Verification Agent"
      })
    }

    return NextResponse.json({ reply })
  }

  // ============================================
  // STAGE 4: VERIFICATION
  // ============================================
  if (mem.stage === "verification") {
    const completion = await openrouter.chat.completions.create({
      model: "google/gemini-2.5-flash-lite",
      messages: [
        {
          role: "system",
          content: verificationAgentPrompt({ 
            userName: mem.userName,
            documentsUploaded: mem.documentsUploaded || []
          })
        },
        ...mem.conversationHistory.slice(-6)
      ],
      temperature: 0.6
    })

    const reply = completion.choices[0].message.content
    mem.conversationHistory.push({ role: "assistant", content: reply! })

    // Check if documents uploaded (detect from UI or explicit confirmation)
    const intent = await detectIntent(message, mem.stage)
    
    if (intent.isAgreement || /upload|done|completed|submitted|verified/i.test(message)) {
      mem.documentsUploaded = ["aadhaar", "pan", "salary_slip"]
      mem.stage = "underwriting"
      
      return NextResponse.json({
        reply: reply + "\n\n🔍 Documents verified! Running final credit evaluation...",
        nextStage: "underwriting",
        agentTransition: "Routing to Underwriting Agent"
      })
    }

    return NextResponse.json({ 
      reply,
      verificationDocs: getVerificationDocs()
    })
  }

  // ============================================
  // STAGE 5: UNDERWRITING
  // ============================================
  if (mem.stage === "underwriting") {
    const user = mem.userProfile!
    const creditScore = user.creditScore
    const preApprovedLimit = user.preApprovedLimit
    
    // Policy checks (FIXED)
    const ruleCheck1 = mem.amount! <= preApprovedLimit // Instant approval
    const ruleCheck2 = mem.amount! <= (2 * preApprovedLimit) // Within 2x limit
    const ruleCheck3 = creditScore >= 700 // Min credit score
    const ruleCheck4 = mem.finalEMI! <= (user.salary * 0.5) // EMI < 50% salary

    let approved = false
    let rejectionReason = ""

    if (!ruleCheck3) {
      rejectionReason = "Credit score below minimum threshold (700)"
    } else if (!ruleCheck2) {
      rejectionReason = "Requested amount exceeds 2x pre-approved limit"
    } else if (!ruleCheck4) {
      rejectionReason = "EMI exceeds 50% of monthly salary"
    } else {
      approved = true // All checks passed
    }

    if (approved) {
      mem.stage = "sanctioned"
      
      const pdfData = await generateSanctionPDF({
        loanId: `TCAP${Date.now()}`,
        userName: mem.userName!,
        amount: mem.amount!,
        tenure: mem.finalTenure!,
        emi: mem.finalEMI!,
        interestRate: mem.interestRate!
      })

      const reply = `🎉 Congratulations, ${mem.userName}!\n\nYour loan has been APPROVED!\n\n✅ Loan Amount: ₹${(mem.amount!/100000).toFixed(1)} lakhs\n✅ Monthly EMI: ₹${Math.round(mem.finalEMI!)}\n✅ Tenure: ${mem.finalTenure} months (${Math.floor(mem.finalTenure!/12)} years)\n✅ Interest Rate: ${mem.interestRate}% p.a.\n\nYour Sanction Letter is ready! The loan will be disbursed within 24-48 hours.`

      mem.conversationHistory.push({ role: "assistant", content: reply })

      return NextResponse.json({
        reply,
        nextStage: "sanctioned",
        offerLetter: {
          fileName: `Sanction_Letter_${mem.userName}.pdf`,
          contentBase64: pdfData
        },
        agentTransition: "Loan Sanctioned ✅"
      })
    } else {
      const reply = `We're sorry, ${mem.userName}.\n\nBased on our policy evaluation, we cannot approve this loan at this time.\n\n❌ Reason: ${rejectionReason}\n\nPlease contact our support team at 1800-209-9191 for alternative options.`
      
      mem.conversationHistory.push({ role: "assistant", content: reply })

      return NextResponse.json({
        reply,
        stage: "rejected",
        rejectionReason
      })
    }
  }

  return NextResponse.json({
    reply: "I'm here to help! How can I assist you?"
  })
}

function getVerificationDocs() {
  return [
    {
      id: "aadhaar",
      label: "Aadhaar Card",
      required: true,
      allowedTypes: ["image/jpeg", "image/png", "application/pdf"],
      uploaded: false
    },
    {
      id: "pan",
      label: "PAN Card",
      required: true,
      allowedTypes: ["image/jpeg", "image/png"],
      uploaded: false
    },
    {
      id: "salary_slip",
      label: "Latest Salary Slip",
      required: true,
      allowedTypes: ["application/pdf"],
      uploaded: false
    }
  ]
}