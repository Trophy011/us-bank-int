
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Navigation, Clock, CreditCard } from 'lucide-react';

interface ATMModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const atmLocations = [
  { id: 1, name: 'Downtown Branch', address: '123 Main St, Downtown', distance: '0.2 miles', available: true },
  { id: 2, name: 'Shopping Mall', address: '456 Mall Ave, Shopping Center', distance: '0.8 miles', available: true },
  { id: 3, name: 'Airport Terminal', address: '789 Airport Blvd, Terminal 1', distance: '2.1 miles', available: false },
  { id: 4, name: 'University Campus', address: '321 College St, Campus Center', distance: '1.5 miles', available: true },
  { id: 5, name: 'Gas Station', address: '654 Highway 1, Gas Plus', distance: '0.5 miles', available: true },
];

export const ATMModal: React.FC<ATMModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'locate' | 'cardless'>('locate');
  const [zipCode, setZipCode] = useState('');
  const [cardlessCode, setCardlessCode] = useState('');

  const handleFindATMs = () => {
    if (!zipCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a ZIP code",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "ATMs Found",
      description: `Found ${atmLocations.length} ATMs near ${zipCode}`,
    });
  };

  const generateCardlessCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setCardlessCode(code);
    
    toast({
      title: "Cardless Code Generated",
      description: `Your cardless withdrawal code is: ${code}. Valid for 30 minutes.`,
    });
  };

  const handleGetDirections = (location: typeof atmLocations[0]) => {
    toast({
      title: "Opening Directions",
      description: `Opening directions to ${location.name}`,
    });
    // In a real app, this would open maps with directions
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            ATM Services
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Tab Navigation */}
          <div className="flex gap-2 border-b">
            <Button
              variant={activeTab === 'locate' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('locate')}
              className="rounded-b-none"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Find ATMs
            </Button>
            <Button
              variant={activeTab === 'cardless' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('cardless')}
              className="rounded-b-none"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Cardless Cash
            </Button>
          </div>

          {/* Find ATMs Tab */}
          {activeTab === 'locate' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="Enter ZIP code"
                    maxLength={5}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleFindATMs}>Find ATMs</Button>
                </div>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {atmLocations.map((location) => (
                  <div key={location.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold">{location.name}</h3>
                        <p className="text-sm text-gray-600">{location.address}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-sm text-blue-600">{location.distance}</span>
                          <div className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${location.available ? 'bg-green-500' : 'bg-red-500'}`} />
                            <span className="text-sm text-gray-600">
                              {location.available ? 'Available' : 'Out of Service'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleGetDirections(location)}
                        disabled={!location.available}
                        className="ml-4"
                      >
                        <Navigation className="h-4 w-4 mr-1" />
                        Directions
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cardless Cash Tab */}
          {activeTab === 'cardless' && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Cardless Cash Withdrawal</h3>
                <p className="text-sm text-blue-800">
                  Generate a secure code to withdraw cash from any US Bank ATM without your card.
                  Perfect when you've forgotten your card or need to send cash to someone.
                </p>
              </div>

              {!cardlessCode ? (
                <div className="text-center py-8">
                  <Button onClick={generateCardlessCode} size="lg">
                    Generate Cardless Code
                  </Button>
                  <p className="text-sm text-gray-600 mt-2">
                    Code will be valid for 30 minutes
                  </p>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-center">
                    <h3 className="font-semibold text-green-900 mb-2">Your Cardless Code</h3>
                    <div className="text-3xl font-mono font-bold text-green-800 mb-2">
                      {cardlessCode}
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm text-green-700">
                      <Clock className="h-4 w-4" />
                      <span>Valid for 30 minutes</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <h4 className="font-medium text-green-900 mb-2">How to use:</h4>
                    <ol className="text-sm text-green-800 space-y-1">
                      <li>1. Visit any US Bank ATM</li>
                      <li>2. Select "Cardless Transaction"</li>
                      <li>3. Enter your phone number</li>
                      <li>4. Enter this 6-digit code</li>
                      <li>5. Complete your transaction</li>
                    </ol>
                  </div>

                  <div className="mt-4 text-center">
                    <Button 
                      variant="outline" 
                      onClick={() => setCardlessCode('')}
                      size="sm"
                    >
                      Generate New Code
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
