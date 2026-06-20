import { useEffect, useMemo, useState } from 'react';
import { Building2, Eye, LogOut, Settings2, UserRound } from 'lucide-react';
import { Link } from 'react-router';
import { AccountStorage } from '../account-storage';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { SUBSCRIPTION_PLANS, USER_VIEW_OPTIONS, UserProfile, UserView } from '../types';

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function AccountMenu() {
  const [profile, setProfile] = useState<UserProfile>(AccountStorage.get());
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const selectedPlan = useMemo(
    () => SUBSCRIPTION_PLANS.find((plan) => plan.id === profile.selectedPlanId) || SUBSCRIPTION_PLANS[0],
    [profile.selectedPlanId]
  );

  useEffect(() => {
    const sync = () => setProfile(AccountStorage.get());
    return AccountStorage.subscribe(sync);
  }, []);

  const handleViewSelect = (userView: UserView) => {
    AccountStorage.update({
      userView,
      role: userView === 'corretor' ? 'Corretor / Vistoriador' : 'Gestora da imobiliária',
    });
    setIsViewDialogOpen(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Abrir menu da conta"
            className="flex size-11 items-center justify-center overflow-hidden rounded-2xl bg-white/12 text-primary-foreground transition-colors hover:bg-white/18"
          >
            {profile.photoDataUrl ? (
              <img src={profile.photoDataUrl} alt="Perfil" className="size-full object-cover" />
            ) : (
              <span className="text-sm font-medium">{getInitials(profile.name || 'VA')}</span>
            )}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2">
          <DropdownMenuLabel className="px-3 py-2">
            <p className="text-sm font-medium text-foreground">{profile.name}</p>
            <p className="text-xs text-muted-foreground">{profile.email}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {AccountStorage.getViewLabel(profile.userView)}
            </p>
            {profile.userView === 'corretor' && (
              <p className="mt-1 text-xs text-primary">Plano {selectedPlan.name}</p>
            )}
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="rounded-xl px-3 py-2"
            onSelect={(event) => {
              event.preventDefault();
              setIsViewDialogOpen(true);
            }}
          >
            <Eye className="size-4" />
            Trocar visualização
          </DropdownMenuItem>

          <DropdownMenuItem asChild className="rounded-xl px-3 py-2">
            <Link to="/conta">
              <Settings2 className="size-4" />
              Conta e ajustes
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild className="rounded-xl px-3 py-2">
            <Link to="/login">
              <LogOut className="size-4" />
              Sair
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="rounded-[2rem] border-border p-0 overflow-hidden">
          <div className="px-6 pt-6 pb-5">
            <DialogHeader className="text-left">
              <DialogTitle className="text-2xl leading-tight">Escolha a visualização</DialogTitle>
              <DialogDescription>
                Altere a experiência do app entre a visão de corretor e de imobiliária.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="grid gap-3 px-6 pb-6">
            {USER_VIEW_OPTIONS.map((option) => {
              const isSelected = option.id === profile.userView;
              const Icon = option.id === 'corretor' ? UserRound : Building2;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleViewSelect(option.id)}
                  className={`flex items-start gap-3 rounded-3xl border p-4 text-left transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border bg-card hover:border-primary/30'
                  }`}
                >
                  <div className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${
                    isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    <Icon className="size-5" />
                  </div>

                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <h3 className="text-base">{option.label}</h3>
                      {isSelected && (
                        <span className="rounded-full bg-primary px-2.5 py-1 text-xs text-primary-foreground">
                          Atual
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                  <Eye className="mt-1 size-4 shrink-0 text-muted-foreground" />
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
