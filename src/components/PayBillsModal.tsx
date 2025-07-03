
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Zap, Wifi, Car, Building } from 'lucide-react';

interface PayBillsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const billTypes = [
  { id: 'electricity', name: 'Electricity', icon: Zap },
  { id: 'internet', name: 'Internet', icon: Wifi },
  { id: 'credit-card', name: 'Credit Card', icon: CreditCard },
  { id: 'insurance', name: 'Insurance', icon: Car },
  { id: 'mortgage', name: 'Mortgage', icon: Building },
];

export const PayBillsModal: React.FC<PayBillsModalProps> = ({ isOpen, onClose }) => {
  const { user, addTransaction } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    billType: '',
    payee: '',
    accountNumber: '',
    amount: '',
    fromAccount: '',
    dueDate: '',
    memo: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.billType || !formData.payee || !formData.amount || !formData.fromAccount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const amount = parseFloat(formData.amount);
    const fromAccount = user.accounts.find(acc => acc.id === formData.fromAccount);
    
    if (!fromAccount || fromAccount.balance < amount) {
      toast({
        title: "Error",
        description: "Insufficient funds in selected account",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    addTransaction({
      accountId: formData.fromAccount,
      type: 'debit',
      amount,
      description: `Bill Payment - ${formData.payee}`,
      balance: fromAccount.balance - amount
    });

    toast({
      title: "Payment Successful",
      description: `Your ${formData.billType} bill has been paid successfully`,
    });

    setFormData({
      billType: '',
      payee: '',
      accountNumber: '',
      amount: '',
      fromAccount: '',
      dueDate: '',
      memo: ''
    });
    setIsProcessing(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Pay Bills</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="billType">Bill Type *</Label>
            <Select value={formData.billType} onValueChange={(value) => setFormData({...formData, billType: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select bill type" />
              </SelectTrigger>
              <SelectContent>
                {billTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <SelectItem key={type.id} value={type.id}>
                      <div className="flex items-center">
                        <Icon className="h-4 w-4 mr-2" />
                        {type.name}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="payee">Payee Name *</Label>
            <Input
              id="payee"
              value={formData.payee}
              onChange={(e) => setFormData({...formData, payee: e.target.value})}
              placeholder="Enter payee name"
              required
            />
          </div>

          <div>
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input
              id="accountNumber"
              value={formData.accountNumber}
              onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
              placeholder="Enter account number"
            />
          </div>

          <div>
            <Label htmlFor="amount">Amount *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <Label htmlFor="fromAccount">Pay From *</Label>
            <Select value={formData.fromAccount} onValueChange={(value) => setFormData({...formData, fromAccount: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {user?.accounts.filter(acc => acc.type !== 'credit').map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name} - ${account.balance.toFixed(2)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
            />
          </div>

          <div>
            <Label htmlFor="memo">Memo</Label>
            <Input
              id="memo"
              value={formData.memo}
              onChange={(e) => setFormData({...formData, memo: e.target.value})}
              placeholder="Optional memo"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="w-full">
              Cancel
            </Button>
            <Button type="submit" disabled={isProcessing} className="w-full">
              {isProcessing ? 'Processing...' : 'Pay Bill'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
