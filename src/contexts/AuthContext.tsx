
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  accounts: Account[];
  isAdmin?: boolean;
}

interface Account {
  id: string;
  type: 'checking' | 'savings' | 'credit';
  accountNumber: string;
  routingNumber: string;
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
  receiptNumber?: string;
  transferDetails?: {
    fromAccount?: string;
    toAccount?: string;
    fromName?: string;
    toName?: string;
  };
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
  sendDomesticTransfer: (fromAccountId: string, recipientDetails: any, amount: number, description: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// US Bank routing number (real routing number for US Bank)
const US_BANK_ROUTING = '091000022';

const generateAccountNumber = (accountType: string) => {
  // Generate complete 10-digit US Bank account numbers
  const prefix = accountType === 'checking' ? '1531' : accountType === 'savings' ? '1532' : '4441';
  const randomDigits = Math.floor(1000000 + Math.random() * 9000000); // 7 digits
  return `${prefix}${randomDigits}`.substring(0, 10); // Ensure exactly 10 digits
};

const generateReceiptNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `USB${timestamp.slice(-6)}${random}`;
};

const simulateEmailAlert = (email: string, type: 'transfer' | 'receipt', details: any) => {
  console.log(`📧 Email Alert Sent to: ${email}`);
  console.log(`Alert Type: ${type}`);
  console.log('Details:', details);
  
  // Simulate email delay
  setTimeout(() => {
    console.log(`✅ Email delivered to ${email}`);
  }, 2000);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentOTP, setCurrentOTP] = useState<string>('');
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([]);

  // Admin account configuration
  const ADMIN_EMAIL = 'godswilluzoma517@gmail.com';
  const ADMIN_PASSWORD = 'smart446688';
  const ADMIN_BALANCE = 100000;

  useEffect(() => {
    // Load data from localStorage on startup
    const storedUser = localStorage.getItem('bankUser');
    const storedTransactions = localStorage.getItem('bankTransactions');
    const storedRegisteredUsers = localStorage.getItem('registeredUsers');
    
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setIsAuthenticated(true);
    }
    
    if (storedTransactions) {
      setTransactions(JSON.parse(storedTransactions));
    }

    if (storedRegisteredUsers) {
      setRegisteredUsers(JSON.parse(storedRegisteredUsers));
    } else {
      // Initialize with admin account
      const adminUser: User = {
        id: 'admin',
        email: ADMIN_EMAIL,
        name: 'Administrator',
        phone: '+1 (555) 000-0000',
        isAdmin: true,
        accounts: [
          {
            id: 'admin-acc1',
            type: 'checking',
            accountNumber: generateAccountNumber('checking'),
            routingNumber: US_BANK_ROUTING,
            balance: ADMIN_BALANCE,
            name: 'Primary Checking'
          },
          {
            id: 'admin-acc2',
            type: 'savings',
            accountNumber: generateAccountNumber('savings'),
            routingNumber: US_BANK_ROUTING,
            balance: 50000,
            name: 'High Yield Savings'
          }
        ]
      };
      const initialUsers = [adminUser];
      setRegisteredUsers(initialUsers);
      localStorage.setItem('registeredUsers', JSON.stringify(initialUsers));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if it's admin login
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const adminUser = registeredUsers.find(u => u.email === ADMIN_EMAIL);
      if (adminUser) {
        setUser(adminUser);
        localStorage.setItem('bankUser', JSON.stringify(adminUser));
        return true;
      }
    }
    
    // Check registered users
    const existingUser = registeredUsers.find(u => u.email === email);
    if (!existingUser) {
      return false; // User must register first
    }
    
    // In a real app, you'd verify the password hash
    // For demo purposes, we'll accept any password for existing users
    setUser(existingUser);
    localStorage.setItem('bankUser', JSON.stringify(existingUser));
    
    // Load user's transactions
    const userTransactions = JSON.parse(localStorage.getItem(`transactions_${existingUser.id}`) || '[]');
    setTransactions(userTransactions);
    
    return true;
  };

  const register = async (email: string, password: string, name: string, phone: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if user already exists
    const existingUser = registeredUsers.find(u => u.email === email);
    if (existingUser) {
      return false; // User already exists
    }
    
    const newUser: User = {
      id: 'user_' + Date.now(),
      email,
      name,
      phone,
      accounts: [
        {
          id: 'acc_' + Date.now(),
          type: 'checking',
          accountNumber: generateAccountNumber('checking'),
          routingNumber: US_BANK_ROUTING,
          balance: 1000, // Starting balance for new users
          name: 'Primary Checking'
        },
        {
          id: 'acc_' + (Date.now() + 1),
          type: 'savings',
          accountNumber: generateAccountNumber('savings'),
          routingNumber: US_BANK_ROUTING,
          balance: 0,
          name: 'Savings Account'
        }
      ]
    };
    
    const updatedUsers = [...registeredUsers, newUser];
    setRegisteredUsers(updatedUsers);
    localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
    
    setUser(newUser);
    localStorage.setItem('bankUser', JSON.stringify(newUser));
    
    // Initialize empty transactions for new user
    setTransactions([]);
    localStorage.setItem(`transactions_${newUser.id}`, JSON.stringify([]));
    
    return true;
  };

  const logout = () => {
    if (user) {
      // Save current user's transactions before logout
      localStorage.setItem(`transactions_${user.id}`, JSON.stringify(transactions));
    }
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('bankUser');
  };

  const sendOTP = (): string => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setCurrentOTP(otp);
    console.log('📧 OTP Email sent to:', user?.email || 'email');
    console.log('🔐 Your OTP Code:', otp);
    
    // Simulate email sending
    if (user?.email) {
      simulateEmailAlert(user.email, 'receipt', {
        type: 'OTP Verification',
        code: otp,
        timestamp: new Date().toISOString()
      });
    }
    
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
      date: new Date().toISOString(),
      receiptNumber: generateReceiptNumber()
    };
    
    const updatedTransactions = [newTransaction, ...transactions];
    setTransactions(updatedTransactions);
    
    if (user) {
      localStorage.setItem(`transactions_${user.id}`, JSON.stringify(updatedTransactions));
      
      // Update account balance
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
        
        // Update in registered users list
        const updatedRegisteredUsers = registeredUsers.map(u => 
          u.id === updatedUser.id ? updatedUser : u
        );
        setRegisteredUsers(updatedRegisteredUsers);
        localStorage.setItem('registeredUsers', JSON.stringify(updatedRegisteredUsers));
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
    
    const receiptNumber = generateReceiptNumber();
    
    // Create debit transaction for source account
    addTransaction({
      accountId: fromAccountId,
      type: 'debit',
      amount,
      description: `Transfer to ${toAccount.name}`,
      balance: fromAccount.balance - amount,
      receiptNumber,
      transferDetails: {
        fromAccount: fromAccount.accountNumber,
        toAccount: toAccount.accountNumber,
        fromName: fromAccount.name,
        toName: toAccount.name
      }
    });
    
    // Create credit transaction for destination account
    addTransaction({
      accountId: toAccountId,
      type: 'credit',
      amount,
      description: `Transfer from ${fromAccount.name}`,
      balance: toAccount.balance + amount,
      receiptNumber,
      transferDetails: {
        fromAccount: fromAccount.accountNumber,
        toAccount: toAccount.accountNumber,
        fromName: fromAccount.name,
        toName: toAccount.name
      }
    });

    // Send email alert
    if (user.email) {
      simulateEmailAlert(user.email, 'transfer', {
        type: 'Internal Transfer',
        amount: amount,
        from: fromAccount.name,
        to: toAccount.name,
        receiptNumber: receiptNumber,
        timestamp: new Date().toISOString()
      });
    }
    
    return true;
  };

  const sendDomesticTransfer = (fromAccountId: string, recipientDetails: any, amount: number, description: string): boolean => {
    if (!user) return false;
    
    const fromAccount = user.accounts.find(acc => acc.id === fromAccountId);
    if (!fromAccount || fromAccount.balance < amount) {
      return false;
    }

    const receiptNumber = generateReceiptNumber();
    
    // Create debit transaction for domestic transfer
    addTransaction({
      accountId: fromAccountId,
      type: 'debit',
      amount,
      description: `Domestic Transfer to ${recipientDetails.recipientName} (${recipientDetails.bankName})`,
      balance: fromAccount.balance - amount,
      receiptNumber,
      transferDetails: {
        fromAccount: fromAccount.accountNumber,
        toAccount: recipientDetails.accountNumber,
        fromName: fromAccount.name,
        toName: recipientDetails.recipientName
      }
    });

    // Send comprehensive email alert
    if (user.email) {
      simulateEmailAlert(user.email, 'transfer', {
        type: 'Domestic Transfer Sent',
        amount: amount,
        recipient: recipientDetails.recipientName,
        recipientBank: recipientDetails.bankName,
        recipientAccount: recipientDetails.accountNumber,
        routingNumber: recipientDetails.routingNumber,
        receiptNumber: receiptNumber,
        timestamp: new Date().toISOString(),
        status: 'Processing - Will arrive in 1-3 business days'
      });

      // Simulate recipient notification
      if (recipientDetails.recipientEmail) {
        simulateEmailAlert(recipientDetails.recipientEmail, 'receipt', {
          type: 'Incoming Transfer',
          amount: amount,
          sender: user.name,
          senderBank: 'US Bank',
          receiptNumber: receiptNumber,
          timestamp: new Date().toISOString(),
          status: 'Transfer incoming - Will arrive in 1-3 business days'
        });
      }
    }
    
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
      transferFunds,
      sendDomesticTransfer
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
