import { Link, useLocation } from 'wouter';
import { Home, Calendar, ShoppingBag, User } from 'lucide-react';

const BottomNav = () => {
  const [location] = useLocation();
  
  return (
    <nav className="flex justify-around items-center py-3 bg-background border-t border-border text-muted-foreground fixed bottom-0 w-full z-30">
      <Link href="/">
        <div className={`flex flex-col items-center ${location === '/' ? 'text-primary' : ''}`}>
          <Home className="w-5 h-5" />
          <span className="text-xs mt-1">Início</span>
        </div>
      </Link>
      <Link href="/appointments">
        <div className={`flex flex-col items-center ${location === '/appointments' ? 'text-primary' : ''}`}>
          <Calendar className="w-5 h-5" />
          <span className="text-xs mt-1">Agenda</span>
        </div>
      </Link>
      <Link href="/products">
        <div className={`flex flex-col items-center ${location === '/products' ? 'text-primary' : ''}`}>
          <ShoppingBag className="w-5 h-5" />
          <span className="text-xs mt-1">Produtos</span>
        </div>
      </Link>
      <Link href="/profile">
        <div className={`flex flex-col items-center ${location === '/profile' ? 'text-primary' : ''}`}>
          <User className="w-5 h-5" />
          <span className="text-xs mt-1">Perfil</span>
        </div>
      </Link>
    </nav>
  );
};

export default BottomNav;
