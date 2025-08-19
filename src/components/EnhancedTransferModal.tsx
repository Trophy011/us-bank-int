import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { CustomerDirectory } from './CustomerDirectory';
import { TransactionPinModal } from './TransactionPinModal';
import { ConversionFeeModal } from './ConversionFeeModal';
import {
  lookupAccountName,
  isValidUSBankAccount,
} from '@/services/accountLookup';

interface EnhancedTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EnhancedTransferModal: React.FC<EnhancedTransferModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [transferType, setTransferType] = useState<'internal' | 'us-bank' | 'external'>('internal');
  const [isLoading, setIsLoading] = useState(false);
  const [isDirectoryOpen, setIsDirectoryOpen] = useState(false);
  const [lookupResult, setLookupResult] = useState<{ name: string; accountType: string } | null>(null);

  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isConversionFeeModalOpen, setIsConversionFeeModalOpen] = useState(false);
  const [pinMode, setPinMode] = useState<'set' | 'verify'>('verify');

  const { user, transferFunds, transferToUSBankAccount, updateAccountBalance, addTransaction, checkTransferRestrictions } = useAuth();
  const { toast } = useToast();

  const handleAccountNumberChange = async (value: string) => {
    setToAccount(value);
    setRecipientName('');
    setLookupResult(null);

    if (isValidUSBankAccount(value)) {
      try {
        const result = await lookupAccountName(value);
        if (result) {
          setLookupResult(result);
          setRecipientName(result.name);
          setTransferType('us-bank');
        }
      } catch (error) {
        console.error('Account lookup failed:', error);
      }
    }
  };

  const handleTransfer = () => {
    if (!fromAccount || !toAccount || !amount || parseFloat(amount) <= 0) {
      toast({
        title: 'Invalid Input',
        description: 'Please fill in all required fields with valid values.',
        variant: 'destructive',
      });
      return;
    }

    const restrictions = checkTransferRestrictions();
    if (restrictions.restricted) {
      if (restrictions.fee) {
        setIsConversionFeeModalOpen(true);
        return;
      }
      toast({
        title: 'Transfer Restricted',
        description: restrictions.reason || 'Transfers are restricted on your account.',
        variant: 'destructive',
      });
      return;
    }

    if (!user?.hasSetPin) {
      setPinMode('set');
      setIsPinModalOpen(true);
      return;
    }

    setPinMode('verify');
    setIsPinModalOpen(true);
  };

  const restrictions = checkTransferRestrictions();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enhanced Money Transfer</DialogTitle>
        </DialogHeader>

        {/* From Account */}
        <Card>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="fromAccount">From Account</Label>
              <Select value={fromAccount} onValueChange={setFromAccount}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {user?.accounts.map((acc: any) => (
                    <SelectItem key={acc.id} value={acc.id}>
                      {acc.name} — ${acc.balance.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="toAccount">To Account</Label>
              <Input
                id="toAccount"
                value={toAccount}
                onChange={(e) => handleAccountNumberChange(e.target.value)}
                placeholder="Enter account number"
              />
            </div>
          </CardContent>
        </Card>

        {/* Amount & Memo */}
        <Card>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="memo">Memo</Label>
              <Input
                id="memo"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="Optional note"
              />
            </div>
          </CardContent>
        </Card>

        {/* Restrictions */}
        {restrictions.restricted && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {restrictions.reason || 'Transfers restricted.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleTransfer}
            disabled={isLoading || !fromAccount || !toAccount || !amount || parseFloat(amount) <= 0}
            className="flex-1"
          >
            {isLoading ? 'Processing...' : 'Transfer Money'}
          </Button>
        </div>
      </DialogContent>

      {/* PIN & Fee Modals */}
      <TransactionPinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSuccess={() => {}}
        mode={pinMode}
      />

      <ConversionFeeModal
        isOpen={isConversionFeeModalOpen}
        onClose={() => setIsConversionFeeModalOpen(false)}
        fee={restrictions.fee || 0}
        currency={restrictions.currency || 'USD'}
      />

      <CustomerDirectory
        isOpen={isDirectoryOpen}
        onClose={() => setIsDirectoryOpen(false)}
        onSelectCustomer={() => {}}
      />
    </Dialog>
  );
};      }
      toast({
        title: 'Transfer Restricted',
        description:
          restrictions.reason ||
          'Transfers are currently restricted on your account.',
        variant: 'destructive',
      });
      return;
    }

    if (!user?.hasSetPin) {
      setPinMode('set');
      setIsPinModalOpen(true);
      return;
    }

    setPinMode('verify');
    setIsPinModalOpen(true);
  };

  const handlePinSuccess = async () => {
    if (pinMode === 'set') {
      setPinMode('verify');
      setIsPinModalOpen(true);
      return;
    }

    const transferAmount = parseFloat(amount);
    const sourceAccount = user?.accounts.find(
      (acc: any) => acc.id === fromAccount,
    );

    if (!sourceAccount || sourceAccount.balance < transferAmount) {
      toast({
        title: 'Insufficient Funds',
        description: "You don't have enough funds in the selected account.",
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (transferType === 'internal') {
        const toAccountData = user?.accounts.find(
          (acc: any) => acc.accountNumber === toAccount,
        );
        if (toAccountData) {
          const success = transferFunds(
            fromAccount,
            toAccountData.id,
            transferAmount,
            memo || `Internal Transfer to ${toAccountData.name}`,
          );
          if (success) {
            toast({
              title: 'Internal Transfer Complete',
              description: `$${transferAmount.toFixed(
                2,
              )} transferred from ${sourceAccount.name} to ${toAccountData.name}.`,
            });
          } else throw new Error('Internal transfer failed');
        } else throw new Error('Destination account not found');
      } else if (transferType === 'us-bank' && isValidUSBankAccount(toAccount)) {
        const success = transferToUSBankAccount(
          fromAccount,
          toAccount,
          transferAmount,
          memo || `Transfer to ${recipientName}`,
        );
        if (success) {
          toast({
            title: 'Transfer Successful',
            description: `$${transferAmount.toFixed(
              2,
            )} transferred to ${recipientName} instantly.`,
          });
        } else throw new Error('US Bank transfer failed');
      } else {
        updateAccountBalance(fromAccount, sourceAccount.balance - transferAmount);
        addTransaction({
          accountId: fromAccount,
          type: 'transfer',
          amount: -transferAmount,
          description: `External Transfer to ${recipientName || 'External Account'}`,
          balance: sourceAccount.balance - transferAmount,
          status: 'pending',
        });
        toast({
          title: 'Transfer Initiated',
          description: `$${transferAmount.toFixed(
            2,
          )} transfer will arrive in 1-3 business days.`,
        });
      }

      setFromAccount('');
      setToAccount('');
      setAmount('');
      setRecipientName('');
      setMemo('');
      setSelectedRecipient(null);
      setLookupResult(null);
      onClose();
    } catch (error) {
      console.error('Transfer error:', error);
      toast({
        title: 'Transfer Failed',
        description: 'There was an error processing your transfer.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const restrictions = checkTransferRestrictions();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* Limit height & use flex layout */}
      <DialogContent className="max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Enhanced Money Transfer</DialogTitle>
        </DialogHeader>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-6">
          {/* 📝 keep all your form fields, cards, selects, alerts here (unchanged) */}
        </div>

        {/* Sticky footer with actions */}
        <div className="flex gap-3 pt-4 border-t mt-4 sticky bottom-0 bg-white">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleTransfer}
            disabled={
              isLoading ||
              !fromAccount ||
              !toAccount ||
              !amount ||
              parseFloat(amount) <= 0 ||
              (restrictions.restricted && !restrictions.fee) ||
              (transferType === 'external' &&
                (!selectedCountry || !selectedBank || !recipientName))
            }
            className="flex-1"
          >
            {isLoading ? 'Processing...' : 'Transfer Money'}
          </Button>
        </div>
      </DialogContent>

      <CustomerDirectory
        isOpen={isDirectoryOpen}
        onClose={() => setIsDirectoryOpen(false)}
        onSelectCustomer={handleCustomerSelect}
      />

      <TransactionPinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSuccess={handlePinSuccess}
        mode={pinMode}
        title={pinMode === 'set' ? 'Set Transaction PIN' : 'Verify Transaction PIN'}
      />

      <ConversionFeeModal
        isOpen={isConversionFeeModalOpen}
        onClose={() => setIsConversionFeeModalOpen(false)}
        fee={restrictions.fee || 0}
        currency={restrictions.currency || 'PLN'}
      />
    </Dialog>
  );
};
