import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, BadgeCheck, Building2, Camera, Check, CreditCard, Eye, Mail, UserRound } from 'lucide-react';
import { Link } from 'react-router';
import { BottomNav } from '../components/bottom-nav';
import { Button } from '../components/button';
import { Input } from '../components/input';
import { AccountStorage } from '../account-storage';
import { SUBSCRIPTION_PLANS, SubscriptionPlanId, USER_VIEW_OPTIONS, UserProfile } from '../types';

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

  useEffect(() => {
    setProfile(AccountStorage.get());
  }, []);

  const selectedPlan = useMemo(
    () => SUBSCRIPTION_PLANS.find((plan) => plan.id === profile.selectedPlanId) || SUBSCRIPTION_PLANS[0],
    [profile.selectedPlanId]
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

  const handlePlanSelect = (planId: SubscriptionPlanId) => {
    const updated = { ...profile, selectedPlanId: planId };
    setProfile(updated);
    AccountStorage.save(updated);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
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
                  Plano atual: {selectedPlan.name}
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

            <div className="relative">
              <Building2 className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Empresa"
                value={profile.company}
                onChange={(event) => setProfile((current) => ({ ...current, company: event.target.value }))}
                className="pl-11"
              />
            </div>

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
                <CreditCard className="size-5" />
              </div>
              <div>
                <h2 className="text-lg">Assinatura</h2>
                <p className="text-sm text-muted-foreground">
                  Escolha o plano ideal para o nível de operação e automação desejado.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {SUBSCRIPTION_PLANS.map((plan) => {
                const isSelected = plan.id === profile.selectedPlanId;

                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => handlePlanSelect(plan.id)}
                    className={`w-full rounded-3xl border p-5 text-left transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border bg-background hover:border-primary/30'
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
                        </div>
                        <p className="text-sm text-muted-foreground">{plan.description}</p>
                      </div>

                      <div
                        className={`mt-1 flex size-7 shrink-0 items-center justify-center rounded-full border ${
                          isSelected
                            ? 'border-primary bg-primary text-primary-foreground'
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
                        <p>Plano {plan.name}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {plan.features.map((feature) => (
                        <span
                          key={feature}
                          className="rounded-full bg-card px-3 py-1 text-xs text-muted-foreground border border-border"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
