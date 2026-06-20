import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import {
  AlertTriangle,
  Camera,
  ChevronRight,
  ClipboardList,
  Clock3,
  History,
  Plus,
  Search,
  Signature,
  Trash2,
} from 'lucide-react';
import { format, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BottomNav } from '../components/bottom-nav';
import { AccountMenu } from '../components/account-menu';
import { Button } from '../components/button';
import { Input } from '../components/input';
import { Inspection, UserView } from '../types';
import { InspectionStorage } from '../storage';
import { AccountStorage } from '../account-storage';
import { seedMockData } from '../seed';

type ManagerStatusFilter = 'all' | 'agendada' | 'em_andamento' | 'concluida' | 'aguardando_assinatura' | 'atrasada';
type ManagerPriorityFilter = 'all' | 'alta' | 'media' | 'baixa';
type ManagerAgent = 'João da Silva' | 'Ana Souza' | 'Carlos Lima' | 'Beatriz Alves' | 'Mariana Costa';

interface ManagedInspection {
  inspection: Inspection;
  agent: ManagerAgent | null;
  tenant: string;
  priority: Exclude<ManagerPriorityFilter, 'all'>;
  status: Exclude<ManagerStatusFilter, 'all'>;
  pendingSignatures: number;
  updatedAt: Date;
  slaLabel: string;
}

const MANAGER_AGENTS: ManagerAgent[] = [
  'João da Silva',
  'Ana Souza',
  'Carlos Lima',
  'Beatriz Alves',
  'Mariana Costa',
];

const TENANTS = [
  'Patrícia Gomes',
  'Ricardo Menezes',
  'Luciana Prado',
  'Thiago Nunes',
  'Fernanda Lopes',
];

function getInspectionIssueCount(inspection: Inspection) {
  return inspection.rooms.reduce((sum, room) => sum + room.items.length, 0);
}

function getInspectionPhotoCount(inspection: Inspection) {
  return inspection.rooms.reduce((sum, room) => sum + room.photos.length, 0);
}

function getPendingSignatureCount(inspection: Inspection) {
  return inspection.signatures?.filter((signature) => signature.status === 'pendente').length || 0;
}

function getInspectionProgress(inspection: Inspection) {
  return Math.round(((inspection.currentRoomIndex + 1) / inspection.rooms.length) * 100);
}

function getManagedStatus(inspection: Inspection, pendingSignatures: number): ManagedInspection['status'] {
  if (pendingSignatures > 0) return 'aguardando_assinatura';
  if (inspection.status === 'concluida') return 'concluida';
  if (startOfDay(inspection.createdAt) < startOfDay(new Date())) return 'atrasada';
  if (startOfDay(inspection.createdAt) > startOfDay(new Date())) return 'agendada';
  return 'em_andamento';
}

function getStatusLabel(status: ManagedInspection['status']) {
  switch (status) {
    case 'agendada':
      return 'Agendada';
    case 'em_andamento':
      return 'Em andamento';
    case 'concluida':
      return 'Concluída';
    case 'aguardando_assinatura':
      return 'Aguardando assinatura';
    case 'atrasada':
      return 'Atrasada';
  }
}

export function InspectionsPage() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [filter, setFilter] = useState<'all' | 'em_andamento' | 'concluida'>('all');
  const [search, setSearch] = useState('');
  const [userView, setUserView] = useState<UserView>(AccountStorage.getSelectedView());
  const [managerStatus, setManagerStatus] = useState<ManagerStatusFilter>('all');
  const [managerPriority, setManagerPriority] = useState<ManagerPriorityFilter>('all');
  const [managerAgent, setManagerAgent] = useState<'all' | ManagerAgent>('all');
  const [managerType, setManagerType] = useState<'all' | 'entrada' | 'saida'>('all');

  useEffect(() => {
    seedMockData();
    loadInspections();
    return AccountStorage.subscribe(() => setUserView(AccountStorage.getSelectedView()));
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

  const managedInspections = useMemo<ManagedInspection[]>(() => {
    return inspections.map((inspection, index) => {
      const pendingSignatures = Math.max(getPendingSignatureCount(inspection), index === 0 ? 2 : 0);
      const agent = index % 6 === 0 ? null : MANAGER_AGENTS[index % MANAGER_AGENTS.length];
      const priority: ManagedInspection['priority'] = index % 4 === 0 ? 'alta' : index % 3 === 0 ? 'media' : 'baixa';
      const status = getManagedStatus(inspection, pendingSignatures);

      return {
        inspection,
        agent,
        tenant: TENANTS[index % TENANTS.length],
        priority,
        status,
        pendingSignatures,
        updatedAt: new Date(inspection.createdAt.getTime() + (index + 1) * 45 * 60000),
        slaLabel: status === 'atrasada'
          ? 'Atrasada em 3h'
          : status === 'aguardando_assinatura'
            ? 'SLA: assinatura hoje'
            : status === 'agendada'
              ? 'SLA: iniciar no horário'
              : 'SLA dentro do prazo',
      };
    });
  }, [inspections]);

  const managerResults = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return managedInspections.filter(({ inspection, agent, tenant, priority, status }) => {
      const matchesSearch = normalizedSearch.length === 0
        ? true
        : inspection.propertyAddress.toLowerCase().includes(normalizedSearch)
          || (agent?.toLowerCase().includes(normalizedSearch) ?? false)
          || tenant.toLowerCase().includes(normalizedSearch);
      const matchesStatus = managerStatus === 'all' ? true : status === managerStatus;
      const matchesPriority = managerPriority === 'all' ? true : priority === managerPriority;
      const matchesAgent = managerAgent === 'all' ? true : agent === managerAgent;
      const matchesType = managerType === 'all' ? true : inspection.type === managerType;

      return matchesSearch && matchesStatus && matchesPriority && matchesAgent && matchesType;
    });
  }, [managedInspections, managerAgent, managerPriority, managerStatus, managerType, search]);

  const managerSummary = useMemo(() => ({
    total: Math.max(managedInspections.length, 12),
    inProgress: Math.max(managedInspections.filter((item) => item.status === 'em_andamento').length, 4),
    pendingReviews: Math.max(managedInspections.filter((item) => item.status === 'aguardando_assinatura').length, 3),
    overdue: Math.max(managedInspections.filter((item) => item.status === 'atrasada').length, 2),
  }), [managedInspections]);

  if (userView === 'imobiliaria') {
    return (
      <div className="min-h-screen pb-20 bg-background">
        <div className="bg-primary px-6 pt-12 pb-8 text-primary-foreground">
          <div className="mb-3 flex items-start justify-between gap-4">
            <div className="min-h-[4.75rem] min-w-0 flex-1">
              <h1 className="mb-1 text-3xl font-medium">Operação</h1>
              <p className="max-w-[15.5rem] text-sm leading-5 text-primary-foreground/80">
                Gerencie filas, pendências e distribuição das vistorias.
              </p>
            </div>
            <div className="shrink-0">
              <AccountMenu />
            </div>
          </div>
        </div>

        <div className="px-6 pt-6 mb-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <p className="text-sm text-muted-foreground">Todas as vistorias</p>
              <p className="mt-2 text-3xl">{managerSummary.total}</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <p className="text-sm text-muted-foreground">Em andamento</p>
              <p className="mt-2 text-3xl">{managerSummary.inProgress}</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <p className="text-sm text-muted-foreground">Pendentes de revisão</p>
              <p className="mt-2 text-3xl">{managerSummary.pendingReviews}</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <p className="text-sm text-muted-foreground">Atrasadas</p>
              <p className="mt-2 text-3xl">{managerSummary.overdue}</p>
            </div>
          </div>
        </div>

        <div className="px-6 -mt-1 mb-6 space-y-4">
          <div className="bg-card border border-border rounded-3xl p-4 shadow-sm">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por imóvel, corretor ou locatário"
            />

            <div className="flex gap-2 overflow-x-auto pt-4">
              {[
                ['all', 'Todas'],
                ['agendada', 'Agendadas'],
                ['em_andamento', 'Em andamento'],
                ['concluida', 'Concluídas'],
                ['aguardando_assinatura', 'Assinaturas'],
                ['atrasada', 'Atrasadas'],
              ].map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setManagerStatus(value as ManagerStatusFilter)}
                  className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                    managerStatus === value ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-4">
              <select
                value={managerAgent}
                onChange={(e) => setManagerAgent(e.target.value as 'all' | ManagerAgent)}
                className="h-12 rounded-xl border border-border bg-input-background px-4 text-sm"
              >
                <option value="all">Todos os corretores</option>
                {MANAGER_AGENTS.map((agent) => (
                  <option key={agent} value={agent}>{agent}</option>
                ))}
              </select>
              <select
                value={managerPriority}
                onChange={(e) => setManagerPriority(e.target.value as ManagerPriorityFilter)}
                className="h-12 rounded-xl border border-border bg-input-background px-4 text-sm"
              >
                <option value="all">Todas as prioridades</option>
                <option value="alta">Alta</option>
                <option value="media">Média</option>
                <option value="baixa">Baixa</option>
              </select>
              <select
                value={managerType}
                onChange={(e) => setManagerType(e.target.value as 'all' | 'entrada' | 'saida')}
                className="h-12 rounded-xl border border-border bg-input-background px-4 text-sm"
              >
                <option value="all">Todos os tipos</option>
                <option value="entrada">Entrada</option>
                <option value="saida">Saída</option>
              </select>
            </div>
          </div>
        </div>

        <div className="px-6 py-2">
          {managerResults.length === 0 ? (
            <div className="text-center py-12">
              <div className="size-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Search className="size-8 text-muted-foreground" />
              </div>
              <h3 className="mb-2">Nenhum item encontrado</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Ajuste os filtros para acompanhar a operação.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {managerResults.map((item) => (
                <Link
                  key={item.inspection.id}
                  to={`/vistoria/${item.inspection.id}`}
                  className="block bg-card rounded-2xl p-4 border border-border hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                          item.inspection.type === 'entrada' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                        }`}>
                          {item.inspection.type === 'entrada' ? 'Entrada' : 'Saída'}
                        </span>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                          item.status === 'atrasada'
                            ? 'bg-destructive/10 text-destructive'
                            : item.status === 'aguardando_assinatura'
                              ? 'bg-warning/10 text-warning'
                              : item.status === 'em_andamento'
                                ? 'bg-primary/10 text-primary'
                                : 'bg-muted text-muted-foreground'
                        }`}>
                          {getStatusLabel(item.status)}
                        </span>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                          item.priority === 'alta'
                            ? 'bg-destructive/10 text-destructive'
                            : item.priority === 'media'
                              ? 'bg-warning/10 text-warning'
                              : 'bg-secondary text-secondary-foreground'
                        }`}>
                          Prioridade {item.priority}
                        </span>
                      </div>
                      <h3 className="mb-1">{item.inspection.propertyAddress}</h3>
                      <p className="text-sm text-muted-foreground">
                        {format(item.inspection.createdAt, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                    <ChevronRight className="size-5 text-muted-foreground shrink-0" />
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                    <div className="rounded-2xl bg-muted p-3 text-muted-foreground">
                      <p className="mb-1">Corretor responsável</p>
                      <p className="text-foreground">{item.agent || 'Sem responsável'}</p>
                    </div>
                    <div className="rounded-2xl bg-muted p-3 text-muted-foreground">
                      <p className="mb-1">Locatário</p>
                      <p className="text-foreground">{item.tenant}</p>
                    </div>
                    <div className="rounded-2xl bg-muted p-3 text-muted-foreground">
                      <p className="mb-1">SLA / atraso</p>
                      <p className="text-foreground">{item.slaLabel}</p>
                    </div>
                    <div className="rounded-2xl bg-muted p-3 text-muted-foreground">
                      <p className="mb-1">Última atualização</p>
                      <p className="text-foreground">{format(item.updatedAt, 'HH:mm', { locale: ptBR })}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs">
                      <Signature className="size-3" />
                      {item.pendingSignatures} pendência(s)
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs">
                      <Camera className="size-3" />
                      {getInspectionPhotoCount(item.inspection)} fotos
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs">
                      <AlertTriangle className="size-3" />
                      {getInspectionIssueCount(item.inspection)} itens
                    </span>
                  </div>

                  <div className="pt-3 border-t border-border flex flex-wrap gap-2">
                    <Button size="sm" variant="secondary">Reatribuir corretor</Button>
                    <Button size="sm" variant="secondary">Remarcar</Button>
                    <Button size="sm" variant="secondary">Cobrar assinatura</Button>
                    <Button size="sm" variant="secondary">Abrir relatório</Button>
                    <Button size="sm" variant="secondary">
                      <History className="size-3" />
                      Ver histórico
                    </Button>
                    <Button size="sm" variant="secondary">
                      <Clock3 className="size-3" />
                      Marcar prioridade
                    </Button>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-background">
      <div className="bg-primary px-6 pt-12 pb-8 text-primary-foreground">
        <div className="mb-3 flex items-start justify-between gap-4">
          <div className="min-h-[4.75rem] min-w-0 flex-1">
            <h1 className="mb-1 text-3xl font-medium">Vistorias</h1>
            <p className="max-w-[15.5rem] text-sm leading-5 text-primary-foreground/80">
              Acompanhe suas vistorias e avance o trabalho em campo.
            </p>
          </div>
          <div className="shrink-0">
            <AccountMenu />
          </div>
        </div>
      </div>

      <div className="px-6 pt-6 mb-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {filteredInspections.length} resultado(s)
          </p>
          <Link to="/nova-vistoria">
            <Button size="sm">
              <Plus className="size-4" />
              Nova
            </Button>
          </Link>
        </div>
        <div className="bg-card border border-border rounded-3xl p-4 shadow-sm">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por endereço"
          />

          <div className="flex gap-2 overflow-x-auto pt-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                filter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilter('em_andamento')}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                filter === 'em_andamento' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
              }`}
            >
              Em andamento
            </button>
            <button
              onClick={() => setFilter('concluida')}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                filter === 'concluida' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
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
                        className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                          inspection.type === 'entrada' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                        }`}
                      >
                        {inspection.type === 'entrada' ? 'Entrada' : 'Saída'}
                      </span>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                          inspection.status === 'em_andamento' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
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
