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
  const [products, setProducts] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const [usersRes, productsRes] = await Promise.all([
          fetch(`/api/users?t=${Date.now()}`),
          fetch(`/api/products?t=${Date.now()}`)
        ]);

        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsersList(usersData);
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
          setProducts(productsData);
          setTotalProducts(productsData.length);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard metrics", error);
      }
    };
    
    fetchMetrics();
  }, []);

  // Prepare Chart Data
  const skintoneCounts = products.reduce((acc: any, p: any) => {
    const tone = p.skintone || 'Uncategorized';
    acc[tone] = (acc[tone] || 0) + 1;
    return acc;
  }, {});
  const sortedSkintones = Object.entries(skintoneCounts).sort((a: any, b: any) => b[1] - a[1]);

  const roleCounts = usersList.reduce((acc: any, u: any) => {
    const r = u.role?.toUpperCase() || 'CUSTOMER';
    acc[r] = (acc[r] || 0) + 1;
    return acc;
  }, {});
  const sortedRoles = Object.entries(roleCounts).sort((a: any, b: any) => b[1] - a[1]);

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
      <div className="flex-1 p-10 overflow-auto">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Products by Skintone */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-gray-900 font-bold mb-6 text-lg">Products by Skintone</h3>
            {products.length === 0 ? (
               <div className="h-48 flex items-center justify-center text-gray-400">
                 <Loader2 size={24} className="animate-spin mr-2" /> Loading chart...
               </div>
            ) : (
               <div className="space-y-5">
                 {sortedSkintones.map(([tone, count]: any) => (
                   <div key={tone}>
                     <div className="flex justify-between text-sm mb-1.5">
                       <span className="font-medium text-gray-700">{tone}</span>
                       <span className="text-gray-500 font-mono">{count}</span>
                     </div>
                     <div className="w-full bg-gray-50 rounded-full h-2.5">
                       <div className="bg-primary-500 h-2.5 rounded-full" style={{ width: `${(count / products.length) * 100}%` }}></div>
                     </div>
                   </div>
                 ))}
               </div>
            )}
          </div>

          {/* Chart 2: User Roles Distribution */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-gray-900 font-bold mb-6 text-lg">User Roles</h3>
            {usersList.length === 0 ? (
               <div className="h-48 flex items-center justify-center text-gray-400">
                 <Loader2 size={24} className="animate-spin mr-2" /> Loading chart...
               </div>
            ) : (
               <div className="space-y-5">
                 {sortedRoles.map(([role, count]: any) => {
                   const colorClass = role === 'ADMIN' ? 'bg-purple-500' : role === 'STAFF' ? 'bg-blue-500' : 'bg-green-500';
                   return (
                     <div key={role}>
                       <div className="flex justify-between text-sm mb-1.5">
                         <span className="font-medium text-gray-700 capitalize">{role.toLowerCase()}</span>
                         <span className="text-gray-500 font-mono">{count}</span>
                       </div>
                       <div className="w-full bg-gray-50 rounded-full h-2.5">
                         <div className={`${colorClass} h-2.5 rounded-full`} style={{ width: `${(count / usersList.length) * 100}%` }}></div>
                       </div>
                     </div>
                   )
                 })}
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

