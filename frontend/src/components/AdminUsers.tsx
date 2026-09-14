import { useState, useEffect } from 'react';
import { LayoutDashboard, Package, Users, LogOut, Search, UserPlus, Pencil, Ban, X, Loader2, Trash2 } from 'lucide-react';
import type { User } from '../types';

interface AdminUsersProps {
  onNavigate: (view: 'login' | 'admin_dashboard' | 'admin_products' | 'admin_users') => void;
  user: User | null;
}

export function AdminUsers({ onNavigate, user }: AdminUsersProps) {
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');

  const filteredUsers = users.filter(u => {
    const matchesSearch = (u.full_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
                          (u.email?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'All Roles' || (u.role?.toUpperCase() || 'CUSTOMER') === roleFilter.toUpperCase();
    return matchesSearch && matchesRole;
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`/api/users?t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
        }
      } catch (err) {
        console.error("Failed to fetch users", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleSaveUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    const userData = Object.fromEntries(formData.entries());

    // If editing and password field is blank, remove it so backend doesn't overwrite it
    if (modalMode === 'edit' && !userData.password) {
      delete userData.password;
    }

    // Force role to be uppercase (e.g. ADMIN, STAFF, CUSTOMER) for database consistency
    if (typeof userData.role === 'string') {
      userData.role = userData.role.toUpperCase();
    }

    try {
      if (modalMode === 'edit' && selectedUser?.id) {
        // Edit User
        await fetch(`/api/users/${selectedUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        });
      } else if (modalMode === 'add') {
        // Add User
        await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        });
      }
      // Wait briefly to allow Google Sheets to finish its internal write cycle
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Refresh user list, forcing a bypass of the browser cache
      const res = await fetch(`/api/users?t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
      setModalMode(null);
    } catch (err) {
      console.error('Failed to save user', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete?.id) return;
    setIsDeleting(true);
    
    try {
      await fetch(`/api/users/${userToDelete.id}`, {
        method: 'DELETE'
      });
      
      await new Promise(resolve => setTimeout(resolve, 800));
      const res = await fetch(`/api/users?t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
      setUserToDelete(null);
    } catch (err) {
      console.error('Failed to delete user', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col z-10">
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
      <div className="flex-1 p-10 flex flex-col min-h-0 min-w-0">
        <div className="flex justify-between items-center mb-8 shrink-0">
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <button 
            onClick={() => { setSelectedUser(null); setModalMode('add'); }}
            className="flex items-center gap-2 bg-primary-800 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-primary-900 transition-colors"
          >
            <UserPlus size={18} /> Add User
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
            <div className="relative w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search users..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="border border-gray-200 rounded-lg text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            >
              <option value="All Roles">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Staff">Staff</option>
              <option value="Customer">Customer</option>
            </select>
          </div>
          
          <div className="overflow-x-auto overflow-y-auto flex-1 block w-full">
            <table className="w-full text-left border-collapse min-w-max">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                  <th className="p-4 font-semibold whitespace-nowrap">User Details</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Phone Number</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Role</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Status</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Created Date</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Last Login</th>
                  <th className="p-4 font-semibold whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="p-8 text-center text-gray-500 font-medium">Loading users...</td></tr>
                ) : filteredUsers.length === 0 ? (
                  <tr><td colSpan={7} className="p-8 text-center text-gray-500 font-medium">No users found.</td></tr>
                ) : (
                  filteredUsers.map((user, idx) => (
                    <tr key={user.id || idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="p-4">
                        <p className="font-medium text-gray-900">{user.full_name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </td>
                      <td className="p-4 text-sm text-gray-700 font-mono">
                        {user.phone_number || 'N/A'}
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        <span className={`px-2 py-1 rounded text-xs font-medium uppercase tracking-wider ${
                          user.role?.toUpperCase() === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 
                          user.role?.toUpperCase() === 'STAFF' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {user.role || 'CUSTOMER'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {user.status || 'Active'}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {user.created_at ? new Date(user.created_at as string).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'}
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {user.last_login ? new Date(user.last_login as string).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true }).toUpperCase() : '-'}
                      </td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <button 
                          onClick={() => { setSelectedUser(user); setModalMode('edit'); }}
                          className="p-2 rounded-lg border border-primary-200 text-primary-600 hover:bg-primary-600 hover:text-white hover:border-primary-600 transition-all mr-2" title="Edit"
                        >
                          <Pencil size={18} />
                        </button>
                        <button 
                          onClick={() => setUserToDelete(user)}
                          className="p-2 rounded-lg border border-rose-200 text-rose-500 hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all" title="Delete User"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Unified Add/Edit User Modal */}
      {modalMode !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSaveUser} className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">
                {modalMode === 'add' ? 'Add New User' : 'Edit User Details'}
              </h3>
              <button 
                type="button"
                onClick={() => setModalMode(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 hover:bg-gray-100 p-2 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Full Name</label>
                  <input type="text" name="full_name" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="e.g. Jane Doe" defaultValue={modalMode === 'edit' ? selectedUser?.full_name : ''} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Phone Number</label>
                  <input type="tel" name="phone_number" required pattern="^\+.*" title="Phone number must start with a + sign" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="+60 12-345 6789" defaultValue={modalMode === 'edit' ? selectedUser?.phone_number : ''} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Email Address</label>
                <input type="email" name="email" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="user@example.com" defaultValue={modalMode === 'edit' ? selectedUser?.email : ''} />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  {modalMode === 'add' ? 'Temporary Password' : 'Change Password (Optional)'}
                </label>
                <input 
                  type="password" 
                  name="password" 
                  required={modalMode === 'add'} 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" 
                  placeholder={modalMode === 'add' ? '••••••••' : 'Leave blank to keep current password'} 
                />
                {modalMode === 'add' && (
                  <p className="text-xs text-gray-400 mt-2">User will be prompted to change this on first login.</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Role</label>
                  <select name="role" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none" defaultValue={modalMode === 'edit' ? (selectedUser?.role?.toUpperCase() || 'CUSTOMER') : 'CUSTOMER'}>
                    <option value="ADMIN">Admin</option>
                    <option value="STAFF">Staff</option>
                    <option value="CUSTOMER">Customer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Account Status</label>
                  <select name="status" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none" defaultValue={modalMode === 'edit' ? (selectedUser?.status || 'Active') : 'Active'}>
                    <option value="Active">Active</option>
                    <option value="Banned">Banned</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button 
                type="button"
                onClick={() => setModalMode(null)}
                className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 bg-primary-800 text-white text-sm font-bold rounded-xl hover:bg-primary-900 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSaving && <Loader2 size={16} className="animate-spin" />}
                {isSaving ? 'Saving...' : (modalMode === 'add' ? 'Create User' : 'Save Changes')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {userToDelete !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden p-6 text-center">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-500">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Are you sure?</h3>
            <p className="text-gray-500 mb-8 text-sm">
              Do you really want to delete <strong>{userToDelete.full_name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => setUserToDelete(null)}
                className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors w-full"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteUser}
                disabled={isDeleting}
                className="px-5 py-2.5 bg-rose-500 text-white text-sm font-bold rounded-xl hover:bg-rose-600 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 w-full"
              >
                {isDeleting && <Loader2 size={16} className="animate-spin" />}
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

