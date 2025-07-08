
import React from 'react';
import { ArrowUpRight, ArrowDownLeft, ArrowRightLeft } from 'lucide-react';

interface Transaction {
  id: string;
  accountId: string;
  type: 'debit' | 'credit' | 'transfer';
  amount: number;
  description: string;
  date: string;
  balance: number;
  currency?: string;
}

interface Account {
  id: string;
  type: 'checking' | 'savings' | 'credit';
  accountNumber: string;
  balance: number;
  name: string;
  currency?: string;
}

interface TransactionListProps {
  transactions: Transaction[];
  accounts: Account[];
}

export const TransactionList: React.FC<TransactionListProps> = ({ transactions, accounts }) => {
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'credit':
        return <ArrowDownLeft className="h-4 w-4 text-bank-green-600" />;
      case 'debit':
        return <ArrowUpRight className="h-4 w-4 text-bank-red-600" />;
      case 'transfer':
        return <ArrowRightLeft className="h-4 w-4 text-bank-blue-600" />;
      default:
        return <ArrowRightLeft className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getCurrencySymbol = (curr: string) => {
    switch (curr) {
      case 'PLN': return 'zł';
      case 'GBP': return '£';
      case 'EUR': return '€';
      case 'USD': return '$';
      default: return '$';
    }
  };

  const formatAmount = (amount: number, type: string, currency: string = 'USD') => {
    const symbol = getCurrencySymbol(currency);
    const formatted = amount.toLocaleString('en-US', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    });
    
    if (type === 'credit') {
      return `+${symbol}${formatted}`;
    } else {
      return `-${symbol}${formatted}`;
    }
  };

  const formatBalance = (balance: number, currency: string = 'USD') => {
    const symbol = getCurrencySymbol(currency);
    return `${symbol}${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const getAmountColor = (type: string) => {
    switch (type) {
      case 'credit':
        return 'text-bank-green-600';
      case 'debit':
        return 'text-bank-red-600';
      default:
        return 'text-gray-900';
    }
  };

  const getAccountName = (accountId: string) => {
    const account = accounts.find(acc => acc.id === accountId);
    return account ? account.name : 'Unknown Account';
  };

  const getAccountCurrency = (accountId: string) => {
    const account = accounts.find(acc => acc.id === accountId);
    return account?.currency || 'USD';
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No transactions found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => {
        const accountCurrency = transaction.currency || getAccountCurrency(transaction.accountId);
        
        return (
          <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                {getTransactionIcon(transaction.type)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {transaction.description}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <p className="text-xs text-gray-500">
                    {getAccountName(transaction.accountId)}
                  </p>
                  <span className="text-xs text-gray-300">•</span>
                  <p className="text-xs text-gray-500">
                    {formatDate(transaction.date)}
                  </p>
                  {accountCurrency !== 'USD' && (
                    <>
                      <span className="text-xs text-gray-300">•</span>
                      <p className="text-xs text-gray-500 font-medium">
                        {accountCurrency}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <p className={`text-sm font-semibold ${getAmountColor(transaction.type)}`}>
                {formatAmount(transaction.amount, transaction.type, accountCurrency)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Balance: {formatBalance(transaction.balance, accountCurrency)}
              </p>
            </div>
          </div>
        );
      })}
      
      {transactions.length === 5 && (
        <div className="text-center pt-4">
          <button className="text-bank-blue-600 hover:text-bank-blue-800 text-sm font-medium">
            View All Transactions
          </button>
        </div>
      )}
    </div>
  );
};
