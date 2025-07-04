
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, Printer, Download } from 'lucide-react';

interface TransferReceiptProps {
  isOpen: boolean;
  onClose: () => void;
  transferDetails: {
    receiptNumber: string;
    amount: number;
    fromAccount: string;
    toAccount: string;
    fromName: string;
    toName: string;
    date: string;
    description: string;
  };
}

export const TransferReceipt: React.FC<TransferReceiptProps> = ({ 
  isOpen, 
  onClose, 
  transferDetails 
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const printReceipt = () => {
    window.print();
  };

  const downloadReceipt = () => {
    const receiptContent = `
US BANK TRANSFER RECEIPT
========================

Receipt Number: ${transferDetails.receiptNumber}
Date: ${formatDate(transferDetails.date)}
Amount: $${transferDetails.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}

FROM ACCOUNT:
${transferDetails.fromName}
Account: ${transferDetails.fromAccount}

TO ACCOUNT:
${transferDetails.toName}  
Account: ${transferDetails.toAccount}

Description: ${transferDetails.description}

Status: COMPLETED
Routing Number: 091000022

This is an official US Bank transfer receipt.
Please keep this for your records.
    `;

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Transfer_Receipt_${transferDetails.receiptNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-center">
            <CheckCircle className="h-6 w-6 text-green-600" />
            Transfer Successful
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Receipt Header */}
          <div className="text-center border-b pb-4">
            <div className="bank-gradient w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-2">
              <span className="text-white font-bold text-sm">US</span>
            </div>
            <h3 className="font-bold text-lg">US Bank</h3>
            <p className="text-sm text-gray-600">Transfer Receipt</p>
          </div>

          {/* Receipt Details */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Receipt Number</span>
              <span className="font-mono text-sm">{transferDetails.receiptNumber}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Date & Time</span>
              <span className="text-sm">{formatDate(transferDetails.date)}</span>
            </div>
            
            <div className="flex justify-between items-center font-semibold text-lg">
              <span>Amount</span>
              <span className="text-green-600">
                ${transferDetails.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            
            <div className="border-t pt-4 space-y-3">
              <div>
                <p className="text-sm text-gray-600 mb-1">From Account</p>
                <p className="font-medium">{transferDetails.fromName}</p>
                <p className="font-mono text-sm text-gray-700">{transferDetails.fromAccount}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 mb-1">To Account</p>
                <p className="font-medium">{transferDetails.toName}</p>
                <p className="font-mono text-sm text-gray-700">{transferDetails.toAccount}</p>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 mb-1">Description</p>
              <p className="text-sm">{transferDetails.description}</p>
            </div>
            
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Status</span>
                <span className="text-green-600 font-medium flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  COMPLETED
                </span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-600">Routing Number</span>
                <span className="font-mono text-sm">091000022</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={printReceipt}
              className="flex-1"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadReceipt}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
          
          <Button onClick={onClose} className="w-full bank-gradient">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
