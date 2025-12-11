import { AgentTool } from '@/types';
export const salesAgentTools: AgentTool[] = [
  {
    name: 'get_customer_info',
    description: 'Retrieve customer basic information by customer ID',
    input_schema: {
      type: 'object',
      properties: {
        customer_id: {
          type: 'string',
          description: 'Unique customer identifier (e.g., CUST001)'
        }
      },
      required: ['customer_id']
    }
  },
  {
    name: 'create_loan_application',
    description: 'Create a new loan application for a customer',
    input_schema: {
      type: 'object',
      properties: {
        customer_id: {
          type: 'string',
          description: 'Customer ID'
        },
        loan_type: {
          type: 'string',
          enum: ['personal', 'home', 'auto', 'business'],
          description: 'Type of loan'
        },
        loan_amount: {
          type: 'number',
          description: 'Requested loan amount in INR'
        },
        tenure: {
          type: 'number',
          description: 'Loan tenure in months'
        },
        purpose: {
          type: 'string',
          description: 'Purpose of the loan'
        }
      },
      required: ['customer_id', 'loan_type', 'loan_amount', 'tenure', 'purpose']
    }
  },
  {
    name: 'get_loan_products',
    description: 'Get available loan products and their features',
    input_schema: {
      type: 'object',
      properties: {
        loan_type: {
          type: 'string',
          enum: ['personal', 'home', 'auto', 'business', 'all'],
          description: 'Filter by loan type or get all'
        }
      },
      required: []
    }
  }
];

// Verification Agent Tools
export const verificationAgentTools: AgentTool[] = [
  {
    name: 'get_kyc_status',
    description: 'Check KYC verification status for a customer',
    input_schema: {
      type: 'object',
      properties: {
        customer_id: {
          type: 'string',
          description: 'Customer ID to check KYC status'
        }
      },
      required: ['customer_id']
    }
  },
  {
    name: 'verify_documents',
    description: 'Verify customer documents (PAN, Aadhaar, etc.)',
    input_schema: {
      type: 'object',
      properties: {
        customer_id: {
          type: 'string',
          description: 'Customer ID'
        },
        document_type: {
          type: 'string',
          enum: ['pan', 'aadhaar', 'address', 'all'],
          description: 'Type of document to verify'
        }
      },
      required: ['customer_id', 'document_type']
    }
  },
  {
    name: 'initiate_video_kyc',
    description: 'Initiate video KYC session for customer',
    input_schema: {
      type: 'object',
      properties: {
        customer_id: {
          type: 'string',
          description: 'Customer ID'
        }
      },
      required: ['customer_id']
    }
  }
];

// Underwriting Agent Tools
export const underwritingAgentTools: AgentTool[] = [
  {
    name: 'get_credit_report',
    description: 'Fetch credit report and score from credit bureau',
    input_schema: {
      type: 'object',
      properties: {
        customer_id: {
          type: 'string',
          description: 'Customer ID'
        },
        bureau: {
          type: 'string',
          enum: ['CIBIL', 'Experian', 'Equifax'],
          description: 'Credit bureau to fetch from'
        }
      },
      required: ['customer_id']
    }
  },
  {
    name: 'check_loan_eligibility',
    description: 'Check if customer is eligible for requested loan based on rules',
    input_schema: {
      type: 'object',
      properties: {
        customer_id: {
          type: 'string',
          description: 'Customer ID'
        },
        application_id: {
          type: 'string',
          description: 'Loan application ID'
        },
        loan_type: {
          type: 'string',
          enum: ['personal', 'home', 'auto', 'business'],
          description: 'Type of loan'
        },
        loan_amount: {
          type: 'number',
          description: 'Requested loan amount'
        }
      },
      required: ['customer_id', 'loan_type', 'loan_amount']
    }
  },
  {
    name: 'calculate_risk_score',
    description: 'Calculate comprehensive risk score for loan application',
    input_schema: {
      type: 'object',
      properties: {
        customer_id: {
          type: 'string',
          description: 'Customer ID'
        },
        application_id: {
          type: 'string',
          description: 'Loan application ID'
        }
      },
      required: ['customer_id']
    }
  }
];

// Sanction Agent Tools
export const sanctionAgentTools: AgentTool[] = [
  {
    name: 'generate_loan_offer',
    description: 'Generate formal loan offer with terms and conditions',
    input_schema: {
      type: 'object',
      properties: {
        application_id: {
          type: 'string',
          description: 'Loan application ID'
        },
        approved_amount: {
          type: 'number',
          description: 'Approved loan amount'
        },
        interest_rate: {
          type: 'number',
          description: 'Interest rate percentage'
        },
        tenure: {
          type: 'number',
          description: 'Loan tenure in months'
        }
      },
      required: ['application_id', 'approved_amount', 'interest_rate', 'tenure']
    }
  },
  {
    name: 'send_sanction_letter',
    description: 'Send sanction letter to customer via email/SMS',
    input_schema: {
      type: 'object',
      properties: {
        customer_id: {
          type: 'string',
          description: 'Customer ID'
        },
        application_id: {
          type: 'string',
          description: 'Loan application ID'
        },
        delivery_method: {
          type: 'string',
          enum: ['email', 'sms', 'both'],
          description: 'How to send the sanction letter'
        }
      },
      required: ['customer_id', 'application_id', 'delivery_method']
    }
  },
  {
    name: 'schedule_disbursement',
    description: 'Schedule loan disbursement after approval',
    input_schema: {
      type: 'object',
      properties: {
        application_id: {
          type: 'string',
          description: 'Loan application ID'
        },
        account_number: {
          type: 'string',
          description: 'Customer bank account for disbursement'
        },
        disbursement_date: {
          type: 'string',
          description: 'Preferred disbursement date (YYYY-MM-DD)'
        }
      },
      required: ['application_id', 'account_number']
    }
  }
];

export const allTools = {
  sales: salesAgentTools,
  verification: verificationAgentTools,
  underwriting: underwritingAgentTools,
  sanction: sanctionAgentTools
};