import { useEffect, useRef, useState } from 'react';
import { Camera, AlertCircle } from 'lucide-react';

interface CameraOverlayProps {
  selectedShade: string | null;
  intensity: number;
}

export function CameraOverlay({ selectedShade, intensity }: CameraOverlayProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    async function setupCamera() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasPermission(false);
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user',
          },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasPermission(true);
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setHasPermission(false);
      }
    }
    setupCamera();

    return () => {
      // Cleanup stream
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {hasPermission === false && (
        <div className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center text-white p-8 text-center">
          <AlertCircle size={48} className="text-rose-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Camera Access Required</h2>
          <p className="text-gray-400 max-w-md">
            Please allow camera access in your browser settings to use the Virtual Try-On feature.
          </p>
        </div>
      )}

      {hasPermission === null && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black text-white">
          <Camera size={48} className="animate-pulse text-gray-500 mb-4" />
          <p className="tracking-widest text-sm uppercase">Initializing Camera...</p>
        </div>
      )}

      {/* Video Feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover transform -scale-x-100"
      />

      {/* AR Overlay Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover transform -scale-x-100 z-10 pointer-events-none"
      />

      {/* Scanning Overlay Effect */}
      {hasPermission && !selectedShade && (
        <div className="absolute inset-0 pointer-events-none z-20 flex flex-col items-center justify-center">
          <div className="w-[300px] h-[400px] border-2 border-dashed border-white/50 rounded-full relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent animate-scan" />
          </div>
          <p className="mt-8 text-white text-sm tracking-widest font-light bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm">
            Align face to scan skin tone
          </p>
        </div>
      )}
      
      {/* Active Shade Indicator overlay */}
      {selectedShade && (
         <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-20">
             <div className="bg-black/40 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 flex items-center gap-3">
                 <div className="w-4 h-4 rounded-full shadow-inner" style={{ backgroundColor: '#952431', opacity: intensity }} />
                 <span className="text-white text-sm font-medium tracking-wide">Classic Red Applied ({Math.round(intensity * 100)}%)</span>
             </div>
         </div>
      )}
    </div>
  );
}
