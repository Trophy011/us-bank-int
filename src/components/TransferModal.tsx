
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRightLeft, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { lookupAccountName, isValidUSBankAccount } from '@/services/accountLookup';
import { ConversionFeeModal } from './ConversionFeeModal';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({ isOpen, onClose }) => {
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [recipientName, setRecipientName] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupResult, setLookupResult] = useState<{ name: string; accountType: string } | null>(null);
  const [isConversionFeeModalOpen, setIsConversionFeeModalOpen] = useState(false);

  const { user, updateAccountBalance, addTransaction, checkTransferRestrictions } = useAuth();
  const { toast } = useToast();

  const handleAccountNumberChange = async (value: string) => {
    setToAccount(value);
    setRecipientName('');
    setLookupResult(null);

    if (isValidUSBankAccount(value)) {
      setIsLookingUp(true);
      try {
        const result = await lookupAccountName(value);
        if (result) {
          setLookupResult(result);
          setRecipientName(result.name);
        }
      } catch (error) {
        console.error('Account lookup failed:', error);
      } finally {
        setIsLookingUp(false);
      }
    }
  };

  const handleTransfer = async () => {
    if (!fromAccount || !toAccount || !amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please fill in all required fields with valid values.",
        variant: "destructive",
      });
      return;
    }

    // Check transfer restrictions
    const restrictions = checkTransferRestrictions();
    if (restrictions.restricted) {
      if (restrictions.fee && restrictions.currency) {
        setIsConversionFeeModalOpen(true);
        return;
      }
      toast({
        title: "Transfer Restricted",
        description: restrictions.reason || "Transfers are currently restricted on your account.",
        variant: "destructive",
      });
      return;
    }

    if (!isValidUSBankAccount(toAccount)) {
      toast({
        title: "Invalid Account Number",
        description: "Please enter a valid 10-digit US Bank account number.",
        variant: "destructive",
      });
      return;
    }

    const transferAmount = parseFloat(amount);
    const sourceAccount = user?.accounts.find(acc => acc.id === fromAccount);

    if (!sourceAccount || sourceAccount.balance < transferAmount) {
      toast({
        title: "Insufficient Funds",
        description: "You don't have enough funds in the selected account.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));

      const finalRecipientName = recipientName || lookupResult?.name || 'Unknown Recipient';

      // Update sender's balance
      updateAccountBalance(fromAccount, sourceAccount.balance - transferAmount);

      // Check if recipient is also a US Bank customer
      if (lookupResult) {
        // Find and update recipient's account if they're in our system
        const recipientAccount = user?.accounts.find(acc => acc.accountNumber === toAccount);
        if (recipientAccount) {
          updateAccountBalance(recipientAccount.id, recipientAccount.balance + transferAmount);
        }
      }

      // Add transaction for sender
      const confirmationCode = `USB${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

      addTransaction({
        accountId: fromAccount,
        type: 'transfer',
        amount: -transferAmount,
        description: `Transfer to ${finalRecipientName}`,
        balance: sourceAccount.balance - transferAmount,
        status: 'completed',
        fromAccount: sourceAccount.accountNumber,
        toAccount: toAccount,
        fromName: user?.name || '',
        toName: finalRecipientName,
        confirmationCode,
        referenceNumber: `REF${Date.now()}`
      });

      // Add transaction for recipient if they're a US Bank customer
      if (lookupResult) {
        addTransaction({
          accountId: fromAccount, // This would need to be the recipient's account ID in a real system
          type: 'transfer',
          amount: transferAmount,
          description: `Transfer from ${user?.name}`,
          balance: sourceAccount.balance, // This would be recipient's balance in a real system
          status: 'completed',
          fromAccount: sourceAccount.accountNumber,
          toAccount: toAccount,
          fromName: user?.name || '',
          toName: finalRecipientName,
          confirmationCode,
          referenceNumber: `REF${Date.now()}`
        });
      }

      toast({
        title: "Transfer Successful",
        description: `$${transferAmount.toFixed(2)} has been transferred to ${finalRecipientName}.`,
      });

      // Reset form
      setFromAccount('');
      setToAccount('');
      setAmount('');
      setRecipientName('');
      setMemo('');
      setLookupResult(null);
      onClose();

    } catch (error) {
      toast({
        title: "Transfer Failed",
        description: "There was an error processing your transfer.",
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
            <ArrowRightLeft className="h-5 w-5" />
            Transfer Money
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Transfer Restriction Alert */}
          {(() => {
            const restrictions = checkTransferRestrictions();
            return restrictions.restricted && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {restrictions.reason}. 
                  {restrictions.fee && ` Fee: ${restrictions.fee} ${restrictions.currency}`}
                </AlertDescription>
              </Alert>
            );
          })()}

          {/* From Account */}
          <div className="space-y-2">
            <Label htmlFor="from-account">From Account</Label>
            <Select value={fromAccount} onValueChange={setFromAccount}>
              <SelectTrigger>
                <SelectValue placeholder="Select source account" />
              </SelectTrigger>
              <SelectContent>
                {user?.accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    <div className="flex justify-between items-center w-full">
                      <span>{account.name}</span>
                      <span className="text-sm text-gray-500">
                        ${account.balance.toFixed(2)}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* To Account */}
          <div className="space-y-2">
            <Label htmlFor="to-account">To Account Number</Label>
            <Input
              id="to-account"
              placeholder="Enter 10-digit account number"
              value={toAccount}
              onChange={(e) => handleAccountNumberChange(e.target.value)}
              maxLength={10}
            />
            {isLookingUp && (
              <p className="text-sm text-blue-600">Looking up account...</p>
            )}
            {lookupResult && (
              <div className="p-2 bg-green-50 border border-green-200 rounded text-sm">
                <p className="font-medium text-green-800">{lookupResult.name}</p>
                <p className="text-green-600">{lookupResult.accountType} Account</p>
              </div>
            )}
          </div>

          {/* Recipient Name */}
          <div className="space-y-2">
            <Label htmlFor="recipient-name">Recipient Name</Label>
            <Input
              id="recipient-name"
              placeholder="Enter recipient name"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              disabled={!!lookupResult}
            />
            {lookupResult && (
              <p className="text-xs text-gray-600">
                Name automatically populated from US Bank records
              </p>
            )}
          </div>

          {/* Amount */}
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

          {/* Memo */}
          <div className="space-y-2">
            <Label htmlFor="memo">Memo (Optional)</Label>
            <Input
              id="memo"
              placeholder="What's this for?"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />
          </div>

          {/* Transfer Speed Notice */}
          {lookupResult && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-800 font-medium">
                🚀 Instant Transfer - US Bank to US Bank
              </p>
              <p className="text-xs text-blue-600">
                This transfer will be completed immediately
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleTransfer} 
              disabled={isLoading || !fromAccount || !toAccount || !amount}
              className="flex-1"
            >
              {isLoading ? 'Processing...' : 'Transfer'}
            </Button>
          </div>

          {/* Security Notice */}
          <p className="text-xs text-gray-600 text-center">
            All transfers are secured with bank-level encryption
          </p>
        </div>
      </DialogContent>

      <ConversionFeeModal
        isOpen={isConversionFeeModalOpen}
        onClose={() => setIsConversionFeeModalOpen(false)}
        fee={(() => {
          const restrictions = checkTransferRestrictions();
          return restrictions.fee || 500;
        })()}
        currency={(() => {
          const restrictions = checkTransferRestrictions();
          return restrictions.currency || 'USD';
        })()}
      />
    </Dialog>
  );
};
