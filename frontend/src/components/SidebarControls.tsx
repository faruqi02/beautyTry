import { useState, useEffect } from 'react';
import { Camera, Heart, Info, SlidersHorizontal, Sparkles, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import type { Product, User } from '../types';

interface SidebarControlsProps {
  selectedShade: string | null;
  onSelectShade: (shade: string | null) => void;
  intensity: number;
  onIntensityChange: (intensity: number) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  currentUser?: User | null;
  setCurrentUser?: (user: User | null) => void;
}

export function SidebarControls({
  selectedShade,
  onSelectShade,
  intensity,
  onIntensityChange,
  isCollapsed = false,
  onToggleCollapse,
  currentUser,
  setCurrentUser,
}: SidebarControlsProps) {
  const [activeTab, setActiveTab] = useState<'shades' | 'details'>('shades');
  const [selectedSkinTone, setSelectedSkinTone] = useState<string>('');
  const [products, setProducts] = useState<Product[]>([]);
  const [currentShades, setCurrentShades] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDetecting, setIsDetecting] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`/api/products?t=${Date.now()}`);
        if (res.ok) {
          const data: Product[] = await res.json();
          setProducts(data);
          
          const tones = Array.from(new Set(data.map(p => p.skintone))).filter(Boolean);
          if (tones.length > 0) {
            setSelectedSkinTone(tones.includes('Tan') ? 'Tan' : tones[0]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch products", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const skinTones = Array.from(new Set(products.map(p => p.skintone))).filter(Boolean);

  // When selectedSkinTone changes, randomize the shades for that tone and auto-apply the best match
  useEffect(() => {
    if (!selectedSkinTone || products.length === 0) return;
    
    const matched = products.filter(p => p.skintone === selectedSkinTone);
    // Shuffle to pick a random "Best Match" for the suggestion
    const shuffled = [...matched].sort(() => 0.5 - Math.random());
    setCurrentShades(shuffled);
    
    if (shuffled.length > 0) {
      const best = shuffled[0];
      onSelectShade(best.hex_colour);
      if (best.intensity_colour !== undefined) {
        onIntensityChange(Number(best.intensity_colour) / 100);
      }
    }
  }, [selectedSkinTone, products]);

  const handleDetectSkintone = () => {
    setIsDetecting(true);
    setTimeout(() => {
      setIsDetecting(false);
      if (skinTones.length > 0) {
        // Pick a random skintone
        const randomTone = skinTones[Math.floor(Math.random() * skinTones.length)];
        setSelectedSkinTone(randomTone);
      }
    }, 1500);
  };
  
  const bestMatch = currentShades.length > 0 ? currentShades[0] : null;
  const otherRecommendations = currentShades.length > 1 ? currentShades.slice(1) : [];

  const getMatchPercentage = (name: string, isBest: boolean) => {
    if (isBest) return 98;
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return 80 + (Math.abs(hash) % 16);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Top Navigation / Tabs */}
      <div className="flex border-b border-primary-200 relative shrink-0 h-[60px]">
        <button
          className={twMerge(
            "flex-1 text-sm font-medium tracking-wide flex justify-center items-center gap-2 transition-colors",
            activeTab === 'shades' ? "text-primary-800 border-b-2 border-primary-800" : "text-gray-400 hover:text-primary-600"
          )}
          onClick={() => {
            setActiveTab('shades');
            if (isCollapsed && onToggleCollapse) onToggleCollapse();
          }}
        >
          <Sparkles size={16} /> All Shades
        </button>
        <button
          className={twMerge(
            "flex-1 text-sm font-medium tracking-wide flex justify-center items-center gap-2 transition-colors",
            activeTab === 'details' ? "text-primary-800 border-b-2 border-primary-800" : "text-gray-400 hover:text-primary-600"
          )}
          onClick={() => {
            setActiveTab('details');
            if (isCollapsed && onToggleCollapse) onToggleCollapse();
          }}
        >
          <Info size={16} /> Product Info
        </button>
        
        {/* Collapse Toggle Button */}
        <button 
          onClick={onToggleCollapse}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-primary-600 rounded-full hover:bg-gray-100 transition-colors"
        >
          {isCollapsed ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {!isCollapsed && activeTab === 'shades' && (
        <div className="flex-1 flex flex-col p-6 gap-8 overflow-y-auto">
          
          {/* Skin Tone Selector */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-widest text-primary-600 font-semibold flex justify-between items-center">
              <span className="flex items-center gap-2"><SlidersHorizontal size={14} /> Detect or Select Tone</span>
              <div className={twMerge("relative inline-flex overflow-hidden rounded-md p-[2px]", (isDetecting || skinTones.length === 0) && "opacity-60")}>
                <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#4285f4,#ea4335,#fbbc04,#34a853,#4285f4)]" />
                <button 
                  onClick={handleDetectSkintone}
                  disabled={isDetecting || skinTones.length === 0}
                  className="relative flex w-full items-center gap-1 justify-center rounded-[4px] bg-white px-2 py-1 text-[10px] font-bold text-gray-800 transition-colors hover:bg-gray-50"
                >
                  {isDetecting ? <Loader2 size={12} className="animate-spin text-[#4285f4]" /> : <Sparkles size={12} className="text-[#4285f4]" />}
                  <span className="bg-gradient-to-r from-[#4285f4] via-[#ea4335] to-[#fbbc04] bg-clip-text text-transparent">
                    {isDetecting ? 'DETECTING...' : 'AI DETECT'}
                  </span>
                </button>
              </div>
            </h3>
            {loading ? (
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Loader2 size={16} className="animate-spin" /> Loading tones...
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {skinTones.map((tone) => (
                  <button
                    key={tone}
                    onClick={() => setSelectedSkinTone(tone)}
                    className={twMerge(
                      "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                      selectedSkinTone === tone 
                        ? "bg-primary-800 text-white border-primary-800" 
                        : "bg-white text-gray-600 border-primary-200 hover:border-primary-400"
                    )}
                  >
                    {tone}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Best Match Highlight */}
          {bestMatch && (
            <div className="bg-primary-50 rounded-2xl p-5 border border-primary-100 shadow-sm relative shrink-0">
              <div className="absolute top-0 right-0 bg-primary-800 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-bl-xl z-10">
                Best Match
              </div>
              <h3 className="text-sm font-bold text-gray-800 mb-4 pr-16">
                Your Best Match
              </h3>
              
              {bestMatch ? (
                <div 
                  className={`flex flex-row items-center gap-4 p-3 rounded-xl cursor-pointer border shadow-sm ${selectedShade === bestMatch.hex_colour ? 'bg-white border-primary-500' : 'bg-white/60 border-transparent hover:bg-white'}`}
                  onClick={() => {
                    if (bestMatch.hex_colour) onSelectShade(bestMatch.hex_colour);
                    if (bestMatch.intensity_colour !== undefined) {
                      onIntensityChange(Number(bestMatch.intensity_colour) / 100);
                    }
                  }}
                >
                  <div 
                    className="w-12 h-12 rounded-full shadow-inner border border-black/10 shrink-0"
                    style={{ backgroundColor: bestMatch.hex_colour || '#000000' }}
                  ></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm truncate">{bestMatch.product_name}</p>
                    <p className="text-xs text-gray-500 truncate">{bestMatch.code_colour}</p>
                  </div>
                  <div className="shrink-0 text-xs font-bold text-white bg-primary-800 px-2 py-1 rounded-md">
                    98% Match
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* All Recommendations */}
          {otherRecommendations.length > 0 && (
            <div className="space-y-4 flex-1">
              <h3 className="text-xs uppercase tracking-widest text-primary-600 font-semibold">
                Other Recommendations
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {otherRecommendations.map((shade) => (
                  <div 
                    key={shade.id || shade.code_colour}
                    className={twMerge(
                      "flex items-center gap-4 p-3 rounded-xl cursor-pointer border transition-all",
                      selectedShade === shade.hex_colour 
                        ? "border-primary-500 bg-primary-50 shadow-sm" 
                        : "border-transparent hover:border-primary-200 hover:bg-gray-50"
                    )}
                    onClick={() => {
                      onSelectShade(shade.hex_colour);
                      if (shade.intensity_colour !== undefined) {
                        onIntensityChange(Number(shade.intensity_colour) / 100);
                      }
                    }}
                  >
                    <div 
                      className="w-10 h-10 rounded-full shadow-inner border border-black/10 flex-shrink-0"
                      style={{ backgroundColor: shade.hex_colour }}
                    />
                    <div className="flex-1 flex justify-between items-center">
                      <div className="overflow-hidden">
                        <p className="font-medium text-gray-800 text-sm truncate">{shade.product_name}</p>
                        <p className="text-xs text-gray-500">{shade.code_colour}</p>
                      </div>
                      <span className="text-xs font-medium text-primary-600 bg-primary-100 px-2 py-1 rounded-md ml-2 shrink-0">
                        {getMatchPercentage(shade.product_name, false)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Intensity Slider */}
          <div className="mt-auto pt-6 border-t border-primary-100 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Color Intensity</span>
              <span className="text-xs font-bold text-primary-800">{Math.round(intensity * 100)}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.05"
              value={intensity}
              onChange={(e) => onIntensityChange(parseFloat(e.target.value))}
              className="w-full accent-primary-600 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

        </div>
      )}

      {/* Product Info Tab Content */}
      {!isCollapsed && activeTab === 'details' && (
        <div className="flex-1 flex flex-col p-6 gap-6 overflow-y-auto">
          {(() => {
            const currentSelectedProduct = products.find(p => p.hex_colour === selectedShade);
            if (currentSelectedProduct) {
              return (
                <div className="bg-white rounded-2xl p-6 border border-primary-100 shadow-sm flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-16 h-16 rounded-full shadow-inner border border-black/10 flex-shrink-0"
                      style={{ backgroundColor: currentSelectedProduct.hex_colour }}
                    />
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{currentSelectedProduct.product_name}</h3>
                      <p className="text-sm text-gray-500 font-mono">{currentSelectedProduct.code_colour}</p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-primary-50">
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Description</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {currentSelectedProduct.product_info || 'No detailed information available for this product.'}
                    </p>
                  </div>
                </div>
              );
            }
            return (
              <div className="bg-primary-50 rounded-2xl p-6 border border-primary-100 flex flex-col items-center justify-center text-center h-full text-gray-500">
                <Info size={40} className="mb-4 text-primary-300" />
                <p className="text-sm">Select a shade from the <strong>All Shades</strong> tab to view detailed product information here.</p>
              </div>
            );
          })()}
        </div>
      )}

      {/* Footer Actions */}
      <div className="mt-auto p-6 bg-gray-50 border-t border-primary-200 flex justify-around shrink-0 relative">
        <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-primary-600 transition-colors">
          <Camera size={20} />
          <span className="text-[10px] uppercase font-bold">Snapshot</span>
        </button>
        {(() => {
          const currentSelectedProduct = products.find(p => p.hex_colour?.toLowerCase() === selectedShade?.toLowerCase());
          
          let savedList: string[] = [];
          if (currentUser?.saved_product) {
            savedList = currentUser.saved_product.split(',').map(s => s.trim()).filter(Boolean);
          }
          const isFav = currentSelectedProduct ? savedList.includes(currentSelectedProduct.product_name) : false;
          
          return (
            <button 
              onClick={async () => {
                if (!currentUser) {
                  alert('Please login to save favorites.');
                  return;
                }
                if (!currentSelectedProduct) {
                  alert('Please select a shade from the list above before saving to favorites!');
                  return;
                }
                
                let newSavedList = [...savedList];
                if (isFav) {
                  newSavedList = newSavedList.filter(name => name !== currentSelectedProduct.product_name);
                } else {
                  newSavedList.push(currentSelectedProduct.product_name);
                }
                
                const newSavedProductStr = newSavedList.join(', ');
                const updatedUser = { ...currentUser, saved_product: newSavedProductStr };
                
                // Optimistic update
                if (setCurrentUser) setCurrentUser(updatedUser);
                
                try {
                  const res = await fetch(`/api/users/${currentUser.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    // ONLY send the field being updated to prevent 422 errors from strict Pydantic validation on extra fields
                    body: JSON.stringify({ saved_product: newSavedProductStr })
                  });
                  if (!res.ok) {
                    throw new Error('Failed to update backend');
                  }
                } catch (err) {
                  console.error("Failed to save favorite", err);
                  alert('Failed to save to database. Please make sure the backend is running and you have restarted it.');
                  // Revert optimistic update
                  if (setCurrentUser) setCurrentUser(currentUser);
                }
              }}
              className={twMerge(
                "flex flex-col items-center gap-1 transition-colors",
                isFav ? "text-rose-500" : "text-gray-500 hover:text-rose-400"
              )}
            >
              <Heart size={20} className={isFav ? "fill-rose-500" : ""} />
              <span className="text-[10px] uppercase font-bold">
                {isFav ? 'Saved' : 'Favorite'}
              </span>
            </button>
          );
        })()}
      </div>
    </div>
  );
}
