
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { CreditCard, Building, Plus } from 'lucide-react';

interface FundingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FundingModal: React.FC<FundingModalProps> = ({ isOpen, onClose }) => {
  const [amount, setAmount] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [fundingMethod, setFundingMethod] = useState('external');
  const [isLoading, setIsLoading] = useState(false);
  
  const { user, updateAccountBalance, addTransaction } = useAuth();
  const { toast } = useToast();

  const handleFunding = async () => {
    if (!amount || !selectedAccount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid amount and select an account.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const fundAmount = parseFloat(amount);
      const account = user?.accounts.find(acc => acc.id === selectedAccount);
      
      if (account) {
        // Update account balance
        updateAccountBalance(selectedAccount, account.balance + fundAmount);
        
        // Add transaction record
        addTransaction({
          id: `FUND-${Date.now()}`,
          type: 'deposit',
          amount: fundAmount,
          description: `Account Funding - ${fundingMethod === 'external' ? 'External Transfer' : 'Internal Transfer'}`,
          date: new Date().toISOString(),
          status: 'completed',
          toAccount: account.accountNumber,
          toName: user.name,
          confirmationCode: `USB${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
          referenceNumber: `REF${Date.now()}`
        });

        toast({
          title: "Funding Successful",
          description: `$${fundAmount.toFixed(2)} has been added to your ${account.name}.`,
        });

        // Reset form
        setAmount('');
        setSelectedAccount('');
        onClose();
      }
    } catch (error) {
      toast({
        title: "Funding Failed",
        description: "There was an error processing your funding request.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Fund Your Account
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Funding Method */}
          <div className="space-y-3">
            <Label>Funding Method</Label>
            <div className="grid grid-cols-2 gap-3">
              <Card 
                className={`cursor-pointer transition-all ${fundingMethod === 'external' ? 'ring-2 ring-bank-blue-500' : ''}`}
                onClick={() => setFundingMethod('external')}
              >
                <CardContent className="p-4 text-center">
                  <CreditCard className="h-8 w-8 mx-auto mb-2 text-bank-blue-600" />
                  <p className="text-sm font-medium">External</p>
                  <p className="text-xs text-gray-600">Bank/Card</p>
                </CardContent>
              </Card>
              
              <Card 
                className={`cursor-pointer transition-all ${fundingMethod === 'internal' ? 'ring-2 ring-bank-blue-500' : ''}`}
                onClick={() => setFundingMethod('internal')}
              >
                <CardContent className="p-4 text-center">
                  <Building className="h-8 w-8 mx-auto mb-2 text-bank-blue-600" />
                  <p className="text-sm font-medium">Internal</p>
                  <p className="text-xs text-gray-600">US Bank</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Account Selection */}
          <div className="space-y-2">
            <Label htmlFor="account">Select Account to Fund</Label>
            <Select value={selectedAccount} onValueChange={setSelectedAccount}>
              <SelectTrigger>
                <SelectValue placeholder="Choose account" />
              </SelectTrigger>
              <SelectContent>
                {user?.accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name} - ***{account.accountNumber.slice(-4)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              min="0.01"
            />
          </div>

          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-4 gap-2">
            {['25', '50', '100', '500'].map((quickAmount) => (
              <Button
                key={quickAmount}
                variant="outline"
                size="sm"
                onClick={() => setAmount(quickAmount)}
              >
                ${quickAmount}
              </Button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleFunding} 
              disabled={isLoading || !amount || !selectedAccount}
              className="flex-1"
            >
              {isLoading ? 'Processing...' : 'Fund Account'}
            </Button>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-gray-600 text-center">
            Funding may take 1-3 business days depending on the method selected.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
