import { useState } from 'react';
import { Mail, Lock, User, ArrowLeft, Smartphone } from 'lucide-react';

interface RegisterProps {
  onNavigate: (view: 'login' | 'app') => void;
}

export function Register({ onNavigate }: RegisterProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      // Prevent submission if passwords don't match
      return;
    }
    if (name && email && phone && password) {
      // In a real app, you would create the account here
      onNavigate('app');
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

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <User size={18} />
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
                className="block w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none"
                placeholder="+60 12-345 6789"
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
            disabled={password !== confirmPassword && confirmPassword.length > 0}
            className={`w-full flex items-center justify-center gap-2 text-white py-3.5 rounded-xl font-bold uppercase tracking-wide text-sm transition-all shadow-md mt-4 ${
              password !== confirmPassword && confirmPassword.length > 0 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-primary-800 hover:bg-primary-900"
            }`}
          >
            Register Account
          </button>
        </form>
      </div>
    </div>
  );
}
