
import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { LoginForm } from '@/components/LoginForm';
import { Dashboard } from '@/components/Dashboard';
import { Toaster } from '@/components/ui/toaster';

const AppContent = () => {
  const { isAuthenticated, user } = useAuth();
  const [showDashboard, setShowDashboard] = useState(false);

  // Update showDashboard when authentication state changes
  useEffect(() => {
    if (isAuthenticated && user) {
      setShowDashboard(true);
    } else {
      setShowDashboard(false);
    }
  }, [isAuthenticated, user]);

  const handleLoginSuccess = () => {
    setShowDashboard(true);
  };

  // Show dashboard if user is authenticated
  if (isAuthenticated && user && showDashboard) {
    return <Dashboard />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bank-blue-50 via-white to-bank-blue-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-bank-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-bank-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-bank-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo and Brand */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="bank-gradient w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl transform hover:scale-110 transition-all duration-300">
            <span className="text-white font-bold text-3xl">US</span>
          </div>
          <h1 className="text-4xl font-bold text-bank-blue-900 mb-3 tracking-tight">US Bank</h1>
          <p className="text-bank-blue-700 text-lg font-medium">Secure Digital Banking</p>
          <div className="w-24 h-1 bg-gradient-to-r from-bank-blue-500 to-bank-blue-700 mx-auto mt-4 rounded-full"></div>
        </div>

        <LoginForm onSuccess={handleLoginSuccess} />

        {/* Security Notice */}
        <div className="mt-8 text-center animate-fade-in animation-delay-1000">
          <div className="flex items-center justify-center mb-2">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            <p className="text-sm text-gray-700 font-medium">Bank-Level Security Enabled</p>
          </div>
          <p className="text-xs text-gray-600">
            🔒 Your data is protected with 256-bit SSL encryption
          </p>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4 animate-fade-in animation-delay-1500">
          <div className="text-center p-3 bg-white/50 backdrop-blur-sm rounded-lg border border-gray-200">
            <div className="text-bank-blue-600 font-bold text-lg">24/7</div>
            <div className="text-xs text-gray-600">Support</div>
          </div>
          <div className="text-center p-3 bg-white/50 backdrop-blur-sm rounded-lg border border-gray-200">
            <div className="text-bank-blue-600 font-bold text-lg">FDIC</div>
            <div className="text-xs text-gray-600">Insured</div>
          </div>
          <div className="text-center p-3 bg-white/50 backdrop-blur-sm rounded-lg border border-gray-200">
            <div className="text-bank-blue-600 font-bold text-lg">Mobile</div>
            <div className="text-xs text-gray-600">Banking</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Index = () => {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster />
    </AuthProvider>
  );
};

export default Index;
