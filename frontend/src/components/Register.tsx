import { useState } from 'react';
import { Mail, Lock, User as UserIcon, ArrowLeft, Smartphone } from 'lucide-react';
import type { User } from '../types';

interface RegisterProps {
  onNavigate: (view: 'login' | 'app') => void;
  onRegister: (user: User) => void;
}

export function Register({ onNavigate, onRegister }: RegisterProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDuplicatePopup, setShowDuplicatePopup] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      return;
    }
    
    if (name && email && phone && password) {
      if (!phone.startsWith('+')) {
        setError('Phone number must start with a "+" sign (e.g., +60 12-345 6789).');
        return;
      }

      setIsLoading(true);
      try {
        // First check if email already exists
        const checkRes = await fetch(`/api/users?t=${Date.now()}`);
        if (checkRes.ok) {
          const existingUsers = await checkRes.json();
          const emailExists = existingUsers.some((u: User) => u.email.toLowerCase() === email.toLowerCase());
          
          if (emailExists) {
            setShowDuplicatePopup(true);
            return;
          }
        }

        const newUser = {
          full_name: name,
          email: email,
          phone_number: phone,
          password: password,
          role: 'CUSTOMER',
          status: 'Active'
        };

        const response = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newUser)
        });

        if (!response.ok) {
          throw new Error('Failed to register user');
        }

        // Save credentials to auto-fill the login page
        sessionStorage.setItem('registeredEmail', email);
        sessionStorage.setItem('registeredPassword', password);
        
        // Navigate back to login
        onNavigate('login');
      } catch (err) {
        console.error(err);
        setError('An error occurred during registration. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8 w-full">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-10 border border-primary-100">
        
        <button 
          onClick={() => onNavigate('login')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-800 transition-colors mb-6 font-medium"
        >
          <ArrowLeft size={16} /> Back to Login
        </button>

        <div className="text-center mb-10">
          <h1 className="text-3xl font-light tracking-widest text-gray-900 uppercase mb-2">Create Account</h1>
          <p className="text-sm text-gray-500">Join BeautyTry for personalized recommendations</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-sm font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <UserIcon size={18} />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none"
                placeholder="Jane Doe"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <Mail size={18} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Mobile Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <Smartphone size={18} />
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`block w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-xl text-sm focus:ring-2 transition-all outline-none ${
                  phone.length > 0 
                    ? phone.startsWith('+') 
                      ? "border-green-500 focus:ring-green-500" 
                      : "border-rose-500 focus:ring-rose-500"
                    : "border-gray-200 focus:ring-primary-500 focus:border-primary-500"
                }`}
                placeholder="+60 12-345 6789"
                pattern="^\+.*"
                title="Phone number must start with a + sign"
                required
              />
            </div>
            {/* Real-time validation message for phone */}
            {phone.length > 0 && (
              <p className={`mt-2 text-xs font-medium ${phone.startsWith('+') ? "text-green-600" : "text-rose-500"}`}>
                {phone.startsWith('+') ? "✓ Valid format" : "✗ Must start with + sign"}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <Lock size={18} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Re-type Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <Lock size={18} />
              </div>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`block w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-xl text-sm focus:ring-2 transition-all outline-none ${
                  confirmPassword.length > 0 
                    ? password === confirmPassword 
                      ? "border-green-500 focus:ring-green-500" 
                      : "border-rose-500 focus:ring-rose-500"
                    : "border-gray-200 focus:ring-primary-500 focus:border-primary-500"
                }`}
                placeholder="••••••••"
                required
              />
            </div>
            {/* Real-time validation message */}
            {confirmPassword.length > 0 && (
              <p className={`mt-2 text-xs font-medium ${password === confirmPassword ? "text-green-600" : "text-rose-500"}`}>
                {password === confirmPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || (password !== confirmPassword && confirmPassword.length > 0) || (phone.length > 0 && !phone.startsWith('+'))}
            className={`w-full flex items-center justify-center gap-2 text-white py-3.5 rounded-xl font-bold uppercase tracking-wide text-sm transition-all shadow-md mt-4 ${
              (isLoading || (password !== confirmPassword && confirmPassword.length > 0) || (phone.length > 0 && !phone.startsWith('+')))
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-primary-800 hover:bg-primary-900"
            }`}
          >
            {isLoading ? 'Registering...' : 'Register Account'}
          </button>
        </form>
      </div>

      {/* Custom Duplicate Email Popup */}
      {showDuplicatePopup && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl transform scale-100 transition-all">
            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <Mail size={28} className="text-rose-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Email Already Exists</h3>
            <p className="text-gray-500 mb-8 text-sm leading-relaxed">
              An account with <span className="font-semibold text-gray-700">{email}</span> is already registered in our system.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => onNavigate('login')}
                className="w-full bg-primary-800 text-white py-3.5 rounded-xl font-bold hover:bg-primary-900 transition-colors"
              >
                Go to Login
              </button>
              <button 
                onClick={() => setShowDuplicatePopup(false)}
                className="w-full bg-white border border-gray-200 text-gray-600 py-3.5 rounded-xl font-bold hover:bg-gray-50 transition-colors"
              >
                Use Different Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
