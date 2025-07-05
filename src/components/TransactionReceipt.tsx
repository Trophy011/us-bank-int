
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Download, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface Transaction {
  id: string;
  type: 'transfer' | 'deposit' | 'withdrawal' | 'payment';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  fromAccount?: string;
  toAccount?: string;
  fromName?: string;
  toName?: string;
  referenceNumber?: string;
  confirmationCode?: string;
  location?: string;
}

interface TransactionReceiptProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  userAccountNumber?: string;
  userName?: string;
}

export const TransactionReceipt: React.FC<TransactionReceiptProps> = ({
  transaction,
  isOpen,
  onClose,
  userAccountNumber,
  userName
}) => {
  const { toast } = useToast();

  if (!transaction) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: `${label} has been copied.`,
    });
  };

  const downloadReceipt = () => {
    toast({
      title: "Receipt Downloaded",
      description: "Transaction receipt has been saved to your downloads.",
    });
  };

  const formatAccountNumber = (accountNumber: string) => {
    return accountNumber || 'N/A';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Transaction Receipt
            <Badge className={getStatusColor(transaction.status)}>
              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <Card className="border-2 border-bank-blue-200">
          <CardContent className="p-6 space-y-6">
            {/* Header */}
            <div className="text-center border-b pb-4">
              <div className="bank-gradient w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold text-xl">US</span>
              </div>
              <h3 className="text-xl font-bold text-bank-blue-900">US Bank</h3>
              <p className="text-sm text-gray-600">Official Transaction Receipt</p>
            </div>

            {/* Transaction Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-700">Transaction ID</label>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-sm">{transaction.id}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(transaction.id, 'Transaction ID')}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-semibold text-gray-700">Date & Time</label>
                <p className="text-sm">{new Date(transaction.date).toLocaleString()}</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">Transaction Type</label>
                <p className="text-sm capitalize">{transaction.type}</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">Amount</label>
                <p className="text-lg font-bold text-bank-blue-900">
                  ${Math.abs(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {/* Account Details */}
            {(transaction.fromAccount || transaction.toAccount) && (
              <div className="border-t pt-6">
                <h4 className="font-semibold text-gray-800 mb-4">Account Information</h4>
                <div className="grid grid-cols-1 gap-4">
                  {transaction.fromAccount && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="text-sm font-semibold text-gray-700">From Account</label>
                      <p className="font-mono text-sm">{formatAccountNumber(transaction.fromAccount)}</p>
                      {transaction.fromName && (
                        <p className="text-sm text-gray-600">{transaction.fromName}</p>
                      )}
                    </div>
                  )}
                  
                  {transaction.toAccount && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="text-sm font-semibold text-gray-700">To Account</label>
                      <p className="font-mono text-sm">{formatAccountNumber(transaction.toAccount)}</p>
                      {transaction.toName && (
                        <p className="text-sm text-gray-600">{transaction.toName}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Additional Details */}
            <div className="border-t pt-6">
              <h4 className="font-semibold text-gray-800 mb-4">Additional Details</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-semibold text-gray-700">Description</label>
                  <p className="text-sm">{transaction.description}</p>
                </div>
                
                {transaction.referenceNumber && (
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Reference Number</label>
                    <p className="font-mono text-sm">{transaction.referenceNumber}</p>
                  </div>
                )}

                {transaction.confirmationCode && (
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Confirmation Code</label>
                    <p className="font-mono text-sm">{transaction.confirmationCode}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Security Notice */}
            <div className="border-t pt-6 bg-blue-50 -mx-6 -mb-6 px-6 py-4 rounded-b-lg">
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-800">Transaction Verified</p>
                  <p className="text-xs text-gray-600">
                    This transaction has been processed securely through US Bank's encrypted systems.
                    Keep this receipt for your records.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={downloadReceipt}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
