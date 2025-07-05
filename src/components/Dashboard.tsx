import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AccountCard } from '@/components/AccountCard';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { User, ChevronDown, LogOut, ArrowRightLeft, Receipt, Plus, PiggyBank, Building, CreditCard, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { TransferModal } from '@/components/TransferModal';
import { PayBillsModal } from '@/components/PayBillsModal';
import { DepositCheckModal } from '@/components/DepositCheckModal';
import { ATMModal } from '@/components/ATMModal';
import { TransactionReceipt, Transaction } from '@/components/TransactionReceipt';
import { OnlineBankingStatus } from '@/components/OnlineBankingStatus';
import { FundingModal } from '@/components/FundingModal';

interface TransactionItemProps {
  transaction: {
    id: string;
    type: string;
    date: string;
    description: string;
    amount: number;
  };
  onTransactionClick: (transaction: any) => void;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, onTransactionClick }) => {
  const formattedDate = new Date(transaction.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const transactionAmount = transaction.amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  return (
    <li
      className="py-2 border-b cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={() => onTransactionClick(transaction)}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-gray-800">{transaction.description}</p>
          <p className="text-gray-500 text-sm">{formattedDate}</p>
        </div>
        <div className="text-right">
          <p className={`font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {transactionAmount}
          </p>
        </div>
      </div>
    </li>
  );
};

interface TransactionListProps {
  transactions: any[];
  onTransactionClick: (transaction: any) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onTransactionClick }) => {
  return (
    <ul className="divide-y divide-gray-200">
      {transactions.slice(0, 5).map((transaction) => (
        <TransactionItem
          key={transaction.id}
          transaction={transaction}
          onTransactionClick={onTransactionClick}
        />
      ))}
    </ul>
  );
};

export const Dashboard: React.FC = () => {
  const { user, logout, updateAccountBalance, addTransaction } = useAuth();
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isPayBillsOpen, setIsPayBillsOpen] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isATMOpen, setIsATMOpen] = useState(false);
  
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isFundingOpen, setIsFundingOpen] = useState(false);

  const handleTransactionClick = (transaction: any) => {
    // Convert transaction to match TransactionReceipt interface
    const receiptTransaction: Transaction = {
      id: transaction.id,
      type: transaction.type,
      amount: transaction.amount,
      description: transaction.description,
      date: transaction.date,
      status: transaction.status || 'completed',
      fromAccount: transaction.fromAccount,
      toAccount: transaction.toAccount,
      fromName: transaction.fromName,
      toName: transaction.toName,
      referenceNumber: transaction.referenceNumber,
      confirmationCode: transaction.confirmationCode
    };
    
    setSelectedTransaction(receiptTransaction);
    setIsReceiptOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bank-gradient w-10 h-10 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-lg">US</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">US Bank</h1>
                <OnlineBankingStatus />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setIsFundingOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Fund Account
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span className="hidden sm:inline">{user?.name}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Profile Settings</DropdownMenuItem>
                  <DropdownMenuItem>Security</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}!
          </h2>
          <p className="text-gray-600">Manage your accounts and track your financial activity.</p>
        </div>

        {/* Quick Actions */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Button className="flex items-center justify-center gap-2" onClick={() => setIsTransferOpen(true)}>
            <ArrowRightLeft className="h-5 w-5" />
            Transfer
          </Button>
          <Button className="flex items-center justify-center gap-2" onClick={() => setIsPayBillsOpen(true)}>
            <Receipt className="h-5 w-5" />
            Pay Bills
          </Button>
          <Button className="flex items-center justify-center gap-2" onClick={() => setIsDepositOpen(true)}>
            <PiggyBank className="h-5 w-5" />
            Deposit Check
          </Button>
          <Button className="flex items-center justify-center gap-2" onClick={() => setIsATMOpen(true)}>
            <Building className="h-5 w-5" />
            Find ATM
          </Button>
        </section>

        {/* Accounts Overview */}
        <section className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Your Accounts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {user?.accounts.map((account) => (
              <AccountCard key={account.id} account={account} />
            ))}
          </div>
        </section>

        {/* Recent Transactions */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Recent Activity</h3>
            <Button variant="outline" size="sm">
              View All Transactions
            </Button>
          </div>
          <TransactionList 
            transactions={user?.transactions || []} 
            onTransactionClick={handleTransactionClick}
          />
        </section>
      </main>

      {/* Modals */}
      <TransferModal 
        isOpen={isTransferOpen} 
        onClose={() => setIsTransferOpen(false)} 
      />
      
      <PayBillsModal 
        isOpen={isPayBillsOpen} 
        onClose={() => setIsPayBillsOpen(false)} 
      />
      
      <DepositCheckModal 
        isOpen={isDepositOpen} 
        onClose={() => setIsDepositOpen(false)} 
      />
      
      <ATMModal 
        isOpen={isATMOpen} 
        onClose={() => setIsATMOpen(false)} 
      />

      <FundingModal
        isOpen={isFundingOpen}
        onClose={() => setIsFundingOpen(false)}
      />

      <TransactionReceipt
        transaction={selectedTransaction}
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        userAccountNumber={user?.accounts[0]?.accountNumber}
        userName={user?.name}
      />
    </div>
  );
};
