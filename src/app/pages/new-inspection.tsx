import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Trash2, Plus } from 'lucide-react';
import { Button } from '../components/button';
import { Input, Textarea } from '../components/input';
import { Inspection, InspectionType, InspectionRoom, DEFAULT_ROOMS } from '../types';
import { InspectionStorage } from '../storage';
import * as LucideIcons from 'lucide-react';

export function NewInspectionPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    propertyAddress: '',
    type: 'entrada' as InspectionType,
    notes: '',
    linkedEntryId: '',
  });
  const [rooms, setRooms] = useState<Omit<InspectionRoom, 'items' | 'photos'>[]>(DEFAULT_ROOMS);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomIcon, setNewRoomIcon] = useState('home');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [entryInspections, setEntryInspections] = useState<Inspection[]>([]);

  useEffect(() => {
    // Load all completed entry inspections
    const allInspections = InspectionStorage.getAll();
    const entries = allInspections.filter(i => i.type === 'entrada' && i.status === 'concluida');
    setEntryInspections(entries);
  }, []);

  useEffect(() => {
    if (formData.type === 'saida' && formData.linkedEntryId) {
      const linkedEntry = entryInspections.find(i => i.id === formData.linkedEntryId);
      if (linkedEntry) {
        setRooms(linkedEntry.rooms.map(r => ({ id: r.id, name: r.name, icon: r.icon })));
      }
    } else {
      setRooms(DEFAULT_ROOMS);
    }
  }, [formData.type, formData.linkedEntryId, entryInspections]);

  const handleAddRoom = () => {
    if (!newRoomName.trim()) return;
    const newRoom = {
      id: `custom-${Date.now()}`,
      name: newRoomName.trim(),
      icon: newRoomIcon
    };
    setRooms([...rooms, newRoom]);
    setNewRoomName('');
  };

  const handleRemoveRoom = (id: string) => {
    setRooms(rooms.filter(r => r.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.propertyAddress.trim()) {
      newErrors.propertyAddress = 'Endereço é obrigatório';
    }
    if (rooms.length === 0) {
      newErrors.rooms = 'Adicione ao menos um ambiente';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    let roomsData: InspectionRoom[] = rooms.map(room => ({
      ...room,
      items: [],
      photos: [],
    }));

    // If exit inspection and linked to an entry, map existing items
    if (formData.type === 'saida' && formData.linkedEntryId) {
      const linkedEntry = entryInspections.find(i => i.id === formData.linkedEntryId);
      if (linkedEntry) {
        roomsData = roomsData.map(room => {
          const linkedRoom = linkedEntry.rooms.find(r => r.id === room.id);
          if (linkedRoom) {
            return {
              ...room,
              items: linkedRoom.items.map(item => ({
                ...item,
                id: `copied-${item.id}-${Date.now()}`,
                createdAt: new Date(),
                comparisonStatus: 'sem_alteracao',
                originalDescription: item.description,
              }))
            };
          }
          return room;
        });
      }
    }

    // Create new inspection
    const inspection: Inspection = {
      id: Date.now().toString(),
      propertyAddress: formData.propertyAddress,
      type: formData.type,
      status: 'em_andamento',
      notes: formData.notes,
      createdAt: new Date(),
      rooms: roomsData,
      currentRoomIndex: 0,
      linkedEntryId: formData.type === 'saida' && formData.linkedEntryId ? formData.linkedEntryId : undefined,
    };

    InspectionStorage.save(inspection);
    navigate(`/vistoria/${inspection.id}`);
  };

  const renderIcon = (iconStr: string) => {
    const iconName = iconStr.split('-').map((word, i) => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join('');
    const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.Home;
    return <IconComponent className="size-4 text-primary" />;
  };

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
      <div className="bg-primary text-primary-foreground px-6 pt-12 pb-6 mb-6">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center gap-2 mb-4 -ml-2 p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <ArrowLeft className="size-5" />
          <span>Voltar</span>
        </button>
        <h1 className="text-2xl">Nova Vistoria</h1>
      </div>

      {/* Form */}
      <div className="px-6 space-y-6">
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

        {formData.type === 'saida' && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
            <label className="text-sm text-foreground/80">
              Vincular Vistoria de Entrada
            </label>
            <select
              value={formData.linkedEntryId}
              onChange={(e) => setFormData({ ...formData, linkedEntryId: e.target.value })}
              className="w-full p-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Continuar sem vinculação</option>
              {entryInspections.map(insp => (
                <option key={insp.id} value={insp.id}>
                  {insp.propertyAddress} ({new Date(insp.createdAt).toLocaleDateString('pt-BR')})
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              Vincular ajuda a comparar o estado atual com a entrada.
            </p>
          </div>
        )}

        <Textarea
          label="Observações (opcional)"
          placeholder="Adicione observações gerais sobre a vistoria..."
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />

        <div className="space-y-3 pt-4 border-t border-border">
          <label className="text-sm font-medium">Ambientes do Imóvel</label>
          <div className="space-y-2">
            {rooms.map(room => (
              <div key={room.id} className="flex justify-between items-center p-3 bg-card border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                     {renderIcon(room.icon)}
                  </div>
                  <span>{room.name}</span>
                </div>
                <button type="button" onClick={() => handleRemoveRoom(room.id)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg">
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2 mt-2">
            <Input 
              placeholder="Novo ambiente..." 
              value={newRoomName} 
              onChange={e => setNewRoomName(e.target.value)} 
            />
            <div className="flex gap-2">
              <select 
                value={newRoomIcon} 
                onChange={e => setNewRoomIcon(e.target.value)}
                className="flex-1 h-12 px-4 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="home">Geral</option>
                <option value="bed">Quarto</option>
                <option value="bath">Banheiro</option>
                <option value="chef-hat">Cozinha</option>
                <option value="sofa">Sala</option>
                <option value="washing-machine">Área de Serv</option>
                <option value="car">Garagem</option>
                <option value="wind">Varanda</option>
              </select>
              <Button type="button" variant="secondary" onClick={handleAddRoom} className="h-12 w-12 flex-shrink-0 p-0 flex items-center justify-center">
                <Plus className="size-5" />
              </Button>
            </div>
          </div>
          {errors.rooms && (
            <p className="text-sm text-destructive mt-1">{errors.rooms}</p>
          )}
        </div>

        <div className="pt-4">
          <Button type="button" onClick={handleSubmit} className="w-full" size="lg">
            Iniciar Vistoria
          </Button>
          <p className="text-center text-xs text-muted-foreground mt-4">
            Você será guiado por cada ambiente do imóvel
          </p>
        </div>
      </div>
    </div>
  );
}
