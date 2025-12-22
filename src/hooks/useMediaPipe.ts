import { useState, useRef, useCallback, useEffect } from 'react';

// Demo seat regions (normalized coordinates 0-1)
export interface SeatRegion {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  occupied: boolean;
}

export interface DetectedPerson {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
}

const DEMO_SEATS: SeatRegion[] = [
  { id: "A1", x: 0.05, y: 0.1, w: 0.2, h: 0.35, occupied: false },
  { id: "A2", x: 0.28, y: 0.1, w: 0.2, h: 0.35, occupied: false },
  { id: "B1", x: 0.52, y: 0.1, w: 0.2, h: 0.35, occupied: false },
  { id: "B2", x: 0.75, y: 0.1, w: 0.2, h: 0.35, occupied: false },
];

export const useMediaPipe = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seatRegions, setSeatRegions] = useState<SeatRegion[]>(DEMO_SEATS);
  const [detectedPersons, setDetectedPersons] = useState<DetectedPerson[]>([]);
  const [personCount, setPersonCount] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const objectDetectorRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize MediaPipe
  const initializeMediaPipe = useCallback(async () => {
    try {
      setError(null);
      
      // Dynamic import for MediaPipe
      const vision = await import('@mediapipe/tasks-vision');
      const { ObjectDetector, FilesetResolver } = vision;
      
      // Initialize FilesetResolver
      const filesetResolver = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );
      
      // Create ObjectDetector
      objectDetectorRef.current = await ObjectDetector.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite",
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        scoreThreshold: 0.5,
        categoryAllowlist: ["person"] // Only detect persons
      });
      
      setIsInitialized(true);
      console.log("MediaPipe ObjectDetector initialized successfully");
    } catch (err) {
      console.error("Failed to initialize MediaPipe:", err);
      setError("Failed to initialize AI detection. Please try again.");
    }
  }, []);

  // Start camera
  const startCamera = useCallback(async (video: HTMLVideoElement, canvas: HTMLCanvasElement) => {
    try {
      setError(null);
      videoRef.current = video;
      canvasRef.current = canvas;
      
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user"
        }
      });
      
      streamRef.current = stream;
      video.srcObject = stream;
      
      await new Promise<void>((resolve) => {
        video.onloadedmetadata = () => {
          video.play();
          resolve();
        };
      });
      
      // Set canvas dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Initialize MediaPipe if not already done
      if (!isInitialized) {
        await initializeMediaPipe();
      }
      
      return true;
    } catch (err) {
      console.error("Failed to start camera:", err);
      setError("Failed to access camera. Please ensure camera permissions are granted.");
      return false;
    }
  }, [isInitialized, initializeMediaPipe]);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsDetecting(false);
    setDetectedPersons([]);
    setPersonCount(0);
    setSeatRegions(DEMO_SEATS);
  }, []);

  // Check if person center is inside seat region
  const isPersonInSeat = useCallback((person: DetectedPerson, seat: SeatRegion): boolean => {
    const centerX = person.x + person.width / 2;
    const centerY = person.y + person.height / 2;
    
    return (
      centerX >= seat.x &&
      centerX <= seat.x + seat.w &&
      centerY >= seat.y &&
      centerY <= seat.y + seat.h
    );
  }, []);

  // Run detection loop
  const startDetection = useCallback((onSeatUpdate: (seatId: string, isOccupied: boolean) => void) => {
    if (!objectDetectorRef.current || !videoRef.current || !canvasRef.current) {
      setError("Detection not ready. Please start camera first.");
      return;
    }
    
    setIsDetecting(true);
    
    const detectFrame = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const detector = objectDetectorRef.current;
      
      if (!video || !canvas || !detector || video.readyState !== 4) {
        animationFrameRef.current = requestAnimationFrame(detectFrame);
        return;
      }
      
      try {
        // Run detection
        const startTimeMs = performance.now();
        const detections = detector.detectForVideo(video, startTimeMs);
        
        // Process detections - only persons
        const persons: DetectedPerson[] = [];
        
        if (detections.detections) {
          for (const detection of detections.detections) {
            const bbox = detection.boundingBox;
            if (bbox) {
              // Normalize coordinates to 0-1
              persons.push({
                x: bbox.originX / video.videoWidth,
                y: bbox.originY / video.videoHeight,
                width: bbox.width / video.videoWidth,
                height: bbox.height / video.videoHeight,
                confidence: detection.categories?.[0]?.score || 0
              });
            }
          }
        }
        
        setDetectedPersons(persons);
        setPersonCount(persons.length);
        
        // Update seat occupancy
        const updatedSeats = seatRegions.map(seat => {
          const isOccupied = persons.some(person => isPersonInSeat(person, seat));
          
          // Only trigger callback if status changed
          if (isOccupied !== seat.occupied) {
            onSeatUpdate(seat.id, isOccupied);
          }
          
          return { ...seat, occupied: isOccupied };
        });
        
        setSeatRegions(updatedSeats);
        
        // Draw on canvas
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Draw video frame (mirrored)
          ctx.save();
          ctx.scale(-1, 1);
          ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
          ctx.restore();
          
          // Draw seat regions
          updatedSeats.forEach(seat => {
            const x = (1 - seat.x - seat.w) * canvas.width; // Mirror X
            const y = seat.y * canvas.height;
            const w = seat.w * canvas.width;
            const h = seat.h * canvas.height;
            
            ctx.strokeStyle = seat.occupied ? '#ef4444' : '#22c55e';
            ctx.lineWidth = 3;
            ctx.setLineDash([]);
            ctx.strokeRect(x, y, w, h);
            
            // Fill with semi-transparent color
            ctx.fillStyle = seat.occupied ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)';
            ctx.fillRect(x, y, w, h);
            
            // Draw seat label
            ctx.fillStyle = seat.occupied ? '#ef4444' : '#22c55e';
            ctx.font = 'bold 18px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(seat.id, x + w / 2, y + 25);
            
            // Draw status
            ctx.font = '12px Inter, sans-serif';
            ctx.fillText(seat.occupied ? 'OCCUPIED' : 'AVAILABLE', x + w / 2, y + h - 10);
          });
          
          // Draw person bounding boxes
          persons.forEach(person => {
            const x = (1 - person.x - person.width) * canvas.width; // Mirror X
            const y = person.y * canvas.height;
            const w = person.width * canvas.width;
            const h = person.height * canvas.height;
            
            ctx.strokeStyle = 'rgba(20, 184, 166, 0.8)';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.strokeRect(x, y, w, h);
            
            // Draw confidence
            ctx.fillStyle = 'rgba(20, 184, 166, 0.9)';
            ctx.font = '10px Inter, sans-serif';
            ctx.setLineDash([]);
            ctx.fillText(`${Math.round(person.confidence * 100)}%`, x + 5, y - 5);
          });
        }
      } catch (err) {
        console.error("Detection error:", err);
      }
      
      animationFrameRef.current = requestAnimationFrame(detectFrame);
    };
    
    detectFrame();
  }, [seatRegions, isPersonInSeat]);

  // Stop detection
  const stopDetection = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setIsDetecting(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    isInitialized,
    isDetecting,
    error,
    seatRegions,
    detectedPersons,
    personCount,
    startCamera,
    stopCamera,
    startDetection,
    stopDetection,
  };
};
