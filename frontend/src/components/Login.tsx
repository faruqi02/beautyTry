import { useState, useEffect } from 'react';
import { Mail, Lock, ArrowRight, UserCircle2, Loader2 } from 'lucide-react';
import type { User } from '../types';

interface LoginProps {
  onNavigate: (view: 'register' | 'app' | 'admin_dashboard') => void;
  onLogin: (user: User) => void;
}

export function Login({ onNavigate, onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedEmail = sessionStorage.getItem('registeredEmail');
    const savedPassword = sessionStorage.getItem('registeredPassword');
    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      sessionStorage.removeItem('registeredEmail');
      sessionStorage.removeItem('registeredPassword');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (response.ok) {
        const matchedUser: User = await response.json();
        onLogin(matchedUser);
        if (matchedUser.role?.toUpperCase() === 'ADMIN' || matchedUser.role?.toUpperCase() === 'STAFF') {
          onNavigate('admin_dashboard');
        } else {
          onNavigate('app');
        }
      } else {
        // Fallback for demo admin account if not found in db
        if (email.toLowerCase().includes('admin')) {
          const fakeAdmin: User = { full_name: 'Admin User', email: email, phone_number: '+60', role: 'ADMIN', status: 'Active' };
          onLogin(fakeAdmin);
          onNavigate('admin_dashboard');
        } else {
          setError('Invalid email or password. Please try again.');
        }
      }
    } catch (err) {
      console.error(err);
      setError('Could not connect to server. Check if backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8 w-full">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-10 border border-primary-100">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-light tracking-widest text-gray-900 uppercase mb-2">BeautyTry</h1>
          <p className="text-sm text-gray-500">Sign in to access your personalized shades</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-sm font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-primary-800 text-white py-3.5 rounded-xl font-bold uppercase tracking-wide text-sm hover:bg-primary-900 transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Signing In...
              </>
            ) : (
              <>
                Sign In <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 flex items-center justify-center space-x-4">
          <div className="h-px bg-gray-200 flex-1"></div>
          <span className="text-xs text-gray-400 uppercase tracking-widest">or</span>
          <div className="h-px bg-gray-200 flex-1"></div>
        </div>

        <button
          onClick={() => onNavigate('app')}
          className="mt-8 w-full flex items-center justify-center gap-2 bg-white border-2 border-primary-800 text-primary-800 py-3.5 rounded-xl font-bold uppercase tracking-wide text-sm hover:bg-primary-50 transition-colors"
        >
          <UserCircle2 size={18} /> Continue as Guest
        </button>

        <p className="mt-8 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <button onClick={() => onNavigate('register')} className="text-primary-600 font-bold hover:underline">
            Register here
          </button>
        </p>
      </div>
    </div>
  );
}

