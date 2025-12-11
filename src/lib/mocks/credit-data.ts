import { CreditData } from '@/types';

export const mockCreditData: Record<string, CreditData> = {
  'CUST001': {
    customerId: 'CUST001',
    creditScore: 750,
    bureau: 'CIBIL',
    existingLoans: 1,
    totalOutstanding: 250000,
    latePayments: 0,
    creditUtilization: 35,
    inquiriesLast6Months: 2,
    oldestAccount: '2015-06-01'
  },
  'CUST002': {
    customerId: 'CUST002',
    creditScore: 680,
    bureau: 'CIBIL',
    existingLoans: 2,
    totalOutstanding: 450000,
    latePayments: 1,
    creditUtilization: 55,
    inquiriesLast6Months: 4,
    oldestAccount: '2012-03-15'
  },
  'CUST003': {
    customerId: 'CUST003',
    creditScore: 820,
    bureau: 'CIBIL',
    existingLoans: 0,
    totalOutstanding: 0,
    latePayments: 0,
    creditUtilization: 15,
    inquiriesLast6Months: 1,
    oldestAccount: '2010-09-20'
  }
};

export function getCreditData(customerId: string): CreditData | null {
  return mockCreditData[customerId] || null;
}

export function calculateCreditRisk(creditScore: number, existingLoans: number, latePayments: number): string {
  if (creditScore >= 750 && latePayments === 0 && existingLoans <= 2) {
    return 'LOW';
  } else if (creditScore >= 650 && latePayments <= 2 && existingLoans <= 3) {
    return 'MEDIUM';
  } else {
    return 'HIGH';
  }
}
