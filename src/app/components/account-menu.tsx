import { useEffect, useMemo, useState } from 'react';
import { LogOut, Settings2 } from 'lucide-react';
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
import { SUBSCRIPTION_PLANS, UserProfile } from '../types';

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
  const selectedPlan = useMemo(
    () => SUBSCRIPTION_PLANS.find((plan) => plan.id === profile.selectedPlanId) || SUBSCRIPTION_PLANS[0],
    [profile.selectedPlanId]
  );

  useEffect(() => {
    const sync = () => setProfile(AccountStorage.get());
    return AccountStorage.subscribe(sync);
  }, []);

  return (
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

      <DropdownMenuContent align="end" className="w-60 rounded-2xl p-2">
        <DropdownMenuLabel className="px-3 py-2">
          <p className="text-sm font-medium text-foreground">{profile.name}</p>
          <p className="text-xs text-muted-foreground">{profile.email}</p>
          <p className="mt-1 text-xs text-primary">Plano {selectedPlan.name}</p>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

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
  );
}
