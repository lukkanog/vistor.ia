import { Home, Plus, Calendar } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { cn } from '../../lib/utils';

export function BottomNav() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-area-inset-bottom">
      <div className="max-w-md mx-auto flex items-center justify-around h-16">
        <Link
          to="/"
          className={cn(
            'flex flex-col items-center gap-1 px-6 py-2 transition-colors',
            isActive('/') ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          <Home className="size-5" />
          <span className="text-xs">Início</span>
        </Link>

        <Link
          to="/nova-vistoria"
          className="flex items-center justify-center size-14 -mt-8 bg-primary text-primary-foreground rounded-full shadow-lg active:scale-95 transition-transform"
        >
          <Plus className="size-6" />
        </Link>

        <Link
          to="/calendario"
          className={cn(
            'flex flex-col items-center gap-1 px-6 py-2 transition-colors',
            isActive('/calendario') ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          <Calendar className="size-5" />
          <span className="text-xs">Calendário</span>
        </Link>
      </div>
    </nav>
  );
}
