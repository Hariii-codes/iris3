import { useState, useEffect, useRef } from 'react';
import { Eye, Loader2, CheckCircle2, XCircle, Video } from 'lucide-react';

interface IrisScannerProps {
  onScanComplete: (irisPattern: string) => void;
  onCancel?: () => void;
}

export function IrisScanner({ onScanComplete, onCancel }: IrisScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: 640, height: 480 }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
          setCameraActive(true);
          setCameraError(null);
        }
      } catch (error) {
        console.error('Camera access error:', error);
        setCameraError('Camera access denied. Please allow camera permissions and try again.');
        setCameraActive(false);
      }
    };

    initCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (scanning) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setStatus('success');
            setTimeout(() => {
              const patterns = ['iris_pattern_123', 'iris_pattern_456', 'iris_pattern_789'];
              const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
              onScanComplete(randomPattern);
            }, 500);
            return 100;
          }
          return prev + 2;
        });
      }, 40);

      return () => clearInterval(interval);
    }
  }, [scanning, onScanComplete]);

  const startScan = () => {
    if (!cameraActive) {
      setStatus('error');
      setCameraError('Camera not ready. Please allow camera access.');
      return;
    }
    setScanning(true);
    setStatus('scanning');
    setProgress(0);
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-8 border border-slate-700">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Iris Authentication</h2>
          <p className="text-slate-400 text-sm">
            {!cameraActive && !cameraError && 'Initializing camera...'}
            {cameraActive && status === 'idle' && 'Position your eye in front of the camera'}
            {status === 'scanning' && 'Scanning your iris...'}
            {status === 'success' && 'Authentication successful!'}
            {cameraError && cameraError}
          </p>
        </div>

        <div className="relative mb-6">
          <div className="aspect-square rounded-xl bg-black border-2 border-blue-500/30 overflow-hidden relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {!cameraActive && !cameraError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-900/20 to-purple-900/20">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-2" />
                  <p className="text-slate-400 text-sm">Starting camera...</p>
                </div>
              </div>
            )}

            {cameraError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-900/20 to-orange-900/20">
                <div className="text-center p-4">
                  <Video className="w-12 h-12 text-red-400 mx-auto mb-2" />
                  <p className="text-red-400 text-sm">Camera not available</p>
                </div>
              </div>
            )}

            {scanning && cameraActive && (
              <>
                <div className="absolute inset-0 border-4 border-blue-500 rounded-xl animate-pulse-border" />
                <div className="absolute inset-0">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-scan"
                      style={{
                        top: `${12.5 * i}%`,
                        animationDelay: `${i * 0.1}s`
                      }}
                    />
                  ))}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-blue-500 rounded-full animate-pulse">
                    <div className="w-full h-full border-2 border-purple-500 rounded-full animate-ping" />
                  </div>
                </div>
              </>
            )}

            {status === 'success' && (
              <div className="absolute inset-0 flex items-center justify-center bg-green-500/20 backdrop-blur-sm">
                <CheckCircle2 className="w-24 h-24 text-green-400 animate-scale-in" />
              </div>
            )}
          </div>

          {scanning && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Scanning...</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          {(status === 'idle' || status === 'error') && (
            <>
              <button
                onClick={startScan}
                disabled={!cameraActive}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-700 disabled:to-slate-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed disabled:shadow-none"
              >
                {cameraActive ? 'Start Scan' : 'Waiting for camera...'}
              </button>
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="px-6 py-3 border border-slate-600 text-slate-300 rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
              )}
            </>
          )}
          {status === 'scanning' && (
            <button
              disabled
              className="flex-1 bg-slate-700 text-slate-400 font-semibold py-3 px-6 rounded-xl cursor-not-allowed"
            >
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            </button>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-slate-700">
          <p className="text-xs text-slate-500 text-center">
            Your biometric data is encrypted and never stored in its raw form
          </p>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0%, 100% { opacity: 0; transform: translateY(-10px); }
          50% { opacity: 1; }
        }
        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
        @keyframes scale-in {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in {
          animation: scale-in 0.5s ease-out;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-out;
        }
        @keyframes pulse-border {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        .animate-pulse-border {
          animation: pulse-border 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
