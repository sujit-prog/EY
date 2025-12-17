export function calculateEMI(
  principal: number,
  annualRate: number,
  months: number
) {
  const r = annualRate / 12 / 100
  return (
    (principal * r * Math.pow(1 + r, months)) /
    (Math.pow(1 + r, months) - 1)
  )
}

export function calculateTotalInterest(
  emi: number,
  months: number,
  principal: number
) {
  return emi * months - principal
}