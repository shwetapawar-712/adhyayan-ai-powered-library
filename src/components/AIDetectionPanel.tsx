import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, Play, Square, Users, Shield, AlertCircle, Video, VideoOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMediaPipe, SeatRegion } from '@/hooks/useMediaPipe';

interface Props {
  onDetection: (seatId: string, isOccupied: boolean) => void;
}

const AIDetectionPanel = ({ onDetection }: Props) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const {
    isInitialized,
    isDetecting,
    error,
    seatRegions,
    personCount,
    startCamera,
    stopCamera,
    startDetection,
    stopDetection,
  } = useMediaPipe();

  const handleSeatUpdate = useCallback((seatId: string, isOccupied: boolean) => {
    onDetection(seatId, isOccupied);
    setLastUpdate(`${seatId}: ${isOccupied ? 'Person detected' : 'Seat cleared'}`);
  }, [onDetection]);

  const handleStartCamera = async () => {
    if (videoRef.current && canvasRef.current) {
      const success = await startCamera(videoRef.current, canvasRef.current);
      if (success) {
        setIsCameraActive(true);
      }
    }
  };

  const handleStopCamera = () => {
    stopCamera();
    setIsCameraActive(false);
    setLastUpdate(null);
  };

  const handleToggleDetection = () => {
    if (isDetecting) {
      stopDetection();
    } else {
      startDetection(handleSeatUpdate);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const occupiedCount = seatRegions.filter(s => s.occupied).length;
  const availableCount = seatRegions.length - occupiedCount;

  return (
    <div className="glass-card p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Camera className="w-5 h-5 text-accent" />
        <h3 className="font-display text-lg font-bold">AI Detection Panel</h3>
        <span className="ml-auto px-2 py-1 text-xs bg-accent/20 text-accent rounded-full flex items-center gap-1">
          <Shield className="w-3 h-3" />
          Librarian Only
        </span>
      </div>

      {/* Live indicator */}
      {isDetecting && (
        <div className="flex items-center gap-2 mb-4 p-2 rounded-lg bg-destructive/10 border border-destructive/30">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
          </span>
          <span className="text-sm font-medium text-destructive">LIVE</span>
          <span className="ml-auto text-sm text-muted-foreground flex items-center gap-1">
            <Users className="w-4 h-4" />
            {personCount} person{personCount !== 1 ? 's' : ''} detected
          </span>
        </div>
      )}

      {/* Detection Preview / Camera View */}
      <div className="relative aspect-video bg-muted/30 rounded-lg mb-4 overflow-hidden border border-border/50">
        {/* Hidden video element for camera feed */}
        <video 
          ref={videoRef} 
          className="absolute inset-0 w-full h-full object-cover hidden"
          playsInline 
          muted 
        />
        
        {/* Canvas for drawing detection overlay */}
        <canvas 
          ref={canvasRef} 
          className={`absolute inset-0 w-full h-full object-cover ${isCameraActive ? '' : 'hidden'}`}
        />
        
        {/* Placeholder when camera is off */}
        {!isCameraActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            <VideoOff className="w-12 h-12 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Camera inactive. Click "Start Camera" to begin.
            </p>
          </div>
        )}

        {/* Scanning overlay */}
        {isDetecting && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 scan-line opacity-30" />
          </div>
        )}
      </div>

      {/* Seat Status Grid */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {seatRegions.map((seat: SeatRegion) => (
          <div 
            key={seat.id}
            className={`p-3 rounded-lg border-2 text-center transition-all ${
              seat.occupied 
                ? 'border-destructive bg-destructive/20 text-destructive' 
                : 'border-success bg-success/20 text-success'
            }`}
          >
            <div className="font-display font-bold text-lg">{seat.id}</div>
            <div className="text-xs opacity-80">
              {seat.occupied ? 'OCCUPIED' : 'AVAILABLE'}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 rounded-lg bg-success/10 border border-success/30 text-center">
          <div className="text-2xl font-bold text-success">{availableCount}</div>
          <div className="text-xs text-success/80">Available</div>
        </div>
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-center">
          <div className="text-2xl font-bold text-destructive">{occupiedCount}</div>
          <div className="text-xs text-destructive/80">Occupied</div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm mb-4">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        </div>
      )}

      {/* Last Update */}
      {lastUpdate && !error && (
        <div className="p-3 rounded-lg bg-accent/10 border border-accent/30 text-sm mb-4">
          <div className="flex items-center gap-2 text-accent">
            <AlertCircle className="w-4 h-4" />
            {lastUpdate}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {!isCameraActive ? (
          <Button
            onClick={handleStartCamera}
            className="col-span-2 bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            <Video className="w-4 h-4 mr-2" />
            Start Camera
          </Button>
        ) : (
          <>
            <Button
              onClick={handleToggleDetection}
              disabled={!isInitialized}
              className={isDetecting 
                ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground" 
                : "bg-accent hover:bg-accent/90 text-accent-foreground"
              }
            >
              {isDetecting ? (
                <><Square className="w-4 h-4 mr-2" /> Stop Detection</>
              ) : (
                <><Play className="w-4 h-4 mr-2" /> Start Detection</>
              )}
            </Button>
            <Button variant="outline" onClick={handleStopCamera}>
              <VideoOff className="w-4 h-4 mr-2" />
              Stop Camera
            </Button>
          </>
        )}
      </div>

      {/* Privacy Notice */}
      <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
        <p className="text-xs text-muted-foreground text-center leading-relaxed">
          🔒 <strong>Privacy First:</strong> No face recognition. No images or videos stored. 
          All AI runs locally in your browser. Only anonymous occupancy data is used.
        </p>
      </div>
    </div>
  );
};

export default AIDetectionPanel;
