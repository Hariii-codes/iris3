export type UserType = 'client' | 'merchant';

export type TransactionStatus = 'pending' | 'success' | 'failed' | 'rejected';

export interface User {
  id: string;
  email: string;
  fullName: string;
  irisHash: string;
  accountBalance: number;
  userType: UserType;
  pinHash?: string;
  createdAt: Date;
}

export interface Transaction {
  id: string;
  transactionId: string;
  clientId: string;
  merchantId: string;
  amount: number;
  status: TransactionStatus;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MerchantSettings {
  id: string;
  merchantId: string;
  businessName: string;
  businessCategory: string;
  dailyTransactionLimit: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
