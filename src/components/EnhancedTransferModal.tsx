import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowRightLeft, Users, Zap, Clock, DollarSign, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { CustomerDirectory } from './CustomerDirectory';
import { TransactionPinModal } from './TransactionPinModal';
import { ConversionFeeModal } from './ConversionFeeModal';
import { lookupAccountName, isValidUSBankAccount } from '@/services/accountLookup';

interface EnhancedTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EnhancedTransferModal: React.FC<EnhancedTransferModalProps> = ({ isOpen, onClose }) => {
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [transferType, setTransferType] = useState<'internal' | 'us-bank' | 'external'>('internal');
  const [isLoading, setIsLoading] = useState(false);
  const [isDirectoryOpen, setIsDirectoryOpen] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<any>(null);
  const [lookupResult, setLookupResult] = useState<{ name: string; accountType: string } | null>(null);

  // PIN and conversion fee states
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isConversionFeeModalOpen, setIsConversionFeeModalOpen] = useState(false);
  const [pinMode, setPinMode] = useState<'set' | 'verify'>('verify');

  const { user, transferToUSBankAccount, addTransaction, updateAccountBalance, checkTransferRestrictions } = useAuth();
  const { toast } = useToast();

  const handleCustomerSelect = (customer: any, account: any) => {
    setSelectedRecipient({ customer, account });
    setToAccount(account.accountNumber);
    setRecipientName(customer.name);
    setTransferType('us-bank');
    setLookupResult({ name: customer.name, accountType: account.type });
  };

  const handleAccountNumberChange = async (value: string) => {
    setToAccount(value);
    setRecipientName('');
    setLookupResult(null);
    setSelectedRecipient(null);

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

    // Check if user needs to set PIN
    if (!user?.hasSetPin) {
      setPinMode('set');
      setIsPinModalOpen(true);
      return;
    }

    // Verify PIN for transfer
    setPinMode('verify');
    setIsPinModalOpen(true);
  };

  const handlePinSuccess = async () => {
    if (pinMode === 'set') {
      // After setting PIN, proceed to verify
      setPinMode('verify');
      setIsPinModalOpen(true);
      return;
    }

    // Proceed with transfer after PIN verification
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
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (transferType === 'us-bank' && isValidUSBankAccount(toAccount)) {
        const success = transferToUSBankAccount(fromAccount, toAccount, transferAmount, memo || `Transfer to ${recipientName}`);
        
        if (success) {
          toast({
            title: "Transfer Successful",
            description: `$${transferAmount.toFixed(2)} transferred to ${recipientName} instantly.`,
          });
        } else {
          throw new Error('Transfer failed');
        }
      } else if (transferType === 'internal') {
        const toAccountData = user?.accounts.find(acc => acc.accountNumber === toAccount);
        if (toAccountData) {
          updateAccountBalance(fromAccount, sourceAccount.balance - transferAmount);
          updateAccountBalance(toAccountData.id, toAccountData.balance + transferAmount);
          
          addTransaction({
            accountId: fromAccount,
            type: 'transfer',
            amount: -transferAmount,
            description: `Internal Transfer to ${toAccountData.name}`,
            balance: sourceAccount.balance - transferAmount,
            status: 'completed'
          });

          toast({
            title: "Internal Transfer Complete",
            description: `$${transferAmount.toFixed(2)} transferred between your accounts.`,
          });
        }
      } else {
        updateAccountBalance(fromAccount, sourceAccount.balance - transferAmount);
        
        addTransaction({
          accountId: fromAccount,
          type: 'transfer',
          amount: -transferAmount,
          description: `External Transfer to ${recipientName || 'External Account'}`,
          balance: sourceAccount.balance - transferAmount,
          status: 'pending'
        });

        toast({
          title: "Transfer Initiated",
          description: `$${transferAmount.toFixed(2)} transfer will arrive in 1-3 business days.`,
        });
      }

      // Reset form
      setFromAccount('');
      setToAccount('');
      setAmount('');
      setRecipientName('');
      setMemo('');
      setSelectedRecipient(null);
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

  const getTransferSpeed = () => {
    switch (transferType) {
      case 'internal':
        return { icon: <Zap className="h-4 w-4" />, text: 'Instant', color: 'text-green-600' };
      case 'us-bank':
        return { icon: <Zap className="h-4 w-4" />, text: 'Instant', color: 'text-blue-600' };
      case 'external':
        return { icon: <Clock className="h-4 w-4" />, text: '1-3 Days', color: 'text-orange-600' };
      default:
        return { icon: <Clock className="h-4 w-4" />, text: 'Standard', color: 'text-gray-600' };
    }
  };

  const restrictions = checkTransferRestrictions();
  const transferSpeed = getTransferSpeed();

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5" />
              Enhanced Money Transfer
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Transfer Restriction Alert */}
            {restrictions.restricted && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {restrictions.reason}. 
                  {restrictions.fee && ` Fee: ${restrictions.fee} ${restrictions.currency}`}
                </AlertDescription>
              </Alert>
            )}

            {/* Currency Display for PLN accounts */}
            {user?.currency === 'PLN' && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Account Currency</span>
                    <Badge variant="outline">PLN (Polish Złoty)</Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Transfer Type Selection */}
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={transferType === 'internal' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTransferType('internal')}
                    className="flex flex-col items-center p-3 h-auto"
                  >
                    <Zap className="h-4 w-4 mb-1" />
                    <span className="text-xs">My Accounts</span>
                  </Button>
                  <Button
                    variant={transferType === 'us-bank' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTransferType('us-bank')}
                    className="flex flex-col items-center p-3 h-auto"
                  >
                    <Users className="h-4 w-4 mb-1" />
                    <span className="text-xs">US Bank</span>
                  </Button>
                  <Button
                    variant={transferType === 'external' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTransferType('external')}
                    className="flex flex-col items-center p-3 h-auto"
                  >
                    <DollarSign className="h-4 w-4 mb-1" />
                    <span className="text-xs">External</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

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
                        <span className="text-sm text-green-600 font-semibold">
                          ${account.balance.toFixed(2)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* To Account/Recipient */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>To {transferType === 'internal' ? 'Account' : 'Recipient'}</Label>
                {transferType === 'us-bank' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsDirectoryOpen(true)}
                  >
                    <Users className="h-4 w-4 mr-1" />
                    Browse
                  </Button>
                )}
              </div>

              {transferType === 'internal' ? (
                <Select value={toAccount} onValueChange={setToAccount}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination account" />
                  </SelectTrigger>
                  <SelectContent>
                    {user?.accounts.filter(acc => acc.id !== fromAccount).map((account) => (
                      <SelectItem key={account.id} value={account.accountNumber}>
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
              ) : (
                <Input
                  placeholder={transferType === 'us-bank' ? "Enter US Bank account number" : "Enter account number"}
                  value={toAccount}
                  onChange={(e) => handleAccountNumberChange(e.target.value)}
                  maxLength={transferType === 'us-bank' ? 10 : undefined}
                />
              )}

              {lookupResult && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-blue-900">{lookupResult.name}</p>
                      <p className="text-sm text-blue-700">{lookupResult.accountType} Account</p>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      US Bank Customer
                    </Badge>
                  </div>
                </div>
              )}
            </div>

            {/* Recipient Name for external transfers */}
            {transferType === 'external' && (
              <div className="space-y-2">
                <Label htmlFor="recipient-name">Recipient Name</Label>
                <Input
                  id="recipient-name"
                  placeholder="Enter recipient name"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                />
              </div>
            )}

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

            {/* Transfer Speed Indicator */}
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={transferSpeed.color}>{transferSpeed.icon}</span>
                    <span className="text-sm font-medium">Transfer Speed:</span>
                  </div>
                  <Badge variant="outline" className={transferSpeed.color}>
                    {transferSpeed.text}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handleTransfer} 
                disabled={isLoading || !fromAccount || !toAccount || !amount || restrictions.restricted}
                className="flex-1"
              >
                {isLoading ? 'Processing...' : 'Transfer Money'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
    </>
  );
};
