export interface PreviousLoan {
  loanName: string
  amount: number
  interestRate: number
  tenureMonths: number
  monthlyEMI: number
  pendingInstallments: number
}

export interface UserProfile {
  name: string
  age: number
  location: string
  phone: string
  email?: string
  salary: number
  creditScore: number
  preApprovedLimit: number
  previousLoans: PreviousLoan[]
}

export const users: Record<string, UserProfile> = {
  "9876543210": {
    name: "Rahul Sharma",
    age: 32,
    location: "Bengaluru",
    phone: "9876543210",
    email: "rahul.sharma@gmail.com",
    salary: 75000,
    creditScore: 820,
    preApprovedLimit: 600000,
    previousLoans: []
  },

  "9337236782": {
    name: "Dharmendra Mahanta",
    age: 28,
    location: "Mumbai",
    phone: "9337236782",
    email: "priya.nair@outlook.com",
    salary: 60000,
    creditScore: 780,
    preApprovedLimit: 450000,
    previousLoans: [
      {
        loanName: "Education Loan",
        amount: 300000,
        interestRate: 10.5,
        tenureMonths: 60,
        monthlyEMI: 6400,
        pendingInstallments: 24
      }
    ]
  },

  "9876543212": {
    name: "Amit Patel",
    age: 38,
    location: "Ahmedabad",
    phone: "9876543212",
    email: "amit.patel@yahoo.com",
    salary: 125000,
    creditScore: 850,
    preApprovedLimit: 1000000,
    previousLoans: [
      {
        loanName: "Home Loan",
        amount: 2500000,
        interestRate: 8.5,
        tenureMonths: 240,
        monthlyEMI: 24500,
        pendingInstallments: 180
      }
    ]
  },

  "9876543213": {
    name: "Sneha Reddy",
    age: 26,
    location: "Hyderabad",
    phone: "9876543213",
    email: "sneha.reddy@gmail.com",
    salary: 45000,
    creditScore: 720,
    preApprovedLimit: 250000,
    previousLoans: []
  },

  "9876543214": {
    name: "Vikram Singh",
    age: 35,
    location: "Delhi",
    phone: "9876543214",
    email: "vikram.singh@rediffmail.com",
    salary: 55000,
    creditScore: 650,
    preApprovedLimit: 200000,
    previousLoans: [
      {
        loanName: "Personal Loan",
        amount: 150000,
        interestRate: 14.5,
        tenureMonths: 36,
        monthlyEMI: 5200,
        pendingInstallments: 12
      }
    ]
  },

  "9876543215": {
    name: "Ananya Iyer",
    age: 31,
    location: "Chennai",
    phone: "9876543215",
    email: "ananya.iyer@gmail.com",
    salary: 80000,
    creditScore: 790,
    preApprovedLimit: 500000, // 5 lakhs
    previousLoans: [
      {
        loanName: "Car Loan",
        amount: 400000,
        interestRate: 9.5,
        tenureMonths: 60,
        monthlyEMI: 8400,
        pendingInstallments: 18
      },
      {
        loanName: "Personal Loan",
        amount: 100000,
        interestRate: 12.5,
        tenureMonths: 24,
        monthlyEMI: 4700,
        pendingInstallments: 8
      }
    ]
  },

  "9876543216": {
    name: "Rohan Mehta",
    age: 24,
    location: "Pune",
    phone: "9876543216",
    email: "rohan.mehta@gmail.com",
    salary: 40000,
    creditScore: 750,
    preApprovedLimit: 200000,
    previousLoans: []
  },

  "9876543217": {
    name: "Deepak Kumar",
    age: 42,
    location: "Bengaluru",
    phone: "9876543217",
    email: "deepak.kumar@hotmail.com",
    salary: 150000,
    creditScore: 830,
    preApprovedLimit: 1200000,
    previousLoans: [
      {
        loanName: "Home Loan",
        amount: 3500000,
        interestRate: 8.25,
        tenureMonths: 240,
        monthlyEMI: 30500,
        pendingInstallments: 160
      }
    ]
  },

  "9876543218": {
    name: "Kavita Desai",
    age: 29,
    location: "Surat",
    phone: "9876543218",
    email: "kavita.desai@gmail.com",
    salary: 50000,
    creditScore: 740,
    preApprovedLimit: 300000,
    previousLoans: [
      {
        loanName: "Two Wheeler Loan",
        amount: 80000,
        interestRate: 11.0,
        tenureMonths: 36,
        monthlyEMI: 2600,
        pendingInstallments: 10
      }
    ]
  },

  "9876543219": {
    name: "Arjun Malhotra",
    age: 36,
    location: "Kolkata",
    phone: "9876543219",
    email: "arjun.malhotra@outlook.com",
    salary: 95000,
    creditScore: 810,
    preApprovedLimit: 750000,
    previousLoans: []
  }
}

export function getUserByPhone(phone: string): UserProfile | null {
  return users[phone] || null
}

export function getAllUsers(): UserProfile[] {
  return Object.values(users)
}

export const testScenarios = {
  instantApproval: ["9876543210", "9876543211", "9876543212"],
  salarySlipRequired: ["9876543213", "9876543218"],
  rejection_lowCredit: ["9876543214"],
  rejection_highAmount: ["9876543216"], 
  premium: ["9876543212", "9876543217", "9876543219"]
}