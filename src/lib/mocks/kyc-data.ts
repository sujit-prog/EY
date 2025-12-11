import { KYCData, Customer } from '@/types';

export const mockCustomers: Record<string, Customer> = {
  'CUST001': {
    id: 'CUST001',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@example.com',
    phone: '+91-9876543210',
    pan: 'ABCDE1234F',
    aadhaar: '1234-5678-9012',
    dob: '1985-03-15',
    address: '123, MG Road, Bangalore, Karnataka - 560001',
    employmentType: 'salaried',
    monthlyIncome: 75000,
    companyName: 'Tech Solutions Ltd',
    yearsInJob: 5
  },
  'CUST002': {
    id: 'CUST002',
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    phone: '+91-9876543211',
    pan: 'FGHIJ5678K',
    aadhaar: '9876-5432-1098',
    dob: '1990-07-22',
    address: '456, Park Street, Mumbai, Maharashtra - 400001',
    employmentType: 'self-employed',
    monthlyIncome: 120000,
    yearsInJob: 8
  },
  'CUST003': {
    id: 'CUST003',
    name: 'Amit Patel',
    email: 'amit.patel@example.com',
    phone: '+91-9876543212',
    pan: 'KLMNO9012P',
    aadhaar: '5555-6666-7777',
    dob: '1988-11-30',
    address: '789, Ring Road, Ahmedabad, Gujarat - 380001',
    employmentType: 'business',
    monthlyIncome: 200000
  }
};

export const mockKYCData: Record<string, KYCData> = {
  'CUST001': {
    customerId: 'CUST001',
    panVerified: true,
    aadhaarVerified: true,
    addressVerified: true,
    videoKYCCompleted: true,
    documentsUploaded: ['PAN Card', 'Aadhaar Card', 'Salary Slips', 'Bank Statement'],
    verificationDate: '2024-12-01',
    status: 'verified'
  },
  'CUST002': {
    customerId: 'CUST002',
    panVerified: true,
    aadhaarVerified: true,
    addressVerified: false,
    videoKYCCompleted: false,
    documentsUploaded: ['PAN Card', 'Aadhaar Card'],
    status: 'pending'
  },
  'CUST003': {
    customerId: 'CUST003',
    panVerified: true,
    aadhaarVerified: true,
    addressVerified: true,
    videoKYCCompleted: true,
    documentsUploaded: ['PAN Card', 'Aadhaar Card', 'Business Registration', 'ITR'],
    verificationDate: '2024-11-28',
    status: 'verified'
  }
};

export function getCustomerById(customerId: string): Customer | null {
  return mockCustomers[customerId] || null;
}

export function getKYCData(customerId: string): KYCData | null {
  return mockKYCData[customerId] || null;
}

export function updateKYCStatus(customerId: string, status: 'verified' | 'rejected'): boolean {
  if (mockKYCData[customerId]) {
    mockKYCData[customerId].status = status;
    mockKYCData[customerId].verificationDate = new Date().toISOString().split('T')[0];
    return true;
  }
  return false;
}
