import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Calendar } from '../components/ui/calendar';
import { Inspection, DEFAULT_ROOMS, UserView } from '../types';
import { InspectionStorage } from '../storage';
import { Button } from '../components/button';
import { Input } from '../components/input';
import {
  Calendar as CalendarIcon,
  ChevronRight,
  MapPin,
  Plus,
  Trash2,
  UserRound,
  Users,
} from 'lucide-react';
import { format, isSameDay, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BottomNav } from '../components/bottom-nav';
import { AccountMenu } from '../components/account-menu';
import { AccountStorage } from '../account-storage';

type ManagerStatusFilter = 'all' | 'em_andamento' | 'concluida' | 'agendada';
type ManagerViewFilter = 'dia' | 'sem_responsavel' | 'conflitos';

interface ManagedInspection {
  inspection: Inspection;
  agent: string | null;
  region: string;
  isFuture: boolean;
  hasConflict: boolean;
}

interface ManagerAgendaSnapshot {
  id: string;
  propertyAddress: string;
  type: Inspection['type'];
  status: ManagerStatusFilter;
  scheduledAt: Date;
  agent: string | null;
  region: string;
  hasConflict: boolean;
}

const TEAM_MEMBERS = [
  'João da Silva',
  'Ana Souza',
  'Carlos Lima',
  'Beatriz Alves',
  'Mariana Costa',
  'Felipe Rocha',
];

const TODAY_TEAM_LOAD: Record<string, number> = {
  'João da Silva': 3,
  'Ana Souza': 2,
  'Carlos Lima': 4,
  'Beatriz Alves': 4,
  'Mariana Costa': 1,
  'Felipe Rocha': 0,
};

function buildTodayAt(hours: number, minutes: number) {
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

const MANAGER_AGENDA_SNAPSHOT: ManagerAgendaSnapshot[] = [
  {
    id: 'ops-1',
    propertyAddress: 'Rua Bela Cintra, 540 - Apto 82',
    type: 'entrada',
    status: 'em_andamento',
    scheduledAt: buildTodayAt(9, 0),
    agent: 'João da Silva',
    region: 'Centro',
    hasConflict: false,
  },
  {
    id: 'ops-2',
    propertyAddress: 'Rua Haddock Lobo, 210 - Conjunto 54',
    type: 'saida',
    status: 'agendada',
    scheduledAt: buildTodayAt(10, 30),
    agent: 'Ana Souza',
    region: 'Centro',
    hasConflict: false,
  },
  {
    id: 'ops-3',
    propertyAddress: 'Av. Brigadeiro Luís Antônio, 1440',
    type: 'entrada',
    status: 'agendada',
    scheduledAt: buildTodayAt(14, 0),
    agent: 'Carlos Lima',
    region: 'Centro',
    hasConflict: true,
  },
  {
    id: 'ops-4',
    propertyAddress: 'Rua da Consolação, 980 - Sala 31',
    type: 'saida',
    status: 'agendada',
    scheduledAt: buildTodayAt(14, 0),
    agent: 'Beatriz Alves',
    region: 'Centro',
    hasConflict: true,
  },
  {
    id: 'ops-5',
    propertyAddress: 'Rua das Acácias, 77 - Casa 2',
    type: 'entrada',
    status: 'agendada',
    scheduledAt: buildTodayAt(15, 30),
    agent: null,
    region: 'Zona Sul',
    hasConflict: false,
  },
  {
    id: 'ops-6',
    propertyAddress: 'Av. Professor Vicente Rao, 1880',
    type: 'entrada',
    status: 'concluida',
    scheduledAt: buildTodayAt(8, 15),
    agent: 'Mariana Costa',
    region: 'Zona Sul',
    hasConflict: false,
  },
];

function getRegion(address: string) {
  if (address.includes('Paulista')) return 'Centro';
  if (address.includes('Flores')) return 'Zona Sul';
  return 'Zona Norte';
}

function getScheduleStatus(inspection: Inspection) {
  return startOfDay(inspection.createdAt) > startOfDay(new Date()) ? 'agendada' : inspection.status;
}

export function CalendarPage() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [month, setMonth] = useState<Date>(new Date());
  const [newAddress, setNewAddress] = useState('');
  const [userView, setUserView] = useState<UserView>(AccountStorage.getSelectedView());
  const [agentFilter, setAgentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<ManagerStatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'entrada' | 'saida'>('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [managerView, setManagerView] = useState<ManagerViewFilter>('dia');

  useEffect(() => {
    loadInspections();
    return AccountStorage.subscribe(() => setUserView(AccountStorage.getSelectedView()));
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
      rooms: DEFAULT_ROOMS.map((room) => ({
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

  const inspectionsForSelectedDate = inspections.filter((inspection) => isSameDay(inspection.createdAt, selectedDate));
  const datesWithInspections = inspections.map((inspection) => inspection.createdAt);

  const modifiers = {
    hasInspection: datesWithInspections,
  };

  const modifiersStyles = {
    hasInspection: {
      fontWeight: 'bold',
      textDecoration: 'underline',
      textDecorationColor: 'var(--color-primary)',
      textUnderlineOffset: '4px',
    },
  };

  const managedInspections = useMemo<ManagedInspection[]>(() => {
    return inspections.map((inspection, index) => {
      const assigned = index % 5 !== 0;
      const agent = assigned ? TEAM_MEMBERS[index % TEAM_MEMBERS.length] : null;
      const region = getRegion(inspection.propertyAddress);
      const isFuture = startOfDay(inspection.createdAt) > startOfDay(new Date());
      const duplicateWindow = inspections.filter((candidate) => (
        candidate.id !== inspection.id
        && isSameDay(candidate.createdAt, inspection.createdAt)
        && format(candidate.createdAt, 'HH:mm') === format(inspection.createdAt, 'HH:mm')
      )).length > 0;

      return {
        inspection,
        agent,
        region,
        isFuture,
        hasConflict: duplicateWindow && assigned,
      };
    });
  }, [inspections]);

  const managerFilteredInspections = useMemo(() => {
    return managedInspections.filter(({ inspection, agent, region }) => {
      const inspectionStatus = getScheduleStatus(inspection);
      const matchesAgent = agentFilter === 'all'
        ? true
        : agentFilter === 'sem_responsavel'
          ? agent === null
          : agent === agentFilter;
      const matchesStatus = statusFilter === 'all' ? true : inspectionStatus === statusFilter;
      const matchesType = typeFilter === 'all' ? true : inspection.type === typeFilter;
      const matchesRegion = regionFilter === 'all' ? true : region === regionFilter;
      const matchesSelectedDate = managerView === 'dia'
        ? isSameDay(inspection.createdAt, selectedDate)
        : true;
      const matchesView = managerView === 'sem_responsavel'
        ? agent === null
        : managerView === 'conflitos'
          ? managedInspections.some((item) => item.inspection.id === inspection.id && item.hasConflict)
          : true;

      return matchesAgent && matchesStatus && matchesType && matchesRegion && matchesSelectedDate && matchesView;
    });
  }, [agentFilter, managedInspections, managerView, regionFilter, selectedDate, statusFilter, typeFilter]);

  const snapshotMatchesFilters = (item: ManagerAgendaSnapshot) => {
    const matchesAgent = agentFilter === 'all'
      ? true
      : agentFilter === 'sem_responsavel'
        ? item.agent === null
        : item.agent === agentFilter;
    const matchesStatus = statusFilter === 'all' ? true : item.status === statusFilter;
    const matchesType = typeFilter === 'all' ? true : item.type === typeFilter;
    const matchesRegion = regionFilter === 'all' ? true : item.region === regionFilter;
    const matchesSelectedDate = managerView === 'dia' ? isSameDay(item.scheduledAt, selectedDate) : true;
    const matchesView = managerView === 'sem_responsavel'
      ? item.agent === null
      : managerView === 'conflitos'
        ? item.hasConflict
        : true;

    return matchesAgent && matchesStatus && matchesType && matchesRegion && matchesSelectedDate && matchesView;
  };

  const managerAgendaSnapshot = useMemo(() => {
    if (!isSameDay(selectedDate, new Date())) {
      return [];
    }

    return MANAGER_AGENDA_SNAPSHOT.filter(snapshotMatchesFilters);
  }, [agentFilter, managerView, regionFilter, selectedDate, statusFilter, typeFilter]);
  const hasManagerResults = managerAgendaSnapshot.length > 0 || managerFilteredInspections.length > 0;

  const managerLoad = useMemo(() => {
    return TEAM_MEMBERS.map((agent) => {
      const dailyInspections = managedInspections.filter(({ inspection, agent: assignedAgent }) => (
        assignedAgent === agent && isSameDay(inspection.createdAt, selectedDate)
      ));
      const seededCount = isSameDay(selectedDate, new Date()) ? TODAY_TEAM_LOAD[agent] ?? 0 : 0;
      const count = Math.max(dailyInspections.length, seededCount);

      return {
        agent,
        count,
        status: count >= 4 ? 'Sobrecarga' : count === 0 ? 'Ocioso' : 'Dentro da capacidade',
      };
    });
  }, [managedInspections, selectedDate]);

  const unassignedCount = managedInspections.filter(({ agent }) => agent === null).length;
  const conflictCount = managedInspections.filter(({ hasConflict }) => hasConflict).length;
  const unassignedDisplayCount = isSameDay(selectedDate, new Date())
    ? Math.max(unassignedCount, MANAGER_AGENDA_SNAPSHOT.filter((item) => item.agent === null).length)
    : unassignedCount;
  const conflictDisplayCount = isSameDay(selectedDate, new Date())
    ? Math.max(conflictCount, MANAGER_AGENDA_SNAPSHOT.filter((item) => item.hasConflict).length)
    : conflictCount;

  if (userView === 'imobiliaria') {
    return (
      <div className="min-h-screen pb-20 bg-background">
        <div className="bg-primary text-primary-foreground px-6 pt-12 pb-8">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="min-h-[4.75rem] min-w-0 flex-1">
              <h1 className="text-3xl font-medium mb-1">Agenda</h1>
              <p className="max-w-[15.5rem] text-sm leading-5 text-primary-foreground/80">
                Acompanhe agenda, conflitos e distribuição da equipe.
              </p>
            </div>
            <div className="shrink-0">
              <AccountMenu />
            </div>
          </div>
        </div>

        <div className="px-4 py-6">
          <div className="bg-card rounded-2xl border border-border p-2 mb-4 shadow-sm">
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
                months: 'w-full flex justify-center',
                month: 'w-full',
                table: 'w-full border-collapse',
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

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <p className="text-sm text-muted-foreground">Sem responsável</p>
              <p className="mt-2 text-2xl">{unassignedDisplayCount}</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <p className="text-sm text-muted-foreground">Conflitos de horário</p>
              <p className="mt-2 text-2xl">{conflictDisplayCount}</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-3xl p-4 shadow-sm mb-4 space-y-4">
            <div className="flex gap-2 overflow-x-auto">
              <button
                onClick={() => setManagerView('dia')}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                  managerView === 'dia' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                }`}
              >
                Lista do dia
              </button>
              <button
                onClick={() => setManagerView('sem_responsavel')}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                  managerView === 'sem_responsavel' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                }`}
              >
                Sem responsável
              </button>
              <button
                onClick={() => setManagerView('conflitos')}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                  managerView === 'conflitos' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                }`}
              >
                Conflitos de horário
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <select
                value={agentFilter}
                onChange={(event) => setAgentFilter(event.target.value)}
                className="h-12 rounded-xl border border-border bg-input-background px-4 text-sm"
              >
                <option value="all">Todos os corretores</option>
                <option value="sem_responsavel">Sem responsável</option>
                {TEAM_MEMBERS.map((member) => (
                  <option key={member} value={member}>{member}</option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as ManagerStatusFilter)}
                className="h-12 rounded-xl border border-border bg-input-background px-4 text-sm"
              >
                <option value="all">Todos os status</option>
                <option value="agendada">Agendadas</option>
                <option value="em_andamento">Em andamento</option>
                <option value="concluida">Concluídas</option>
              </select>
              <select
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value as 'all' | 'entrada' | 'saida')}
                className="h-12 rounded-xl border border-border bg-input-background px-4 text-sm"
              >
                <option value="all">Todos os tipos</option>
                <option value="entrada">Entrada</option>
                <option value="saida">Saída</option>
              </select>
              <select
                value={regionFilter}
                onChange={(event) => setRegionFilter(event.target.value)}
                className="h-12 rounded-xl border border-border bg-input-background px-4 text-sm"
              >
                <option value="all">Todas as regiões</option>
                <option value="Centro">Centro</option>
                <option value="Zona Sul">Zona Sul</option>
                <option value="Zona Norte">Zona Norte</option>
              </select>
            </div>
          </div>

          <div className="px-2 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-medium">
                {managerView === 'sem_responsavel'
                  ? 'Vistorias sem responsável'
                  : managerView === 'conflitos'
                    ? 'Conflitos de horário'
                    : `Operação em ${format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}`}
              </h2>
              <span className="text-sm text-muted-foreground">
                {Math.max(managerFilteredInspections.length, managerAgendaSnapshot.length)} item(ns)
              </span>
            </div>

            {managerAgendaSnapshot.length > 0 && (
              <div className="space-y-3 mb-3">
                {managerAgendaSnapshot.map((item) => (
                  <div key={item.id} className="bg-card rounded-2xl p-4 border border-border shadow-sm">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                            item.type === 'entrada' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                          }`}>
                            {item.type === 'entrada' ? 'Entrada' : 'Saída'}
                          </span>
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                            item.status === 'agendada'
                              ? 'bg-muted text-muted-foreground'
                              : item.status === 'em_andamento'
                                ? 'bg-primary/10 text-primary'
                                : 'bg-secondary text-secondary-foreground'
                          }`}>
                            {item.status === 'agendada'
                              ? 'Agendada'
                              : item.status === 'em_andamento'
                                ? 'Em andamento'
                                : 'Concluída'}
                          </span>
                          {item.hasConflict && (
                            <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-warning/10 text-warning">
                              Conflito
                            </span>
                          )}
                          {!item.agent && (
                            <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-destructive/10 text-destructive">
                              Sem responsável
                            </span>
                          )}
                        </div>
                        <h3 className="mb-1">{item.propertyAddress}</h3>
                        <p className="text-sm text-muted-foreground">
                          {format(item.scheduledAt, "dd/MM 'às' HH:mm", { locale: ptBR })} • {item.region}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs">
                        <UserRound className="size-3" />
                        {item.agent || 'Atribuir corretor'}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs">
                        <MapPin className="size-3" />
                        {item.region}
                      </span>
                    </div>

                    <div className="pt-3 border-t border-border flex flex-wrap gap-2">
                      <Button size="sm" variant="secondary">
                        Reatribuir
                      </Button>
                      <Button size="sm" variant="secondary">
                        Remanejar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!hasManagerResults ? (
              <div className="text-center py-8 px-6 bg-card rounded-2xl border border-border">
                <div className="size-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <CalendarIcon className="size-8 text-muted-foreground" />
                </div>
                <h3 className="mb-2">Nenhuma vistoria encontrada</h3>
                <p className="text-muted-foreground text-sm">
                  Ajuste os filtros ou selecione outro dia para acompanhar a equipe.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {managerFilteredInspections.map(({ inspection, agent, region, isFuture, hasConflict }) => (
                  <Link
                    key={inspection.id}
                    to={`/vistoria/${inspection.id}`}
                    className="block bg-card rounded-2xl p-4 border border-border hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                            inspection.type === 'entrada' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                          }`}>
                            {inspection.type === 'entrada' ? 'Entrada' : 'Saída'}
                          </span>
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                            getScheduleStatus(inspection) === 'agendada'
                              ? 'bg-muted text-muted-foreground'
                              : inspection.status === 'em_andamento'
                                ? 'bg-primary/10 text-primary'
                                : 'bg-secondary text-secondary-foreground'
                          }`}>
                            {getScheduleStatus(inspection) === 'agendada'
                              ? 'Agendada'
                              : inspection.status === 'em_andamento'
                                ? 'Em andamento'
                                : 'Concluída'}
                          </span>
                          {hasConflict && (
                            <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-warning/10 text-warning">
                              Conflito
                            </span>
                          )}
                          {!agent && (
                            <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-destructive/10 text-destructive">
                              Sem responsável
                            </span>
                          )}
                        </div>
                        <h3 className="mb-1">{inspection.propertyAddress}</h3>
                        <p className="text-sm text-muted-foreground">
                          {format(inspection.createdAt, "dd/MM 'às' HH:mm", { locale: ptBR })} • {region}
                        </p>
                      </div>
                      <ChevronRight className="size-5 text-muted-foreground shrink-0" />
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs">
                        <UserRound className="size-3" />
                        {agent || 'Atribuir corretor'}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs">
                        <MapPin className="size-3" />
                        {region}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs">
                        <CalendarIcon className="size-3" />
                        {isFuture ? 'Agendamento futuro' : 'Janela ativa'}
                      </span>
                    </div>

                    <div className="pt-3 border-t border-border flex flex-wrap gap-2">
                      <Button size="sm" variant="secondary">
                        Reatribuir
                      </Button>
                      <Button size="sm" variant="secondary">
                        Remanejar
                      </Button>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="px-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-medium">Carga diária por corretor</h2>
              <Link to="/corretores" className="text-sm text-primary">
                Ver corretores
              </Link>
            </div>

            <div className="space-y-3">
              {managerLoad.map((agent) => (
                <div key={agent.agent} className="bg-card rounded-2xl border border-border p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3>{agent.agent}</h3>
                      <p className="text-sm text-muted-foreground">
                        {agent.count} vistoria(s) em {format(selectedDate, 'dd/MM', { locale: ptBR })}
                      </p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs ${
                      agent.status === 'Sobrecarga'
                        ? 'bg-warning/10 text-warning'
                        : agent.status === 'Ocioso'
                          ? 'bg-muted text-muted-foreground'
                          : 'bg-success/10 text-success'
                    }`}>
                      {agent.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-background">
      <div className="bg-primary text-primary-foreground px-6 pt-12 pb-8">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="min-h-[4.75rem] min-w-0 flex-1">
            <h1 className="text-3xl font-medium mb-1">Calendário</h1>
            <p className="max-w-[15.5rem] text-sm leading-5 text-primary-foreground/80">
              Veja agendamentos e organize sua rotina em campo.
            </p>
          </div>
          <AccountMenu />
        </div>
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
              months: 'w-full flex justify-center',
              month: 'w-full',
              table: 'w-full border-collapse',
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
                        {format(inspection.createdAt, 'HH:mm', { locale: ptBR })}
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
              Irá agendar automaticamente para: {format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })}
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="min-w-0 flex-1">
                <Input
                  placeholder="Endereço do imóvel..."
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSchedule();
                  }}
                />
              </div>
              <Button
                onClick={handleSchedule}
                disabled={!newAddress.trim()}
                className="w-full sm:w-auto sm:shrink-0"
              >
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
