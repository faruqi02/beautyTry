import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, LogOut, Settings, Heart, UserCircle2, Loader2, Edit2, Trash2, Camera } from 'lucide-react';
import type { User, Product } from '../types';

interface ProfileProps {
  onNavigate: (view: 'app' | 'login') => void;
  user: User | null;
  onLogout: () => void;
  onUpdateUser?: (user: User) => void;
}

function SwipeableFavoriteItem({ favName, favProduct, onRemove, onApply }: { favName: string, favProduct: Product | undefined, onRemove: () => void, onApply: () => void }) {
  const [offsetX, setOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    startX.current = e.touches[0].clientX - offsetX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const x = e.touches[0].clientX - startX.current;
    // Limit dragging between -80 (left) and 0 (right)
    const boundedX = Math.max(-80, Math.min(0, x));
    setOffsetX(boundedX);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (offsetX < -40) {
      setOffsetX(-80); // snap open
    } else {
      setOffsetX(0); // snap closed
    }
  };

  // Support mouse dragging for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startX.current = e.clientX - offsetX;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const x = e.clientX - startX.current;
    const boundedX = Math.max(-80, Math.min(0, x));
    setOffsetX(boundedX);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (offsetX < -40) {
      setOffsetX(-80); // snap open
    } else {
      setOffsetX(0); // snap closed
    }
  };

  return (
    <div className="relative w-full overflow-hidden rounded-2xl shadow-sm border border-rose-100 bg-rose-50">
      {/* Background Action (Delete) */}
      <div className="absolute inset-y-0 right-0 w-20 flex items-center justify-center">
        <button 
          onClick={onRemove}
          className="text-rose-600 hover:text-rose-800 font-bold text-[10px] uppercase tracking-wider flex flex-col items-center gap-1 w-full h-full justify-center"
        >
          <Trash2 size={24} /> Delete
        </button>
      </div>

      {/* Foreground Item */}
      <div 
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="bg-white p-6 flex flex-row items-center gap-4 relative z-10 cursor-grab active:cursor-grabbing border border-transparent rounded-2xl h-full select-none"
        style={{ 
          transform: `translateX(${offsetX}px)`,
          transition: isDragging ? 'none' : 'transform 0.2s ease-out'
        }}
      >
        <div className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-bl-xl pointer-events-none">
          Favorite
        </div>
        <div 
          className="w-16 h-16 rounded-full shadow-inner border border-black/10 shrink-0 pointer-events-none"
          style={{ backgroundColor: favProduct?.hex_colour || '#eeeeee' }}
        />
        <div className="flex-1 pointer-events-none">
          <p className="font-bold text-gray-900 text-lg">{favName}</p>
          {favProduct ? (
            <p className="text-sm text-gray-500 mt-1">{favProduct.code_colour}</p>
          ) : (
            <p className="text-sm text-gray-500 mt-1">Product details unavailable.</p>
          )}
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onApply();
          }}
          className="mt-2 text-sm text-rose-600 font-bold hover:text-rose-700 w-max shrink-0 px-4 cursor-pointer"
        >
          Apply in Try-On &rarr;
        </button>
      </div>
    </div>
  );
}

export function Profile({ onNavigate, user, onLogout, onUpdateUser }: ProfileProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

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
    <div className="min-h-screen bg-gray-50 w-full overflow-y-auto flex flex-col">
      <div className="max-w-2xl mx-auto p-8 w-full flex-1 flex flex-col">
        
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
              <div className="relative group shrink-0">
                <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center text-primary-800 text-3xl font-light uppercase overflow-hidden border-4 border-white shadow-sm">
                  {displayUser.profile_image_url ? (
                    <img src={displayUser.profile_image_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    (displayUser.full_name || 'U').charAt(0)
                  )}
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  {isSaving ? <Loader2 size={24} className="animate-spin" /> : <Camera size={24} />}
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    disabled={isSaving}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setIsSaving(true);
                      try {
                        const { uploadImageToGas, callGasApi } = await import('../utils/gasApi');
                        const uploadRes = await uploadImageToGas('users', user.id, file);
                        
                        if (uploadRes.status !== 200 || uploadRes.data?.error) {
                          alert(`Upload Error: ${uploadRes.data?.error || 'Unknown error'}`);
                          return;
                        }

                        if (uploadRes.data?.url) {
                          const dbRes = await callGasApi("POST", {}, {
                            action: "update",
                            sheet: "user_data",
                            id: user.id,
                            data: {
                              profile_image_url: uploadRes.data.url
                            }
                          });
                          
                          if (dbRes.status !== 200 || dbRes.data?.error) {
                            alert(`Database Update Error: ${dbRes.data?.error || 'Unknown error'}`);
                            return;
                          }

                          if (onUpdateUser) {
                            onUpdateUser({ ...user, profile_image_url: uploadRes.data.url });
                          }
                        }
                      } catch (err: any) {
                        console.error('Upload failed', err);
                        alert(`Network/Fetch Error: ${err.message || String(err)}`);
                      } finally {
                        setIsSaving(false);
                      }
                    }} 
                  />
                </label>
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
                
                const handleRemoveFavorite = async () => {
                  const newSavedList = savedProductNames.filter(name => name !== favName);
                  const newSavedProductStr = newSavedList.join(', ');
                  
                  const updatedUser = { ...displayUser, saved_product: newSavedProductStr };
                  if (onUpdateUser) onUpdateUser(updatedUser);
                  
                  try {
                    const res = await fetch(`/api/users/${displayUser.id}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ saved_product: newSavedProductStr })
                    });
                    if (!res.ok) throw new Error('Failed to remove favorite');
                  } catch (err) {
                    console.error(err);
                    alert('Failed to remove favorite.');
                    if (onUpdateUser) onUpdateUser(displayUser); // Revert
                  }
                };

                const handleApply = () => {
                  if (favProduct?.hex_colour) {
                    window.localStorage.setItem('pending_apply_shade', favProduct.hex_colour);
                  }
                  onNavigate('app');
                };

                return (
                  <SwipeableFavoriteItem 
                    key={favName} 
                    favName={favName} 
                    favProduct={favProduct} 
                    onRemove={handleRemoveFavorite} 
                    onApply={handleApply} 
                  />
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
        {/* Logout */}
        <button
          onClick={() => setShowSignOutConfirm(true)}
          className="mt-auto w-full flex items-center justify-center gap-2 bg-rose-600 text-white py-4 rounded-2xl font-bold uppercase tracking-wide text-sm hover:bg-rose-700 transition-colors shadow-sm"
        >
          <LogOut size={18} /> Sign Out
        </button>

      </div>

      {/* Custom Sign Out Modal */}
      {showSignOutConfirm && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-6">
              <LogOut size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Sign Out</h3>
            <p className="text-gray-500 mb-8">Are you sure you want to sign out of your account?</p>
            <div className="flex w-full gap-4">
              <button 
                onClick={() => setShowSignOutConfirm(false)}
                className="flex-1 py-3.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setShowSignOutConfirm(false);
                  onLogout();
                  onNavigate('login');
                }}
                className="flex-1 py-3.5 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

