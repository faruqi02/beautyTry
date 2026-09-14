import { useState, useEffect } from 'react';
import { LayoutDashboard, Package, Users, LogOut, Plus, Search, Pencil, Trash2, X, Loader2 } from 'lucide-react';

import type { User, Product } from '../types';

interface AdminProductsProps {
  onNavigate: (view: 'login' | 'admin_dashboard' | 'admin_products' | 'admin_users') => void;
  user: User | null;
}

export function AdminProducts({ onNavigate, user }: AdminProductsProps) {
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [skintoneFilter, setSkintoneFilter] = useState('All');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`/api/products?t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (err) {
        console.error("Failed to fetch products", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    const productData = Object.fromEntries(formData.entries());

    // Ensure stock_qty and intensity_colour are integers
    if (productData.stock_qty) {
      productData.stock_qty = parseInt(productData.stock_qty as string, 10) as any;
    } else {
      productData.stock_qty = 0 as any;
    }

    if (productData.intensity_colour) {
      productData.intensity_colour = parseInt(productData.intensity_colour as string, 10) as any;
    } else {
      productData.intensity_colour = 60 as any;
    }

    try {
      if (modalMode === 'edit' && selectedProduct?.id) {
        await fetch(`/api/products/${selectedProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData)
        });
      } else if (modalMode === 'add') {
        await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData)
        });
      }
      
      await new Promise(resolve => setTimeout(resolve, 800));
      const res = await fetch(`/api/products?t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
      setModalMode(null);
    } catch (err) {
      console.error('Failed to save product', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete?.id) return;
    setIsDeleting(true);
    
    try {
      await fetch(`/api/products/${productToDelete.id}`, {
        method: 'DELETE'
      });
      
      await new Promise(resolve => setTimeout(resolve, 800));
      const res = await fetch(`/api/products?t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
      setProductToDelete(null);
    } catch (err) {
      console.error('Failed to delete product', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const uniqueSkintones = Array.from(new Set(products.map(p => p.skintone))).filter(Boolean);

  const filteredProducts = products.filter(p => {
    const matchesSearch = (p.product_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                          (p.code_colour?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesSkintone = skintoneFilter === 'All' || p.skintone === skintoneFilter;
    return matchesSearch && matchesSkintone;
  });

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
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
          <button onClick={() => onNavigate('admin_dashboard')} className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors">
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button onClick={() => onNavigate('admin_products')} className="w-full flex items-center gap-3 px-4 py-3 bg-primary-50 text-primary-800 rounded-xl font-medium transition-colors">
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
      <div className="flex-1 p-10 flex flex-col min-h-0 min-w-0">
        <div className="flex justify-between items-center mb-8 shrink-0">
          <h2 className="text-2xl font-bold text-gray-900">Product Management</h2>
          <button 
            onClick={() => setModalMode('add')}
            className="flex items-center gap-2 bg-primary-800 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-primary-900 transition-colors"
          >
            <Plus size={18} /> Add Product
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
            <div className="flex gap-4 items-center">
              <div className="relative w-64">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <select
                value={skintoneFilter}
                onChange={(e) => setSkintoneFilter(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white min-w-[160px]"
              >
                <option value="All">All Skintones</option>
                {uniqueSkintones.map(tone => (
                  <option key={tone} value={tone}>{tone}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="overflow-x-auto overflow-y-auto flex-1 block w-full">
            <table className="w-full text-left border-collapse min-w-max">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                  <th className="p-4 font-semibold whitespace-nowrap">Product Name</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Skintone</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Code Colour</th>
                  <th className="p-4 font-semibold whitespace-nowrap">HEX_colour</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Product Info</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Intensity</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Stock Qty</th>
                  <th className="p-4 font-semibold whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} className="p-8 text-center text-gray-500 font-medium"><Loader2 size={24} className="animate-spin mx-auto" /></td></tr>
                ) : filteredProducts.length === 0 ? (
                  <tr><td colSpan={8} className="p-8 text-center text-gray-500 font-medium">No products found.</td></tr>
                ) : (
                  filteredProducts.map((product, idx) => (
                    <tr key={product.id || idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="p-4">
                        <p className="font-medium text-gray-900">{product.product_name}</p>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-gray-700">{product.skintone}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-gray-700 font-mono bg-gray-100 px-2 py-1 rounded">{product.code_colour}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-6 h-6 rounded border border-gray-200 shadow-sm" 
                            style={{ backgroundColor: product.hex_colour }}
                          ></div>
                          <span className="text-sm text-gray-600 uppercase font-mono">{product.hex_colour}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-gray-700 truncate max-w-[150px] inline-block">{product.product_info || '-'}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm font-medium text-gray-900">{product.intensity_colour ?? 60}%</span>
                      </td>
                      <td className="p-4">
                        <span className={`text-sm font-medium ${Number(product.stock_qty) < 20 ? 'text-rose-600 bg-rose-50 px-2 py-1 rounded' : 'text-gray-900'}`}>
                          {product.stock_qty}
                        </span>
                      </td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <button 
                          onClick={() => { setSelectedProduct(product); setModalMode('edit'); }}
                          className="p-2 rounded-lg border border-primary-200 text-primary-600 hover:bg-primary-600 hover:text-white hover:border-primary-600 transition-all mr-2" title="Edit"
                        >
                          <Pencil size={18} />
                        </button>
                        <button 
                          onClick={() => setProductToDelete(product)}
                          className="p-2 rounded-lg border border-rose-200 text-rose-500 hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all" title="Delete"
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

      {/* Add/Edit Product Modal */}
      {(modalMode === 'add' || modalMode === 'edit') && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSaveProduct} className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">{modalMode === 'add' ? 'Add New Product' : 'Edit Product'}</h3>
              <button 
                type="button"
                onClick={() => setModalMode(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 hover:bg-gray-100 p-2 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Product Name</label>
                <input 
                  type="text" 
                  name="product_name"
                  defaultValue={selectedProduct?.product_name || ''}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" 
                  placeholder="e.g. Classic Red Lipstick" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Skintone</label>
                  <select 
                    name="skintone"
                    defaultValue={selectedProduct?.skintone || ''}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
                  >
                    <option value="" disabled>Select Tone</option>
                    <option value="Fair">Fair</option>
                    <option value="Neutral Medium">Neutral Medium</option>
                    <option value="Medium Light">Medium Light</option>
                    <option value="Tan">Tan</option>
                    <option value="Deep">Deep</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Code Colour</label>
                  <input 
                    type="text" 
                    name="code_colour"
                    defaultValue={selectedProduct?.code_colour || ''}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" 
                    placeholder="e.g. s01" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">HEX Colour</label>
                  <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2">
                    <input 
                      type="color" 
                      name="hex_colour"
                      defaultValue={selectedProduct?.hex_colour || '#000000'}
                      className="w-8 h-8 rounded cursor-pointer border-0 p-0 bg-transparent"
                    />
                    <span className="text-xs text-gray-500 font-mono">Pick</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Intensity</label>
                  <input 
                    type="number" 
                    name="intensity_colour"
                    defaultValue={selectedProduct?.intensity_colour || 60}
                    min="0"
                    max="100"
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Stock Qty</label>
                  <input 
                    type="number" 
                    name="stock_qty"
                    defaultValue={selectedProduct?.stock_qty || 0}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Product Info</label>
                <textarea 
                  name="product_info"
                  defaultValue={selectedProduct?.product_info || ''}
                  rows={2}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" 
                  placeholder="Describe the shade..." 
                ></textarea>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button 
                type="button"
                onClick={() => setModalMode(null)}
                className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 bg-primary-800 text-white text-sm font-bold rounded-xl hover:bg-primary-900 transition-colors shadow-sm flex items-center gap-2"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : null}
                {isSaving ? 'Saving...' : 'Save Product'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden p-6 text-center">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-500">
              <Trash2 size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Product</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete <span className="font-bold text-gray-900">{productToDelete.product_name}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => setProductToDelete(null)}
                className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors bg-gray-50 hover:bg-gray-100 rounded-xl"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteProduct}
                disabled={isDeleting}
                className="px-6 py-2.5 bg-rose-600 text-white text-sm font-bold rounded-xl hover:bg-rose-700 transition-colors shadow-sm flex items-center gap-2"
              >
                {isDeleting ? <Loader2 size={16} className="animate-spin" /> : null}
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
