import { useState, useEffect, useRef } from 'react';
import { Mic, Square, Check, X } from 'lucide-react';
import { Button } from './button';

interface VoiceRecorderProps {
  onConfirm: (transcript: string) => void;
  onCancel: () => void;
}

export function VoiceRecorder({ onConfirm, onCancel }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert('Seu navegador não suporta reconhecimento de voz. Use Chrome ou Edge.');
      onCancel();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPart = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcriptPart + ' ';
        } else {
          interim += transcriptPart;
        }
      }

      if (final) {
        setTranscript(prev => prev + final);
      }
      setInterimTranscript(interim);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'no-speech') {
        // User didn't speak, just retry
        return;
      }
      setIsRecording(false);
    };

    recognition.onend = () => {
      if (isRecording) {
        recognition.start(); // Restart if still recording
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isRecording, onCancel]);

  const startRecording = () => {
    setTranscript('');
    setInterimTranscript('');
    setIsRecording(true);
    recognitionRef.current?.start();
  };

  const stopRecording = () => {
    setIsRecording(false);
    recognitionRef.current?.stop();
  };

  const handleConfirm = () => {
    const fullTranscript = transcript + interimTranscript;
    if (fullTranscript.trim()) {
      onConfirm(fullTranscript.trim());
    }
  };

  useEffect(() => {
    startRecording();
  }, []);

  const fullText = transcript + interimTranscript;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="bg-card w-full rounded-t-3xl p-6 pb-8 animate-in slide-in-from-bottom max-h-[80vh] flex flex-col">
        <div className="text-center mb-6">
          <div className={`size-20 mx-auto mb-4 rounded-full flex items-center justify-center transition-all ${
            isRecording ? 'bg-destructive animate-pulse' : 'bg-muted'
          }`}>
            {isRecording ? (
              <Mic className="size-10 text-white" />
            ) : (
              <Square className="size-8 text-muted-foreground" />
            )}
          </div>
          <h3 className="mb-2">
            {isRecording ? 'Escutando...' : 'Gravação pausada'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {isRecording ? 'Descreva o problema encontrado' : 'Toque para continuar'}
          </p>
        </div>

        {/* Transcript Display */}
        <div className="min-h-[120px] max-h-[200px] overflow-y-auto p-4 bg-muted/50 rounded-xl mb-6 flex-shrink">
          {fullText ? (
            <p className="text-foreground">
              {transcript}
              <span className="text-muted-foreground">{interimTranscript}</span>
            </p>
          ) : (
            <p className="text-muted-foreground text-center">
              A transcrição aparecerá aqui...
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={onCancel}
            className="flex-1"
            size="lg"
          >
            <X className="size-5" />
            Cancelar
          </Button>

          {isRecording ? (
            <Button
              variant="destructive"
              onClick={stopRecording}
              className="flex-1"
              size="lg"
            >
              <Square className="size-5" />
              Pausar
            </Button>
          ) : (
            <Button
              onClick={startRecording}
              className="flex-1"
              size="lg"
            >
              <Mic className="size-5" />
              Continuar
            </Button>
          )}

          {fullText.trim() && (
            <Button
              variant="success"
              onClick={handleConfirm}
              className="flex-1"
              size="lg"
            >
              <Check className="size-5" />
              Confirmar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}