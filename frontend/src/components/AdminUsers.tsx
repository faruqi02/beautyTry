import { LayoutDashboard, Package, Users, LogOut, Search, UserPlus } from 'lucide-react';

interface AdminUsersProps {
  onNavigate: (view: 'login' | 'admin_dashboard' | 'admin_products' | 'admin_users') => void;
}

export function AdminUsers({ onNavigate }: AdminUsersProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col">
        <h1 className="text-xl font-bold tracking-widest uppercase text-gray-900 mb-10">BeautyTry<br/><span className="text-sm text-primary-600">Admin</span></h1>
        
        <nav className="space-y-2 flex-1">
          <button onClick={() => onNavigate('admin_dashboard')} className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors">
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button onClick={() => onNavigate('admin_products')} className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors">
            <Package size={20} /> Products
          </button>
          <button onClick={() => onNavigate('admin_users')} className="w-full flex items-center gap-3 px-4 py-3 bg-primary-50 text-primary-800 rounded-xl font-medium transition-colors">
            <Users size={20} /> Users
          </button>
        </nav>

        <button onClick={() => onNavigate('login')} className="w-full flex items-center gap-3 px-4 py-3 text-rose-600 hover:bg-rose-50 rounded-xl font-medium transition-colors mt-auto">
          <LogOut size={20} /> Sign Out
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <button className="flex items-center gap-2 bg-primary-800 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-primary-900 transition-colors">
            <UserPlus size={18} /> Add User
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div className="relative w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search users..." 
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <select className="border border-gray-200 rounded-lg text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500 bg-white">
              <option>All Roles</option>
              <option>Admin</option>
              <option>Staff</option>
              <option>Customer</option>
            </select>
          </div>
          
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                <th className="p-4 font-semibold">User Details</th>
                <th className="p-4 font-semibold">Role</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-50">
                <td className="p-4">
                  <p className="font-medium text-gray-900">Jane Doe</p>
                  <p className="text-xs text-gray-500">jane.doe@example.com</p>
                </td>
                <td className="p-4 text-sm text-gray-600">
                  <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-medium uppercase">Admin</span>
                </td>
                <td className="p-4">
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">Active</span>
                </td>
                <td className="p-4 text-sm">
                  <button className="text-primary-600 hover:underline mr-3">Edit</button>
                  <button className="text-rose-600 hover:underline">Ban</button>
                </td>
              </tr>
              <tr>
                <td className="p-4">
                  <p className="font-medium text-gray-900">John Smith</p>
                  <p className="text-xs text-gray-500">john@example.com</p>
                </td>
                <td className="p-4 text-sm text-gray-600">
                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium uppercase">Customer</span>
                </td>
                <td className="p-4">
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">Active</span>
                </td>
                <td className="p-4 text-sm">
                  <button className="text-primary-600 hover:underline mr-3">Edit</button>
                  <button className="text-rose-600 hover:underline">Ban</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

