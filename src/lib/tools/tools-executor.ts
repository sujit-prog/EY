// src/lib/tool-executor.ts

import { 
  ToolResult,
  Customer,
  KYCData,
  CreditData,
  LoanApplication
} from '@/types';
import { getCustomerById, getKYCData, updateKYCStatus } from '@/lib/mocks/kyc-data';
import { getCreditData, calculateCreditRisk } from '@/lib/mocks/credit-data';
import { getLoanRule, validateLoanEligibility, calculateMaxLoanAmount } from '@/lib/mocks/loan-rules';

/**
 * Tool Executor
 * - runTool executes named tools provided by different agents
 * - This file is typed and safe to paste into a TypeScript Next/Node project
 */

// Simple in-memory storage for loan applications
const loanApplications: Map<string, LoanApplication> = new Map();
let applicationCounter = 1;

export async function runTool(
  toolName: string,
  toolInput: Record<string, any>,
  agentName: string
): Promise<ToolResult> {
  console.log(`[Tool Executor] Running tool: ${toolName} for agent: ${agentName}`);
  console.log(`[Tool Executor] Input:`, toolInput);

  try {
    let result: any;

    switch (toolName) {
      // SALES AGENT TOOLS
      case 'get_customer_info':
        result = await getCustomerInfo(toolInput as { customer_id: string });
        break;

      case 'create_loan_application':
        result = await createLoanApplication(toolInput as {
          customer_id: string;
          loan_type: string;
          loan_amount: number;
          tenure: number;
          purpose: string;
        });
        break;

      case 'get_loan_products':
        result = await getLoanProducts(toolInput as { loan_type?: string });
        break;

      // VERIFICATION AGENT TOOLS
      case 'get_kyc_status':
        result = await getKYCStatus(toolInput as { customer_id: string });
        break;

      case 'verify_documents':
        result = await verifyDocuments(toolInput as { customer_id: string; document_type: string });
        break;

      case 'initiate_video_kyc':
        result = await initiateVideoKYC(toolInput as { customer_id: string });
        break;

      // UNDERWRITING AGENT TOOLS
      case 'get_credit_report':
        result = await getCreditReport(toolInput as { customer_id: string; bureau?: string });
        break;

      case 'check_loan_eligibility':
        result = await checkLoanEligibility(toolInput as {
          customer_id: string;
          loan_type: string;
          loan_amount: number;
        });
        break;

      case 'calculate_risk_score':
        result = await calculateRiskScore(toolInput as { customer_id: string; application_id?: string });
        break;

      // SANCTION AGENT TOOLS
      case 'generate_loan_offer':
        result = await generateLoanOffer(toolInput as {
          application_id: string;
          approved_amount: number;
          interest_rate: number;
          tenure: number;
        });
        break;

      case 'send_sanction_letter':
        result = await sendSanctionLetter(toolInput as {
          customer_id: string;
          application_id: string;
          delivery_method: string;
        });
        break;

      case 'schedule_disbursement':
        result = await scheduleDisbursement(toolInput as {
          application_id: string;
          account_number: string;
          disbursement_date?: string;
        });
        break;

      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }

    return {
      success: true,
      data: result,
      agentName,
      toolName
    };
  } catch (error: any) {
    console.error(`[Tool Executor] Error in ${toolName}:`, error);
    return {
      success: false,
      error: error?.message ?? String(error),
      agentName,
      toolName
    };
  }
}

/* =========================
   SALES AGENT TOOL IMPLEMENTATIONS
   ========================= */

async function getCustomerInfo(input: { customer_id: string }): Promise<Customer> {
  const customer = getCustomerById(input.customer_id);
  if (!customer) {
    throw new Error(`Customer ${input.customer_id} not found`);
  }
  return customer;
}

async function createLoanApplication(input: {
  customer_id: string;
  loan_type: string;
  loan_amount: number;
  tenure: number;
  purpose: string;
}): Promise<LoanApplication> {
  const customer = getCustomerById(input.customer_id);
  if (!customer) {
    throw new Error(`Customer ${input.customer_id} not found`);
  }

  const applicationId = `APP${String(applicationCounter++).padStart(5, '0')}`;
  const now = new Date().toISOString();
  const application: LoanApplication = {
    applicationId,
    customerId: input.customer_id,
    loanType: input.loan_type as any,
    loanAmount: input.loan_amount,
    tenure: input.tenure,
    purpose: input.purpose,
    status: 'initiated',
    createdAt: now,
    updatedAt: now
  };

  loanApplications.set(applicationId, application);
  return application;
}

async function getLoanProducts(input: { loan_type?: string }): Promise<Record<string, any>> {
  const products = {
    personal: {
      name: 'Personal Loan',
      interestRate: '10.5% - 18%',
      maxAmount: '₹15,00,000',
      tenure: '12-60 months',
      processingFee: '1-2% of loan amount',
      features: ['No collateral required', 'Quick approval', 'Flexible tenure']
    },
    home: {
      name: 'Home Loan',
      interestRate: '8.5% - 11%',
      maxAmount: '₹5,00,00,000',
      tenure: '60-360 months',
      processingFee: '0.5% of loan amount',
      features: ['Tax benefits', 'Long tenure', 'Balance transfer available']
    },
    auto: {
      name: 'Auto Loan',
      interestRate: '9% - 14%',
      maxAmount: '₹50,00,000',
      tenure: '12-84 months',
      processingFee: '2% of loan amount',
      features: ['Up to 85% financing', 'Fast approval', 'New and used vehicles']
    },
    business: {
      name: 'Business Loan',
      interestRate: '11% - 20%',
      maxAmount: '₹1,00,00,000',
      tenure: '12-60 months',
      processingFee: '2-3% of loan amount',
      features: ['Working capital support', 'Flexible repayment', 'Collateral or non-collateral']
    }
  };

  const loanType = input?.loan_type;
  if (loanType && loanType !== 'all') {
    const key = loanType as keyof typeof products;
    const product = products[key];
    if (!product) throw new Error(`Loan product ${loanType} not found`);
    return { [loanType]: product };
  }
  return products;
}

/* =========================
   VERIFICATION AGENT TOOL IMPLEMENTATIONS
   ========================= */

async function getKYCStatus(input: { customer_id: string }): Promise<KYCData> {
  const kycData = getKYCData(input.customer_id);
  if (!kycData) {
    throw new Error(`KYC data not found for customer ${input.customer_id}`);
  }
  return kycData;
}

async function verifyDocuments(input: { customer_id: string; document_type: string }): Promise<Record<string, any>> {
  const kycData = getKYCData(input.customer_id);
  if (!kycData) {
    throw new Error(`KYC data not found for customer ${input.customer_id}`);
  }

  const verificationResult: Record<string, any> = {
    customer_id: input.customer_id,
    document_type: input.document_type,
    timestamp: new Date().toISOString()
  };

  if (input.document_type === 'all') {
    verificationResult.pan_verified = kycData.panVerified;
    verificationResult.aadhaar_verified = kycData.aadhaarVerified;
    verificationResult.address_verified = kycData.addressVerified;
    verificationResult.all_verified = kycData.panVerified && kycData.aadhaarVerified && kycData.addressVerified;
  } else {
    const fieldMap: Record<string, keyof KYCData> = {
      pan: 'panVerified',
      aadhaar: 'aadhaarVerified',
      address: 'addressVerified'
    };

    const fieldKey = fieldMap[input.document_type];
    if (!fieldKey) {
      throw new Error(`Unknown document type: ${input.document_type}`);
    }
    verificationResult.verified = Boolean(kycData[fieldKey]);
  }

  return verificationResult;
}

async function initiateVideoKYC(input: { customer_id: string }): Promise<Record<string, any>> {
  const customer = getCustomerById(input.customer_id);
  if (!customer) {
    throw new Error(`Customer ${input.customer_id} not found`);
  }

  return {
    customer_id: input.customer_id,
    video_kyc_session_id: `VKYC_${Date.now()}`,
    status: 'scheduled',
    scheduled_time: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
    meeting_link: `https://videokyc.example.com/session/${input.customer_id}`,
    instructions: 'Please keep your PAN card and Aadhaar card ready for the video KYC session'
  };
}

/* =========================
   UNDERWRITING AGENT TOOL IMPLEMENTATIONS
   ========================= */

async function getCreditReport(input: { customer_id: string; bureau?: string }): Promise<Record<string, any>> {
  const creditData = getCreditData(input.customer_id);
  if (!creditData) {
    throw new Error(`Credit data not found for customer ${input.customer_id}`);
  }

  const riskCategory = calculateCreditRisk(
    creditData.creditScore,
    creditData.existingLoans,
    creditData.latePayments
  );

  return {
    ...creditData,
    risk_category: riskCategory,
    report_date: new Date().toISOString()
  };
}

async function checkLoanEligibility(input: {
  customer_id: string;
  loan_type: string;
  loan_amount: number;
}): Promise<Record<string, any>> {
  const customer = getCustomerById(input.customer_id);
  if (!customer) {
    throw new Error(`Customer ${input.customer_id} not found`);
  }

  const creditData = getCreditData(input.customer_id);
  if (!creditData) {
    throw new Error(`Credit data not found for customer ${input.customer_id}`);
  }

  // Calculate age
  const dob = new Date(customer.dob);
  const age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));

  const eligibility = validateLoanEligibility(
    input.loan_type,
    creditData.creditScore,
    customer.monthlyIncome,
    age,
    creditData.existingLoans,
    customer.employmentType
  );

  const maxLoanAmount = calculateMaxLoanAmount(
    input.loan_type,
    customer.monthlyIncome,
    creditData.creditScore,
    creditData.totalOutstanding
  );

  return {
    customer_id: input.customer_id,
    loan_type: input.loan_type,
    requested_amount: input.loan_amount,
    eligible: eligibility.eligible && input.loan_amount <= maxLoanAmount,
    max_eligible_amount: maxLoanAmount,
    eligibility_reasons: eligibility.reasons,
    credit_score: creditData.creditScore,
    monthly_income: customer.monthlyIncome,
    existing_obligations: creditData.totalOutstanding
  };
}

async function calculateRiskScore(input: { customer_id: string; application_id?: string }): Promise<Record<string, any>> {
  const customer = getCustomerById(input.customer_id);
  if (!customer) {
    throw new Error(`Customer ${input.customer_id} not found`);
  }

  const creditData = getCreditData(input.customer_id);
  if (!creditData) {
    throw new Error(`Credit data not found for customer ${input.customer_id}`);
  }

  // Risk scoring algorithm
  let riskScore = 100;

  // Credit score component (40% weight)
  if (creditData.creditScore >= 750) riskScore -= 0;
  else if (creditData.creditScore >= 700) riskScore -= 10;
  else if (creditData.creditScore >= 650) riskScore -= 20;
  else riskScore -= 40;

  // Existing loans component (20% weight)
  riskScore -= creditData.existingLoans * 5;

  // Late payments component (20% weight)
  riskScore -= creditData.latePayments * 10;

  // Credit utilization component (10% weight)
  if (creditData.creditUtilization > 70) riskScore -= 10;
  else if (creditData.creditUtilization > 50) riskScore -= 5;

  // Income stability component (10% weight)
  if (customer.employmentType === 'salaried' && customer.yearsInJob && customer.yearsInJob >= 3) {
    riskScore -= 0;
  } else {
    riskScore -= 10;
  }

  riskScore = Math.max(0, Math.min(100, riskScore));

  let riskCategory: 'LOW' | 'MEDIUM' | 'HIGH';
  if (riskScore <= 30) riskCategory = 'LOW';
  else if (riskScore <= 60) riskCategory = 'MEDIUM';
  else riskCategory = 'HIGH';

  return {
    customer_id: input.customer_id,
    risk_score: riskScore,
    risk_category: riskCategory,
    components: {
      credit_score_impact: creditData.creditScore,
      existing_loans_impact: creditData.existingLoans,
      late_payments_impact: creditData.latePayments,
      credit_utilization_impact: creditData.creditUtilization
    },
    recommendation: riskScore <= 30 ? 'APPROVE' : riskScore <= 60 ? 'REVIEW' : 'REJECT'
  };
}

/* =========================
   SANCTION AGENT TOOL IMPLEMENTATIONS
   ========================= */

async function generateLoanOffer(input: {
  application_id: string;
  approved_amount: number;
  interest_rate: number;
  tenure: number;
}): Promise<Record<string, any>> {
  const application = loanApplications.get(input.application_id);
  if (!application) {
    throw new Error(`Application ${input.application_id} not found`);
  }

  const monthlyRate = input.interest_rate / 12 / 100;
  const emi =
    input.approved_amount *
    monthlyRate *
    Math.pow(1 + monthlyRate, input.tenure) /
    (Math.pow(1 + monthlyRate, input.tenure) - 1);

  const totalPayment = emi * input.tenure;
  const totalInterest = totalPayment - input.approved_amount;

  return {
    application_id: input.application_id,
    offer_id: `OFFER_${Date.now()}`,
    approved_amount: input.approved_amount,
    interest_rate: input.interest_rate,
    tenure: input.tenure,
    monthly_emi: Math.round(emi),
    total_interest: Math.round(totalInterest),
    total_payment: Math.round(totalPayment),
    processing_fee: Math.round(input.approved_amount * 0.02),
    offer_valid_till: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    terms_and_conditions: [
      'This offer is valid for 7 days from the date of generation',
      'Processing fee is non-refundable',
      'Subject to final documentation and verification',
      'Interest rate is subject to change based on policy updates'
    ]
  };
}

async function sendSanctionLetter(input: {
  customer_id: string;
  application_id: string;
  delivery_method: 'email' | 'sms' | 'both' | string;
}): Promise<Record<string, any>> {
  const customer = getCustomerById(input.customer_id);
  if (!customer) {
    throw new Error(`Customer ${input.customer_id} not found`);
  }

  const application = loanApplications.get(input.application_id);
  if (!application) {
    throw new Error(`Application ${input.application_id} not found`);
  }

  const deliveryStatus: Record<string, any> = {
    application_id: input.application_id,
    customer_id: input.customer_id,
    sent_at: new Date().toISOString()
  };

  if (input.delivery_method === 'email' || input.delivery_method === 'both') {
    deliveryStatus.email_sent = true;
    deliveryStatus.email_address = customer.email;
  }

  if (input.delivery_method === 'sms' || input.delivery_method === 'both') {
    deliveryStatus.sms_sent = true;
    deliveryStatus.phone_number = customer.phone;
  }

  deliveryStatus.message = `Sanction letter sent successfully via ${input.delivery_method}`;

  return deliveryStatus;
}

async function scheduleDisbursement(input: {
  application_id: string;
  account_number: string;
  disbursement_date?: string;
}): Promise<Record<string, any>> {
  const application = loanApplications.get(input.application_id);
  if (!application) {
    throw new Error(`Application ${input.application_id} not found`);
  }

  const disbursementDate =
    input.disbursement_date ||
    new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return {
    application_id: input.application_id,
    disbursement_id: `DISB_${Date.now()}`,
    account_number: input.account_number,
    amount: application.loanAmount,
    scheduled_date: disbursementDate,
    status: 'scheduled',
    processing_time: '1-2 business days',
    disbursement_method: 'NEFT/RTGS',
    message: 'Disbursement scheduled successfully. Funds will be credited to your account.'
  };
}
