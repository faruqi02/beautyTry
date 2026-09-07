import { useState, useLayoutEffect } from 'react';
import { CameraOverlay } from './components/CameraOverlay';
import { SidebarControls } from './components/SidebarControls';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { Profile } from './components/Profile';
import { UserCircle2 } from 'lucide-react';

type ViewState = 'login' | 'register' | 'app' | 'profile';

function App() {
  const [selectedShade, setSelectedShade] = useState<string | null>(null);
  const [intensity, setIntensity] = useState<number>(0.8);
  const [currentView, setCurrentView] = useState<ViewState>('login');
  const [isValidScreen, setIsValidScreen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

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

  if (!isValidScreen) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-gray-900 p-8 text-center font-sans">
        <div className="bg-black/50 p-10 rounded-3xl border border-gray-700 max-w-md">
          <h2 className="text-white text-2xl font-bold mb-4 tracking-widest uppercase">Device Not Supported</h2>
          <p className="text-gray-400">
            This website is only for iPad 11th Generation OR iPad Pro (Portrait). 
            Please rotate your device or use a supported screen size.
          </p>
        </div>
      </div>
    );
  }

  // Render Login
  if (currentView === 'login') {
    return <Login onNavigate={setCurrentView} />;
  }

  // Render Register
  if (currentView === 'register') {
    return <Register onNavigate={setCurrentView} />;
  }
  
  // Render Profile
  if (currentView === 'profile') {
    return <Profile onNavigate={setCurrentView} />;
  }

  // Render Main App (Try-On)
  return (
    <div className="relative h-screen w-full bg-background overflow-hidden font-sans">
      {/* Main Camera View Area */}
      <main className="absolute inset-0 bg-black flex items-center justify-center overflow-hidden">
        <CameraOverlay 
          selectedShade={selectedShade} 
          intensity={intensity} 
        />
        
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
          isCollapsed ? 'h-[60px]' : 'h-[500px]'
        }`}
      >
        <SidebarControls 
          selectedShade={selectedShade}
          onSelectShade={setSelectedShade}
          intensity={intensity}
          onIntensityChange={setIntensity}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />
      </aside>
    </div>
  );
}

export default App;
