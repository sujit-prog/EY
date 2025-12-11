import { LoanRule } from '@/types';

export const loanRules: Record<string, LoanRule> = {
  personal: {
    ruleId: 'RULE_PERSONAL_001',
    loanType: 'personal',
    minCreditScore: 650,
    maxLTV: 0,
    minIncome: 25000,
    maxExistingLoans: 3,
    maxAge: 60,
    minAge: 21,
    employmentTypes: ['salaried', 'self-employed']
  },
  home: {
    ruleId: 'RULE_HOME_001',
    loanType: 'home',
    minCreditScore: 700,
    maxLTV: 80,
    minIncome: 40000,
    maxExistingLoans: 2,
    maxAge: 65,
    minAge: 23,
    employmentTypes: ['salaried', 'self-employed', 'business']
  },
  auto: {
    ruleId: 'RULE_AUTO_001',
    loanType: 'auto',
    minCreditScore: 650,
    maxLTV: 85,
    minIncome: 30000,
    maxExistingLoans: 3,
    maxAge: 60,
    minAge: 21,
    employmentTypes: ['salaried', 'self-employed', 'business']
  },
  business: {
    ruleId: 'RULE_BUSINESS_001',
    loanType: 'business',
    minCreditScore: 680,
    maxLTV: 70,
    minIncome: 100000,
    maxExistingLoans: 2,
    maxAge: 65,
    minAge: 25,
    employmentTypes: ['self-employed', 'business']
  }
};

export function getLoanRule(loanType: string): LoanRule | null {
  return loanRules[loanType] || null;
}

export function validateLoanEligibility(
  loanType: string,
  creditScore: number,
  monthlyIncome: number,
  age: number,
  existingLoans: number,
  employmentType: string
): { eligible: boolean; reasons: string[] } {
  const rule = getLoanRule(loanType);
  if (!rule) return { eligible: false, reasons: ['Invalid loan type'] };

  const reasons: string[] = [];

  if (creditScore < rule.minCreditScore)
    reasons.push(`Credit score ${creditScore} is below minimum ${rule.minCreditScore}`);

  if (monthlyIncome < rule.minIncome)
    reasons.push(`Monthly income ₹${monthlyIncome} is below minimum ₹${rule.minIncome}`);

  if (age < rule.minAge || age > rule.maxAge)
    reasons.push(`Age ${age} is outside allowed range ${rule.minAge}-${rule.maxAge}`);

  if (existingLoans > rule.maxExistingLoans)
    reasons.push(`Existing loans ${existingLoans} exceed maximum ${rule.maxExistingLoans}`);

  if (!rule.employmentTypes.includes(employmentType))
    reasons.push(`Employment type ${employmentType} not allowed for ${loanType} loans`);

  return { eligible: reasons.length === 0, reasons };
}

export function calculateMaxLoanAmount(
  loanType: string,
  monthlyIncome: number,
  creditScore: number,
  existingOutstanding: number
): number {
  const rule = getLoanRule(loanType);
  if (!rule) return 0;

  const foir = creditScore >= 750 ? 0.6 : creditScore >= 700 ? 0.55 : 0.5;

  const maxEMI = monthlyIncome * foir - (existingOutstanding * 0.02);

  const interestRate = 0.10 / 12;
  const tenure = loanType === 'home' ? 240 : loanType === 'auto' ? 60 : 48;

  const maxLoan =
    maxEMI *
    ((Math.pow(1 + interestRate, tenure) - 1) /
      (interestRate * Math.pow(1 + interestRate, tenure)));

  return Math.floor(maxLoan / 10000) * 10000;
}
