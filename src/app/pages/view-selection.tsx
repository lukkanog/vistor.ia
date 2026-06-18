import { Building2, ChevronRight, UserRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import logo from '../../assets/logo.png';
import { Button } from '../components/button';
import { AccountStorage } from '../account-storage';
import { USER_VIEW_OPTIONS, UserView } from '../types';

export function ViewSelectionPage() {
  const navigate = useNavigate();

  const handleSelect = (userView: UserView) => {
    AccountStorage.update({
      userView,
      role: userView === 'corretor' ? 'Corretor / Vistoriador' : 'Gestor da imobiliária',
    });

    navigate('/');
  };

  return (
    <div className="min-h-screen bg-primary">
      <div className="px-6 pt-14 pb-10 text-primary-foreground">
        <img src={logo} alt="vistor.ia" className="h-14 w-auto object-contain brightness-0 invert" />
      </div>

      <div className="min-h-[calc(100vh-8.5rem)] rounded-t-[2rem] bg-background px-6 pt-8 pb-10">
        <div className="mx-auto max-w-sm">
          <div className="mb-8">
            <h1 className="text-[2rem] leading-tight text-foreground">Escolha a visualização</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Escolha como deseja navegar pelo app neste momento.
            </p>
          </div>

          <div className="space-y-3">
            {USER_VIEW_OPTIONS.map((option) => {
              const Icon = option.id === 'corretor' ? UserRound : Building2;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleSelect(option.id)}
                  className="flex w-full items-start gap-3 rounded-3xl border border-border bg-card p-5 text-left shadow-sm transition-colors hover:border-primary/30"
                >
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>

                  <div className="flex-1">
                    <h2 className="text-lg">{option.label}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{option.description}</p>
                  </div>

                  <ChevronRight className="mt-1 size-5 shrink-0 text-muted-foreground" />
                </button>
              );
            })}
          </div>

          <div className="mt-6 text-center">
            <Link to="/conta" className="text-sm text-primary">
              Depois você poderá alternar isso em Conta e ajustes
            </Link>
          </div>

          <div className="mt-4">
            <Button variant="secondary" className="w-full" onClick={() => navigate('/')}>
              Pular por enquanto
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
