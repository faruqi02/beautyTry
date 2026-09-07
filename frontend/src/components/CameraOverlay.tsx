import { useEffect, useRef, useState } from 'react';
import { Camera, AlertCircle } from 'lucide-react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

interface CameraOverlayProps {
  selectedShade: string | null;
  intensity: number;
}

// Helper to convert hex to rgba
function hexToRgba(hex: string, alpha: number) {
  if (!hex.startsWith('#')) return hex; // Fallback if it's not hex
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.slice(1, 3), 16);
    g = parseInt(hex.slice(3, 5), 16);
    b = parseInt(hex.slice(5, 7), 16);
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// MediaPipe Lip Indices (Ordered to form closed polygons)
const UPPER_LIP = [
  61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, // Outer top
  308, 415, 310, 311, 312, 13, 82, 81, 80, 191, 78 // Inner bottom (reversed to close)
];

const LOWER_LIP = [
  61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, // Outer bottom
  308, 324, 318, 402, 317, 14, 87, 178, 88, 95, 78   // Inner top (reversed to close)
];

export function CameraOverlay({ selectedShade, intensity }: CameraOverlayProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const animationRef = useRef<number>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize Camera
  useEffect(() => {
    async function setupCamera() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasPermission(false);
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        });
        streamRef.current = stream;
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
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Initialize MediaPipe
  useEffect(() => {
    async function initMediaPipe() {
      try {
        const filesetResolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );
        const faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU"
          },
          outputFaceBlendshapes: false,
          runningMode: "VIDEO",
          numFaces: 1
        });
        faceLandmarkerRef.current = faceLandmarker;
        setIsModelLoaded(true);
      } catch (error) {
        console.error("Error loading MediaPipe model:", error);
      }
    }
    initMediaPipe();
  }, []);

  // Render Loop
  useEffect(() => {
    if (!hasPermission || !isModelLoaded || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastVideoTime = -1;

    function renderLoop() {
      if (video.readyState >= 2 && faceLandmarkerRef.current) {
        // Match canvas size to video size
        if (canvas.width !== video.videoWidth) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        const startTimeMs = performance.now();
        if (lastVideoTime !== video.currentTime) {
          lastVideoTime = video.currentTime;
          const results = faceLandmarkerRef.current.detectForVideo(video, startTimeMs);

          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (results.faceLandmarks && results.faceLandmarks.length > 0) {
            const landmarks = results.faceLandmarks[0];

            if (selectedShade) {
              // Draw Virtual Lipstick
              ctx.save();
              // Apply multiply blend mode for realistic texture blending
              ctx.globalCompositeOperation = 'multiply';
              
              const drawLipPolygon = (indices: number[]) => {
                ctx.beginPath();
                indices.forEach((index, i) => {
                  const pt = landmarks[index];
                  const x = pt.x * canvas.width;
                  const y = pt.y * canvas.height;
                  if (i === 0) ctx.moveTo(x, y);
                  else ctx.lineTo(x, y);
                });
                ctx.closePath();
                ctx.fill();
              };

              // Use the actual selected shade
              ctx.fillStyle = hexToRgba(selectedShade, intensity);
              
              drawLipPolygon(UPPER_LIP);
              drawLipPolygon(LOWER_LIP);

              ctx.restore();
            }
          }
        }
      }
      animationRef.current = requestAnimationFrame(renderLoop);
    }
    
    // Start loop once video starts playing
    const handleLoadedData = () => {
       renderLoop();
    };
    
    video.addEventListener('loadeddata', handleLoadedData);

    // Also try starting immediately in case it's already loaded
    if (video.readyState >= 2) {
        renderLoop();
    }

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [hasPermission, isModelLoaded, selectedShade, intensity]);


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

      {(hasPermission === null || !isModelLoaded) && hasPermission !== false && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black text-white">
          <Camera size={48} className="animate-pulse text-gray-500 mb-4" />
          <p className="tracking-widest text-sm uppercase">
            {!isModelLoaded ? "Loading AI Model..." : "Initializing Camera..."}
          </p>
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
      {hasPermission && isModelLoaded && !selectedShade && (
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
                 <div className="w-4 h-4 rounded-full shadow-inner" style={{ backgroundColor: selectedShade, opacity: intensity }} />
                 <span className="text-white text-sm font-medium tracking-wide">
                     Virtual Shade Applied ({Math.round(intensity * 100)}%)
                 </span>
             </div>
         </div>
      )}
    </div>
  );
}
