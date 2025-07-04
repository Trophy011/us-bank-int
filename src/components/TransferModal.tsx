import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ArrowRightLeft, Building2, Globe, CheckCircle, Mail } from 'lucide-react';
import { TransferReceipt } from './TransferReceipt';

interface Account {
  id: string;
  type: 'checking' | 'savings' | 'credit';
  accountNumber: string;
  routingNumber: string;
  balance: number;
  name: string;
}

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
}

export const TransferModal: React.FC<TransferModalProps> = ({ isOpen, onClose, accounts }) => {
  const [transferType, setTransferType] = useState<'internal' | 'domestic' | 'international'>('internal');
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  // External transfer fields
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [bankName, setBankName] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [swiftCode, setSwiftCode] = useState('');
  const [country, setCountry] = useState('');

  // Receipt state
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptDetails, setReceiptDetails] = useState<any>(null);

  const { transferFunds, sendDomesticTransfer, user } = useAuth();
  const { toast } = useToast();

  const eligibleFromAccounts = accounts.filter(acc => acc.type !== 'credit');
  const eligibleToAccounts = accounts.filter(acc => acc.id !== fromAccount);

  const resetForm = () => {
    setFromAccount('');
    setToAccount('');
    setAmount('');
    setDescription('');
    setRecipientName('');
    setRecipientEmail('');
    setBankName('');
    setRoutingNumber('');
    setAccountNumber('');
    setSwiftCode('');
    setCountry('');
  };

  const handleInternalTransfer = async () => {
    const transferAmount = parseFloat(amount);
    const sourceAccount = accounts.find(acc => acc.id === fromAccount);
    const destAccount = accounts.find(acc => acc.id === toAccount);
    
    if (sourceAccount && transferAmount > sourceAccount.balance) {
      toast({
        title: "Insufficient Funds",
        description: "You don't have enough balance in the source account.",
        variant: "destructive"
      });
      return false;
    }

    const success = transferFunds(fromAccount, toAccount, transferAmount, description);
    
    if (success && sourceAccount && destAccount) {
      // Show receipt
      setReceiptDetails({
        receiptNumber: `USB${Date.now().toString().slice(-6)}${Math.floor(1000 + Math.random() * 9000)}`,
        amount: transferAmount,
        fromAccount: sourceAccount.accountNumber,
        toAccount: destAccount.accountNumber,
        fromName: sourceAccount.name,
        toName: destAccount.name,
        date: new Date().toISOString(),
        description
      });
      setShowReceipt(true);
      
      toast({
        title: "✅ Transfer Successful",
        description: (
          <div className="space-y-1">
            <p className="font-medium">${transferAmount.toFixed(2)} transferred successfully</p>
            <div className="flex items-center text-sm text-green-600">
              <Mail className="h-3 w-3 mr-1" />
              Email confirmation sent
            </div>
          </div>
        ),
      });
      return true;
    } else {
      toast({
        title: "Transfer Failed",
        description: "Unable to process the transfer. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  const handleDomesticTransfer = async () => {
    const transferAmount = parseFloat(amount);
    const sourceAccount = accounts.find(acc => acc.id === fromAccount);
    
    if (sourceAccount && transferAmount > sourceAccount.balance) {
      toast({
        title: "Insufficient Funds",
        description: "You don't have enough balance in the source account.",
        variant: "destructive"
      });
      return false;
    }

    const recipientDetails = {
      recipientName,
      recipientEmail,
      bankName,
      routingNumber,
      accountNumber
    };

    const success = sendDomesticTransfer(fromAccount, recipientDetails, transferAmount, description);
    
    if (success) {
      toast({
        title: "🚀 Domestic Transfer Initiated",
        description: (
          <div className="space-y-2">
            <p className="font-medium">${transferAmount.toFixed(2)} to {recipientName}</p>
            <p className="text-sm">Bank: {bankName}</p>
            <div className="flex items-center text-sm text-blue-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              Processing time: 1-3 business days
            </div>
            <div className="flex items-center text-sm text-green-600">
              <Mail className="h-3 w-3 mr-1" />
              Email confirmations sent to both parties
            </div>
          </div>
        ),
      });
      return true;
    } else {
      toast({
        title: "Transfer Failed", 
        description: "Unable to process the domestic transfer. Please check your details.",
        variant: "destructive"
      });
      return false;
    }
  };

  const handleExternalTransfer = async () => {
    const transferAmount = parseFloat(amount);
    const sourceAccount = accounts.find(acc => acc.id === fromAccount);
    
    if (sourceAccount && transferAmount > sourceAccount.balance) {
      toast({
        title: "Insufficient Funds",
        description: "You don't have enough balance in the source account.",
        variant: "destructive"
      });
      return false;
    }

    // For international transfers, use the existing addTransaction method
    const { addTransaction } = useAuth();
    addTransaction({
      accountId: fromAccount,
      type: 'debit',
      amount: transferAmount,
      description: transferType === 'international' 
        ? `International Transfer to ${recipientName} (${bankName}, ${country})` 
        : `Domestic Transfer to ${recipientName} (${bankName})`,
      balance: (sourceAccount?.balance || 0) - transferAmount
    });

    const transferTypeLabel = transferType === 'international' ? 'International' : 'Domestic';
    toast({
      title: `🌍 ${transferTypeLabel} Transfer Initiated`,
      description: (
        <div className="space-y-1">
          <p className="font-medium">${transferAmount.toFixed(2)} to {recipientName}</p>
          <p className="text-sm">Processing time: {transferType === 'international' ? '3-5 business days' : '1-3 business days'}</p>
          <div className="flex items-center text-sm text-green-600">
            <Mail className="h-3 w-3 mr-1" />
            Email confirmation sent
          </div>
        </div>
      ),
    });
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fromAccount || !amount || !description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    if (transferType === 'internal' && !toAccount) {
      toast({
        title: "Missing Information",
        description: "Please select a destination account.",
        variant: "destructive"
      });
      return;
    }

    if (transferType !== 'internal') {
      if (!recipientName || !bankName || !accountNumber) {
        toast({
          title: "Missing Information",
          description: "Please fill in all recipient and bank details.",
          variant: "destructive"
        });
        return;
      }
      
      if (transferType === 'domestic' && !routingNumber) {
        toast({
          title: "Missing Information",
          description: "Routing number is required for domestic transfers.",
          variant: "destructive"
        });
        return;
      }
      
      if (transferType === 'international' && (!swiftCode || !country)) {
        toast({
          title: "Missing Information",
          description: "SWIFT code and country are required for international transfers.",
          variant: "destructive"
        });
        return;
      }
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

    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let success = false;
      if (transferType === 'internal') {
        success = await handleInternalTransfer();
      } else if (transferType === 'domestic') {
        success = await handleDomesticTransfer();
      } else {
        success = await handleExternalTransfer();
      }
      
      if (success) {
        resetForm();
        if (transferType === 'internal') {
          // Don't close modal yet, receipt will be shown
        } else {
          onClose();
        }
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
    return `${account.name} (****${account.accountNumber.slice(-4)})`;
  };

  const handleCloseReceipt = () => {
    setShowReceipt(false);
    setReceiptDetails(null);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen && !showReceipt} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5" />
              Transfer Funds
            </DialogTitle>
            <DialogDescription>
              Transfer money between your accounts or to any bank worldwide
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={transferType} onValueChange={(value) => setTransferType(value as any)} className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="internal" className="flex items-center gap-2">
                <ArrowRightLeft className="h-4 w-4" />
                Between Accounts
              </TabsTrigger>
              <TabsTrigger value="domestic" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Domestic
              </TabsTrigger>
              <TabsTrigger value="international" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                International
              </TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              {/* From Account - Common for all transfer types */}
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

              <TabsContent value="internal" className="space-y-4 mt-0">
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
              </TabsContent>

            <TabsContent value="domestic" className="space-y-4 mt-0">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recipientName">Recipient Name *</Label>
                  <Input
                    id="recipientName"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipientEmail">Recipient Email</Label>
                  <Input
                    id="recipientEmail"
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="john@example.com"
                  />
                  <p className="text-xs text-gray-500">For transfer notifications</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name *</Label>
                  <Input
                    id="bankName"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="Bank of America"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="routingNumber">Routing Number *</Label>
                  <Input
                    id="routingNumber"
                    value={routingNumber}
                    onChange={(e) => setRoutingNumber(e.target.value)}
                    placeholder="021000021"
                    maxLength={9}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number *</Label>
                <Input
                  id="accountNumber"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="1234567890"
                  maxLength={17}
                  required
                />
              </div>
            </TabsContent>

            <TabsContent value="international" className="space-y-4 mt-0">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recipientName">Recipient Name</Label>
                  <Input
                    id="recipientName"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipientEmail">Recipient Email (Optional)</Label>
                  <Input
                    id="recipientEmail"
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="HSBC Bank"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="United Kingdom"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="swiftCode">SWIFT Code</Label>
                  <Input
                    id="swiftCode"
                    value={swiftCode}
                    onChange={(e) => setSwiftCode(e.target.value)}
                    placeholder="HBUKGB4B"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number/IBAN</Label>
                  <Input
                    id="accountNumber"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="GB29 NWBK 6016 1331 9268 19"
                    required
                  />
                </div>
              </div>
            </TabsContent>

              {/* Amount and Description - Common for all transfer types */}
              <div className="space-y-2">
                <Label htmlFor="amount">Amount ($) *</Label>
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
                <Label htmlFor="description">Description *</Label>
                <Input
                  id="description"
                  type="text"
                  placeholder="What's this transfer for?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              {transferType !== 'internal' && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium">
                    <strong>Transfer Fee:</strong> {transferType === 'international' ? '$25.00' : '$15.00'} 
                    {transferType === 'international' && ' + exchange rate markup'}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Processing time: {transferType === 'international' ? '3-5 business days' : '1-3 business days'}
                  </p>
                  <div className="flex items-center mt-2 text-xs text-green-700">
                    <Mail className="h-3 w-3 mr-1" />
                    Email confirmations will be sent to all parties
                  </div>
                </div>
              )}

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
                  {loading ? 'Processing...' : transferType === 'internal' ? 'Transfer Now' : 'Send Transfer'}
                </Button>
              </div>
            </form>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Transfer Receipt Modal */}
      {showReceipt && receiptDetails && (
        <TransferReceipt
          isOpen={showReceipt}
          onClose={handleCloseReceipt}
          transferDetails={receiptDetails}
        />
      )}
    </>
  );
};
