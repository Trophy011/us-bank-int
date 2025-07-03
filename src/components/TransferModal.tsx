
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ArrowRightLeft } from 'lucide-react';

interface Account {
  id: string;
  type: 'checking' | 'savings' | 'credit';
  accountNumber: string;
  balance: number;
  name: string;
}

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
}

export const TransferModal: React.FC<TransferModalProps> = ({ isOpen, onClose, accounts }) => {
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const { transferFunds } = useAuth();
  const { toast } = useToast();

  const eligibleFromAccounts = accounts.filter(acc => acc.type !== 'credit');
  const eligibleToAccounts = accounts.filter(acc => acc.id !== fromAccount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fromAccount || !toAccount || !amount || !description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const transferAmount = parseFloat(amount);
    if (transferAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid transfer amount.",
        variant: "destructive"
      });
      return;
    }

    const sourceAccount = accounts.find(acc => acc.id === fromAccount);
    if (sourceAccount && transferAmount > sourceAccount.balance) {
      toast({
        title: "Insufficient Funds",
        description: "You don't have enough balance in the source account.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const success = transferFunds(fromAccount, toAccount, transferAmount, description);
      
      if (success) {
        toast({
          title: "Transfer Successful",
          description: `$${transferAmount.toFixed(2)} has been transferred successfully.`,
        });
        
        // Reset form
        setFromAccount('');
        setToAccount('');
        setAmount('');
        setDescription('');
        onClose();
      } else {
        toast({
          title: "Transfer Failed",
          description: "Unable to process the transfer. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getSelectedAccountBalance = (accountId: string) => {
    const account = accounts.find(acc => acc.id === accountId);
    return account ? account.balance : 0;
  };

  const getAccountDisplayName = (account: Account) => {
    return `${account.name} (${account.accountNumber})`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            Transfer Funds
          </DialogTitle>
          <DialogDescription>
            Transfer money between your accounts instantly
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="fromAccount">From Account</Label>
            <Select value={fromAccount} onValueChange={setFromAccount}>
              <SelectTrigger>
                <SelectValue placeholder="Select source account" />
              </SelectTrigger>
              <SelectContent>
                {eligibleFromAccounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    <div className="flex justify-between items-center w-full">
                      <span>{getAccountDisplayName(account)}</span>
                      <span className="ml-2 text-sm text-gray-500">
                        ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fromAccount && (
              <p className="text-sm text-gray-600">
                Available: ${getSelectedAccountBalance(fromAccount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="toAccount">To Account</Label>
            <Select value={toAccount} onValueChange={setToAccount}>
              <SelectTrigger>
                <SelectValue placeholder="Select destination account" />
              </SelectTrigger>
              <SelectContent>
                {eligibleToAccounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    <div className="flex justify-between items-center w-full">
                      <span>{getAccountDisplayName(account)}</span>
                      <span className="ml-2 text-sm text-gray-500">
                        ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0.01"
              step="0.01"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              type="text"
              placeholder="What's this transfer for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bank-gradient hover:opacity-90 transition-opacity"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Transfer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
