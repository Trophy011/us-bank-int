
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, AlertTriangle, CreditCard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ConversionFeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  fee: number;
  currency: string;
}

export const ConversionFeeModal: React.FC<ConversionFeeModalProps> = ({ 
  isOpen, 
  onClose, 
  fee, 
  currency 
}) => {
  const { user } = useAuth();
  
  const handlePayViaBybit = () => {
    // Open Bybit in a new tab
    window.open('https://www.bybit.com', '_blank');
  };

  const handlePayViaGCash = () => {
    // Open GCash in a new tab
    window.open('https://www.gcash.com', '_blank');
  };

  // Check if current user is aizalaquian@gmail.com
  const isGCashOnlyUser = user?.email === 'aizalaquian@gmail.com';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Currency Conversion Fee Required
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Your account has been temporarily restricted for transfers until the conversion fee is paid.
            </AlertDescription>
          </Alert>

          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="text-center">
                <p className="text-sm text-gray-600">Outstanding Conversion Fee</p>
                <p className="text-2xl font-bold text-red-600">
                  {fee.toLocaleString()} {currency}
                </p>
                <p className="text-sm text-gray-500">
                  {currency === 'USD' ? `(≈ ₱${(fee * 57.2).toLocaleString()} PHP)` : `(≈ $${(fee * 0.24).toLocaleString()} USD)`}
                </p>
              </div>
              
              <div className="border-t pt-3">
                <h4 className="font-semibold text-sm mb-2">Why is this fee required?</h4>
                <p className="text-xs text-gray-600">
                  Due to international currency conversion regulations, a processing fee is required 
                  before transfers can be enabled on your account.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <p className="text-sm font-medium">Available Payment Methods:</p>
            
            {!isGCashOnlyUser && (
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold text-blue-900">Bybit Payment</span>
                  </div>
                  <p className="text-xs text-blue-700">
                    Pay the conversion fee through Bybit to unlock transfer capabilities.
                  </p>
                </CardContent>
              </Card>
            )}

            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-4 w-4 text-green-600" />
                  <span className="font-semibold text-green-900">GCash Transfer</span>
                </div>
                <p className="text-xs text-green-700">
                  Pay via GCash mobile wallet for instant processing and verification.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-2">
            <div className={`flex gap-2 ${isGCashOnlyUser ? 'justify-center' : ''}`}>
              {!isGCashOnlyUser && (
                <Button onClick={handlePayViaBybit} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Pay via Bybit
                </Button>
              )}
              <Button onClick={handlePayViaGCash} className={`${isGCashOnlyUser ? 'w-full' : 'flex-1'} bg-green-600 hover:bg-green-700`}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Pay via GCash
              </Button>
            </div>
            <Button variant="outline" onClick={onClose} className="w-full">
              Close
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            Once payment is confirmed, your transfer restrictions will be automatically lifted.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
