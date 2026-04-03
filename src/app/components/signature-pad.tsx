import React, { useRef, useState, useEffect } from 'react';
import { Button } from './button';
import { RefreshCcw } from 'lucide-react';

interface SignaturePadProps {
  onSave: (dataUrl: string) => void;
  onCancel: () => void;
}

export function SignaturePad({ onSave, onCancel }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      // Setup high resolution canvas
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Set actual size
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * 2;
        canvas.height = rect.height * 2;
        ctx.scale(2, 2);
        
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#000000';
      }
    }
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    return {
      x: (e as React.MouseEvent).clientX - rect.left,
      y: (e as React.MouseEvent).clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      setIsDrawing(true);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (isDrawing) {
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        ctx.closePath();
      }
      setIsDrawing(false);
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      onSave(dataUrl);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col pt-12 animate-in fade-in zoom-in-95 duration-200">
      <div className="px-6 flex-1 flex flex-col">
        <h2 className="text-2xl font-medium mb-2">Sua Assinatura</h2>
        <p className="text-muted-foreground text-sm mb-6">
          Desenhe sua assinatura no espaço abaixo usando o dedo ou mouse.
        </p>

        <div className="flex-1 bg-white rounded-2xl border-2 border-dashed border-border flex items-center justify-center relative touch-none mb-6">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full cursor-crosshair rounded-2xl"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
          <div className="absolute bottom-4 right-4 flex gap-2">
            <button
              onClick={handleClear}
              className="flex items-center gap-2 px-3 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm transition-colors"
            >
              <RefreshCcw className="size-4" />
              Limpar
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 bg-card border-t border-border mt-auto">
        <div className="flex gap-3">
          <Button onClick={onCancel} variant="secondary" className="flex-1">
            Cancelar
          </Button>
          <Button onClick={handleSave} className="flex-1">
            Confirmar Assinatura
          </Button>
        </div>
      </div>
    </div>
  );
}
