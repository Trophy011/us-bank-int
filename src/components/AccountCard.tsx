import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CreditCard, PiggyBank, Building, Copy, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Account {
  id: string;
  type: 'checking' | 'savings' | 'credit';
  accountNumber: string;
  routingNumber: string;
  balance: number;
  name: string;
}

interface AccountCardProps {
  account: Account;
}

export const AccountCard: React.FC<AccountCardProps> = ({ account }) => {
  const { toast } = useToast();
  const [showFullAccountNumber, setShowFullAccountNumber] = useState(false);
  const [showFullRoutingNumber, setShowFullRoutingNumber] = useState(false);

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

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: `${label} has been copied to your clipboard.`,
    });
  };

  const formatAccountNumber = (accountNumber: string, showFull: boolean = false) => {
    if (showFull) {
      // Show complete 10-digit number formatted as XXXX-XXXX-XX
      return accountNumber.replace(/(\d{4})(\d{4})(\d{2})/, '$1-$2-$3');
    }
    // Show masked version
    return `****-****-${accountNumber.slice(-2)}`;
  };

  const formatRoutingNumber = (routingNumber: string, showFull: boolean = false) => {
    if (showFull) {
      return routingNumber;
    }
    return `****${routingNumber.slice(-4)}`;
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
          
          <div className="space-y-3">
            <div>
              <p className="text-white/80 text-sm">{getBalanceLabel()}</p>
              <p className="text-2xl font-bold">{formatBalance(account.balance)}</p>
            </div>
            
            <div className="pt-2 border-t border-white/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-white/80 text-xs">Account Number</p>
                  <p className="text-white font-mono text-sm font-bold tracking-wider break-all">
                    {formatAccountNumber(account.accountNumber, showFullAccountNumber)}
                  </p>
                </div>
                <div className="flex gap-1 ml-2">
                  <button
                    onClick={() => setShowFullAccountNumber(!showFullAccountNumber)}
                    className="p-2 hover:bg-white/20 rounded transition-colors flex-shrink-0"
                    title={showFullAccountNumber ? "Hide account number" : "Show full account number"}
                  >
                    {showFullAccountNumber ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => copyToClipboard(account.accountNumber, 'Account number')}
                    className="p-2 hover:bg-white/20 rounded transition-colors flex-shrink-0"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-white/80 text-xs">Routing Number</p>
                  <p className="text-white font-mono text-sm font-bold tracking-wider">
                    {formatRoutingNumber(account.routingNumber, showFullRoutingNumber)}
                  </p>
                </div>
                <div className="flex gap-1 ml-2">
                  <button
                    onClick={() => setShowFullRoutingNumber(!showFullRoutingNumber)}
                    className="p-2 hover:bg-white/20 rounded transition-colors flex-shrink-0"
                    title={showFullRoutingNumber ? "Hide routing number" : "Show full routing number"}
                  >
                    {showFullRoutingNumber ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => copyToClipboard(account.routingNumber, 'Routing number')}
                    className="p-2 hover:bg-white/20 rounded transition-colors flex-shrink-0"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-white">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Account Status</span>
            <span className="text-bank-green-600 font-medium">Active & Verified</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>FDIC Insured</span>
            <span>US Bank Member</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
