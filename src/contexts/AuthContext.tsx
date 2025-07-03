
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  accounts: Account[];
}

interface Account {
  id: string;
  type: 'checking' | 'savings' | 'credit';
  accountNumber: string;
  balance: number;
  name: string;
}

interface Transaction {
  id: string;
  accountId: string;
  type: 'debit' | 'credit' | 'transfer';
  amount: number;
  description: string;
  date: string;
  balance: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, phone: string) => Promise<boolean>;
  logout: () => void;
  verifyOTP: (otp: string) => boolean;
  sendOTP: () => string;
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
  transferFunds: (fromAccountId: string, toAccountId: string, amount: number, description: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentOTP, setCurrentOTP] = useState<string>('');
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    // Load data from localStorage on startup
    const storedUser = localStorage.getItem('bankUser');
    const storedTransactions = localStorage.getItem('bankTransactions');
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
    
    if (storedTransactions) {
      setTransactions(JSON.parse(storedTransactions));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (email && password) {
      const newUser: User = {
        id: 'user1',
        email,
        name: 'John Doe',
        phone: '+1 (555) 123-4567',
        accounts: [
          {
            id: 'acc1',
            type: 'checking',
            accountNumber: '****1234',
            balance: 5247.83,
            name: 'Primary Checking'
          },
          {
            id: 'acc2',
            type: 'savings',
            accountNumber: '****5678',
            balance: 12250.00,
            name: 'High Yield Savings'
          },
          {
            id: 'acc3',
            type: 'credit',
            accountNumber: '****9012',
            balance: -1234.56,
            name: 'Platinum Credit Card'
          }
        ]
      };
      
      setUser(newUser);
      setIsNewUser(false);
      localStorage.setItem('bankUser', JSON.stringify(newUser));
      
      // Load sample transactions only for existing users (login)
      const storedTransactions = localStorage.getItem('bankTransactions');
      if (!storedTransactions) {
        const sampleTransactions: Transaction[] = [
          {
            id: '1',
            accountId: 'acc1',
            type: 'credit',
            amount: 2500.00,
            description: 'Direct Deposit - Salary',
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            balance: 5247.83
          },
          {
            id: '2',
            accountId: 'acc1',
            type: 'debit',
            amount: 89.99,
            description: 'Online Purchase - Amazon',
            date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            balance: 5157.84
          },
          {
            id: '3',
            accountId: 'acc2',
            type: 'credit',
            amount: 50.00,
            description: 'Transfer from Checking',
            date: new Date().toISOString(),
            balance: 1250.00
          }
        ];
        setTransactions(sampleTransactions);
        localStorage.setItem('bankTransactions', JSON.stringify(sampleTransactions));
      }
      
      return true;
    }
    return false;
  };

  const register = async (email: string, password: string, name: string, phone: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser: User = {
      id: 'user' + Date.now(),
      email,
      name,
      phone,
      accounts: [
        {
          id: 'acc1',
          type: 'checking',
          accountNumber: '****' + Math.floor(Math.random() * 9999),
          balance: 0,
          name: 'Primary Checking'
        }
      ]
    };
    
    setUser(newUser);
    setIsNewUser(true);
    setTransactions([]); // Start with empty transactions for new users
    localStorage.setItem('bankUser', JSON.stringify(newUser));
    localStorage.setItem('bankTransactions', JSON.stringify([])); // Save empty transactions
    return true;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setIsNewUser(false);
    localStorage.removeItem('bankUser');
  };

  const sendOTP = (): string => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setCurrentOTP(otp);
    console.log('OTP sent:', otp); // In real app, this would be sent via SMS/email
    return otp;
  };

  const verifyOTP = (otp: string): boolean => {
    if (otp === currentOTP) {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'date'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      date: new Date().toISOString()
    };
    
    const updatedTransactions = [newTransaction, ...transactions];
    setTransactions(updatedTransactions);
    localStorage.setItem('bankTransactions', JSON.stringify(updatedTransactions));
    
    // Update account balance
    if (user) {
      const updatedUser = { ...user };
      const account = updatedUser.accounts.find(acc => acc.id === transaction.accountId);
      if (account) {
        if (transaction.type === 'credit') {
          account.balance += transaction.amount;
        } else if (transaction.type === 'debit') {
          account.balance -= transaction.amount;
        }
        setUser(updatedUser);
        localStorage.setItem('bankUser', JSON.stringify(updatedUser));
      }
    }
  };

  const transferFunds = (fromAccountId: string, toAccountId: string, amount: number, description: string): boolean => {
    if (!user) return false;
    
    const fromAccount = user.accounts.find(acc => acc.id === fromAccountId);
    const toAccount = user.accounts.find(acc => acc.id === toAccountId);
    
    if (!fromAccount || !toAccount || fromAccount.balance < amount) {
      return false;
    }
    
    // Create debit transaction for source account
    addTransaction({
      accountId: fromAccountId,
      type: 'debit',
      amount,
      description: `Transfer to ${toAccount.name}`,
      balance: fromAccount.balance - amount
    });
    
    // Create credit transaction for destination account
    addTransaction({
      accountId: toAccountId,
      type: 'credit',
      amount,
      description: `Transfer from ${fromAccount.name}`,
      balance: toAccount.balance + amount
    });
    
    return true;
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      login,
      register,
      logout,
      verifyOTP,
      sendOTP,
      transactions,
      addTransaction,
      transferFunds
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
