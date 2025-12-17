import { UserProfile } from "./users"

export function calculateExistingEMIBurden(user: UserProfile): number {
  return user.previousLoans.reduce(
    (sum, loan) => sum + loan.monthlyEMI,
    0
  )
}
