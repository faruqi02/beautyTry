import { useState, useEffect } from 'react';
import { LayoutDashboard, Package, Users, LogOut, Loader2 } from 'lucide-react';

import type { User } from '../types';

interface AdminDashboardProps {
  onNavigate: (view: 'login' | 'admin_dashboard' | 'admin_products' | 'admin_users') => void;
  user: User | null;
}

export function AdminDashboard({ onNavigate, user }: AdminDashboardProps) {
  const [totalUsers, setTotalUsers] = useState<number | '-'>('-');
  const [totalProducts, setTotalProducts] = useState<number | '-'>('-');
  const [activeSessions, setActiveSessions] = useState<number | '-'>('-');

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const [usersRes, productsRes] = await Promise.all([
          fetch(`/api/users?t=${Date.now()}`),
          fetch(`/api/products?t=${Date.now()}`)
        ]);

        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setTotalUsers(usersData.length);
          
          // Calculate active sessions (login within last 24h)
          const oneDayAgo = new Date();
          oneDayAgo.setDate(oneDayAgo.getDate() - 1);
          
          const active = usersData.filter((u: any) => {
            if (!u.last_login) return false;
            return new Date(u.last_login) >= oneDayAgo;
          }).length;
          
          setActiveSessions(active);
        }

        if (productsRes.ok) {
          const productsData = await productsRes.json();
          setTotalProducts(productsData.length);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard metrics", error);
      }
    };
    
    fetchMetrics();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col">
        <div className="mb-10">
          <h1 className="text-xl font-bold tracking-widest uppercase text-gray-900">BeautyTry<br/><span className="text-sm text-primary-600">{user?.role || 'Admin'}</span></h1>
          {user && (
            <div className="mt-6">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Logged in as</p>
              <p className="text-sm font-medium text-primary-700 mt-1 truncate">HI, {user.full_name.toUpperCase()}</p>
            </div>
          )}
        </div>
        
        <nav className="space-y-2 flex-1">
          <button onClick={() => onNavigate('admin_dashboard')} className="w-full flex items-center gap-3 px-4 py-3 bg-primary-50 text-primary-800 rounded-xl font-medium transition-colors">
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button onClick={() => onNavigate('admin_products')} className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors">
            <Package size={20} /> Products
          </button>
          <button onClick={() => onNavigate('admin_users')} className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors">
            <Users size={20} /> Users
          </button>
        </nav>

        <button onClick={() => onNavigate('login')} className="w-full flex items-center gap-3 px-4 py-3 text-rose-600 hover:bg-rose-50 rounded-xl font-medium transition-colors mt-auto">
          <LogOut size={20} /> Sign Out
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Management Dashboard</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-gray-500 text-sm font-medium mb-2">Total Users</h3>
            <p className="text-3xl font-bold text-gray-900">{totalUsers === '-' ? <Loader2 size={24} className="animate-spin text-gray-400" /> : totalUsers}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-gray-500 text-sm font-medium mb-2">Total Products</h3>
            <p className="text-3xl font-bold text-gray-900">{totalProducts === '-' ? <Loader2 size={24} className="animate-spin text-gray-400" /> : totalProducts}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-gray-500 text-sm font-medium mb-2">Active Sessions (24h)</h3>
            <p className="text-3xl font-bold text-gray-900">{activeSessions === '-' ? <Loader2 size={24} className="animate-spin text-gray-400" /> : activeSessions}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-96 flex items-center justify-center">
          <p className="text-gray-400">Dashboard charts and activity logs will appear here.</p>
        </div>
      </div>
    </div>
  );
}

