export type LoanType = "personal" | "home" | "car"

export const loanConfigs: Record<
  LoanType,
  {
    label: string
    interestRate: number
    maxTenure: number
  }
> = {
  personal: {
    label: "Personal Loan",
    interestRate: 12,
    maxTenure: 60
  },
  home: {
    label: "Home Loan",
    interestRate: 8.5,
    maxTenure: 240
  },
  car: {
    label: "Car Loan",
    interestRate: 9.5,
    maxTenure: 84
  }
}