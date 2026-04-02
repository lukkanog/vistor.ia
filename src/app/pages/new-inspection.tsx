import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/button';
import { Input, Textarea } from '../components/input';
import { Inspection, InspectionType, DEFAULT_ROOMS } from '../types';
import { InspectionStorage } from '../storage';

export function NewInspectionPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    propertyAddress: '',
    type: 'entrada' as InspectionType,
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.propertyAddress.trim()) {
      newErrors.propertyAddress = 'Endereço é obrigatório';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Create new inspection
    const inspection: Inspection = {
      id: Date.now().toString(),
      propertyAddress: formData.propertyAddress,
      type: formData.type,
      status: 'em_andamento',
      notes: formData.notes,
      createdAt: new Date(),
      rooms: DEFAULT_ROOMS.map(room => ({
        ...room,
        items: [],
        photos: [],
      })),
      currentRoomIndex: 0,
    };

    InspectionStorage.save(inspection);
    navigate(`/vistoria/${inspection.id}`);
  };

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
      <div className="bg-primary text-primary-foreground px-6 pt-12 pb-6 mb-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 mb-4 -ml-2 p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <ArrowLeft className="size-5" />
          <span>Voltar</span>
        </button>
        <h1 className="text-2xl">Nova Vistoria</h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-6 space-y-6">
        <Input
          label="Endereço do Imóvel *"
          placeholder="Ex: Rua das Flores, 123 - Apto 45"
          value={formData.propertyAddress}
          onChange={(e) => {
            setFormData({ ...formData, propertyAddress: e.target.value });
            setErrors({ ...errors, propertyAddress: '' });
          }}
          error={errors.propertyAddress}
        />

        <div className="space-y-2">
          <label className="text-sm text-foreground/80">
            Tipo de Vistoria *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'entrada' })}
              className={`p-4 rounded-xl border-2 transition-all ${
                formData.type === 'entrada'
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card'
              }`}
            >
              <div className="text-center">
                <div className="size-12 mx-auto mb-2 rounded-full bg-success/10 flex items-center justify-center">
                  <span className="text-2xl">🔑</span>
                </div>
                <p className="font-medium">Entrada</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Ao receber as chaves
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'saida' })}
              className={`p-4 rounded-xl border-2 transition-all ${
                formData.type === 'saida'
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card'
              }`}
            >
              <div className="text-center">
                <div className="size-12 mx-auto mb-2 rounded-full bg-warning/10 flex items-center justify-center">
                  <span className="text-2xl">📦</span>
                </div>
                <p className="font-medium">Saída</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Ao devolver as chaves
                </p>
              </div>
            </button>
          </div>
        </div>

        <Textarea
          label="Observações (opcional)"
          placeholder="Adicione observações gerais sobre a vistoria..."
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />

        <div className="pt-4">
          <Button type="submit" className="w-full" size="lg">
            Iniciar Vistoria
          </Button>
          <p className="text-center text-xs text-muted-foreground mt-4">
            Você será guiado por cada ambiente do imóvel
          </p>
        </div>
      </form>
    </div>
  );
}
