import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router';
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Search,
  UserRound,
  Users,
} from 'lucide-react';
import { BottomNav } from '../components/bottom-nav';
import { AccountMenu } from '../components/account-menu';
import { AccountStorage } from '../account-storage';
import { Input } from '../components/input';
import { Button } from '../components/button';
import { UserView } from '../types';

type BrokerStatus = 'ativo' | 'inativo';
type BrokerAvailability = 'disponivel' | 'em_campo' | 'sobrecarga' | 'folga';

interface Broker {
  id: string;
  name: string;
  region: string;
  status: BrokerStatus;
  availability: BrokerAvailability;
  workloadNow: number;
  inspectionsToday: number;
  inspectionsWeek: number;
  pendingAssignments: number;
  averageCompletion: string;
  availabilityLabel: string;
}

const BROKERS: Broker[] = [
  {
    id: 'broker-1',
    name: 'João da Silva',
    region: 'Centro',
    status: 'ativo',
    availability: 'em_campo',
    workloadNow: 2,
    inspectionsToday: 4,
    inspectionsWeek: 17,
    pendingAssignments: 1,
    averageCompletion: '1h28',
    availabilityLabel: 'Em campo até 14h30',
  },
  {
    id: 'broker-2',
    name: 'Ana Souza',
    region: 'Centro',
    status: 'ativo',
    availability: 'disponivel',
    workloadNow: 1,
    inspectionsToday: 3,
    inspectionsWeek: 14,
    pendingAssignments: 0,
    averageCompletion: '1h19',
    availabilityLabel: 'Livre para nova vistoria às 11h',
  },
  {
    id: 'broker-3',
    name: 'Carlos Lima',
    region: 'Zona Sul',
    status: 'ativo',
    availability: 'sobrecarga',
    workloadNow: 3,
    inspectionsToday: 5,
    inspectionsWeek: 19,
    pendingAssignments: 2,
    averageCompletion: '1h41',
    availabilityLabel: 'Carga alta no turno da tarde',
  },
  {
    id: 'broker-4',
    name: 'Beatriz Alves',
    region: 'Zona Norte',
    status: 'ativo',
    availability: 'sobrecarga',
    workloadNow: 3,
    inspectionsToday: 4,
    inspectionsWeek: 16,
    pendingAssignments: 1,
    averageCompletion: '1h35',
    availabilityLabel: 'Sem janela livre antes de 16h',
  },
  {
    id: 'broker-5',
    name: 'Mariana Costa',
    region: 'Zona Sul',
    status: 'ativo',
    availability: 'disponivel',
    workloadNow: 1,
    inspectionsToday: 2,
    inspectionsWeek: 11,
    pendingAssignments: 0,
    averageCompletion: '1h12',
    availabilityLabel: 'Disponível para remanejamento',
  },
  {
    id: 'broker-6',
    name: 'Felipe Rocha',
    region: 'Zona Norte',
    status: 'inativo',
    availability: 'folga',
    workloadNow: 0,
    inspectionsToday: 0,
    inspectionsWeek: 6,
    pendingAssignments: 0,
    averageCompletion: '1h24',
    availabilityLabel: 'Folga programada hoje',
  },
];

function getStatusLabel(status: BrokerStatus) {
  return status === 'ativo' ? 'Ativo' : 'Inativo';
}

function getAvailabilityLabel(availability: BrokerAvailability) {
  switch (availability) {
    case 'disponivel':
      return 'Disponível';
    case 'em_campo':
      return 'Em campo';
    case 'sobrecarga':
      return 'Sobrecarga';
    case 'folga':
      return 'Folga';
  }
}

export function BrokersPage() {
  const [userView, setUserView] = useState<UserView>(AccountStorage.getSelectedView());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | BrokerStatus>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | BrokerAvailability>('all');

  useEffect(() => {
    return AccountStorage.subscribe(() => setUserView(AccountStorage.getSelectedView()));
  }, []);

  const filteredBrokers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return BROKERS.filter((broker) => {
      const matchesSearch = normalizedSearch.length === 0
        ? true
        : broker.name.toLowerCase().includes(normalizedSearch)
          || broker.region.toLowerCase().includes(normalizedSearch);
      const matchesStatus = statusFilter === 'all' ? true : broker.status === statusFilter;
      const matchesAvailability = availabilityFilter === 'all' ? true : broker.availability === availabilityFilter;

      return matchesSearch && matchesStatus && matchesAvailability;
    });
  }, [availabilityFilter, search, statusFilter]);

  const summary = useMemo(() => ({
    activeNow: BROKERS.filter((broker) => broker.status === 'ativo').length,
    availableNow: BROKERS.filter((broker) => broker.availability === 'disponivel').length,
    overloadedNow: BROKERS.filter((broker) => broker.availability === 'sobrecarga').length,
    pendingAssignments: BROKERS.reduce((sum, broker) => sum + broker.pendingAssignments, 0),
    averageToday: '1h27',
  }), []);

  if (userView !== 'imobiliaria') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen pb-20 bg-background">
      <div className="bg-primary px-6 pt-12 pb-8 text-primary-foreground">
        <div className="mb-3 flex items-start justify-between gap-4">
          <div className="min-h-[4.75rem] min-w-0 flex-1">
            <h1 className="mb-1 text-3xl font-medium">Corretores</h1>
            <p className="max-w-[15.5rem] text-sm leading-5 text-primary-foreground/80">
              Acompanhe disponibilidade, carga e distribuição da equipe.
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
            <p className="text-sm text-muted-foreground">Ativos agora</p>
            <p className="mt-2 text-3xl">{summary.activeNow}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">Disponíveis</p>
            <p className="mt-2 text-3xl">{summary.availableNow}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">Sobrecarga</p>
            <p className="mt-2 text-3xl">{summary.overloadedNow}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">Pendências</p>
            <p className="mt-2 text-3xl">{summary.pendingAssignments}</p>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-1 mb-6 space-y-4">
        <div className="bg-card rounded-3xl border border-border p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg">Equipe operacional</h2>
              <p className="text-sm text-muted-foreground">
                Tempo médio de conclusão hoje: {summary.averageToday}
              </p>
            </div>
          </div>

          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por corretor ou região"
          />

          <div className="flex gap-2 overflow-x-auto pt-4">
            {[
              ['all', 'Todos'],
              ['ativo', 'Ativos'],
              ['inativo', 'Inativos'],
            ].map(([value, label]) => (
              <button
                key={value}
                onClick={() => setStatusFilter(value as 'all' | BrokerStatus)}
                className={`rounded-full px-4 py-2 text-sm whitespace-nowrap transition-colors ${
                  statusFilter === value ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-2 pt-4">
            <select
              value={availabilityFilter}
              onChange={(event) => setAvailabilityFilter(event.target.value as 'all' | BrokerAvailability)}
              className="h-12 rounded-xl border border-border bg-input-background px-4 text-sm"
            >
              <option value="all">Toda a disponibilidade</option>
              <option value="disponivel">Disponíveis</option>
              <option value="em_campo">Em campo</option>
              <option value="sobrecarga">Sobrecarga</option>
              <option value="folga">Folga</option>
            </select>
          </div>
        </div>
      </div>

      <div className="px-6 py-2">
        <div className="mb-3 flex items-center justify-between gap-4">
          <h2 className="text-lg font-medium">Lista da equipe</h2>
          <span className="text-sm text-muted-foreground">
            {filteredBrokers.length} corretor(es)
          </span>
        </div>

        {filteredBrokers.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card px-6 py-12 text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
              <Search className="size-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2">Nenhum corretor encontrado</h3>
            <p className="text-sm text-muted-foreground">
              Ajuste os filtros para revisar a disponibilidade da equipe.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBrokers.map((broker) => (
              <div key={broker.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs ${
                        broker.status === 'ativo'
                          ? 'bg-success/10 text-success'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {getStatusLabel(broker.status)}
                      </span>
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs ${
                        broker.availability === 'sobrecarga'
                          ? 'bg-warning/10 text-warning'
                          : broker.availability === 'disponivel'
                            ? 'bg-primary/10 text-primary'
                            : broker.availability === 'em_campo'
                              ? 'bg-secondary text-secondary-foreground'
                              : 'bg-muted text-muted-foreground'
                      }`}>
                        {getAvailabilityLabel(broker.availability)}
                      </span>
                    </div>
                    <h3 className="mb-1">{broker.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {broker.region} • {broker.availabilityLabel}
                    </p>
                  </div>
                  <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
                </div>

                <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-2xl bg-muted p-3 text-muted-foreground">
                    <p className="mb-1">Carga agora</p>
                    <p className="text-foreground">{broker.workloadNow} vistoria(s)</p>
                  </div>
                  <div className="rounded-2xl bg-muted p-3 text-muted-foreground">
                    <p className="mb-1">Hoje / semana</p>
                    <p className="text-foreground">{broker.inspectionsToday} hoje • {broker.inspectionsWeek} semana</p>
                  </div>
                  <div className="rounded-2xl bg-muted p-3 text-muted-foreground">
                    <p className="mb-1">Atribuições pendentes</p>
                    <p className="text-foreground">{broker.pendingAssignments}</p>
                  </div>
                  <div className="rounded-2xl bg-muted p-3 text-muted-foreground">
                    <p className="mb-1">Tempo médio</p>
                    <p className="text-foreground">{broker.averageCompletion}</p>
                  </div>
                </div>

                <div className="mb-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                    <Users className="size-3" />
                    {broker.status === 'ativo' ? 'Em escala hoje' : 'Fora da escala'}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                    <CalendarClock className="size-3" />
                    {broker.availabilityLabel}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                    <Clock3 className="size-3" />
                    Conclusão média {broker.averageCompletion}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 border-t border-border pt-3">
                  <Button size="sm" variant="secondary">
                    <UserRound className="size-3" />
                    Atribuir vistoria
                  </Button>
                  <Button size="sm" variant="secondary">
                    Reatribuir carga
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-warning/10 text-warning">
              <AlertTriangle className="size-5" />
            </div>
            <div className="min-w-0">
              <h3 className="mb-1">Atenção do dia</h3>
              <p className="text-sm text-muted-foreground">
                Carlos Lima e Beatriz Alves estão com sobrecarga, enquanto Mariana Costa pode absorver remanejamentos.
              </p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
            <Link to="/vistorias">
              <Button size="sm" variant="secondary">
                <CheckCircle2 className="size-3" />
                Ver operação
              </Button>
            </Link>
            <Link to="/calendario">
              <Button size="sm" variant="secondary">Abrir agenda</Button>
            </Link>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
