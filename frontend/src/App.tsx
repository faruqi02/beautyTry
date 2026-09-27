import React, { useState, useLayoutEffect } from 'react';
import { CameraOverlay } from './components/CameraOverlay';
import { SidebarControls } from './components/SidebarControls';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { Profile } from './components/Profile';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminProducts } from './components/AdminProducts';
import { AdminUsers } from './components/AdminUsers';
import { UserCircle2, X, ChevronLeft, ChevronRight, Download, Trash2, Loader2 } from 'lucide-react';
import type { User } from './types';

type ViewState = 'login' | 'register' | 'app' | 'profile' | 'admin_dashboard' | 'admin_products' | 'admin_users';

function SwipeableSnapshot({ url, index, onDismiss, onExpand }: { url: string, index: number, onDismiss: () => void, onExpand: () => void }) {
  const [translateX, setTranslateX] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);
  const [isDismissing, setIsDismissing] = React.useState(false);
  const startXRef = React.useRef(0);
  const currentXRef = React.useRef(0);

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (isDismissing) return;
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    startXRef.current = clientX;
    currentXRef.current = clientX;
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging || isDismissing) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    currentXRef.current = clientX;
    const diff = currentXRef.current - startXRef.current;
    if (diff < 0) { // Only allow swiping to the left
      setTranslateX(diff);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging || isDismissing) return;
    setIsDragging(false);
    
    // If the user didn't really swipe (less than 5px movement), treat it as a click!
    const dragDistance = Math.abs(currentXRef.current - startXRef.current);
    if (dragDistance < 5) {
      onExpand();
      setTranslateX(0);
      return;
    }

    if (translateX < -20) { // Very sensitive swipe threshold
      setIsDismissing(true);
      setTimeout(() => onDismiss(), 300); // Wait for animation to finish
    } else {
      setTranslateX(0); // Snap back if not swiped far enough
    }
  };

  const handleCloseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDismissing(true);
    setTranslateX(-100);
    setTimeout(() => onDismiss(), 300);
  };

  return (
    <div 
      className={`relative rounded-xl overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.2)] shrink-0 group bg-black cursor-grab active:cursor-grabbing touch-pan-y
        ${isDragging ? '' : 'transition-all duration-300 ease-out'}
        ${isDismissing ? 'max-h-0 opacity-0 mb-0 border-0 scale-95' : 'max-h-[300px] opacity-100 mb-4 border-2 border-white scale-100'}
      `}
      style={{ 
        transform: isDismissing ? `translateX(-120px)` : `translateX(${translateX}px)`, 
        opacity: isDismissing ? 0 : 1 + (translateX / 60) 
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseMove={handleTouchMove}
      onMouseUp={handleTouchEnd}
      onMouseLeave={() => { if (isDragging) handleTouchEnd() }}
    >
      <img src={url} alt={`Snapshot ${index}`} className="w-full h-auto object-cover pointer-events-none select-none" draggable={false} />
      <button 
        onClick={handleCloseClick}
        className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-rose-500 z-10"
      >
         <X size={12} />
      </button>
    </div>
  );
}

function App() {
  const [selectedShade, setSelectedShade] = useState<string | null>(null);
  const [intensity, setIntensity] = useState<number>(0.8);
  const [currentView, setCurrentView] = useState<ViewState>(() => {
    try {
      const saved = localStorage.getItem('currentUser');
      if (saved) {
        const user = JSON.parse(saved) as User;
        return user.role === 'admin' ? 'admin_dashboard' : 'app';
      }
    } catch(e) {}
    return 'login';
  });
  const [isValidScreen, setIsValidScreen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('currentUser');
      return saved ? JSON.parse(saved) : null;
    } catch(e) { return null; }
  });
  const [snapshotTrigger, setSnapshotTrigger] = useState(0);
  const [snapshots, setSnapshots] = useState<string[]>([]);
  const [expandedSnapshot, setExpandedSnapshot] = useState<string | null>(null);
  const [snapshotToDelete, setSnapshotToDelete] = useState<string | null>(null);
  const [isDeletingSnapshot, setIsDeletingSnapshot] = useState(false);

  React.useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  React.useEffect(() => {
    if (currentView === 'app') {
      const pendingShade = window.localStorage.getItem('pending_apply_shade');
      if (pendingShade) {
        setSelectedShade(pendingShade);
        window.localStorage.removeItem('pending_apply_shade');
      }
    }
  }, [currentView]);

  // iPad Pro dimensions check
  useLayoutEffect(() => {
    const checkScreen = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Strict constraint: Must be portrait (width < height) 
      // AND large enough to be a tablet/iPad (width >= 800)
      if (width > height || width < 800) {
        setIsValidScreen(false);
      } else {
        setIsValidScreen(true);
      }
    };
    
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  // Render Login
  if (currentView === 'login') {
    return <Login onNavigate={setCurrentView} onLogin={setCurrentUser} />;
  }

  // Render Register
  if (currentView === 'register') {
    return <Register onNavigate={setCurrentView} onRegister={setCurrentUser} />;
  }
  
  // Render Profile
  if (currentView === 'profile' && currentUser) {
    return <Profile onNavigate={setCurrentView} user={currentUser} onLogout={() => setCurrentUser(null)} onUpdateUser={setCurrentUser} />;
  }

  // Render Admin Routes
  if (currentView === 'admin_dashboard') {
    return <AdminDashboard onNavigate={setCurrentView} user={currentUser} />;
  }
  if (currentView === 'admin_products') {
    return <AdminProducts onNavigate={setCurrentView} user={currentUser} />;
  }
  if (currentView === 'admin_users') {
    return <AdminUsers onNavigate={setCurrentView} user={currentUser} />;
  }

  // Render Main App (Try-On)
  // Only restrict the Try-On feature to the iPad screen size!
  if (!isValidScreen) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-gray-900 p-8 text-center font-sans">
        <div className="bg-black/50 p-10 rounded-3xl border border-gray-700 max-w-md">
          <h2 className="text-white text-2xl font-bold mb-4 tracking-widest uppercase">Device Not Supported</h2>
          <p className="text-gray-400">
            The Try-On feature is only for iPad 11th Generation OR iPad Pro (Portrait). 
            Please rotate your device or use a supported screen size.
          </p>
          <button 
            onClick={() => setCurrentView('login')}
            className="mt-6 px-6 py-2 bg-primary-800 text-white rounded-xl font-medium hover:bg-primary-900 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full bg-background overflow-hidden font-sans">
      {/* Main Camera View Area */}
      <main className="absolute inset-0 bg-black flex items-center justify-center overflow-hidden">
        <CameraOverlay 
          selectedShade={selectedShade} 
          intensity={intensity} 
          snapshotTrigger={snapshotTrigger}
          currentUser={currentUser}
          onSnapshotCaptured={(url) => setSnapshots(prev => [url, ...prev])}
        />
        
        {/* Floating Snapshots Gallery */}
        {snapshots.length > 0 && (
          <div className="absolute left-6 top-24 bottom-40 w-28 flex flex-col overflow-y-auto z-10 p-2 pointer-events-auto" style={{ scrollbarWidth: 'none' }}>
             {snapshots.map((url, i) => (
               <SwipeableSnapshot 
                 key={url} 
                 url={url} 
                 index={i} 
                 onDismiss={() => setSnapshots(prev => prev.filter(u => u !== url))} 
                 onExpand={() => setExpandedSnapshot(url)}
               />
             ))}
          </div>
        )}

        {/* Fullscreen Expanded Image Overlay */}
        {expandedSnapshot && (() => {
          const currentIdx = snapshots.indexOf(expandedSnapshot);
          return (
            <div className="absolute inset-0 z-[110] flex flex-col bg-black pointer-events-auto">
              {/* Header */}
              <div className="flex justify-between items-center p-4">
                <button onClick={() => setExpandedSnapshot(null)} className="p-2 bg-gray-800 hover:bg-gray-700 transition-colors text-white rounded-full">
                  <X size={24} />
                </button>
                <button onClick={() => setSnapshotToDelete(expandedSnapshot)} className="py-2 px-4 bg-rose-600 hover:bg-rose-700 transition-colors text-white rounded-full flex gap-2 items-center shadow-lg shadow-rose-600/30">
                  <Trash2 size={16} /> <span className="font-bold text-sm uppercase tracking-wide">Delete</span>
                </button>
              </div>
              
              {/* Image */}
              <div className="flex-1 relative flex items-center justify-center overflow-hidden p-4">
                {currentIdx > 0 && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setExpandedSnapshot(snapshots[currentIdx - 1]); }}
                    className="absolute left-4 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full z-10 transition-colors backdrop-blur-sm shadow-xl"
                  >
                    <ChevronLeft size={32} />
                  </button>
                )}
                
                <img src={expandedSnapshot} className="max-w-full max-h-full object-contain rounded-2xl animate-in zoom-in duration-200" alt="Preview" />
                
                {currentIdx !== -1 && currentIdx < snapshots.length - 1 && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setExpandedSnapshot(snapshots[currentIdx + 1]); }}
                    className="absolute right-4 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full z-10 transition-colors backdrop-blur-sm shadow-xl"
                  >
                    <ChevronRight size={32} />
                  </button>
                )}
              </div>
              
              {/* Footer Save */}
              <div className="p-6 pb-8 bg-gradient-to-t from-black/80 to-transparent">
                 <button onClick={async () => {
                      try {
                        const res = await fetch(expandedSnapshot);
                        const blob = await res.blob();
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.style.display = 'none';
                        a.href = url;
                        a.download = `snapshot_${Date.now()}.jpg`;
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                      } catch (err) {
                        alert("Failed to download image. You can also try long-pressing the image to save.");
                      }
                 }} className="w-full py-4 bg-white hover:bg-gray-100 transition-colors text-black rounded-2xl font-bold flex items-center justify-center gap-2 uppercase tracking-wide text-sm shadow-xl">
                     <Download size={20} /> Save to Device
                 </button>
              </div>
            </div>
          );
        })()}

        {/* Top Header overlay */}
        <header className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-10 bg-gradient-to-b from-black/50 to-transparent pointer-events-none">
          <h1 className="text-white text-2xl font-light tracking-widest uppercase shadow-black drop-shadow-md">BeautyTry</h1>
          <button 
            onClick={() => setCurrentView('profile')}
            className="p-3 bg-black/30 backdrop-blur-md rounded-full text-white hover:bg-black/50 transition-colors border border-white/10 pointer-events-auto"
          >
            <UserCircle2 size={24} />
          </button>
        </header>
      </main>

      {/* Custom Delete Snapshot Modal */}
      {snapshotToDelete && (
        <div className="fixed inset-0 bg-black/60 z-[120] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-6">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Snapshot</h3>
            <p className="text-gray-500 mb-8">Are you sure you want to remove this snapshot from your session?</p>
            <div className="flex w-full gap-4">
              <button
                disabled={isDeletingSnapshot}
                onClick={() => setSnapshotToDelete(null)}
                className="flex-1 py-3.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                disabled={isDeletingSnapshot}
                onClick={() => {
                  setIsDeletingSnapshot(true);
                  // Simulate brief network delay for consistency with Profile
                  setTimeout(() => {
                    setSnapshots(prev => prev.filter(url => url !== snapshotToDelete));
                    setSnapshotToDelete(null);
                    setExpandedSnapshot(null);
                    setIsDeletingSnapshot(false);
                  }, 400);
                }}
                className="flex-1 py-3.5 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isDeletingSnapshot ? <Loader2 size={18} className="animate-spin" /> : null}
                {isDeletingSnapshot ? 'Deleting' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Bottom Controls Area */}
      <aside 
        className={`absolute bottom-0 left-0 w-full bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex flex-col z-20 rounded-t-3xl transition-all duration-300 ease-in-out ${
          isCollapsed ? 'h-[144px]' : 'h-[500px]'
        }`}
      >
        <SidebarControls 
          selectedShade={selectedShade}
          onSelectShade={setSelectedShade}
          intensity={intensity}
          onIntensityChange={setIntensity}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
          onTakeSnapshot={() => setSnapshotTrigger(prev => prev + 1)}
        />
      </aside>
    </div>
  );
}

export default App;
