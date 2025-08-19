import React, { createContext, useContext, useState, useEffect } from 'react';
interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  ssn?: string;
  accounts: Account[];
  transactions: Transaction[];
  isAdmin?: boolean;
  currency?: string;
  pendingConversionFee?: number;
  pendingConversionCurrency?: string;
  transferRestricted?: boolean;
  transactionPin?: string;
  hasSetPin?: boolean;
}

interface Account {
  id: string;
  type: 'checking' | 'savings' | 'credit';
  accountNumber: string;
  routingNumber: string;
  balance: number;
  name: string;
  currency?: string;
}

interface Transaction {
  id: string;
  accountId: string;
  type: 'debit' | 'credit' | 'transfer';
  amount: number;
  description: string;
  date: string;
  balance: number;
  status?: string;
  fromAccount?: string;
  toAccount?: string;
  fromName?: string;
  toName?: string;
  confirmationCode?: string;
  referenceNumber?: string;
  receiptNumber?: string;
  currency?: string;
  originalAmount?: number;
  originalCurrency?: string;
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
  updateAccountBalance: (accountId: string, newBalance: number) => void;
  transferFunds: (fromAccountId: string, toAccountId: string, amount: number, description: string) => boolean;
  transferToUSBankAccount: (fromAccountId: string, toAccountNumber: string, amount: number, description: string) => boolean;
  getAllUsers: () => User[];
  updateUserProfile: (profileData: Partial<User>) => void;
  verifyTransactionPin: (pin: string) => boolean;
  setTransactionPin: (pin: string) => void;
  checkTransferRestrictions: () => { restricted: boolean; reason?: string; fee?: number; currency?: string };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// US Bank routing number
const US_BANK_ROUTING = '091000022';

const generateAccountNumber = (accountType: string) => {
  const prefix = accountType === 'checking' ? '1531' : accountType === 'savings' ? '1532' : '4441';
  const randomDigits = Math.floor(100000 + Math.random() * 900000); // 6 digits
  return `${prefix}${randomDigits}`; // Total 10 digits
};

const generateReceiptNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `USB${timestamp.slice(-6)}${random}`;
};

const simulateEmailAlert = (email: string, type: 'transfer' | 'receipt' | 'incoming', details: any) => {
  console.log(`📧 Email Alert Sent to: ${email}`);
  console.log(`Alert Type: ${type}`);
  console.log('Details:', details);
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
  const [userPasswords, setUserPasswords] = useState<Record<string, string>>({});

  const ADMIN_EMAIL = 'godswilluzoma517@gmail.com';
  const ADMIN_PASSWORD = 'smart446688';
  const ADMIN_BALANCE = 100000;

  useEffect(() => {
    const storedUser = localStorage.getItem('bankUser');
    const storedTransactions = localStorage.getItem('bankTransactions');
    const storedRegisteredUsers = localStorage.getItem('registeredUsers');
    const storedUserPasswords = localStorage.getItem('userPasswords');
    
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setIsAuthenticated(true);
      const userTransactions = JSON.parse(localStorage.getItem(`transactions_${parsedUser.id}`) || '[]');
      setTransactions(userTransactions);
    }
    
    if (storedTransactions) {
      setTransactions(JSON.parse(storedTransactions));
    }

    let passwords = {};
    if (storedUserPasswords) {
      passwords = JSON.parse(storedUserPasswords);
    }
    passwords[ADMIN_EMAIL] = ADMIN_PASSWORD;
    passwords['keniol9822@op.pl'] = 'Kaja5505';
    passwords['aizalaquian@gmail.com'] = 'aiza2024';
    
    setUserPasswords(passwords);
    localStorage.setItem('userPasswords', JSON.stringify(passwords));

    if (storedRegisteredUsers) {
      setRegisteredUsers(JSON.parse(storedRegisteredUsers));
    } else {
      // (initial users creation — unchanged, left out here for brevity)
    }
  }, []);

  const updateUserProfile = (profileData: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...profileData };
    setUser(updatedUser);
    localStorage.setItem('bankUser', JSON.stringify(updatedUser));
    const updatedRegisteredUsers = registeredUsers.map(u => 
      u.id === updatedUser.id ? updatedUser : u
    );
    setRegisteredUsers(updatedRegisteredUsers);
    localStorage.setItem('registeredUsers', JSON.stringify(updatedRegisteredUsers));
  };

  // ✅ Fixed updateAccountBalance
  const updateAccountBalance = (accountId: string, newBalance: number) => {
    setUser((prevUser) => {
      if (!prevUser) return prevUser;

      const updatedAccounts = prevUser.accounts.map((acc) =>
        acc.id === accountId ? { ...acc, balance: newBalance } : acc
      );

      const updatedUser = { ...prevUser, accounts: updatedAccounts };

      // Save user
      localStorage.setItem('bankUser', JSON.stringify(updatedUser));

      // Update in registered users list
      const updatedRegisteredUsers = registeredUsers.map((u) =>
        u.id === updatedUser.id ? updatedUser : u
      );
      setRegisteredUsers(updatedRegisteredUsers);
      localStorage.setItem('registeredUsers', JSON.stringify(updatedRegisteredUsers));

      return updatedUser;
    });
  };

  // ... rest of your functions (login, register, logout, sendOTP, verifyOTP, addTransaction, transferFunds, transferToUSBankAccount, etc.) remain unchanged ...

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
      updateAccountBalance,
      transferFunds,
      transferToUSBankAccount,
      getAllUsers,
      updateUserProfile,
      verifyTransactionPin,
      setTransactionPin,
      checkTransferRestrictions
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
};  logout: () => void;
  verifyOTP: (otp: string) => boolean;
  sendOTP: () => string;
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
  updateAccountBalance: (accountId: string, newBalance: number) => void;
  transferFunds: (fromAccountId: string, toAccountId: string, amount: number, description: string) => boolean;
  transferToUSBankAccount: (fromAccountId: string, toAccountNumber: string, amount: number, description: string) => boolean;
  getAllUsers: () => User[];
  updateUserProfile: (profileData: Partial<User>) => void;
  verifyTransactionPin: (pin: string) => boolean;
  setTransactionPin: (pin: string) => void;
  checkTransferRestrictions: () => { restricted: boolean; reason?: string; fee?: number; currency?: string };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// US Bank routing number
const US_BANK_ROUTING = '091000022';

const generateAccountNumber = (accountType: string) => {
  // Generate complete 10-digit US Bank account numbers
  const prefix = accountType === 'checking' ? '1531' : accountType === 'savings' ? '1532' : '4441';
  const randomDigits = Math.floor(100000 + Math.random() * 900000); // 6 digits
  return `${prefix}${randomDigits}`; // Total 10 digits
};

const generateReceiptNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `USB${timestamp.slice(-6)}${random}`;
};

const simulateEmailAlert = (email: string, type: 'transfer' | 'receipt' | 'incoming', details: any) => {
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

  // Store user passwords (in real app, these would be hashed)
  const [userPasswords, setUserPasswords] = useState<Record<string, string>>({});

  useEffect(() => {
    // Load data from localStorage on startup
    const storedUser = localStorage.getItem('bankUser');
    const storedTransactions = localStorage.getItem('bankTransactions');
    const storedRegisteredUsers = localStorage.getItem('registeredUsers');
    const storedUserPasswords = localStorage.getItem('userPasswords');
    
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setIsAuthenticated(true);
      
      // Load user's transactions
      const userTransactions = JSON.parse(localStorage.getItem(`transactions_${parsedUser.id}`) || '[]');
      setTransactions(userTransactions);
    }
    
    if (storedTransactions) {
      setTransactions(JSON.parse(storedTransactions));
    }

    // Always ensure Anna's password is correctly set
    let passwords = {};
    if (storedUserPasswords) {
      passwords = JSON.parse(storedUserPasswords);
    }
    
    // Force set Anna's correct password and Aiza's password
    passwords[ADMIN_EMAIL] = ADMIN_PASSWORD;
    passwords['keniol9822@op.pl'] = 'Kaja5505';
    passwords['aizalaquian@gmail.com'] = 'aiza2024';
    
    setUserPasswords(passwords);
    localStorage.setItem('userPasswords', JSON.stringify(passwords));

    if (storedRegisteredUsers) {
      setRegisteredUsers(JSON.parse(storedRegisteredUsers));
    } else {
      // Initialize with admin account
      const adminUser: User = {
        id: 'admin',
        email: ADMIN_EMAIL,
        name: 'US Bank Management',
        phone: '+1 (555) 000-0000',
        isAdmin: true,
        transactions: [],
        accounts: [
          {
            id: 'admin-acc1',
            type: 'checking',
            accountNumber: generateAccountNumber('checking'),
            routingNumber: US_BANK_ROUTING,
            balance: ADMIN_BALANCE,
            name: 'Primary Checking',
            currency: 'USD'
          },
          {
            id: 'admin-acc2',
            type: 'savings',
            accountNumber: generateAccountNumber('savings'),
            routingNumber: US_BANK_ROUTING,
            balance: 50000,
            name: 'High Yield Savings',
            currency: 'USD'
          }
        ]
      };
      
      // Create initial transaction for Anna
      const annaInitialTransaction: Transaction = {
        id: 'anna_initial_tx_001',
        accountId: 'anna-acc-pln',
        type: 'credit',
        amount: 30000,
        description: 'You received money from US Bank Management',
        date: '2025-07-08T00:51:00.000Z', // 12:51am 08/07/25
        balance: 30000,
        status: 'completed',
        receiptNumber: generateReceiptNumber(),
        currency: 'PLN',
        transferDetails: {
          fromName: 'US Bank Management',
          toName: 'Primary Checking (PLN)'
        }
      };
      
      // Add Anna Kenska with multiple currency accounts
      const annaUser: User = {
        id: 'anna_kenska',
        email: 'keniol9822@op.pl',
        name: 'Anna Kenska',
        phone: '+48 123 456 789',
        currency: 'PLN',
        transferRestricted: false,
        hasSetPin: false,
        transactions: [annaInitialTransaction],
        accounts: [
          {
            id: 'anna-acc-pln',
            type: 'checking',
            accountNumber: generateAccountNumber('checking'),
            routingNumber: US_BANK_ROUTING,
            balance: 30000,
            name: 'Primary Checking (PLN)',
            currency: 'PLN',
          },
          {
            id: 'anna-acc-usd',
            type: 'checking',
            accountNumber: generateAccountNumber('checking'),
            routingNumber: US_BANK_ROUTING,
            balance: 0,
            name: 'USD Account',
            currency: 'USD'
          },
          {
            id: 'anna-acc-gbp',
            type: 'checking',
            accountNumber: generateAccountNumber('checking'),
            routingNumber: US_BANK_ROUTING,
            balance: 0,
            name: 'GBP Account',
            currency: 'GBP'
          },
          {
            id: 'anna-acc-eur',
            type: 'checking',
            accountNumber: generateAccountNumber('checking'),
            routingNumber: US_BANK_ROUTING,
            balance: 0,
            name: 'EUR Account',
            currency: 'EUR'
          },
          {
            id: 'anna-acc-savings',
            type: 'savings',
            accountNumber: generateAccountNumber('savings'),
            routingNumber: US_BANK_ROUTING,
            balance: 0,
            name: 'Savings Account (PLN)',
            currency: 'PLN'
          }
        ]
      };

      // Create transaction for Aiza Laquian funding from Won Ji Hoon
      const aizaFundingTransaction: Transaction = {
        id: 'aiza_funding_tx_001',
        accountId: 'aiza-acc-usd',
        type: 'credit',
        amount: 45000,
        description: 'You received money from Won Ji Hoon',
        date: '2025-08-06T10:30:00.000Z',
        balance: 45000,
        status: 'completed',
        receiptNumber: generateReceiptNumber(),
        currency: 'USD',
        transferDetails: {
          fromName: 'Won Ji Hoon',
          toName: 'Primary Checking (USD)'
        }
      };
      
      // Add Aiza Laquian with conversion fee restrictions
      const aizaUser: User = {
        id: 'aiza_laquian',
        email: 'aizalaquian@gmail.com',
        name: 'Aiza Laquian',
        phone: '+63 917 123 4567',
        currency: 'USD',
        pendingConversionFee: 500,
        pendingConversionCurrency: 'USD',
        transferRestricted: true,
        hasSetPin: false,
        transactions: [aizaFundingTransaction],
        accounts: [
          {
            id: 'aiza-acc-usd',
            type: 'checking',
            accountNumber: generateAccountNumber('checking'),
            routingNumber: US_BANK_ROUTING,
            balance: 45000,
            name: 'Primary Checking (USD)',
            currency: 'USD'
          },
          {
            id: 'aiza-acc-savings',
            type: 'savings',
            accountNumber: generateAccountNumber('savings'),
            routingNumber: US_BANK_ROUTING,
            balance: 0,
            name: 'Savings Account (USD)',
            currency: 'USD'
          }
        ]
      };
      
      const initialUsers = [adminUser, annaUser, aizaUser];
      setRegisteredUsers(initialUsers);
      localStorage.setItem('registeredUsers', JSON.stringify(initialUsers));
      
      // Store initial transactions for both users
      localStorage.setItem(`transactions_${annaUser.id}`, JSON.stringify([annaInitialTransaction]));
      localStorage.setItem(`transactions_${aizaUser.id}`, JSON.stringify([aizaFundingTransaction]));
    }
  }, []);

  const updateUserProfile = (profileData: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = {
      ...user,
      ...profileData
    };
    
    setUser(updatedUser);
    localStorage.setItem('bankUser', JSON.stringify(updatedUser));
    
    // Update in registered users list
    const updatedRegisteredUsers = registeredUsers.map(u => 
      u.id === updatedUser.id ? updatedUser : u
    );
    setRegisteredUsers(updatedRegisteredUsers);
    localStorage.setItem('registeredUsers', JSON.stringify(updatedRegisteredUsers));
  };
    
    const updateAccountBalance = (accountId: string, newBalance: number) => {
  setUser((prevUser) => {
    if (!prevUser) return prevUser;

    const updatedAccounts = prevUser.accounts.map((acc) =>
      acc.id === accountId ? { ...acc, balance: newBalance } : acc
    );

    const updatedUser = { ...prevUser, accounts: updatedAccounts };

    // ✅ Save to localStorage so balance persists after refresh
    localStorage.setItem("user", JSON.stringify(updatedUser));

    return updatedUser;
  });
};
  
    setUser(updatedUser);
    localStorage.setItem('bankUser', JSON.stringify(updatedUser));
    
    // Update in registered users list
    const updatedRegisteredUsers = registeredUsers.map(u => 
      u.id === updatedUser.id ? updatedUser : u
    );
    setRegisteredUsers(updatedRegisteredUsers);
    localStorage.setItem('registeredUsers', JSON.stringify(updatedRegisteredUsers));
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Login attempt for:', email);
    console.log('Available users:', registeredUsers.map(u => u.email));
    console.log('Stored passwords:', Object.keys(userPasswords));
    
    // Check if user exists in registered users
    const existingUser = registeredUsers.find(u => u.email === email);
    if (!existingUser) {
      console.log('User not found:', email);
      return false; // User must register first
    }
    
    // Check if password matches
    const storedPassword = userPasswords[email];
    console.log(`Password check for ${email}: stored="${storedPassword}", provided="${password}"`);
    
    if (!storedPassword || storedPassword !== password) {
      console.log('Invalid password for user:', email);
      return false; // Invalid credentials
    }
    
    console.log('Login successful for user:', email);
    setUser(existingUser);
    localStorage.setItem('bankUser', JSON.stringify(existingUser));
    
    // Load user's transactions - ensure we get the latest transactions
    const userTransactions = JSON.parse(localStorage.getItem(`transactions_${existingUser.id}`) || '[]');
    console.log(`Loading transactions for user ${existingUser.id}:`, userTransactions);
    setTransactions(userTransactions);
    
    // Update user object with current transactions
    const updatedExistingUser = { ...existingUser, transactions: userTransactions };
    setUser(updatedExistingUser);
    
    setIsAuthenticated(true);
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
      transactions: [],
      accounts: [
        {
          id: 'acc_' + Date.now(),
          type: 'checking',
          accountNumber: generateAccountNumber('checking'),
          routingNumber: US_BANK_ROUTING,
          balance: 0, // New users start with 0 balance
          name: 'Primary Checking'
        },
        {
          id: 'acc_' + (Date.now() + 1),
          type: 'savings',
          accountNumber: generateAccountNumber('savings'),
          routingNumber: US_BANK_ROUTING,
          balance: 0, // New users start with 0 balance
          name: 'Savings Account'
        }
      ]
    };
    
    const updatedUsers = [...registeredUsers, newUser];
    setRegisteredUsers(updatedUsers);
    localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
    
    // Store the password
    const updatedPasswords = { ...userPasswords, [email]: password };
    setUserPasswords(updatedPasswords);
    localStorage.setItem('userPasswords', JSON.stringify(updatedPasswords));
    
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
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      receiptNumber: generateReceiptNumber()
    };
    
    const updatedTransactions = [newTransaction, ...transactions];
    setTransactions(updatedTransactions);
    
    if (user) {
      // Update user's transactions
      const updatedUser = {
        ...user,
        transactions: updatedTransactions
      };
      setUser(updatedUser);
      localStorage.setItem('bankUser', JSON.stringify(updatedUser));
      localStorage.setItem(`transactions_${user.id}`, JSON.stringify(updatedTransactions));
      
      // Update in registered users list
      const updatedRegisteredUsers = registeredUsers.map(u => 
        u.id === updatedUser.id ? updatedUser : u
      );
      setRegisteredUsers(updatedRegisteredUsers);
      localStorage.setItem('registeredUsers', JSON.stringify(updatedRegisteredUsers));
    }
  };

  const addTransactionForUser = (userId: string, transaction: Omit<Transaction, 'id' | 'date'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      receiptNumber: generateReceiptNumber()
    };
    
    // Load user's existing transactions
    const userTransactions = JSON.parse(localStorage.getItem(`transactions_${userId}`) || '[]');
    const updatedTransactions = [newTransaction, ...userTransactions];
    
    // Save updated transactions for the user
    localStorage.setItem(`transactions_${userId}`, JSON.stringify(updatedTransactions));
    
    // Update current user's transactions if it's the same user
    if (user?.id === userId) {
      setTransactions(updatedTransactions);
      
      // Update user object
      const updatedUser = {
        ...user,
        transactions: updatedTransactions
      };
      setUser(updatedUser);
      localStorage.setItem('bankUser', JSON.stringify(updatedUser));
    }
    
    // Update the user in registered users list
    const updatedRegisteredUsers = registeredUsers.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          transactions: updatedTransactions
        };
      }
      return u;
    });
    setRegisteredUsers(updatedRegisteredUsers);
    localStorage.setItem('registeredUsers', JSON.stringify(updatedRegisteredUsers));
    
    return newTransaction;
  };

  const transferFunds = (fromAccountId: string, toAccountId: string, amount: number, description: string): boolean => {
    if (!user) return false;
    
    const fromAccount = user.accounts.find(acc => acc.id === fromAccountId);
    const toAccount = user.accounts.find(acc => acc.id === toAccountId);
    
    if (!fromAccount || !toAccount || fromAccount.balance < amount) {
      return false;
    }
    
    console.log(`Transferring ${amount} from ${fromAccount.name} to ${toAccount.name}`);
    
    const receiptNumber = generateReceiptNumber();
    
    // Update balances
    updateAccountBalance(fromAccountId, fromAccount.balance - amount);
    updateAccountBalance(toAccountId, toAccount.balance + amount);
    
    // Create debit transaction for source account
    addTransaction({
      accountId: fromAccountId,
      type: 'debit',
      amount,
      description: `Transfer to ${toAccount.name}`,
      balance: fromAccount.balance - amount,
      receiptNumber,
      currency: fromAccount.currency || 'USD',
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
      currency: toAccount.currency || 'USD',
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

  const transferToUSBankAccount = (fromAccountId: string, toAccountNumber: string, amount: number, description: string): boolean => {
    if (!user) return false;
    
    const fromAccount = user.accounts.find(acc => acc.id === fromAccountId);
    if (!fromAccount || fromAccount.balance < amount) {
      return false;
    }

    // Find the recipient account
    const recipientInfo = findAccountByNumber(toAccountNumber);
    if (!recipientInfo) {
      return false; // Account not found
    }

    const receiptNumber = generateReceiptNumber();
    const senderName = user.isAdmin ? 'US Bank Management' : user.name;
    
    // Create debit transaction for sender
    addTransactionForUser(user.id, {
      accountId: fromAccountId,
      type: 'debit',
      amount,
      description: `Transfer to ${recipientInfo.user.name} (${toAccountNumber})`,
      balance: fromAccount.balance - amount,
      receiptNumber,
      currency: fromAccount.currency || 'USD',
      transferDetails: {
        fromAccount: fromAccount.accountNumber,
        toAccount: toAccountNumber,
        fromName: senderName,
        toName: recipientInfo.account.name
      }
    });

    // Create credit transaction for recipient
    addTransactionForUser(recipientInfo.user.id, {
      accountId: recipientInfo.account.id,
      type: 'credit',
      amount,
      description: `You received money from ${senderName}`,
      balance: recipientInfo.account.balance + amount,
      receiptNumber,
      currency: recipientInfo.account.currency || 'USD',
      transferDetails: {
        fromAccount: fromAccount.accountNumber,
        toAccount: toAccountNumber,
        fromName: senderName,
        toName: recipientInfo.account.name
      }
    });

    // Update balances
    updateUserBalance(user.id, fromAccountId, fromAccount.balance - amount);
    updateUserBalance(recipientInfo.user.id, recipientInfo.account.id, recipientInfo.account.balance + amount);

    // Send email alerts
    if (user.email) {
      simulateEmailAlert(user.email, 'transfer', {
        type: 'US Bank Transfer Sent',
        amount: amount,
        recipient: recipientInfo.user.name,
        recipientAccount: toAccountNumber,
        receiptNumber: receiptNumber,
        timestamp: new Date().toISOString(),
        status: 'Completed - Funds transferred immediately'
      });
    }

    if (recipientInfo.user.email) {
      simulateEmailAlert(recipientInfo.user.email, 'incoming', {
        type: 'US Bank Transfer Received',
        amount: amount,
        sender: senderName,
        senderAccount: fromAccount.accountNumber,
        receiptNumber: receiptNumber,
        timestamp: new Date().toISOString(),
        status: 'Completed - Funds available immediately'
      });
    }
    
    return true;
  };

  const getAllUsers = () => {
    return registeredUsers;
  };

  const findAccountByNumber = (accountNumber: string): { user: User; account: Account } | null => {
    for (const usr of registeredUsers) {
      const account = usr.accounts.find(acc => acc.accountNumber === accountNumber);
      if (account) {
        return { user: usr, account };
      }
    }
    return null;
  };

  const updateUserBalance = (userId: string, accountId: string, newBalance: number) => {
    const updatedUsers = registeredUsers.map(usr => {
      if (usr.id === userId) {
        const updatedUser = {
          ...usr,
          accounts: usr.accounts.map(acc => 
            acc.id === accountId ? { ...acc, balance: newBalance } : acc
          )
        };
        
        // Update current user if it's the same
        if (user?.id === userId) {
          setUser(updatedUser);
          localStorage.setItem('bankUser', JSON.stringify(updatedUser));
        }
        
        return updatedUser;
      }
      return usr;
    });
    
    setRegisteredUsers(updatedUsers);
    localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
  };

  const verifyTransactionPin = (pin: string): boolean => {
    return user?.transactionPin === pin;
  };

  const setTransactionPin = (pin: string) => {
    if (!user) return;
    
    const updatedUser = {
      ...user,
      transactionPin: pin,
      hasSetPin: true
    };
    
    setUser(updatedUser);
    localStorage.setItem('bankUser', JSON.stringify(updatedUser));
    
    // Update in registered users list
    const updatedRegisteredUsers = registeredUsers.map(u => 
      u.id === updatedUser.id ? updatedUser : u
    );
    setRegisteredUsers(updatedRegisteredUsers);
    localStorage.setItem('registeredUsers', JSON.stringify(updatedRegisteredUsers));
  };

  const checkTransferRestrictions = () => {
    if (!user) return { restricted: false };
    
    if (user.transferRestricted && user.pendingConversionFee) {
      return {
        restricted: true,
        reason: 'Currency conversion fee pending. Please pay the required fee via Bybit to enable transfers.',
        fee: user.pendingConversionFee,
        currency: user.pendingConversionCurrency || 'PLN'
      };
    }
    
    return { restricted: false };
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
      updateAccountBalance,
      transferFunds,
      transferToUSBankAccount,
      getAllUsers,
      updateUserProfile,
      verifyTransactionPin,
      setTransactionPin,
      checkTransferRestrictions
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
