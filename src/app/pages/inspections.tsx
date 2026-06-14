import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import {
  AlertTriangle,
  Camera,
  ChevronRight,
  ClipboardList,
  Plus,
  Search,
  Signature,
  Trash2,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BottomNav } from '../components/bottom-nav';
import { AccountMenu } from '../components/account-menu';
import { Button } from '../components/button';
import { Input } from '../components/input';
import { Inspection } from '../types';
import { InspectionStorage } from '../storage';
import logo from '../../assets/logo.png';
import { seedMockData } from '../seed';

export function InspectionsPage() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [filter, setFilter] = useState<'all' | 'em_andamento' | 'concluida'>('all');
  const [search, setSearch] = useState('');

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

  const getInspectionIssueCount = (inspection: Inspection) => {
    return inspection.rooms.reduce((sum, room) => sum + room.items.length, 0);
  };

  const getInspectionPhotoCount = (inspection: Inspection) => {
    return inspection.rooms.reduce((sum, room) => sum + room.photos.length, 0);
  };

  const getPendingSignatureCount = (inspection: Inspection) => {
    return inspection.signatures?.filter((signature) => signature.status === 'pendente').length || 0;
  };

  const getInspectionProgress = (inspection: Inspection) => {
    return Math.round(((inspection.currentRoomIndex + 1) / inspection.rooms.length) * 100);
  };

  const filteredInspections = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return inspections.filter((inspection) => {
      const matchesFilter = filter === 'all' ? true : inspection.status === filter;
      const matchesSearch = normalizedSearch.length === 0
        ? true
        : inspection.propertyAddress.toLowerCase().includes(normalizedSearch);

      return matchesFilter && matchesSearch;
    });
  }, [filter, inspections, search]);

  return (
    <div className="min-h-screen pb-20 bg-background">
      <div className="px-6 pt-12 pb-6 bg-primary text-primary-foreground">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="pb-2 border-b-[3px] border-white/40 w-fit">
            <img src={logo} alt="Logo" className="h-12 w-auto object-contain brightness-0 invert" />
          </div>
          <AccountMenu />
        </div>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl leading-tight">Vistorias</h1>
            <p className="text-sm text-primary-foreground/80 mt-2">
              {filteredInspections.length} resultado(s)
            </p>
          </div>
          <Link to="/nova-vistoria">
            <Button size="sm" className="bg-white text-primary hover:bg-white/90">
              <Plus className="size-4" />
              Nova
            </Button>
          </Link>
        </div>
      </div>

      <div className="px-6 -mt-5 mb-6 space-y-4">
        <div className="bg-card border border-border rounded-3xl p-4 shadow-sm">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por endereço"
          />

          <div className="flex gap-2 overflow-x-auto pt-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${filter === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground'
                }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilter('em_andamento')}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${filter === 'em_andamento'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground'
                }`}
            >
              Em andamento
            </button>
            <button
              onClick={() => setFilter('concluida')}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${filter === 'concluida'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground'
                }`}
            >
              Concluídas
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-2">
        {filteredInspections.length === 0 ? (
          <div className="text-center py-12">
            <div className="size-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              {search ? (
                <Search className="size-8 text-muted-foreground" />
              ) : (
                <ClipboardList className="size-8 text-muted-foreground" />
              )}
            </div>
            <h3 className="mb-2">
              {search ? 'Nenhuma vistoria encontrada' : 'Nenhuma vistoria cadastrada'}
            </h3>
            <p className="text-muted-foreground text-sm mb-6">
              {search
                ? 'Tente buscar por outro endereço ou ajuste os filtros.'
                : 'Crie uma vistoria para acompanhar o andamento, registrar evidências e finalizar o laudo.'}
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
                        className={`inline-block px-2 py-0.5 rounded-full text-xs ${inspection.type === 'entrada'
                          ? 'bg-success/10 text-success'
                          : 'bg-warning/10 text-warning'
                          }`}
                      >
                        {inspection.type === 'entrada' ? 'Entrada' : 'Saída'}
                      </span>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs ${inspection.status === 'em_andamento'
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

                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs">
                    <Camera className="size-3" />
                    {getInspectionPhotoCount(inspection)} fotos
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs">
                    <AlertTriangle className="size-3" />
                    {getInspectionIssueCount(inspection)} itens
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs">
                    <Signature className="size-3" />
                    {getPendingSignatureCount(inspection)} pendências
                  </span>
                </div>

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
                        style={{ width: `${getInspectionProgress(inspection)}%` }}
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
