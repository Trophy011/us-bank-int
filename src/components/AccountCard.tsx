
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CreditCard, PiggyBank, Building } from 'lucide-react';

interface Account {
  id: string;
  type: 'checking' | 'savings' | 'credit';
  accountNumber: string;
  balance: number;
  name: string;
}

interface AccountCardProps {
  account: Account;
}

export const AccountCard: React.FC<AccountCardProps> = ({ account }) => {
  const getAccountIcon = () => {
    switch (account.type) {
      case 'checking':
        return <Building className="h-6 w-6 text-white" />;
      case 'savings':
        return <PiggyBank className="h-6 w-6 text-white" />;
      case 'credit':
        return <CreditCard className="h-6 w-6 text-white" />;
      default:
        return <Building className="h-6 w-6 text-white" />;
    }
  };

  const getAccountColor = () => {
    switch (account.type) {
      case 'checking':
        return 'from-bank-blue-600 to-bank-blue-800';
      case 'savings':
        return 'from-bank-green-500 to-bank-green-600';
      case 'credit':
        return 'from-purple-600 to-purple-800';
      default:
        return 'from-bank-blue-600 to-bank-blue-800';
    }
  };

  const formatBalance = (balance: number) => {
    const isNegative = balance < 0;
    const absoluteBalance = Math.abs(balance);
    const formatted = absoluteBalance.toLocaleString('en-US', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    });
    
    if (account.type === 'credit') {
      return isNegative ? `$${formatted}` : `$0.00`;
    }
    
    return `$${formatted}`;
  };

  const getBalanceLabel = () => {
    if (account.type === 'credit') {
      return account.balance < 0 ? 'Current Balance' : 'Available Credit';
    }
    return 'Available Balance';
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200 transaction-hover">
      <CardContent className="p-0">
        <div className={`bg-gradient-to-br ${getAccountColor()} p-6 text-white`}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold">{account.name}</h3>
              <p className="text-white/80 text-sm">{account.type.charAt(0).toUpperCase() + account.type.slice(1)}</p>
            </div>
            {getAccountIcon()}
          </div>
          
          <div className="space-y-2">
            <div>
              <p className="text-white/80 text-sm">{getBalanceLabel()}</p>
              <p className="text-2xl font-bold">{formatBalance(account.balance)}</p>
            </div>
            
            <div className="pt-2 border-t border-white/20">
              <p className="text-white/80 text-sm">Account Number</p>
              <p className="text-white font-mono">{account.accountNumber}</p>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-white">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Account Status</span>
            <span className="text-bank-green-600 font-medium">Active</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
