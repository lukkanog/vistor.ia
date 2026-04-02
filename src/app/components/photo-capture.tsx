import { useRef, useState } from 'react';
import { Camera, X, Check, RotateCw, Video } from 'lucide-react';
import { Button } from './button';

interface PhotoCaptureProps {
  onConfirm: (mediaDataUrl: string) => void;
  onCancel: () => void;
}

export function PhotoCapture({ onConfirm, onCancel }: PhotoCaptureProps) {
  const [capturedMedia, setCapturedMedia] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const reader = new FileReader();
    reader.onloadend = () => {
      setCapturedMedia({ url: reader.result as string, type: isVideo ? 'video' : 'image' });
    };
    reader.readAsDataURL(file);
  };

  const handleTakePhoto = () => {
    fileInputRef.current?.click();
  };

  const handleRetake = () => {
    setCapturedMedia(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConfirm = () => {
    if (capturedMedia) {
      onConfirm(capturedMedia.url);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/50 text-white">
        <button
          onClick={onCancel}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="size-6" />
        </button>
        <h3>Capturar Mídia</h3>
        <div className="w-10" />
      </div>

      {/* Media Display */}
      <div className="flex-1 flex items-center justify-center bg-black overflow-hidden relative">
        {capturedMedia ? (
          capturedMedia.type === 'video' ? (
            <video
              src={capturedMedia.url}
              controls
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <img
              src={capturedMedia.url}
              alt="Mídia capturada"
              className="max-w-full max-h-full object-contain"
            />
          )
        ) : (
          <div className="text-center text-white/60">
            <div className="flex justify-center gap-4 mb-4">
              <Camera className="size-16" />
              <Video className="size-16" />
            </div>
            <p>Toque no botão abaixo para capturar foto ou vídeo</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-6 bg-black/50">
        {capturedMedia ? (
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={handleRetake}
              className="flex-1"
              size="lg"
            >
              <RotateCw className="size-5" />
              Refazer
            </Button>
            <Button
              variant="success"
              onClick={handleConfirm}
              className="flex-1"
              size="lg"
            >
              <Check className="size-5" />
              Confirmar
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleTakePhoto}
            className="w-full"
            size="lg"
          >
            <Camera className="size-5" />
            Capturar Foto / Vídeo
          </Button>
        )}
      </div>
    </div>
  );
}
