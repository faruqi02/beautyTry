import { useState } from 'react';
import { Camera, Heart, Info, SlidersHorizontal, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

interface SidebarControlsProps {
  selectedShade: string | null;
  onSelectShade: (shade: string | null) => void;
  intensity: number;
  onIntensityChange: (intensity: number) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

// Mock Data
const skinTones = ['Fair', 'Light Medium', 'Neutral Medium', 'Tan', 'Deep'];
const shades = [
  { id: 's01', name: 'Peach Nude', hex: '#d99484', match: 88, category: 'Fair' },
  { id: 's02', name: 'Rosey Pink', hex: '#c86f7b', match: 90, category: 'Light Medium' },
  { id: 's03', name: 'Mauve Blush', hex: '#9d5d67', match: 92, category: 'Neutral Medium' },
  { id: 's04', name: 'Classic Red', hex: '#952431', match: 96, category: 'Tan', recommended: true },
  { id: 's05', name: 'Brick Brown', hex: '#72342c', match: 85, category: 'Deep' },
];

export function SidebarControls({
  selectedShade,
  onSelectShade,
  intensity,
  onIntensityChange,
  isCollapsed = false,
  onToggleCollapse,
}: SidebarControlsProps) {
  const [activeTab, setActiveTab] = useState<'shades' | 'details'>('shades');
  const [selectedSkinTone, setSelectedSkinTone] = useState('Tan');

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
            <h3 className="text-xs uppercase tracking-widest text-primary-600 font-semibold flex items-center gap-2">
              <SlidersHorizontal size={14} /> Detect or Select Tone
            </h3>
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
          </div>

          {/* Best Match Highlight */}
          {shades.find(s => s.recommended) && (
            <div className="bg-primary-50 rounded-2xl p-5 border border-primary-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary-800 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-bl-xl">
                Best Match
              </div>
              <h3 className="text-sm font-bold text-gray-800 mb-3">Your Best Match</h3>
              {(() => {
                const best = shades.find(s => s.recommended)!;
                return (
                  <div 
                    className={clsx(
                      "flex items-center gap-4 cursor-pointer p-2 rounded-xl transition-all",
                      selectedShade === best.hex ? "bg-white shadow-md ring-1 ring-primary-300" : "hover:bg-white/60"
                    )}
                    onClick={() => onSelectShade(best.hex)}
                  >
                    <div 
                      className="w-12 h-12 rounded-full shadow-inner border border-black/10 flex-shrink-0"
                      style={{ backgroundColor: best.hex }}
                    />
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{best.name}</p>
                      <p className="text-xs text-gray-500">{best.id} • Match: {best.match}%</p>
                    </div>
                  </div>
                )
              })()}
            </div>
          )}

          {/* All Recommendations */}
          <div className="space-y-4 flex-1">
            <h3 className="text-xs uppercase tracking-widest text-primary-600 font-semibold">
              Other Recommendations
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {shades.filter(s => !s.recommended).map((shade) => (
                <div 
                  key={shade.id}
                  className={twMerge(
                    "flex items-center gap-4 p-3 rounded-xl cursor-pointer border transition-all",
                    selectedShade === shade.hex 
                      ? "border-primary-500 bg-primary-50 shadow-sm" 
                      : "border-transparent hover:border-primary-200 hover:bg-gray-50"
                  )}
                  onClick={() => onSelectShade(shade.hex)}
                >
                  <div 
                    className="w-10 h-10 rounded-full shadow-inner border border-black/10 flex-shrink-0"
                    style={{ backgroundColor: shade.hex }}
                  />
                  <div className="flex-1 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{shade.name}</p>
                      <p className="text-xs text-gray-500">{shade.id}</p>
                    </div>
                    <span className="text-xs font-medium text-primary-600 bg-primary-100 px-2 py-1 rounded-md">
                      {shade.match}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

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

      {/* Footer Actions */}
      <div className="p-6 bg-gray-50 border-t border-primary-200 flex justify-around">
        <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-primary-600 transition-colors">
          <Camera size={20} />
          <span className="text-[10px] uppercase font-bold">Snapshot</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-rose-500 transition-colors">
          <Heart size={20} />
          <span className="text-[10px] uppercase font-bold">Favorite</span>
        </button>
      </div>
    </div>
  );
}
