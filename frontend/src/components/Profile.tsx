import { useState, useEffect } from 'react';
import { ArrowLeft, LogOut, Settings, Heart, UserCircle2, Loader2, Edit2 } from 'lucide-react';
import type { User, Product } from '../types';

interface ProfileProps {
  onNavigate: (view: 'app' | 'login') => void;
  user: User | null;
  onLogout: () => void;
  onUpdateUser?: (user: User) => void;
}

export function Profile({ onNavigate, user, onLogout, onUpdateUser }: ProfileProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`/api/products?t=${Date.now()}`);
        if (res.ok) {
          setProducts(await res.json());
        }
      } catch (err) {
        console.error('Failed to fetch products', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 w-full overflow-y-auto">
        <div className="max-w-2xl mx-auto p-8">
          <div className="flex items-center mb-10">
            <button 
              onClick={() => onNavigate('app')}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-800 transition-colors font-medium"
            >
              <ArrowLeft size={20} /> Back to Try-On
            </button>
          </div>
          
          <div className="bg-white rounded-3xl shadow-sm border border-primary-100 p-12 flex flex-col items-center text-center mt-10">
            <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mb-6 text-primary-600">
              <UserCircle2 size={48} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Please Login</h2>
            <p className="text-gray-500 mb-8 max-w-sm">
              You are currently browsing as a guest. Please sign in to view your profile and save your favorite shades!
            </p>
            
            <button 
              onClick={() => onNavigate('login')}
              className="bg-primary-800 text-white px-10 py-3.5 rounded-xl font-bold hover:bg-primary-900 transition-colors shadow-sm w-full max-w-xs"
            >
              Sign In to Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  const displayUser = user;
  
  // Parse saved products
  const savedProductNames = displayUser.saved_product 
    ? displayUser.saved_product.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="min-h-screen bg-gray-50 w-full overflow-y-auto">
      <div className="max-w-2xl mx-auto p-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <button 
            onClick={() => onNavigate('app')}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-800 transition-colors font-medium"
          >
            <ArrowLeft size={20} /> Back to Try-On
          </button>
          <h1 className="text-2xl font-light tracking-widest text-gray-900 uppercase">Profile</h1>
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>

        {/* User Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-primary-100 p-8 mb-8 flex flex-col gap-6">
          {isEditing ? (
            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                setIsSaving(true);
                try {
                  const formData = new FormData(e.currentTarget);
                  const updates = Object.fromEntries(formData.entries());
                  
                  const res = await fetch(`/api/users/${displayUser.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updates)
                  });
                  
                  if (!res.ok) throw new Error('Failed to update profile');
                  
                  const updatedData = { ...displayUser, ...updates };
                  if (onUpdateUser) onUpdateUser(updatedData);
                  setIsEditing(false);
                } catch (err) {
                  console.error(err);
                  alert('Failed to update profile');
                } finally {
                  setIsSaving(false);
                }
              }}
              className="flex flex-col gap-4 w-full"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
                <button 
                  type="button" 
                  onClick={() => setIsEditing(false)}
                  className="text-gray-400 hover:text-gray-600 font-medium text-sm"
                >
                  Cancel
                </button>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                <input 
                  type="text" 
                  name="full_name" 
                  defaultValue={displayUser.full_name} 
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                <input 
                  type="email" 
                  name="email" 
                  defaultValue={displayUser.email} 
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone Number</label>
                <input 
                  type="text" 
                  name="phone_number" 
                  defaultValue={displayUser.phone_number || ''} 
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                />
              </div>
              <div className="flex justify-end mt-2">
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="bg-primary-800 text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-900 transition-colors shadow-sm disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="flex items-center gap-6 w-full">
              <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center text-primary-800 text-3xl font-light uppercase shrink-0">
                {displayUser.full_name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-gray-900 truncate">{displayUser.full_name}</h2>
                <p className="text-gray-500 mb-2 truncate">{displayUser.email}</p>
                <span className="inline-block bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  {displayUser.role}
                </span>
              </div>
              <button 
                onClick={() => setIsEditing(true)}
                className="flex flex-col items-center gap-1 p-3 text-gray-400 hover:text-primary-600 transition-colors rounded-xl hover:bg-primary-50"
              >
                <Edit2 size={20} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Edit</span>
              </button>
            </div>
          )}
        </div>

        {/* Favorites Section */}
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Heart size={18} className="text-rose-500" /> Saved Favorite Products
        </h3>
        <div className="mb-12">
          {loading ? (
             <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary-300" size={32}/></div>
          ) : savedProductNames.length > 0 ? (
            <div className="flex flex-col gap-4">
              {savedProductNames.map(favName => {
                const favProduct = products.find(p => p.product_name === favName);
                return (
                  <div key={favName} className="bg-white rounded-2xl p-6 border border-rose-100 flex flex-row items-center gap-4 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-bl-xl">
                      Favorite
                    </div>
                    <div 
                      className="w-16 h-16 rounded-full shadow-inner border border-black/10 shrink-0"
                      style={{ backgroundColor: favProduct?.hex_colour || '#eeeeee' }}
                    />
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-lg">{favName}</p>
                      {favProduct ? (
                        <p className="text-sm text-gray-500 mt-1">{favProduct.code_colour}</p>
                      ) : (
                        <p className="text-sm text-gray-500 mt-1">Product details unavailable.</p>
                      )}
                    </div>
                    <button 
                      onClick={() => {
                        // We use a small hack to pass the hex_colour through local storage 
                        // so App.tsx can pick it up, or we can just navigate and let the user select.
                        // Better: just navigate for now, since App.tsx doesn't take a hex parameter in onNavigate.
                        // Wait, user explicitly asked: "make sure it apply the selected one"
                        if (favProduct?.hex_colour) {
                          window.localStorage.setItem('pending_apply_shade', favProduct.hex_colour);
                        }
                        onNavigate('app');
                      }} 
                      className="mt-2 text-sm text-rose-600 font-bold hover:text-rose-700 w-max shrink-0 px-4"
                    >
                      Apply in Try-On &rarr;
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 border border-dashed border-gray-300 flex flex-col items-center justify-center text-center text-gray-500">
              <Heart size={32} className="text-gray-300 mb-3" />
              <p className="text-sm font-medium">No favorite product saved yet.</p>
              <p className="text-xs mt-1">Go to the Try-On studio and click the Favorite button to save your shade!</p>
            </div>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={() => {
            onLogout();
            onNavigate('login');
          }}
          className="w-full flex items-center justify-center gap-2 bg-white border border-rose-200 text-rose-600 py-4 rounded-2xl font-bold uppercase tracking-wide text-sm hover:bg-rose-50 transition-colors"
        >
          <LogOut size={18} /> Sign Out
        </button>

      </div>
    </div>
  );
}

