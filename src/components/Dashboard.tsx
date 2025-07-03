
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { AccountCard } from './AccountCard';
import { TransactionList } from './TransactionList';
import { TransferModal } from './TransferModal';
import { PayBillsModal } from './PayBillsModal';
import { DepositCheckModal } from './DepositCheckModal';
import { ATMModal } from './ATMModal';
import { LogOut, CreditCard, TrendingUp, PiggyBank, User } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user, logout, transactions } = useAuth();
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showPayBillsModal, setShowPayBillsModal] = useState(false);
  const [showDepositCheckModal, setShowDepositCheckModal] = useState(false);
  const [showATMModal, setShowATMModal] = useState(false);

  if (!user) return null;

  const totalBalance = user.accounts.reduce((sum, account) => {
    return account.type === 'credit' ? sum + account.balance : sum + account.balance;
  }, 0);

  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bank-gradient w-8 h-8 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">US</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">US Bank</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.name}</span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={logout}
                className="text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Overview</h2>
          <p className="text-gray-600">Manage your accounts and transactions</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Balance</CardTitle>
              <PiggyBank className="h-4 w-4 text-bank-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-gray-600 mt-1">Across all accounts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Accounts</CardTitle>
              <CreditCard className="h-4 w-4 text-bank-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{user.accounts.length}</div>
              <p className="text-xs text-gray-600 mt-1">Banking products</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Recent Activity</CardTitle>
              <TrendingUp className="h-4 w-4 text-bank-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{transactions.length}</div>
              <p className="text-xs text-gray-600 mt-1">Total transactions</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={() => setShowTransferModal(true)}
              className="bank-gradient hover:opacity-90 transition-opacity"
            >
              Transfer Funds
            </Button>
            <Button 
              variant="outline"
              onClick={() => setShowPayBillsModal(true)}
            >
              Pay Bills
            </Button>
            <Button 
              variant="outline"
              onClick={() => setShowDepositCheckModal(true)}
            >
              Deposit Check
            </Button>
            <Button 
              variant="outline"
              onClick={() => setShowATMModal(true)}
            >
              Find ATM
            </Button>
          </div>
        </div>

        {/* Accounts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {user.accounts.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}
        </div>

        {/* Recent Transactions */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest account activity</CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionList transactions={recentTransactions} accounts={user.accounts} />
            </CardContent>
          </Card>
        </div>

        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Full Name</label>
                <p className="text-gray-900">{user.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="text-gray-900">{user.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Phone</label>
                <p className="text-gray-900">{user.phone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Customer ID</label>
                <p className="text-gray-900">{user.id}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* All Modals */}
      <TransferModal 
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        accounts={user.accounts}
      />
      
      <PayBillsModal 
        isOpen={showPayBillsModal}
        onClose={() => setShowPayBillsModal(false)}
      />
      
      <DepositCheckModal 
        isOpen={showDepositCheckModal}
        onClose={() => setShowDepositCheckModal(false)}
      />
      
      <ATMModal 
        isOpen={showATMModal}
        onClose={() => setShowATMModal(false)}
      />
    </div>
  );
};
