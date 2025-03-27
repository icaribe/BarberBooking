import { Link, useLocation } from 'wouter';
import { Home, Calendar, ShoppingBag, User } from 'lucide-react';

const BottomNav = () => {
  const [location] = useLocation();
  
  return (
    <nav className="flex justify-around items-center py-3 bg-background border-t border-border text-muted-foreground fixed bottom-0 w-full z-30">
      <Link href="/">
        <a className={`flex flex-col items-center ${location === '/' ? 'text-primary' : ''}`}>
          <Home className="w-5 h-5" />
          <span className="text-xs mt-1">Início</span>
        </a>
      </Link>
      <Link href="/appointments">
        <a className={`flex flex-col items-center ${location === '/appointments' ? 'text-primary' : ''}`}>
          <Calendar className="w-5 h-5" />
          <span className="text-xs mt-1">Agenda</span>
        </a>
      </Link>
      <Link href="/products">
        <a className={`flex flex-col items-center ${location === '/products' ? 'text-primary' : ''}`}>
          <ShoppingBag className="w-5 h-5" />
          <span className="text-xs mt-1">Produtos</span>
        </a>
      </Link>
      <Link href="/profile">
        <a className={`flex flex-col items-center ${location === '/profile' ? 'text-primary' : ''}`}>
          <User className="w-5 h-5" />
          <span className="text-xs mt-1">Perfil</span>
        </a>
      </Link>
    </nav>
  );
};

export default BottomNav;
