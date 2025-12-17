// lib/pdf.ts
import { PDFDocument, StandardFonts, rgb } from "pdf-lib"

interface SanctionPDFParams {
  loanId: string
  userName: string
  amount: number
  tenure: number
  emi: number
  interestRate: number
}

export async function generateSanctionPDF({
  loanId,
  userName,
  amount,
  tenure,
  emi,
  interestRate
}: SanctionPDFParams) {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595, 842]) // A4 size

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

  // Header
  page.drawText("TATA CAPITAL", {
    x: 50,
    y: 780,
    size: 24,
    font: fontBold,
    color: rgb(0.6, 0, 0.6) // Purple
  })

  page.drawText("LOAN SANCTION LETTER", {
    x: 50,
    y: 755,
    size: 16,
    font: fontBold,
    color: rgb(0.2, 0.2, 0.2)
  })

  // Horizontal line
  page.drawLine({
    start: { x: 50, y: 740 },
    end: { x: 545, y: 740 },
    thickness: 2,
    color: rgb(0.6, 0, 0.6)
  })

  // Loan ID and Date
  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })

  page.drawText(`Loan ID: ${loanId}`, {
    x: 50,
    y: 710,
    size: 10,
    font,
    color: rgb(0.4, 0.4, 0.4)
  })

  page.drawText(`Date: ${currentDate}`, {
    x: 50,
    y: 695,
    size: 10,
    font,
    color: rgb(0.4, 0.4, 0.4)
  })

  // Customer Details Section
  page.drawText("CUSTOMER DETAILS", {
    x: 50,
    y: 660,
    size: 14,
    font: fontBold,
    color: rgb(0.2, 0.2, 0.2)
  })

  page.drawText(`Name: ${userName}`, {
    x: 70,
    y: 635,
    size: 12,
    font
  })

  // Loan Details Section
  page.drawText("LOAN DETAILS", {
    x: 50,
    y: 600,
    size: 14,
    font: fontBold,
    color: rgb(0.2, 0.2, 0.2)
  })

const loanDetails = [
  { label: "Sanctioned Amount:", value: `INR ${amount.toLocaleString('en-IN')}` },
  { label: "Interest Rate:", value: `${interestRate}% per annum` },
  { label: "Loan Tenure:", value: `${tenure} months (${Math.floor(tenure / 12)} years)` },
  { label: "Monthly EMI:", value: `INR ${Math.round(emi).toLocaleString('en-IN')}` },
  { label: "Total Payable:", value: `INR ${Math.round(emi * tenure).toLocaleString('en-IN')}` }
]

  let yPosition = 575
  loanDetails.forEach(detail => {
    page.drawText(detail.label, {
      x: 70,
      y: yPosition,
      size: 11,
      font: fontBold
    })

    page.drawText(detail.value, {
      x: 250,
      y: yPosition,
      size: 11,
      font,
      color: rgb(0, 0.4, 0)
    })

    yPosition -= 25
  })

  // Terms & Conditions
  page.drawText("TERMS & CONDITIONS", {
    x: 50,
    y: yPosition - 20,
    size: 14,
    font: fontBold,
    color: rgb(0.2, 0.2, 0.2)
  })

  const terms = [
    "1. This sanction is valid for 30 days from the date of issue.",
    "2. Disbursement subject to property & document verification.",
    "3. Zero prepayment charges after 6 months.",
    "4. Late payment charges: 2% per month on overdue amount.",
    "5. Please refer to the detailed loan agreement for complete T&C."
  ]

  yPosition -= 45
  terms.forEach(term => {
    page.drawText(term, {
      x: 70,
      y: yPosition,
      size: 9,
      font,
      color: rgb(0.3, 0.3, 0.3)
    })
    yPosition -= 20
  })

  // Footer
  page.drawText("Congratulations on your loan approval!", {
    x: 50,
    y: 120,
    size: 12,
    font: fontBold,
    color: rgb(0, 0.5, 0)
  })

  page.drawText(
    "This is a system-generated sanction letter and does not require a signature.",
    {
      x: 50,
      y: 90,
      size: 9,
      font,
      color: rgb(0.5, 0.5, 0.5)
    }
  )

  page.drawText(
    "For queries, contact: support@tatacapital.com | 1800-209-9191",
    {
      x: 50,
      y: 70,
      size: 9,
      font,
      color: rgb(0.5, 0.5, 0.5)
    }
  )

  // Bottom border
  page.drawLine({
    start: { x: 50, y: 50 },
    end: { x: 545, y: 50 },
    thickness: 1,
    color: rgb(0.6, 0, 0.6)
  })

  const pdfBytes = await pdfDoc.save()
  return Buffer.from(pdfBytes).toString("base64")
}

// Legacy support - simplified signature
export async function generateSanctionPDFSimple(
  name: string,
  amount: number,
  interestRate: number,
  tenure: number
) {
  return generateSanctionPDF({
    loanId: `TCAP${Date.now()}`,
    userName: name,
    amount,
    tenure,
    emi: 0, // Will need to be calculated
    interestRate
  })
}