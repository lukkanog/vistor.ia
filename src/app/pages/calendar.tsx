import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Calendar } from '../components/ui/calendar';
import { Inspection, DEFAULT_ROOMS } from '../types';
import { InspectionStorage } from '../storage';
import { Button } from '../components/button';
import { Input } from '../components/input';
import { ChevronRight, Plus, Calendar as CalendarIcon, Trash2 } from 'lucide-react';
import { format, isSameDay, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BottomNav } from '../components/bottom-nav';

export function CalendarPage() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [month, setMonth] = useState<Date>(new Date());
  const [newAddress, setNewAddress] = useState('');

  useEffect(() => {
    loadInspections();
  }, []);

  const loadInspections = () => {
    const data = InspectionStorage.getAll();
    setInspections(data.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Deseja realmente excluir esta vistoria?')) {
      InspectionStorage.delete(id);
      loadInspections();
    }
  };

  const handleSchedule = () => {
    if (!newAddress.trim()) return;
    
    const scheduledDate = new Date(selectedDate);
    const now = new Date();
    scheduledDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());

    const inspection: Inspection = {
      id: Date.now().toString(),
      propertyAddress: newAddress.trim(),
      type: 'entrada',
      status: 'em_andamento',
      createdAt: scheduledDate,
      rooms: DEFAULT_ROOMS.map(room => ({
        ...room,
        items: [],
        photos: [],
      })),
      currentRoomIndex: 0,
    };

    InspectionStorage.save(inspection);
    setNewAddress('');
    loadInspections();
  };

  const handleCardClick = (e: React.MouseEvent, inspectionDate: Date) => {
    if (startOfDay(inspectionDate) > startOfDay(new Date())) {
      e.preventDefault();
      alert('Você só pode iniciar esta vistoria na data agendada.');
    }
  };

  const inspectionsForSelectedDate = inspections.filter(i => isSameDay(i.createdAt, selectedDate));
  const datesWithInspections = inspections.map(i => i.createdAt);

  const modifiers = {
    hasInspection: datesWithInspections,
  };

  const modifiersStyles = {
    hasInspection: {
      fontWeight: 'bold',
      textDecoration: 'underline',
      textDecorationColor: 'var(--color-primary)',
      textUnderlineOffset: '4px'
    }
  };

  return (
    <div className="min-h-screen pb-20 bg-background">
      <div className="bg-primary text-primary-foreground px-6 pt-12 pb-8">
        <h1 className="text-3xl font-medium mb-1">Calendário</h1>
        <p className="text-primary-foreground/80">Histórico de vistorias</p>
      </div>

      <div className="px-4 py-6">
        <div className="bg-card rounded-2xl border border-border p-2 mb-6 shadow-sm">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              if (date) setSelectedDate(date);
            }}
            month={month}
            onMonthChange={setMonth}
            modifiers={modifiers}
            modifiersStyles={modifiersStyles}
            locale={ptBR}
            className="w-full"
            classNames={{
              months: "w-full flex justify-center",
              month: "w-full",
              table: "w-full border-collapse",
            }}
          />
          <div className="px-4 pb-2 pt-2 border-t border-border mt-2 text-center">
            <button 
              onClick={() => {
                const today = new Date();
                setSelectedDate(today);
                setMonth(today);
              }}
              className="text-sm text-primary font-medium p-2"
            >
              Ir para Hoje
            </button>
          </div>
        </div>

        <h2 className="text-lg font-medium px-2 mb-4">
          Vistorias em {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
        </h2>

        {inspectionsForSelectedDate.length === 0 ? (
          <div className="text-center py-8 px-6">
            <div className="size-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <CalendarIcon className="size-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2">Nenhuma vistoria neste dia</h3>
            <p className="text-muted-foreground text-sm">
              Nenhuma vistoria agendada para a data selecionada.
            </p>
          </div>
        ) : (
          <div className="space-y-3 px-2 mb-2">
            {inspectionsForSelectedDate.map((inspection) => {
              const isFuture = startOfDay(inspection.createdAt) > startOfDay(new Date());
              return (
                <Link
                  key={inspection.id}
                  to={`/vistoria/${inspection.id}`}
                  onClick={(e) => handleCardClick(e, inspection.createdAt)}
                  className={`block bg-card rounded-2xl p-4 border border-border hover:shadow-md transition-shadow ${
                    isFuture ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                            inspection.type === 'entrada'
                              ? 'bg-success/10 text-success'
                              : 'bg-warning/10 text-warning'
                          }`}
                        >
                          {inspection.type === 'entrada' ? 'Entrada' : 'Saída'}
                        </span>
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                            inspection.status === 'em_andamento'
                              ? 'bg-primary/10 text-primary'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {inspection.status === 'em_andamento' ? 'Em andamento' : 'Concluída'}
                        </span>
                        {isFuture && (
                          <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">
                            Agendada
                          </span>
                        )}
                      </div>
                      <h3 className="mb-1">{inspection.propertyAddress}</h3>
                      <p className="text-sm text-muted-foreground">
                        {format(inspection.createdAt, "HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleDelete(inspection.id, e)}
                        className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </button>
                      <ChevronRight className="size-5 text-muted-foreground" />
                    </div>
                  </div>

                  {inspection.status === 'em_andamento' && !isFuture && (
                    <div className="pt-3 border-t border-border">
                      <div className="flex justify-between text-sm text-muted-foreground mb-2">
                        <span>Progresso</span>
                        <span>
                          {inspection.currentRoomIndex + 1} de {inspection.rooms.length} ambientes
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{
                            width: `${((inspection.currentRoomIndex + 1) / inspection.rooms.length) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}

        <div className="px-2 mt-4 pt-4">
          <div className="bg-card rounded-2xl border border-primary/20 p-4 shadow-sm">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Plus className="size-4 text-primary" />
              Agendar Vistoria
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Irá agendar automaticamente para: {format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder="Endereço do imóvel..."
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSchedule();
                }}
              />
              <Button onClick={handleSchedule} disabled={!newAddress.trim()} className="mt-2 sm:mt-0">
                Adicionar
              </Button>
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
