import { User, Transaction, MerchantSettings } from '../types';

const DEMO_IRIS_HASHES = {
  alice: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
  bob: '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae',
  cafe: 'fcde2b2edba56bf408601fb721fe9b5c338d10ee429ea04fae5511b68fbf8fb9'
};

const initialUsers: User[] = [
  {
    id: '1',
    email: 'alice@demo.com',
    fullName: 'Alice Johnson',
    irisHash: DEMO_IRIS_HASHES.alice,
    accountBalance: 5000.00,
    userType: 'client',
    pinHash: '5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5',
    createdAt: new Date('2024-01-15')
  },
  {
    id: '2',
    email: 'bob@demo.com',
    fullName: 'Bob Smith',
    irisHash: DEMO_IRIS_HASHES.bob,
    accountBalance: 3500.00,
    userType: 'client',
    pinHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    createdAt: new Date('2024-02-20')
  },
  {
    id: '3',
    email: 'cafe@demo.com',
    fullName: 'City Café Terminal',
    irisHash: DEMO_IRIS_HASHES.cafe,
    accountBalance: 15000.00,
    userType: 'merchant',
    createdAt: new Date('2024-01-01')
  }
];

const initialTransactions: Transaction[] = [
  {
    id: 't1',
    transactionId: 'TXN20241003-123456',
    clientId: '1',
    merchantId: '3',
    amount: 25.50,
    status: 'success',
    description: 'Coffee and pastry',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    id: 't2',
    transactionId: 'TXN20241003-234567',
    clientId: '2',
    merchantId: '3',
    amount: 18.75,
    status: 'success',
    description: 'Lunch special',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000)
  },
  {
    id: 't3',
    transactionId: 'TXN20241003-345678',
    clientId: '1',
    merchantId: '3',
    amount: 42.00,
    status: 'success',
    description: 'Dinner',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
  }
];

const initialMerchantSettings: MerchantSettings[] = [
  {
    id: 'm1',
    merchantId: '3',
    businessName: 'City Café',
    businessCategory: 'Food & Beverage',
    dailyTransactionLimit: 25000.00
  }
];

class MockDatabase {
  private users: User[] = [...initialUsers];
  private transactions: Transaction[] = [...initialTransactions];
  private merchantSettings: MerchantSettings[] = [...initialMerchantSettings];
  private listeners: Set<() => void> = new Set();

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(listener => listener());
  }

  async getUserByIrisHash(irisHash: string): Promise<User | null> {
    const user = this.users.find(u => u.irisHash === irisHash);
    return user || null;
  }

  async getUserById(id: string): Promise<User | null> {
    return this.users.find(u => u.id === id) || null;
  }

  async updateUserBalance(userId: string, newBalance: number): Promise<void> {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.accountBalance = newBalance;
      this.notify();
    }
  }

  async getTransactionsByUser(userId: string): Promise<Transaction[]> {
    return this.transactions
      .filter(t => t.clientId === userId || t.merchantId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getPendingTransactionsForClient(clientId: string): Promise<Transaction[]> {
    return this.transactions.filter(
      t => t.clientId === clientId && t.status === 'pending'
    );
  }

  async createTransaction(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    const newTransaction: Transaction = {
      ...transaction,
      id: `t${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.transactions.unshift(newTransaction);
    this.notify();
    return newTransaction;
  }

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction | null> {
    const index = this.transactions.findIndex(t => t.id === id);
    if (index === -1) return null;

    this.transactions[index] = {
      ...this.transactions[index],
      ...updates,
      updatedAt: new Date()
    };
    this.notify();
    return this.transactions[index];
  }

  async getMerchantSettings(merchantId: string): Promise<MerchantSettings | null> {
    return this.merchantSettings.find(s => s.merchantId === merchantId) || null;
  }

  getAllTransactions(): Transaction[] {
    return [...this.transactions].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  getAllUsers(): User[] {
    return [...this.users];
  }
}

export const db = new MockDatabase();
