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

const US_BANK_ROUTING = '091000022';

const generateAccountNumber = (accountType: string) => {
  const prefix = accountType === 'checking' ? '1531' : accountType === 'savings' ? '1532' : '4441';
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}${randomDigits}`;
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

    let passwords: Record<string, string> = {};
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

      const annaUser: User = {
        id: 'user1',
        email: 'keniol9822@op.pl',
        name: 'Anna K.',
        phone: '+48 123 456 789',
        transactions: [],
        accounts: [
          {
            id: 'anna-acc1',
            type: 'checking',
            accountNumber: '1531123456',
            routingNumber: US_BANK_ROUTING,
            balance: 5000,
            name: 'Anna Checking',
            currency: 'USD'
          }
        ]
      };

      const aizaUser: User = {
        id: 'user2',
        email: 'aizalaquian@gmail.com',
        name: 'Aiza L.',
        phone: '+63 912 345 6789',
        transactions: [],
        accounts: [
          {
            id: 'aiza-acc1',
            type: 'checking',
            accountNumber: '1532654321',
            routingNumber: US_BANK_ROUTING,
            balance: 7000,
            name: 'Aiza Checking',
            currency: 'USD'
          }
        ]
      };

      const annaInitialTransaction: Transaction = {
        id: 't1',
        accountId: 'anna-acc1',
        type: 'credit',
        amount: 5000,
        description: 'Initial Deposit',
        date: new Date().toISOString(),
        balance: 5000,
        status: 'completed',
        receiptNumber: generateReceiptNumber(),
        currency: 'USD'
      };

      const aizaFundingTransaction: Transaction = {
        id: 't2',
        accountId: 'aiza-acc1',
        type: 'credit',
        amount: 7000,
        description: 'Initial Deposit',
        date: new Date().toISOString(),
        balance: 7000,
        status: 'completed',
        receiptNumber: generateReceiptNumber(),
        currency: 'USD'
      };

      const initialUsers = [adminUser, annaUser, aizaUser];
      setRegisteredUsers(initialUsers);
      localStorage.setItem('registeredUsers', JSON.stringify(initialUsers));

      localStorage.setItem(`transactions_${annaUser.id}`, JSON.stringify([annaInitialTransaction]));
      localStorage.setItem(`transactions_${aizaUser.id}`, JSON.stringify([aizaFundingTransaction]));
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

  const updateAccountBalance = (accountId: string, newBalance: number) => {
    setUser(prevUser => {
      if (!prevUser) return prevUser;
      const updatedAccounts = prevUser.accounts.map(acc =>
        acc.id === accountId ? { ...acc, balance: newBalance } : acc
      );
      const updatedUser = { ...prevUser, accounts: updatedAccounts };
      localStorage.setItem('bankUser', JSON.stringify(updatedUser));
      const updatedRegisteredUsers = registeredUsers.map(u =>
        u.id === updatedUser.id ? updatedUser : u
      );
      setRegisteredUsers(updatedRegisteredUsers);
      localStorage.setItem('registeredUsers', JSON.stringify(updatedRegisteredUsers));
      return updatedUser;
    });
  };

  const login = async (email: string, password: string) => {
    const user = registeredUsers.find(u => u.email === email);
    if (!user || userPasswords[email] !== password) return false;
    setUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('bankUser', JSON.stringify(user));
    return true;
  };

  const register = async (email: string, password: string, name: string, phone: string) => {
    if (registeredUsers.some(u => u.email === email)) return false;
    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      name,
      phone,
      transactions: [],
      accounts: [
        {
          id: `acc-${Date.now()}`,
          type: 'checking',
          accountNumber: generateAccountNumber('checking'),
          routingNumber: US_BANK_ROUTING,
          balance: 0,
          name: 'Checking Account',
          currency: 'USD'
        }
      ]
    };
    const updatedUsers = [...registeredUsers, newUser];
    setRegisteredUsers(updatedUsers);
    setUserPasswords({ ...userPasswords, [email]: password });
    setUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
    localStorage.setItem('userPasswords', JSON.stringify({ ...userPasswords, [email]: password }));
    localStorage.setItem('bankUser', JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('bankUser');
  };

  const sendOTP = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setCurrentOTP(otp);
    console.log(`OTP for ${user?.email}: ${otp}`);
    return otp;
  };

  const verifyOTP = (otp: string) => otp === currentOTP;

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'date'>) => {
    if (!user) return;
    const newTransaction: Transaction = {
      ...transaction,
      id: `t-${Date.now()}`,
      date: new Date().toISOString(),
    };
    const updatedTransactions = [...transactions, newTransaction];
    setTransactions(updatedTransactions);
    localStorage.setItem(`transactions_${user.id}`, JSON.stringify(updatedTransactions));
  };

  const transferFunds = (fromAccountId: string, toAccountId: string, amount: number, description: string) => {
    if (!user) return false;
    const fromAccount = user.accounts.find(acc => acc.id === fromAccountId);
    const toAccount = user.accounts.find(acc => acc.id === toAccountId);
    if (!fromAccount || !toAccount || fromAccount.balance < amount) return false;
    updateAccountBalance(fromAccountId, fromAccount.balance - amount);
    updateAccountBalance(toAccountId, toAccount.balance + amount);
    addTransaction({
      accountId: fromAccountId,
      type: 'transfer',
      amount: -amount,
      description,
      balance: fromAccount.balance - amount,
    });
    addTransaction({
      accountId: toAccountId,
      type: 'transfer',
      amount,
      description,
      balance: toAccount.balance + amount,
    });
    return true;
  };

  const transferToUSBankAccount = (fromAccountId: string, toAccountNumber: string, amount: number, description: string) => {
    if (!user) return false;
    const fromAccount = user.accounts.find(acc => acc.id === fromAccountId);
    if (!fromAccount || fromAccount.balance < amount) return false;
    updateAccountBalance(fromAccountId, fromAccount.balance - amount);
    addTransaction({
      accountId: fromAccountId,
      type: 'transfer',
      amount: -amount,
      description: `Transfer to ${toAccountNumber}`,
      balance: fromAccount.balance - amount,
    });
    return true;
  };

  const getAllUsers = () => registeredUsers;

  const verifyTransactionPin = (pin: string) => user?.transactionPin === pin;

  const setTransactionPin = (pin: string) => {
    if (!user) return;
    const updatedUser = { ...user, transactionPin: pin, hasSetPin: true };
    setUser(updatedUser);
    localStorage.setItem('bankUser', JSON.stringify(updatedUser));
  };

  const checkTransferRestrictions = () => {
    if (user?.transferRestricted) {
      return { restricted: true, reason: 'Transfer restrictions applied.' };
    }
    return { restricted: false };
  };

  return (
    <AuthContext.Provider
      value={{
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
      }}
    >
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
