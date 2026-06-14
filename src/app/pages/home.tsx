import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
  AlertTriangle,
  CalendarClock,
  Camera,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  FileText,
  FolderOpen,
  Plus,
  ShieldCheck,
  Signature,
} from 'lucide-react';
import { BottomNav } from '../components/bottom-nav';
import { AccountMenu } from '../components/account-menu';
import logo from '../../assets/logo.png';
import { Inspection } from '../types';
import { InspectionStorage } from '../storage';
import { Button } from '../components/button';
import { format, isToday, isTomorrow, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { seedMockData } from '../seed';

export function HomePage() {
  const [inspections, setInspections] = useState<Inspection[]>([]);

  useEffect(() => {
    seedMockData();
    loadInspections();
  }, []);

  const loadInspections = () => {
    const data = InspectionStorage.getAll();
    setInspections(data.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
  };

  const today = startOfDay(new Date());
  const inspectionsToday = inspections.filter((inspection) => isToday(inspection.createdAt));
  const activeInspections = inspections.filter((inspection) => (
    inspection.status === 'em_andamento' && startOfDay(inspection.createdAt) <= today
  ));
  const scheduledInspections = inspections.filter((inspection) => startOfDay(inspection.createdAt) > today);
  const pendingSignatureInspections = inspections.filter((inspection) =>
    inspection.signatures?.some((signature) => signature.status === 'pendente')
  );
  const completedInspections = inspections.filter((inspection) => inspection.status === 'concluida');
  const allIssues = inspections.reduce(
    (sum, inspection) => sum + inspection.rooms.reduce((roomSum, room) => roomSum + room.items.length, 0),
    0
  );
  const allPhotos = inspections.reduce(
    (sum, inspection) => sum + inspection.rooms.reduce((roomSum, room) => roomSum + room.photos.length, 0),
    0
  );

  const nextInspection = activeInspections[0] || scheduledInspections[0];
  const nextPendingSignature = pendingSignatureInspections[0];
  const reportReadyInspection = completedInspections.find((inspection) => !inspection.signatures?.length)
    || completedInspections[0];

  const getInspectionProgress = (inspection: Inspection) => {
    return Math.round(((inspection.currentRoomIndex + 1) / inspection.rooms.length) * 100);
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

  const getActionLabel = (inspection: Inspection) => {
    if (inspection.status === 'em_andamento') {
      return startOfDay(inspection.createdAt) > today ? 'Preparar vistoria' : 'Continuar vistoria';
    }

    return 'Abrir vistoria';
  };

  const getScheduleLabel = (inspection: Inspection) => {
    if (isToday(inspection.createdAt)) {
      return `Hoje, ${format(inspection.createdAt, 'HH:mm', { locale: ptBR })}`;
    }

    if (isTomorrow(inspection.createdAt)) {
      return `Amanhã, ${format(inspection.createdAt, 'HH:mm', { locale: ptBR })}`;
    }

    return format(inspection.createdAt, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR });
  };

  return (
    <div className="min-h-screen pb-20 bg-background">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 bg-primary text-primary-foreground">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="pb-2 border-b-[3px] border-white/40 w-fit">
            <img src={logo} alt="Logo" className="h-12 w-auto object-contain brightness-0 invert" />
          </div>
          <AccountMenu />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl leading-tight max-w-sm">Início</h1>
          {inspections.length > 0 && (
            <p className="text-sm text-primary-foreground/80 max-w-sm">
              {inspectionsToday.length} hoje • {pendingSignatureInspections.length} assinaturas pendentes • {scheduledInspections.length} agendadas
            </p>
          )}
          {inspections.length === 0 && (
            <p className="text-sm text-primary-foreground/80 max-w-sm">
              Organize visitas, acompanhe pendências e finalize laudos em um só fluxo.
            </p>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="px-6 pt-6 mb-6">
        <div className="mb-4">
          <h2 className="text-lg">Resumo</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="relative bg-card border border-border rounded-2xl p-4 shadow-sm min-h-36 flex flex-col">
            <ClipboardCheck className="absolute top-4 right-4 size-4 text-primary" />
            <div className="mb-6 pr-8">
              <span className="text-sm text-muted-foreground">Vistorias de hoje</span>
            </div>
            <div className="mt-auto">
              <p className="text-3xl">{inspectionsToday.length}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {activeInspections.length} em campo
              </p>
            </div>
          </div>

          <div className="relative bg-card border border-border rounded-2xl p-4 shadow-sm min-h-36 flex flex-col">
            <Signature className="absolute top-4 right-4 size-4 text-warning" />
            <div className="mb-6 pr-8">
              <span className="text-sm text-muted-foreground">Assinaturas pendentes</span>
            </div>
            <div className="mt-auto">
              <p className="text-3xl">{pendingSignatureInspections.length}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {completedInspections.length} laudos concluídos
              </p>
            </div>
          </div>

          <div className="relative bg-card border border-border rounded-2xl p-4 shadow-sm min-h-36 flex flex-col">
            <Camera className="absolute top-4 right-4 size-4 text-success" />
            <div className="mb-6 pr-8">
              <span className="text-sm text-muted-foreground">Evidências coletadas</span>
            </div>
            <div className="mt-auto">
              <p className="text-3xl">{allPhotos}</p>
              <p className="text-sm text-muted-foreground mt-1">
                fotos anexadas
              </p>
            </div>
          </div>

          <div className="relative bg-card border border-border rounded-2xl p-4 shadow-sm min-h-36 flex flex-col">
            <AlertTriangle className="absolute top-4 right-4 size-4 text-destructive" />
            <div className="mb-6 pr-8">
              <span className="text-sm text-muted-foreground">Pontos registrados</span>
            </div>
            <div className="mt-auto">
              <p className="text-3xl">{allIssues}</p>
              <p className="text-sm text-muted-foreground mt-1">
                observações e avarias
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* In Progress */}
      <div className="px-6 mb-6 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg">Em andamento</h2>
          <Link to="/nova-vistoria">
            <Button size="sm">
              <Plus className="size-4" />
              Nova
            </Button>
          </Link>
        </div>

        {nextInspection && (
          <Link
            to={`/vistoria/${nextInspection.id}`}
            className="block rounded-3xl border border-primary/20 bg-primary text-primary-foreground p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-primary-foreground/70 mb-2">
                  Próxima melhor ação
                </p>
                <h3 className="text-xl leading-tight mb-1">{getActionLabel(nextInspection)}</h3>
                <p className="text-sm text-primary-foreground/80">
                  {nextInspection.propertyAddress}
                </p>
              </div>
              <ChevronRight className="size-5 shrink-0 text-primary-foreground/70" />
            </div>

            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-2xl bg-white/10 p-3">
                <p className="text-primary-foreground/70 mb-1">Agenda</p>
                <p>{getScheduleLabel(nextInspection)}</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-3">
                <p className="text-primary-foreground/70 mb-1">Progresso</p>
                <p>{getInspectionProgress(nextInspection)}%</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-3">
                <p className="text-primary-foreground/70 mb-1">Capturas</p>
                <p>{getInspectionPhotoCount(nextInspection)} fotos</p>
              </div>
            </div>
          </Link>
        )}

        <div className="grid gap-3">
          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-2xl bg-warning/10 text-warning flex items-center justify-center shrink-0">
                <Signature className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground mb-1">Pendência comercial</p>
                <h3 className="mb-1">Assinaturas para cobrar</h3>
                {nextPendingSignature ? (
                  <>
                    <p className="text-sm text-muted-foreground mb-3">
                      {nextPendingSignature.propertyAddress} • {getPendingSignatureCount(nextPendingSignature)} pendente(s)
                    </p>
                    <Link to={`/vistoria/${nextPendingSignature.id}/concluida`}>
                      <Button variant="secondary" size="sm">
                        <ShieldCheck className="size-4" />
                        Revisar pendências
                      </Button>
                    </Link>
                  </>
                ) : (
                  <p className="text-sm text-success">
                    Nenhuma assinatura pendente no momento.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-2xl bg-success/10 text-success flex items-center justify-center shrink-0">
                <FileText className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground mb-1">Entrega de resultado</p>
                <h3 className="mb-1">Laudos prontos para compartilhar</h3>
                {reportReadyInspection ? (
                  <>
                    <p className="text-sm text-muted-foreground mb-3">
                      {reportReadyInspection.propertyAddress}
                    </p>
                    <Link to={`/vistoria/${reportReadyInspection.id}/concluida`}>
                      <Button variant="secondary" size="sm">
                        <CheckCircle2 className="size-4" />
                        Abrir resumo final
                      </Button>
                    </Link>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Conclua uma vistoria para gerar um laudo compartilhável.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg">Acessos</h2>
          <Link to="/vistorias" className="text-sm text-primary">
            Ver tudo
          </Link>
        </div>

        <div className="grid gap-3">
          <Link
            to="/vistorias"
            className="bg-card border border-border rounded-2xl p-4 shadow-sm flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <FolderOpen className="size-5" />
              </div>
              <div>
                <p>Vistorias</p>
                <p className="text-sm text-muted-foreground">
                  {inspections.length} cadastradas
                </p>
              </div>
            </div>
            <ChevronRight className="size-5 text-muted-foreground" />
          </Link>

          <Link
            to="/calendario"
            className="bg-card border border-border rounded-2xl p-4 shadow-sm flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <CalendarClock className="size-5" />
              </div>
              <div>
                <p>Calendário</p>
                <p className="text-sm text-muted-foreground">
                  {scheduledInspections.length} agendadas
                </p>
              </div>
            </div>
            <ChevronRight className="size-5 text-muted-foreground" />
          </Link>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
