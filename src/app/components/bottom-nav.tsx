import { useEffect, useState } from 'react';
import { ClipboardList, Home, Calendar, Users } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { AccountStorage } from '../account-storage';
import { cn } from '../../lib/utils';

export function BottomNav() {
  const location = useLocation();
  const [userView, setUserView] = useState(AccountStorage.getSelectedView());

  useEffect(() => {
    const sync = () => {
      setUserView(AccountStorage.getSelectedView());
    };

    return AccountStorage.subscribe(sync);
  }, []);

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const isManagerView = userView === 'imobiliaria';

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-area-inset-bottom">
      <div className={cn(
        'mx-auto grid max-w-md items-center h-16',
        isManagerView ? 'grid-cols-4' : 'grid-cols-3'
      )}>
        <Link
          to="/"
          className={cn(
            'flex flex-col items-center gap-1 px-3 py-2 transition-colors',
            isActive('/') ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          <Home className="size-5" />
          <span className="text-xs">Início</span>
        </Link>

        <Link
          to="/vistorias"
          className={cn(
            'flex flex-col items-center gap-1 px-3 py-2 transition-colors',
            isActive('/vistorias') || isActive('/vistoria/') ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          <ClipboardList className="size-5" />
          <span className="text-xs">{isManagerView ? 'Operação' : 'Vistorias'}</span>
        </Link>

        {isManagerView && (
          <Link
            to="/corretores"
            className={cn(
              'flex flex-col items-center gap-1 px-3 py-2 transition-colors',
              isActive('/corretores') ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <Users className="size-5" />
            <span className="text-xs">Corretores</span>
          </Link>
        )}

        <Link
          to="/calendario"
          className={cn(
            'flex flex-col items-center gap-1 px-3 py-2 transition-colors',
            isActive('/calendario') ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          <Calendar className="size-5" />
          <span className="text-xs">{isManagerView ? 'Agenda' : 'Calendário'}</span>
        </Link>
      </div>
    </nav>
  );
}
