import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ChevronRight, Plus, Search, Trash2 } from 'lucide-react';
import { BottomNav } from '../components/bottom-nav';
import { Inspection } from '../types';
import { InspectionStorage } from '../storage';
import { Button } from '../components/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { seedMockData } from '../seed';

export function HomePage() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [filter, setFilter] = useState<'all' | 'em_andamento' | 'concluida'>('all');

  useEffect(() => {
    seedMockData();
    loadInspections();
  }, []);

  const loadInspections = () => {
    const data = InspectionStorage.getAll();
    setInspections(data.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (confirm('Deseja realmente excluir esta vistoria?')) {
      InspectionStorage.delete(id);
      loadInspections();
    }
  };

  const filteredInspections = inspections.filter(i => 
    filter === 'all' ? true : i.status === filter
  );

  return (
    <div className="min-h-screen pb-20 bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground px-6 pt-12 pb-8">
        <h1 className="text-3xl mb-2">vistor.ia</h1>
        <p className="text-primary-foreground/80">
          Vistorias inteligentes e rápidas
        </p>
      </div>

      {/* Filters */}
      <div className="px-6 py-4 flex gap-2 overflow-x-auto">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
            filter === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground'
          }`}
        >
          Todas
        </button>
        <button
          onClick={() => setFilter('em_andamento')}
          className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
            filter === 'em_andamento'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground'
          }`}
        >
          Em andamento
        </button>
        <button
          onClick={() => setFilter('concluida')}
          className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
            filter === 'concluida'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground'
          }`}
        >
          Concluídas
        </button>
      </div>

      {/* Inspections List */}
      <div className="px-6 py-2">
        {filteredInspections.length === 0 ? (
          <div className="text-center py-12">
            <div className="size-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Search className="size-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2">Nenhuma vistoria encontrada</h3>
            <p className="text-muted-foreground text-sm mb-6">
              {filter === 'all'
                ? 'Comece criando sua primeira vistoria'
                : `Nenhuma vistoria ${filter === 'em_andamento' ? 'em andamento' : 'concluída'}`}
            </p>
            <Link to="/nova-vistoria">
              <Button>
                <Plus className="size-5" />
                Nova Vistoria
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredInspections.map((inspection) => (
              <Link
                key={inspection.id}
                to={`/vistoria/${inspection.id}`}
                className="block bg-card rounded-2xl p-4 border border-border hover:shadow-md transition-shadow"
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
                    </div>
                    <h3 className="mb-1">{inspection.propertyAddress}</h3>
                    <p className="text-sm text-muted-foreground">
                      {format(inspection.createdAt, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
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

                {/* Progress */}
                {inspection.status === 'em_andamento' && (
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
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}