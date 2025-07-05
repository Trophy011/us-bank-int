import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Lock, Mail, Phone } from 'lucide-react';

interface LoginFormProps {
  onSuccess: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    otp: ''
  });

  const { login, register, verifyOTP, sendOTP } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Form submission started', { step, isLogin });
      
      if (step === 'credentials') {
        let success = false;
        
        if (isLogin) {
          console.log('Attempting login...');
          success = await login(formData.email, formData.password);
          console.log('Login result:', success);
          
          if (!success) {
            toast({
              title: "Account Not Found",
              description: "Please create an account first or check your credentials.",
              variant: "destructive"
            });
            setLoading(false);
            return;
          }
        } else {
          console.log('Attempting registration...');
          success = await register(formData.email, formData.password, formData.name, formData.phone);
          console.log('Registration result:', success);
          
          if (!success) {
            toast({
              title: "Registration Failed",
              description: "An account with this email already exists.",
              variant: "destructive"
            });
            setLoading(false);
            return;
          }
        }

        if (success) {
          const otp = sendOTP();
          console.log('OTP sent:', otp);
          toast({
            title: "Verification Required",
            description: `Security code sent to ${formData.email}. Code: ${otp}`,
          });
          setStep('otp');
        }
      } else {
        console.log('Verifying OTP:', formData.otp);
        const isValidOTP = verifyOTP(formData.otp);
        console.log('OTP verification result:', isValidOTP);
        
        if (isValidOTP) {
          toast({
            title: "Welcome to US Bank",
            description: "You have successfully signed in to your account.",
          });
          console.log('Calling onSuccess callback');
          onSuccess();
        } else {
          toast({
            title: "Invalid Security Code",
            description: "Please enter the correct verification code.",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Login/Registration error:', error);
      toast({
        title: "System Error",
        description: "Please try again in a moment.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (step === 'otp') {
    return (
      <div className="animate-fade-in">
        <Card className="w-full max-w-md mx-auto shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-bank-blue-800">Security Verification</CardTitle>
            <CardDescription className="text-gray-600">
              Enter the 6-digit code sent to your email
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-sm font-medium">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="000000"
                  value={formData.otp}
                  onChange={(e) => handleInputChange('otp', e.target.value)}
                  maxLength={6}
                  className="text-center text-lg tracking-widest h-12 border-2 focus:border-bank-blue-500"
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-12 bank-gradient hover:opacity-90 transition-all duration-300 transform hover:scale-[1.02] font-medium"
                disabled={loading || formData.otp.length !== 6}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Verifying...
                  </div>
                ) : 'Verify & Sign In'}
              </Button>
              
              <Button 
                type="button" 
                variant="ghost" 
                className="w-full hover:bg-gray-100 transition-colors"
                onClick={() => setStep('credentials')}
              >
                Back to Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <Card className="w-full max-w-md mx-auto shadow-xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold text-bank-blue-800">
            {isLogin ? 'Welcome Back' : 'Join US Bank'}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {isLogin ? 'Sign in to your account' : 'Create your new account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2 animate-fade-in">
                <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="h-11 border-2 focus:border-bank-blue-500 transition-colors"
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="pl-10 h-11 border-2 focus:border-bank-blue-500 transition-colors"
                  required
                />
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2 animate-fade-in">
                <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="pl-10 h-11 border-2 focus:border-bank-blue-500 transition-colors"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="pl-10 pr-10 h-11 border-2 focus:border-bank-blue-500 transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bank-gradient hover:opacity-90 transition-all duration-300 transform hover:scale-[1.02] font-medium text-base"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isLogin ? 'Signing In...' : 'Creating Account...'}
                </div>
              ) : (isLogin ? 'Sign In' : 'Create Account')}
            </Button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-bank-blue-600 hover:text-bank-blue-800 transition-colors font-medium"
              >
                {isLogin ? "Need an account? Sign up here" : "Have an account? Sign in here"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
