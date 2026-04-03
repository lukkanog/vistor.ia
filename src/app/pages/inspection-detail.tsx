import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Camera,
  Mic,
  CheckCircle2,
  Trash2,
  Edit3,
  MapPin,
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Button } from '../components/button';
import { VoiceRecorder } from '../components/voice-recorder';
import { PhotoCapture } from '../components/photo-capture';
import { AIVisionModal } from '../components/ai-vision-modal';
import { ComparisonReviewModal } from '../components/comparison-review-modal';
import { Inspection, InspectionItem, ComparisonStatus } from '../types';
import { InspectionStorage } from '../storage';

export function InspectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showPhotoCapture, setShowPhotoCapture] = useState(false);
  const [aiVisionMediaUrl, setAiVisionMediaUrl] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [showComparisonReview, setShowComparisonReview] = useState(false);
  const [mapVerified, setMapVerified] = useState(false);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    if (id) {
      const data = InspectionStorage.getById(id);
      if (data) {
        setInspection(data);
        verifyAddress(data.propertyAddress);
      } else {
        navigate('/');
      }
    }
  }, [id, navigate]);

  const verifyAddress = async (address: string) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`);
      const results = await response.json();
      if (results && results.length > 0) {
        setMapVerified(true);
      }
    } catch (e) {
      console.error("Geocoding check failed", e);
    }
  };

  if (!inspection) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="size-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
            <div className="size-8 rounded-full bg-primary/20" />
          </div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  const currentRoom = inspection.rooms[inspection.currentRoomIndex];
  const isLastRoom = inspection.currentRoomIndex === inspection.rooms.length - 1;
  const isFirstRoom = inspection.currentRoomIndex === 0;

  const handleAddItem = (description: string) => {
    const newItem: InspectionItem = {
      id: Date.now().toString(),
      description,
      createdAt: new Date(),
      comparisonStatus: inspection.linkedEntryId ? 'novo_dano' as ComparisonStatus : undefined,
    };

    const updatedInspection = { ...inspection };
    updatedInspection.rooms[inspection.currentRoomIndex].items.push(newItem);

    InspectionStorage.save(updatedInspection);
    setInspection(updatedInspection);
    setShowVoiceRecorder(false);
  };

  const handlePhotoCaptureConfirm = (mediaDataUrl: string) => {
    setShowPhotoCapture(false);
    setAiVisionMediaUrl(mediaDataUrl);
  };

  const handleAiVisionComplete = (acceptedIssues: string[]) => {
    if (!aiVisionMediaUrl) return;

    const updatedInspection = { ...inspection };

    // Add photo/video
    updatedInspection.rooms[inspection.currentRoomIndex].photos.push(aiVisionMediaUrl);

    // Add accepted issues
    acceptedIssues.forEach((desc, index) => {
      updatedInspection.rooms[inspection.currentRoomIndex].items.push({
        id: Date.now().toString() + index.toString(),
        description: desc,
        createdAt: new Date(),
        comparisonStatus: inspection.linkedEntryId ? 'novo_dano' as ComparisonStatus : undefined,
      });
    });

    InspectionStorage.save(updatedInspection);
    setInspection(updatedInspection);
    setAiVisionMediaUrl(null);
  };

  const handleDeleteItem = (itemId: string) => {
    if (!confirm('Deseja realmente excluir este item?')) return;

    const updatedInspection = { ...inspection };
    updatedInspection.rooms[inspection.currentRoomIndex].items =
      currentRoom.items.filter(item => item.id !== itemId);

    InspectionStorage.save(updatedInspection);
    setInspection(updatedInspection);
  };

  const handleEditItem = (itemId: string, newDescription: string) => {
    const updatedInspection = { ...inspection };
    const item = updatedInspection.rooms[inspection.currentRoomIndex].items.find(
      i => i.id === itemId
    );

    if (item) {
      item.description = newDescription;
      if (item.originalDescription) {
        if (newDescription !== item.originalDescription) {
          item.comparisonStatus = 'modificado';
        } else {
          item.comparisonStatus = 'sem_alteracao';
        }
      }
      InspectionStorage.save(updatedInspection);
      setInspection(updatedInspection);
    }

    setEditingItem(null);
    setEditText('');
  };

  const handleDeletePhoto = (photoIndex: number) => {
    if (!confirm('Deseja realmente excluir esta mídia?')) return;

    const updatedInspection = { ...inspection };
    updatedInspection.rooms[inspection.currentRoomIndex].photos.splice(photoIndex, 1);

    InspectionStorage.save(updatedInspection);
    setInspection(updatedInspection);
  };

  const handlePreviousRoom = () => {
    if (!isFirstRoom) {
      const updatedInspection = { ...inspection };
      updatedInspection.currentRoomIndex--;
      InspectionStorage.save(updatedInspection);
      setInspection(updatedInspection);
    }
  };

  const handleNextRoom = () => {
    if (!isLastRoom) {
      const updatedInspection = { ...inspection };
      updatedInspection.currentRoomIndex++;
      InspectionStorage.save(updatedInspection);
      setInspection(updatedInspection);
    }
  };

  const handleFinishInspection = () => {
    if (inspection.type === 'saida' && inspection.linkedEntryId) {
      setShowComparisonReview(true);
      return;
    }

    if (!confirm('Deseja finalizar a vistoria? Você ainda poderá visualizá-la depois.')) return;
    performFinalSave();
  };

  const performFinalSave = () => {
    const updatedInspection = { ...inspection };
    updatedInspection.status = 'concluida';
    updatedInspection.completedAt = new Date();

    InspectionStorage.save(updatedInspection);
    navigate(`/vistoria/${inspection.id}/concluida`);
  };

  // Get room icon
  const iconName = currentRoom.icon.split('-').map((word, i) =>
    i === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word.charAt(0).toUpperCase() + word.slice(1)
  ).join('');
  const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.Home;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-primary text-primary-foreground px-6 pt-12 pb-6">
        <div className="flex justify-between items-start mb-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 -ml-2 p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="size-5" />
            <span>Voltar</span>
          </button>

          {mapVerified && (
            <button
              onClick={() => setShowMap(!showMap)}
              className="flex items-center gap-1.5 p-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
            >
              <MapPin className="size-4" />
              {showMap ? 'Ocultar Mapa' : 'Ver Mapa'}
            </button>
          )}
        </div>

        {showMap && (
          <div className="mb-6 bg-card rounded-xl overflow-hidden shadow-lg animate-in fade-in slide-in-from-top-4">
            <iframe
              width="100%"
              height="200"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              src={`https://maps.google.com/maps?q=${encodeURIComponent(inspection.propertyAddress)}&output=embed`}
            />
          </div>
        )}

        <div className="flex items-center gap-3 mb-4">
          <div className="size-12 rounded-xl bg-white/10 flex items-center justify-center">
            <IconComponent className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl">{currentRoom.name}</h1>
            <p className="text-primary-foreground/80 text-sm">
              Ambiente {inspection.currentRoomIndex + 1} de {inspection.rooms.length}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-300"
            style={{
              width: `${((inspection.currentRoomIndex + 1) / inspection.rooms.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 py-6 grid grid-cols-2 gap-3">
        <Button
          onClick={() => setShowPhotoCapture(true)}
          variant="secondary"
          size="lg"
          className="h-24 flex-col"
        >
          <Camera className="size-8 mb-2" />
          <span>Capturar Foto</span>
        </Button>
        <Button
          onClick={() => setShowVoiceRecorder(true)}
          variant="secondary"
          size="lg"
          className="h-24 flex-col"
        >
          <Mic className="size-8 mb-1" />
          <span>Descrever por Voz</span>
        </Button>
      </div>

      {/* Photos */}
      {currentRoom.photos.length > 0 && (
        <div className="px-6 mb-6">
          <h3 className="mb-3">Fotos ({currentRoom.photos.length})</h3>
          <div className="grid grid-cols-3 gap-2">
            {currentRoom.photos.map((photo, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                <img
                  src={photo}
                  alt={`Foto ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => handleDeletePhoto(index)}
                  className="absolute top-1 right-1 p-1.5 bg-destructive rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="size-4 text-white" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Items List */}
      <div className="px-6 mb-6">
        <h3 className="mb-3">Problemas Encontrados ({currentRoom.items.length})</h3>
        {currentRoom.items.length === 0 ? (
          <div className="text-center py-8 bg-muted/30 rounded-xl">
            <CheckCircle2 className="size-12 mx-auto mb-3 text-success" />
            <p className="text-muted-foreground">
              Nenhum problema registrado neste ambiente
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {currentRoom.items.map((item) => (
              <div
                key={item.id}
                className="bg-card border border-border rounded-xl p-4"
              >
                {editingItem === item.id ? (
                  <div className="space-y-3">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full p-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                      rows={3}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleEditItem(item.id, editText)}
                        className="flex-1"
                      >
                        Salvar
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setEditingItem(null);
                          setEditText('');
                        }}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <p className={`text-foreground ${item.comparisonStatus === 'resolvido' ? 'line-through opacity-60' : ''}`}>
                          {item.description}
                        </p>
                        {item.comparisonStatus && (
                          <div className="mt-2 flex gap-2">
                            {item.comparisonStatus === 'novo_dano' && <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">Novo Dano</span>}
                            {item.comparisonStatus === 'resolvido' && <span className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success">Resolvido</span>}
                            {item.comparisonStatus === 'modificado' && <span className="text-xs px-2 py-0.5 rounded-full bg-warning/10 text-warning">Modificado</span>}
                            {item.comparisonStatus === 'sem_alteracao' && <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Sem Alteração</span>}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setEditingItem(item.id);
                            setEditText(item.description);
                          }}
                          className="p-2 hover:bg-secondary rounded-lg transition-colors"
                        >
                          <Edit3 className="size-4 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </button>
                      </div>
                    </div>

                    {/* Action buttons for pre-populated items */}
                    {item.originalDescription && item.comparisonStatus !== 'resolvido' && (
                      <div className="flex gap-2 pt-2 border-t border-border/50">
                        <Button
                          size="sm"
                          variant="success"
                          className="flex-1 text-xs"
                          onClick={() => {
                            const updated = { ...inspection };
                            const i = updated.rooms[inspection.currentRoomIndex].items.find(x => x.id === item.id);
                            if (i) i.comparisonStatus = 'resolvido';
                            InspectionStorage.save(updated);
                            setInspection(updated);
                          }}
                        >
                          <CheckCircle2 className="size-3 mr-1" /> Marcar Resolvido
                        </Button>
                      </div>
                    )}
                    {item.comparisonStatus === 'resolvido' && (
                      <div className="flex gap-2 pt-2 border-t border-border/50">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="flex-1 text-xs"
                          onClick={() => {
                            const updated = { ...inspection };
                            const i = updated.rooms[inspection.currentRoomIndex].items.find(x => x.id === item.id);
                            if (i) i.comparisonStatus = 'sem_alteracao';
                            InspectionStorage.save(updated);
                            setInspection(updated);
                          }}
                        >
                          Desfazer Resolução
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4">
        <div className="max-w-md mx-auto flex gap-3">
          <Button
            onClick={handlePreviousRoom}
            disabled={isFirstRoom}
            variant="secondary"
            className="flex-1"
            size="lg"
          >
            <ChevronLeft className="size-5" />
            Anterior
          </Button>

          {isLastRoom ? (
            <Button
              onClick={handleFinishInspection}
              variant="success"
              className="flex-1"
              size="lg"
            >
              <CheckCircle2 className="size-5" />
              Finalizar
            </Button>
          ) : (
            <Button
              onClick={handleNextRoom}
              className="flex-1"
              size="lg"
            >
              Próximo
              <ChevronRight className="size-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Modals */}
      {showVoiceRecorder && (
        <VoiceRecorder
          onConfirm={handleAddItem}
          onCancel={() => setShowVoiceRecorder(false)}
        />
      )}

      {showPhotoCapture && (
        <PhotoCapture
          onConfirm={handlePhotoCaptureConfirm}
          onCancel={() => setShowPhotoCapture(false)}
        />
      )}

      {aiVisionMediaUrl && (
        <AIVisionModal
          mediaUrl={aiVisionMediaUrl}
          onComplete={handleAiVisionComplete}
          onCancel={() => setAiVisionMediaUrl(null)}
        />
      )}

      {showComparisonReview && (
        <ComparisonReviewModal
          inspection={inspection}
          onConfirm={() => {
            setShowComparisonReview(false);
            performFinalSave();
          }}
          onCancel={() => setShowComparisonReview(false)}
        />
      )}
    </div>
  );
}