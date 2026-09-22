import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Check, X, ZoomIn, ZoomOut } from 'lucide-react';

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (base64: string) => void;
  onCancel: () => void;
}

export const ImageCropper: React.FC<ImageCropperProps> = ({ imageSrc, onCropComplete, onCancel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      imageRef.current = img;
      
      // Initial scale to fit the canvas width
      if (containerRef.current) {
        const size = containerRef.current.offsetWidth;
        const initialScale = Math.max(size / img.width, size / img.height);
        setScale(initialScale);
        
        // Center the image
        setPosition({
          x: (size - img.width * initialScale) / 2,
          y: (size - img.height * initialScale) / 2
        });
        
        drawCanvas(img, initialScale, { x: (size - img.width * initialScale) / 2, y: (size - img.height * initialScale) / 2 });
      }
    };
  }, [imageSrc]);

  const drawCanvas = (img: HTMLImageElement, currentScale: number, currentPos: { x: number, y: number }) => {
    if (!canvasRef.current || !containerRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const size = containerRef.current.offsetWidth;
    canvas.width = size;
    canvas.height = size;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.drawImage(
      img,
      0, 0, img.width, img.height,
      currentPos.x, currentPos.y, img.width * currentScale, img.height * currentScale
    );
    
    // Draw the mask (darkened area with a clear circle)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2, true);
    ctx.fill('evenodd');
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    setDragStart({ x: clientX - position.x, y: clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !imageRef.current || !containerRef.current) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    
    const newPos = {
      x: clientX - dragStart.x,
      y: clientY - dragStart.y
    };
    
    setPosition(newPos);
    drawCanvas(imageRef.current, scale, newPos);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoom = (delta: number) => {
    if (!imageRef.current || !containerRef.current) return;
    const newScale = Math.max(0.1, scale + delta);
    setScale(newScale);
    
    // Adjust position to zoom from center
    const size = containerRef.current.offsetWidth;
    const cx = size / 2;
    const cy = size / 2;
    
    const newPos = {
      x: cx - (cx - position.x) * (newScale / scale),
      y: cy - (cy - position.y) * (newScale / scale)
    };
    
    setPosition(newPos);
    drawCanvas(imageRef.current, newScale, newPos);
  };

  const handleSave = () => {
    if (!imageRef.current || !containerRef.current) return;
    
    // Create a temporary canvas just for the cropped area
    const tempCanvas = document.createElement('canvas');
    const size = containerRef.current.offsetWidth;
    tempCanvas.width = size;
    tempCanvas.height = size;
    
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    
    ctx.drawImage(
      imageRef.current,
      0, 0, imageRef.current.width, imageRef.current.height,
      position.x, position.y, imageRef.current.width * scale, imageRef.current.height * scale
    );
    
    // For smaller database storage, resize it down to 256x256
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = 256;
    outputCanvas.height = 256;
    const outCtx = outputCanvas.getContext('2d');
    if (outCtx) {
        outCtx.drawImage(tempCanvas, 0, 0, 256, 256);
        const base64 = outputCanvas.toDataURL('image/jpeg', 0.8);
        onCropComplete(base64);
    }
  };

  return (
    <div className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="flex justify-between items-center w-full mb-4">
        <h3 className="font-semibold text-slate-800">Crop Profile Photo</h3>
        <Button variant="ghost" size="icon" onClick={onCancel} className="h-8 w-8 text-slate-500 hover:bg-slate-100 rounded-full">
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      <div 
        ref={containerRef}
        className="relative w-full max-w-[280px] aspect-square overflow-hidden rounded-lg bg-slate-100 cursor-move border border-slate-200"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
      </div>

      <div className="flex items-center gap-4 mt-6 w-full max-w-[280px]">
        <Button variant="outline" size="icon" onClick={() => handleZoom(-0.1)} className="shrink-0 h-8 w-8 rounded-full border-slate-200 text-slate-600">
          <ZoomOut className="w-4 h-4" />
        </Button>
        <div className="flex-1 text-center text-xs font-medium text-slate-500">
          {Math.round(scale * 100)}%
        </div>
        <Button variant="outline" size="icon" onClick={() => handleZoom(0.1)} className="shrink-0 h-8 w-8 rounded-full border-slate-200 text-slate-600">
          <ZoomIn className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex justify-end gap-3 mt-6 w-full">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button onClick={handleSave} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white">
          <Check className="w-4 h-4 mr-2" /> Apply
        </Button>
      </div>
    </div>
  );
};
