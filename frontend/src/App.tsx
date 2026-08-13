import { useState } from 'react';
import { CameraOverlay } from './components/CameraOverlay';
import { SidebarControls } from './components/SidebarControls';

function App() {
  const [selectedShade, setSelectedShade] = useState<string | null>(null);
  const [intensity, setIntensity] = useState<number>(0.8);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden font-sans">
      {/* Main Camera View Area */}
      <main className="flex-1 relative bg-black flex items-center justify-center">
        <CameraOverlay 
          selectedShade={selectedShade} 
          intensity={intensity} 
        />
        
        {/* Top Header overlay */}
        <header className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-10 bg-gradient-to-b from-black/50 to-transparent">
          <h1 className="text-white text-2xl font-light tracking-widest uppercase">BeautyTry</h1>
        </header>
      </main>

      {/* Sidebar Controls Area */}
      <aside className="w-[400px] h-full bg-white shadow-2xl flex flex-col z-20">
        <SidebarControls 
          selectedShade={selectedShade}
          onSelectShade={setSelectedShade}
          intensity={intensity}
          onIntensityChange={setIntensity}
        />
      </aside>
    </div>
  );
}

export default App;
