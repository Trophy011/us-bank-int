
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Users, ArrowRightLeft, Building, PiggyBank, CreditCard } from 'lucide-react';

interface CustomerDirectoryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCustomer: (customer: any, account: any) => void;
}

export const CustomerDirectory: React.FC<CustomerDirectoryProps> = ({ 
  isOpen, 
  onClose, 
  onSelectCustomer 
}) => {
  const { getAllUsers, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  
  const allUsers = getAllUsers();
  const otherUsers = allUsers.filter(u => u.id !== user?.id);

  const filteredUsers = otherUsers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.accounts.some(acc => acc.accountNumber.includes(searchTerm))
  );

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'checking':
        return <Building className="h-4 w-4" />;
      case 'savings':
        return <PiggyBank className="h-4 w-4" />;
      case 'credit':
        return <CreditCard className="h-4 w-4" />;
      default:
        return <Building className="h-4 w-4" />;
    }
  };

  const handleSelectAccount = (customer: any, account: any) => {
    onSelectCustomer(customer, account);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            US Bank Customer Directory
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, email, or account number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No customers found</p>
              </div>
            ) : (
              filteredUsers.map((customer) => (
                <Card key={customer.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4 mb-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="font-bold">
                          {getInitials(customer.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold">{customer.name}</h3>
                        <p className="text-sm text-gray-600">{customer.email}</p>
                        <p className="text-sm text-gray-600">{customer.phone}</p>
                        {customer.isAdmin && (
                          <Badge variant="secondary" className="mt-1">
                            Premium Member
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Available Accounts:</p>
                      {customer.accounts.map((account: any) => (
                        <div
                          key={account.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => handleSelectAccount(customer, account)}
                        >
                          <div className="flex items-center space-x-3">
                            {getAccountIcon(account.type)}
                            <div>
                              <p className="font-medium">{account.name}</p>
                              <p className="text-sm text-gray-600">
                                Account: {account.accountNumber.replace(/(\d{4})(\d{4})(\d{2})/, '$1-$2-$3')}
                              </p>
                              <p className="text-sm text-gray-500">
                                Balance: ${account.balance.toFixed(2)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant={account.type === 'checking' ? 'default' : 
                                     account.type === 'savings' ? 'secondary' : 'outline'}
                            >
                              {account.type.charAt(0).toUpperCase() + account.type.slice(1)}
                            </Badge>
                            <Button size="sm" variant="outline">
                              <ArrowRightLeft className="h-4 w-4 mr-1" />
                              Transfer
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
