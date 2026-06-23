import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, BadgeCheck, Building2, Camera, Check, CreditCard, Eye, Mail, UserRound } from 'lucide-react';
import { Link } from 'react-router';
import { BottomNav } from '../components/bottom-nav';
import { Button } from '../components/button';
import { Input } from '../components/input';
import { AccountStorage } from '../account-storage';
import { SUBSCRIPTION_PLANS, SubscriptionPlanId, USER_VIEW_OPTIONS, UserProfile } from '../types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function AccountSettingsPage() {
  const [profile, setProfile] = useState<UserProfile>(AccountStorage.get());
  const [saved, setSaved] = useState(false);
  const [pendingPlanRequest, setPendingPlanRequest] = useState<{
    agencyId: string;
    agencyName: string;
    planId: SubscriptionPlanId;
    planName: string;
  } | null>(null);
  const [planRequestDialog, setPlanRequestDialog] = useState<{
    agencyName: string;
    planName: string;
  } | null>(null);

  useEffect(() => {
    setProfile(AccountStorage.get());
  }, []);

  const agencyCountLabel = useMemo(() => (
    `${profile.agencies.length} ${profile.agencies.length === 1 ? 'imobiliária vinculada' : 'imobiliárias vinculadas'}`
  ), [profile.agencies.length]);

  const agencyPlansLabel = useMemo(
    () => profile.agencies
      .map((agency) => SUBSCRIPTION_PLANS.find((plan) => plan.id === agency.selectedPlanId)?.name || 'Basic')
      .join(' • '),
    [profile.agencies]
  );

  const selectedView = useMemo(
    () => USER_VIEW_OPTIONS.find((option) => option.id === profile.userView) || USER_VIEW_OPTIONS[0],
    [profile.userView]
  );
  const isManagerView = profile.userView === 'imobiliaria';

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setProfile((current) => ({
        ...current,
        photoDataUrl: typeof reader.result === 'string' ? reader.result : current.photoDataUrl,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = () => {
    AccountStorage.save(profile);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  const handleAgencyPlanSelect = (agencyId: string, planId: SubscriptionPlanId) => {
    const currentAgency = profile.agencies.find((agency) => agency.id === agencyId);
    if (!currentAgency || currentAgency.selectedPlanId === planId) return;

    const selectedPlan = SUBSCRIPTION_PLANS.find((plan) => plan.id === planId) || SUBSCRIPTION_PLANS[0];

    setPendingPlanRequest({
      agencyId,
      agencyName: currentAgency.name,
      planId,
      planName: selectedPlan.name,
    });
  };

  const handleConfirmPlanRequest = () => {
    if (!pendingPlanRequest) return;

    const updatedProfile = {
      ...profile,
      agencies: profile.agencies.map((agency) => (
        agency.id === pendingPlanRequest.agencyId
          ? {
              ...agency,
              pendingPlanChangeRequest: {
                requestedPlanId: pendingPlanRequest.planId,
                status: 'pendente',
                requestedAt: new Date().toISOString(),
                reviewedAt: undefined,
              },
            }
          : agency
      )),
    };

    setProfile(updatedProfile);
    AccountStorage.save(updatedProfile);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
    setPlanRequestDialog({
      agencyName: pendingPlanRequest.agencyName,
      planName: pendingPlanRequest.planName,
    });
    setPendingPlanRequest(null);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-primary px-6 pt-12 pb-8 text-primary-foreground">
        <div className="mb-5 flex items-center justify-between gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm transition-colors hover:bg-white/15"
          >
            <ArrowLeft className="size-4" />
            Voltar
          </Link>

          {saved && (
            <div className="rounded-xl bg-white/10 px-3 py-2 text-sm">
              Alterações salvas
            </div>
          )}
        </div>

        <div>
          <h1 className="text-3xl leading-tight">Conta e ajustes</h1>
          <p className="mt-2 text-sm text-primary-foreground/80">
            Gerencie perfil, foto e preferências da conta.
          </p>
        </div>
      </div>

      <div className="space-y-6 px-6 py-6">
        <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-4">
            <div className="relative">
              {profile.photoDataUrl ? (
                <img
                  src={profile.photoDataUrl}
                  alt="Foto do perfil"
                  className="size-20 rounded-3xl object-cover"
                />
              ) : (
                <div className="flex size-20 items-center justify-center rounded-3xl bg-primary text-2xl text-primary-foreground">
                  {getInitials(profile.name || 'Vistor')}
                </div>
              )}

              <label className="absolute -right-1 -bottom-1 flex size-9 cursor-pointer items-center justify-center rounded-2xl bg-foreground text-background shadow-md">
                <Camera className="size-4" />
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </label>
            </div>

            <div>
              <h2 className="text-lg">{profile.name || 'Seu perfil'}</h2>
              <p className="text-sm text-muted-foreground">{profile.role}</p>
              {!isManagerView && (
                <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-success/10 px-3 py-1 text-xs text-success">
                  <BadgeCheck className="size-3.5" />
                  {agencyCountLabel}
                </div>
              )}
              {!isManagerView && (
                <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                  <CreditCard className="size-3.5" />
                  {agencyPlansLabel}
                </div>
              )}
              <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                <Eye className="size-3.5" />
                {selectedView.label}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <UserRound className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Nome"
                value={profile.name}
                readOnly
                className="pl-11"
              />
            </div>

            <div className="relative">
              <Mail className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="email"
                placeholder="E-mail"
                value={profile.email}
                readOnly
                className="pl-11"
              />
            </div>

            {isManagerView && (
              <div className="relative">
                <Building2 className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Empresa"
                  value={profile.company}
                  onChange={(event) => setProfile((current) => ({ ...current, company: event.target.value }))}
                  className="pl-11"
                />
              </div>
            )}

            <Input
              placeholder="Cargo"
              value={profile.role}
              readOnly
            />

            <Button className="w-full" size="lg" onClick={handleSaveProfile}>
              Salvar perfil
            </Button>
          </div>
        </section>

        {!isManagerView && (
          <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-5 flex items-start gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Building2 className="size-5" />
              </div>
              <div>
                <h2 className="text-lg">Imobiliárias vinculadas</h2>
                <p className="text-sm text-muted-foreground">
                  Cada vínculo possui um plano independente para a operação em cada imobiliária.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {profile.agencies.map((agency) => {
                const selectedAgencyPlan = SUBSCRIPTION_PLANS.find((plan) => plan.id === agency.selectedPlanId) || SUBSCRIPTION_PLANS[0];
                const requestedAgencyPlan = agency.pendingPlanChangeRequest
                  ? SUBSCRIPTION_PLANS.find((plan) => plan.id === agency.pendingPlanChangeRequest?.requestedPlanId) || SUBSCRIPTION_PLANS[0]
                  : null;
                const requestStatus = agency.pendingPlanChangeRequest?.status;
                const hasPendingRequest = requestStatus === 'pendente';
                const hasApprovedRequest = requestStatus === 'aprovado';
                const hasRejectedRequest = requestStatus === 'recusado';

                return (
                  <div key={agency.id} className="rounded-3xl border border-border bg-background p-5">
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="relative">
                          <Building2 className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            placeholder="Nome da imobiliária"
                            value={agency.name}
                            readOnly
                            className="pl-11"
                          />
                        </div>
                        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                          <CreditCard className="size-3.5" />
                          Plano {selectedAgencyPlan.name}
                        </div>
                        {hasPendingRequest && requestedAgencyPlan && (
                          <div className="mt-2 rounded-2xl border border-warning/20 bg-warning/10 px-3 py-2 text-xs text-warning">
                            Solicitação em análise: mudança para o plano {requestedAgencyPlan.name}.
                            Aguarde o retorno da imobiliária para pedir uma nova alteração.
                          </div>
                        )}
                        {hasApprovedRequest && requestedAgencyPlan && (
                          <div className="mt-2 rounded-2xl border border-success/20 bg-success/10 px-3 py-2 text-xs text-success">
                            Solicitação aprovada pela imobiliária. O plano {requestedAgencyPlan.name} já está ativo.
                          </div>
                        )}
                        {hasRejectedRequest && requestedAgencyPlan && (
                          <div className="mt-2 rounded-2xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                            Solicitação recusada pela imobiliária para o plano {requestedAgencyPlan.name}.
                            Você pode enviar um novo pedido quando quiser.
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-3">
                      {SUBSCRIPTION_PLANS.map((plan) => {
                        const isSelected = plan.id === agency.selectedPlanId;
                        const isRequested = hasPendingRequest && agency.pendingPlanChangeRequest?.requestedPlanId === plan.id;
                        const isApprovedRequest = hasApprovedRequest && agency.pendingPlanChangeRequest?.requestedPlanId === plan.id;
                        const isRejectedRequest = hasRejectedRequest && agency.pendingPlanChangeRequest?.requestedPlanId === plan.id;

                        return (
                          <button
                            key={plan.id}
                            type="button"
                            onClick={() => handleAgencyPlanSelect(agency.id, plan.id)}
                            disabled={hasPendingRequest}
                            className={`w-full rounded-3xl border p-5 text-left transition-all ${
                              isSelected
                                ? 'border-primary bg-primary/5 shadow-sm'
                                : isRequested
                                  ? 'border-warning bg-warning/5 shadow-sm'
                                  : 'border-border bg-card hover:border-primary/30'
                            } ${
                              hasPendingRequest ? 'cursor-not-allowed opacity-70' : ''
                            }`}
                          >
                            <div className="mb-4 flex items-start justify-between gap-4">
                              <div>
                                <div className="mb-2 flex items-center gap-2">
                                  <h3 className="text-xl">{plan.name}</h3>
                                  {isSelected && (
                                    <span className="rounded-full bg-primary px-2.5 py-1 text-xs text-primary-foreground">
                                      Atual
                                    </span>
                                  )}
                                  {isRequested && (
                                    <span className="rounded-full bg-warning px-2.5 py-1 text-xs text-warning-foreground">
                                      Em análise
                                    </span>
                                  )}
                                  {isApprovedRequest && (
                                    <span className="rounded-full bg-success px-2.5 py-1 text-xs text-success-foreground">
                                      Aprovado
                                    </span>
                                  )}
                                  {isRejectedRequest && (
                                    <span className="rounded-full bg-destructive px-2.5 py-1 text-xs text-destructive-foreground">
                                      Recusado
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">{plan.description}</p>
                              </div>

                              <div
                                className={`mt-1 flex size-7 shrink-0 items-center justify-center rounded-full border ${
                                  isSelected
                                    ? 'border-primary bg-primary text-primary-foreground'
                                    : isRequested
                                      ? 'border-warning bg-warning text-warning-foreground'
                                    : 'border-border text-transparent'
                                }`}
                              >
                                <Check className="size-4" />
                              </div>
                            </div>

                            <div className="mb-4 flex items-end justify-between gap-4">
                              <div>
                                <p className="text-3xl">{formatCurrency(plan.monthlyPrice)}</p>
                                <p className="text-sm text-muted-foreground">por mês</p>
                              </div>

                              <div className="text-right text-sm text-muted-foreground">
                                <p>{plan.features.length} recursos incluídos</p>
                                <p>{agency.name}</p>
                              </div>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                              {plan.features.map((feature) => (
                                <span
                                  key={feature}
                                  className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground"
                                >
                                  {feature}
                                </span>
                              ))}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>

      <BottomNav />

      <AlertDialog open={pendingPlanRequest !== null} onOpenChange={(open) => !open && setPendingPlanRequest(null)}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)] rounded-[2rem] border-border p-6">
          <AlertDialogHeader className="text-left">
            <AlertDialogTitle className="text-2xl leading-tight">Confirmar solicitação</AlertDialogTitle>
            <AlertDialogDescription className="text-sm leading-6">
              {pendingPlanRequest
                ? `Deseja realmente solicitar a alteração para o plano ${pendingPlanRequest.planName} na ${pendingPlanRequest.agencyName}?`
                : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel className="w-full sm:w-auto">Cancelar</AlertDialogCancel>
            <AlertDialogAction className="w-full sm:w-auto" onClick={handleConfirmPlanRequest}>
              Confirmar solicitação
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={planRequestDialog !== null} onOpenChange={(open) => !open && setPlanRequestDialog(null)}>
        <DialogContent className="overflow-hidden rounded-[2rem] border-border p-0">
          <div className="px-6 py-6">
            <DialogHeader className="text-left">
              <DialogTitle className="text-2xl leading-tight">Solicitação enviada</DialogTitle>
              <DialogDescription className="text-sm leading-6">
                {planRequestDialog
                  ? `A solicitação para alterar o plano para ${planRequestDialog.planName} na ${planRequestDialog.agencyName} está sendo enviada para análise da imobiliária.`
                  : ''}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6">
              <Button className="w-full" size="lg" onClick={() => setPlanRequestDialog(null)}>
                Entendi
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
