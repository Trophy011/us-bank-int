
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface TransactionPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: 'set' | 'verify';
  title?: string;
}

export const TransactionPinModal: React.FC<TransactionPinModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  mode,
  title 
}) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { setTransactionPin, verifyTransactionPin } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async () => {
    setError('');
    setIsLoading(true);

    if (mode === 'set') {
      if (pin.length !== 4 || confirmPin.length !== 4) {
        setError('PIN must be 4 digits');
        setIsLoading(false);
        return;
      }

      if (pin !== confirmPin) {
        setError('PINs do not match');
        setIsLoading(false);
        return;
      }

      if (!/^\d{4}$/.test(pin)) {
        setError('PIN must contain only numbers');
        setIsLoading(false);
        return;
      }

      setTransactionPin(pin);
      toast({
        title: "PIN Set Successfully",
        description: "Your transaction PIN has been set.",
      });
      onSuccess();
    } else {
      if (pin.length !== 4) {
        setError('PIN must be 4 digits');
        setIsLoading(false);
        return;
      }

      if (verifyTransactionPin(pin)) {
        onSuccess();
      } else {
        setError('Incorrect PIN');
        setIsLoading(false);
        return;
      }
    }

    setIsLoading(false);
    setPin('');
    setConfirmPin('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {title || (mode === 'set' ? 'Set Transaction PIN' : 'Enter Transaction PIN')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {mode === 'set' && (
            <Alert>
              <Lock className="h-4 w-4" />
              <AlertDescription>
                Create a 4-digit PIN to secure your transactions. This PIN will be required for all transfers and payments.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="pin">
              {mode === 'set' ? 'Create PIN' : 'Transaction PIN'}
            </Label>
            <Input
              id="pin"
              type="password"
              placeholder="Enter 4-digit PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              maxLength={4}
              className="text-center text-xl tracking-widest"
            />
          </div>

          {mode === 'set' && (
            <div className="space-y-2">
              <Label htmlFor="confirm-pin">Confirm PIN</Label>
              <Input
                id="confirm-pin"
                type="password"
                placeholder="Confirm 4-digit PIN"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                maxLength={4}
                className="text-center text-xl tracking-widest"
              />
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isLoading || !pin || (mode === 'set' && !confirmPin)}
              className="flex-1"
            >
              {isLoading ? 'Processing...' : (mode === 'set' ? 'Set PIN' : 'Verify')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
