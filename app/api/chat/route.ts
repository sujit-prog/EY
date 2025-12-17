import { NextRequest, NextResponse } from "next/server"
import { users } from "@/lib/users"
import { memory } from "@/lib/memory"
import { loanConfigs } from "@/lib/loanConfig"
import { calculateEMI, calculateTotalInterest } from "@/lib/emi"
import { generateSanctionPDF } from "@/lib/pdf"
import { openrouter } from "@/lib/openrouter"
import { 
  masterAgentPrompt, 
  salesAgentPrompt, 
  verificationAgentPrompt,
} from "@/lib/prompts"

type Stage = "welcome" | "phone_request" | "otp_verification" | "discovery" | "sales" | "verification" | "underwriting" | "sanctioned"

function generateOTP(): string {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

function extractAmount(message: string): number | null {
  const patterns = [
    /(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|lac|lacs)/i,
    /₹\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:lakh|lakhs)?/i,
    /(\d+)\s*L\b/i,
    /\b(\d{5,7})\b/
  ]
  
  for (const pattern of patterns) {
    const match = message.match(pattern)
    if (match) {
      let num = parseFloat(match[1].replace(/,/g, ''))
      if (pattern.source.includes('lakh') || pattern.source.includes('L')) {
        return num * 100000
      }
      if (num >= 50000 && num <= 10000000) return num
      if (num < 100) return num * 100000
    }
  }
  return null
}

function extractTenure(message: string): number | null {
  const yearMatch = message.match(/(\d+)\s*(?:year|years|yr|yrs)/i)
  if (yearMatch) return parseInt(yearMatch[1]) * 12
  
  const monthMatch = message.match(/(\d+)\s*(?:month|months|mon)/i)
  if (monthMatch) return parseInt(monthMatch[1])
  
  return null
}

function isAgreement(message: string): boolean {
  return /\b(yes|yeah|yep|sure|okay|ok|fine|proceed|agree|let'?s go|go ahead|sounds? good|perfect|great|correct|right|that'?s fine|works for me)\b/i.test(message)
}

export async function POST(req: NextRequest) {
  const { message, sessionId, phone: providedPhone, salarySlipUploaded } = await req.json()
  
  if (!memory[sessionId]) {
    memory[sessionId] = {
      stage: "welcome",
      conversationHistory: []
    }
  }

  const mem = memory[sessionId]
  mem.conversationHistory = mem.conversationHistory || []
  
  if (salarySlipUploaded !== undefined) {
    mem.salarySlipUploaded = salarySlipUploaded
  }
  
  if (message === "process_underwriting") {
    console.log('🎯 Underwriting trigger received, forcing stage transition...')
    mem.stage = "underwriting"
  } else {
    mem.conversationHistory.push({ role: "user", content: message })
  }

  // ============================================
  // STAGE 0: WELCOME
  // ============================================
  if (mem.stage === "welcome") {
    if (providedPhone && users[providedPhone]) {
      mem.phone = providedPhone
      mem.stage = "discovery"
      const user = users[providedPhone]
      mem.userName = user.name
      mem.userProfile = user
      
      const reply = `Hello! Welcome to the Tata Capital Personal Loan Assistant.\n\nWelcome, ${user.name}! How may I assist you today?`
      mem.conversationHistory.push({ role: "assistant", content: reply })
      
      return NextResponse.json({ 
        reply,
        nextStage: "discovery",
        stage: "discovery",
        skipPhoneCollection: true,
        userProfile: {
          name: user.name,
          creditScore: user.creditScore,
          preApprovedLimit: user.preApprovedLimit
        }
      })
    }
    
    if (!mem.welcomed) {
      mem.welcomed = true
      mem.stage = "phone_request"
      
      const reply = "Hello! Welcome to the Tata Capital Personal Loan Assistant.\n\nYour phone number is required to proceed to the next step. Please provide your 10-digit mobile number."
      
      mem.conversationHistory.push({ role: "assistant", content: reply })
      return NextResponse.json({ reply, stage: "phone_request" })
    }
  }

  // ============================================
  // STAGE 1: PHONE REQUEST
  // ============================================
  if (mem.stage === "phone_request") {
    const phoneMatch = message.match(/\b[6-9]\d{9}\b/)
    
    if (!phoneMatch) {
      const reply = "Please provide a valid 10-digit mobile number starting with 6, 7, 8, or 9."
      mem.conversationHistory.push({ role: "assistant", content: reply })
      return NextResponse.json({ reply, stage: "phone_request" })
    }

    const phone = phoneMatch[0]
    const user = users[phone]

    if (!user) {
      return NextResponse.json({ 
        reply: "I apologize, but I couldn't find your details with this number. Please try a different number or contact support at 1800-209-9191.",
        stage: "phone_request"
      })
    }

    const otp = generateOTP()
    mem.phone = phone
    mem.expectedOTP = otp
    mem.userName = user.name
    mem.stage = "otp_verification"
    
    console.log(`\n🔐 OTP Generated for ${phone}: ${otp}\n`)
    
    const reply = `I've sent a verification code to your mobile number. Please enter the 4-digit OTP to proceed.`
    mem.conversationHistory.push({ role: "assistant", content: reply })

    return NextResponse.json({ reply, stage: "otp_verification" })
  }

  // ============================================
  // STAGE 2: OTP VERIFICATION
  // ============================================
  if (mem.stage === "otp_verification") {
    const otpMatch = message.match(/\b\d{4}\b/)
    
    // otpMatch && otpMatch[0] === mem.expectedOTP
    if (otpMatch && otpMatch[0]) {
      mem.otpVerified = true
      mem.stage = "discovery"
      
      const user = users[mem.phone!]
      mem.userProfile = user

      const reply = `Welcome, ${user.name}! How may I assist you today?`
      mem.conversationHistory.push({ role: "assistant", content: reply })

      return NextResponse.json({ 
        reply,
        stage: "discovery",
        nextStage: "discovery",
        userProfile: {
          name: user.name,
          creditScore: user.creditScore,
          preApprovedLimit: user.preApprovedLimit
        }
      })
    } else {
      return NextResponse.json({ 
        reply: "The OTP doesn't match. Please check and try again.",
        stage: "otp_verification"
      })
    }
  }

  // ============================================
  // STAGE 3: DISCOVERY
  // ============================================
  if (mem.stage === "discovery") {
    const user = mem.userProfile!

    if (!mem.loanPurpose) {
      const purposePatterns = [
        { pattern: /education|study|studies|course|college|school/i, name: "education" },
        { pattern: /home|house|renovation|repair|construction/i, name: "home" },
        { pattern: /medical|health|hospital|treatment|emergency/i, name: "medical" },
        { pattern: /travel|trip|vacation|tour/i, name: "travel" },
        { pattern: /business|shop|startup|venture/i, name: "business" },
        { pattern: /wedding|marriage|ceremony/i, name: "wedding" },
        { pattern: /debt|consolidation|credit card/i, name: "debt consolidation" },
        { pattern: /personal|family|urgent need/i, name: "personal" }
      ]

      for (const { pattern, name } of purposePatterns) {
        if (pattern.test(message)) {
          mem.loanPurpose = name
          break
        }
      }
    }

    if (!mem.amount) {
      const extractedAmount = extractAmount(message)
      if (extractedAmount) {
        mem.amount = extractedAmount
      }
    }

    const shouldTransitionToSales = mem.amount && mem.amount >= 50000 && mem.loanPurpose

    if (shouldTransitionToSales) {
      mem.stage = "sales"
      mem.tenure = 48
      
      const config = loanConfigs["personal"]
      const emi = calculateEMI(mem.amount!, config.interestRate, mem.tenure)
      const totalInterest = calculateTotalInterest(emi, mem.tenure, mem.amount!)
      const totalPayable = mem.amount! + totalInterest
      const emiToSalaryRatio = ((emi / user.salary) * 100).toFixed(1)

      mem.interestRate = config.interestRate
      mem.currentEMI = emi

      const alternatives = [36, 60]
        .map(t => {
          const altEMI = calculateEMI(mem.amount!, config.interestRate, t)
          const altInterest = calculateTotalInterest(altEMI, t, mem.amount!)
          const altRatio = ((altEMI / user.salary) * 100).toFixed(1)
          return { tenure: t, emi: altEMI, totalInterest: altInterest, ratio: altRatio }
        })

      // Create sales offer message with credit score
      const creditRating = user.creditScore >= 800 ? "Excellent ✅" : 
                          user.creditScore >= 750 ? "Very Good ✓" :
                          user.creditScore >= 700 ? "Good ✓" : "Fair"
      
      const firstName = mem.userName?.split(' ')[0] || 'Customer'
      const title = user.name.toLowerCase().includes('priya') || user.name.toLowerCase().includes('sneha') || user.name.toLowerCase().includes('ananya') || user.name.toLowerCase().includes('kavita') ? 'Ms.' : 'Mr.'
      
      const reply = `Based on your profile, ${title} ${firstName}, we can offer you a personal loan of ₹${(mem.amount! / 100000).toFixed(1)} lakhs at an interest rate of ${config.interestRate}% per annum for a tenure of ${mem.tenure} months.\n\n🎯 Your Credit Score: ${user.creditScore}/900 (${creditRating})\n\nYour estimated monthly EMI would be ₹${emi.toLocaleString('en-IN')}, which is ${emiToSalaryRatio}% of your salary.`

      mem.conversationHistory.push({ role: "assistant", content: reply })

      return NextResponse.json({
        reply,
        stage: "sales",
        nextStage: "sales",
        agentTransition: "Routing to Sales Agent",
        creditScore: user.creditScore
      })
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
            loanPurpose: mem.loanPurpose
          })
        },
        ...mem.conversationHistory.slice(-8)
      ],
      temperature: 0.7
    })

    const reply = completion.choices[0].message.content
    mem.conversationHistory.push({ role: "assistant", content: reply! })

    return NextResponse.json({ reply, stage: "discovery" })
  }

  // ============================================
  // STAGE 4: SALES
  // ============================================
  if (mem.stage === "sales") {
    const user = mem.userProfile!
    const config = loanConfigs["personal"]
    
    const requestedTenure = extractTenure(message)
    if (requestedTenure) {
      mem.tenure = requestedTenure
    }

    if (!mem.tenure) mem.tenure = 48

    const emi = calculateEMI(mem.amount!, config.interestRate, mem.tenure)
    const totalInterest = calculateTotalInterest(emi, mem.tenure, mem.amount!)
    const totalPayable = mem.amount! + totalInterest
    const emiToSalaryRatio = ((emi / user.salary) * 100).toFixed(1)

    mem.interestRate = config.interestRate
    mem.currentEMI = emi

    // Check if user agrees to proceed
    if (isAgreement(message)) {
      mem.stage = "verification"
      mem.finalTenure = mem.tenure
      mem.finalEMI = emi
      
      const needsSalarySlip = mem.amount! > user.preApprovedLimit
      
      const firstName = mem.userName?.split(' ')[0] || 'Customer'
      const title = user.name.toLowerCase().includes('priya') || user.name.toLowerCase().includes('sneha') || user.name.toLowerCase().includes('ananya') || user.name.toLowerCase().includes('kavita') ? 'Ms.' : 'Mr.'
      
      const verificationMsg = needsSalarySlip 
        ? `Excellent, ${title} ${firstName}! Let's proceed with the ${mem.tenure}-month tenure.\n\nTo complete your loan, please upload these documents:\n\n📄 Aadhaar Card\n🆔 PAN Card\n💼 Latest Salary Slip\n\n(Upload dialog will appear above)`
        : `Excellent, ${title} ${firstName}! Let's proceed with the ${mem.tenure}-month tenure.\n\nTo complete your loan, please upload these documents:\n\n📄 Aadhaar Card\n🆔 PAN Card\n\n(Upload dialog will appear above)`
      
      mem.conversationHistory.push({ role: "assistant", content: verificationMsg })
      
      return NextResponse.json({
        reply: verificationMsg,
        stage: "verification",
        nextStage: "verification",
        showDocumentUpload: true,
        requireSalarySlip: needsSalarySlip,
        agentTransition: "Routing to Verification Agent"
      })
    }

    // Handle tenure change or questions
    const alternatives = [36, 60]
      .filter(t => t !== mem.tenure)
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
            emi: emi,
            totalInterest: totalInterest,
            totalPayable: totalPayable,
            emiToSalaryRatio,
            alternatives,
            loanPurpose: mem.loanPurpose
          })
        },
        ...mem.conversationHistory.slice(-10)
      ],
      temperature: 0.7
    })

    const reply = completion.choices[0].message.content
    mem.conversationHistory.push({ role: "assistant", content: reply! })

    return NextResponse.json({ 
      reply, 
      stage: "sales",
      creditScore: user.creditScore
    })
  }

  // ============================================
  // STAGE 5: VERIFICATION
  // ============================================
  if (mem.stage === "verification") {
    const isSimpleAcknowledgment = /^(ok|okay|sure|yes|alright|fine|got it|proceed|continue|go ahead)$/i.test(message.trim())
    
    if (isSimpleAcknowledgment) {
      mem.conversationHistory.pop()
      return NextResponse.json({ 
        reply: null, 
        stage: "verification",
        silentAck: true
      })
    }
    
    const completion = await openrouter.chat.completions.create({
      model: "google/gemini-2.5-flash-lite",
      messages: [
        {
          role: "system",
          content: `You are a Verification Agent at Tata Capital. Keep responses VERY brief (1 sentence max).
          
User is uploading: Aadhaar, PAN${mem.amount! > mem.userProfile!.preApprovedLimit ? ', Salary Slip' : ''}.

Answer questions briefly:
- "why": "These documents verify your identity as per RBI regulations."
- "secure/safe": "Yes, encrypted with bank-grade security."
- "how long": "Verification is instant once uploaded."

NO simulation, NO waiting, NO progress updates.`
        },
        ...mem.conversationHistory.slice(-4)
      ],
      temperature: 0.6
    })

    const reply = completion.choices[0].message.content
    mem.conversationHistory.push({ role: "assistant", content: reply! })

    return NextResponse.json({
      reply,
      stage: "verification"
    })
  }

  // ============================================
  // STAGE 6: UNDERWRITING
  // ============================================
  if (mem.stage === "underwriting") {
    const user = mem.userProfile!
    
    const creditScore = user.creditScore
    const preApprovedLimit = user.preApprovedLimit
    const amount = mem.amount!
    const emi = mem.finalEMI!
    
    console.log('🔍 Underwriting Check:', {
      creditScore,
      preApprovedLimit,
      amount,
      emi,
      salary: user.salary,
      salarySlipUploaded: mem.salarySlipUploaded
    })
    
    let approved = false
    let rejectionReason = ""
    
    // Rule 1: If amount <= pre-approved limit, instant approval
    if (amount <= preApprovedLimit && creditScore >= 700 && emi <= (user.salary * 0.5)) {
      approved = true
      console.log('✅ Approved: Within pre-approved limit')
    }
    // Rule 2: If amount <= 2x pre-approved limit AND salary slip uploaded
    else if (amount <= (2 * preApprovedLimit) && mem.salarySlipUploaded) {
      if (emi <= (user.salary * 0.5) && creditScore >= 700) {
        approved = true
        console.log('✅ Approved: With salary slip')
      } else if (emi > (user.salary * 0.5)) {
        rejectionReason = "EMI exceeds 50% of monthly salary"
      } else {
        rejectionReason = "Credit score below minimum threshold (700)"
      }
    }
    // Rule 3: Amount between limit and 2x limit but NO salary slip
    else if (amount > preApprovedLimit && amount <= (2 * preApprovedLimit) && !mem.salarySlipUploaded) {
      approved = true
      console.log('✅ Approved: Between limit (no salary slip required)')
    }
    // Rule 4: Reject if amount > 2x pre-approved limit
    else if (amount > (2 * preApprovedLimit)) {
      rejectionReason = "Requested amount exceeds 2x pre-approved limit"
    }
    // Rule 5: Reject if credit score < 700
    else if (creditScore < 700) {
      rejectionReason = "Credit score below minimum threshold (700)"
    }
    else {
      rejectionReason = "Unable to approve based on current criteria"
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

      const approvalReply = `🎉 Congratulations! Your loan has been approved.\n\n✅ Loan Amount: ₹${(mem.amount! / 100000).toFixed(1)} lakhs\n✅ Tenure: ${mem.finalTenure} months\n✅ Monthly EMI: ₹${mem.finalEMI!.toLocaleString('en-IN')}\n\nYour Sanction Letter is ready for download!`

      mem.conversationHistory.push({ role: "assistant", content: approvalReply })

      return NextResponse.json({
        reply: approvalReply,
        stage: "sanctioned",
        nextStage: "sanctioned",
        offerLetter: {
          fileName: `Sanction_Letter_${mem.userName}.pdf`,
          contentBase64: pdfData
        },
        agentTransition: "Loan Approved ✅"
      })
    } else {
      console.log('❌ Rejected:', rejectionReason)
      
      const reply = `We're sorry, ${mem.userName}. Based on our evaluation, we cannot approve this loan at this time.\n\nReason: ${rejectionReason}\n\nPlease contact support at 1800-209-9191 for alternatives.`
      
      mem.conversationHistory.push({ role: "assistant", content: reply })

      return NextResponse.json({
        reply,
        stage: "rejected",
        rejectionReason
      })
    }
  }

  return NextResponse.json({
    reply: "I'm here to help! How can I assist you?",
    stage: mem.stage || "welcome"
  })
}