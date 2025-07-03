
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Camera, Upload, Receipt } from 'lucide-react';

interface DepositCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DepositCheckModal: React.FC<DepositCheckModalProps> = ({ isOpen, onClose }) => {
  const { user, addTransaction } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    amount: '',
    toAccount: '',
    memo: '',
    frontImage: null as File | null,
    backImage: null as File | null
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = (type: 'front' | 'back') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        [type + 'Image']: file
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.amount || !formData.toAccount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (!formData.frontImage || !formData.backImage) {
      toast({
        title: "Error",
        description: "Please upload both front and back images of the check",
        variant: "destructive"
      });
      return;
    }

    const amount = parseFloat(formData.amount);
    const toAccount = user.accounts.find(acc => acc.id === formData.toAccount);
    
    if (!toAccount) {
      toast({
        title: "Error",
        description: "Invalid account selected",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    addTransaction({
      accountId: formData.toAccount,
      type: 'credit',
      amount,
      description: `Mobile Check Deposit${formData.memo ? ' - ' + formData.memo : ''}`,
      balance: toAccount.balance + amount
    });

    toast({
      title: "Check Deposited",
      description: `Your check for $${amount.toFixed(2)} has been deposited successfully. Funds may take 1-2 business days to be available.`,
    });

    setFormData({
      amount: '',
      toAccount: '',
      memo: '',
      frontImage: null,
      backImage: null
    });
    setIsProcessing(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Receipt className="h-5 w-5 mr-2" />
            Deposit Check
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="amount">Check Amount *</Label>
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
            <Label htmlFor="toAccount">Deposit To *</Label>
            <Select value={formData.toAccount} onValueChange={(value) => setFormData({...formData, toAccount: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {user?.accounts.filter(acc => acc.type !== 'credit').map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name} - {account.accountNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="memo">Memo</Label>
            <Input
              id="memo"
              value={formData.memo}
              onChange={(e) => setFormData({...formData, memo: e.target.value})}
              placeholder="Optional description"
            />
          </div>

          <div className="space-y-3">
            <Label>Check Images *</Label>
            
            <div>
              <Label htmlFor="frontImage" className="text-sm text-gray-600">Front of Check</Label>
              <div className="mt-1 flex items-center gap-2">
                <Input
                  id="frontImage"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload('front')}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('frontImage')?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {formData.frontImage ? 'Change Front' : 'Upload Front'}
                </Button>
                {formData.frontImage && (
                  <span className="text-sm text-green-600">✓ Front uploaded</span>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="backImage" className="text-sm text-gray-600">Back of Check</Label>
              <div className="mt-1 flex items-center gap-2">
                <Input
                  id="backImage"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload('back')}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('backImage')?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {formData.backImage ? 'Change Back' : 'Upload Back'}
                </Button>
                {formData.backImage && (
                  <span className="text-sm text-green-600">✓ Back uploaded</span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Deposited funds may take 1-2 business days to become available. 
              Make sure the check is properly endorsed on the back.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="w-full">
              Cancel
            </Button>
            <Button type="submit" disabled={isProcessing} className="w-full">
              {isProcessing ? 'Processing...' : 'Deposit Check'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
