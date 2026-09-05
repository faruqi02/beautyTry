import { useState } from 'react';
import { Mail, Lock, User, ArrowLeft } from 'lucide-react';

interface RegisterProps {
  onNavigate: (view: 'login' | 'app') => void;
}

export function Register({ onNavigate }: RegisterProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && password) {
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
            className="w-full flex items-center justify-center gap-2 bg-primary-800 text-white py-3.5 rounded-xl font-bold uppercase tracking-wide text-sm hover:bg-primary-900 transition-colors shadow-md mt-4"
          >
            Register Account
          </button>
        </form>
      </div>
    </div>
  );
}

