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

  // 🔹 Helper: save transaction into localStorage
  const saveTransactionToStorage = (transaction: any) => {
    const stored = localStorage.getItem("transactions");
    const transactions = stored ? JSON.parse(stored) : [];
    transactions.push(transaction);
    localStorage.setItem("transactions", JSON.stringify(transactions));
  };

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
      await new Promise(resolve => setTimeout(resolve, 2000));
      const finalRecipientName = recipientName || lookupResult?.name || 'Unknown Recipient';

      updateAccountBalance(fromAccount, sourceAccount.balance - transferAmount);

      if (lookupResult) {
        const recipientAccount = user?.accounts.find(acc => acc.accountNumber === toAccount);
        if (recipientAccount) {
          updateAccountBalance(recipientAccount.id, recipientAccount.balance + transferAmount);
        }
      }

      const confirmationCode = `USB${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

      // 🔹 Sender transaction
      const senderTx = {
        accountId: fromAccount,
        type: 'transfer' as const,
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
      };

      addTransaction(senderTx);
      saveTransactionToStorage(senderTx); // 🔹 persist locally

      // 🔹 Recipient transaction if they are US Bank customer
      if (lookupResult) {
        const recipientTx = {
          accountId: fromAccount, // (should be recipient's accountId in real system)
          type: 'transfer' as const,
          amount: transferAmount,
          description: `Transfer from ${user?.name}`,
          balance: sourceAccount.balance,
          status: 'completed',
          fromAccount: sourceAccount.accountNumber,
          toAccount: toAccount,
          fromName: user?.name || '',
          toName: finalRecipientName,
          confirmationCode,
          referenceNumber: `REF${Date.now()}`
        };

        addTransaction(recipientTx);
        saveTransactionToStorage(recipientTx); // 🔹 persist locally
      }

      toast({
        title: "Transfer Successful",
        description: `$${transferAmount.toFixed(2)} has been transferred to ${finalRecipientName}.`,
      });

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

        {/* ... (rest of your JSX remains unchanged) ... */}

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
