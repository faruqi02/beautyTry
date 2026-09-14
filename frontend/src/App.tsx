import React, { useState, useLayoutEffect, useEffect } from 'react';
import { CameraOverlay } from './components/CameraOverlay';
import { SidebarControls } from './components/SidebarControls';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { Profile } from './components/Profile';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminProducts } from './components/AdminProducts';
import { AdminUsers } from './components/AdminUsers';
import { UserCircle2, X } from 'lucide-react';
import type { User } from './types';

type ViewState = 'login' | 'register' | 'app' | 'profile' | 'admin_dashboard' | 'admin_products' | 'admin_users';

function App() {
  const [selectedShade, setSelectedShade] = useState<string | null>(null);
  const [intensity, setIntensity] = useState<number>(0.8);
  const [currentView, setCurrentView] = useState<ViewState>('login');
  const [isValidScreen, setIsValidScreen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [snapshotTrigger, setSnapshotTrigger] = useState(0);
  const [snapshots, setSnapshots] = useState<string[]>([]);

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
          <div className="absolute left-6 top-24 bottom-40 w-28 flex flex-col gap-4 overflow-y-auto z-10 p-2 pointer-events-auto" style={{ scrollbarWidth: 'none' }}>
             {snapshots.map((url, i) => (
               <div key={i} className="relative rounded-xl overflow-hidden border-2 border-white shadow-[0_4px_12px_rgba(0,0,0,0.2)] shrink-0 group bg-black">
                 <img src={url} alt={`Snapshot ${i}`} className="w-full h-auto object-cover" />
                 <button 
                   onClick={() => setSnapshots(prev => prev.filter((_, idx) => idx !== i))}
                   className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-rose-500"
                 >
                    <X size={12} />
                 </button>
               </div>
             ))}
          </div>
        )}

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
