
import React, { useState } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { LoginForm } from '@/components/LoginForm';
import { Dashboard } from '@/components/Dashboard';

const AppContent = () => {
  const { isAuthenticated } = useAuth();
  const [showDashboard, setShowDashboard] = useState(false);

  const handleLoginSuccess = () => {
    setShowDashboard(true);
  };

  if (isAuthenticated && showDashboard) {
    return <Dashboard />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bank-blue-50 to-bank-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <div className="bank-gradient w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-bold text-2xl">US</span>
          </div>
          <h1 className="text-3xl font-bold text-bank-blue-900 mb-2">US Bank</h1>
          <p className="text-bank-blue-700">Secure Online Banking</p>
        </div>

        <LoginForm onSuccess={handleLoginSuccess} />

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-600">
            🔒 Your information is protected with bank-level security
          </p>
        </div>

        {/* Demo Information */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">Demo Features:</h3>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Real-time OTP verification</li>
            <li>• Multiple account types</li>
            <li>• Fund transfers between accounts</li>
            <li>• Transaction history storage</li>
            <li>• Professional banking interface</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const Index = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default Index;
