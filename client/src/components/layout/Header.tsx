import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, MapPin, Heart, User, Instagram, Facebook, Phone, ArrowLeft, Settings } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/lib/hooks/useAuth';
import logoPath from '@/assets/logo.jpeg';

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
}

const Header = ({ title, showBackButton }: HeaderProps) => {
  const [, navigate] = useLocation();
  return (
    <header className="px-4 py-3 flex justify-between items-center bg-background shadow-md sticky top-0 z-30">
      {showBackButton ? (
        <Button variant="ghost" size="icon" className="text-foreground" onClick={() => navigate('/')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
      ) : (
        <SidebarMenu />
      )}
      
      <div className="flex items-center">
        {!title ? (
          <>
            <img 
              src={logoPath} 
              alt="Los Barbeiros Logo" 
              className="h-8 w-8 mr-2 rounded-full object-cover" 
            />
            <h1 className="font-montserrat font-bold text-xl text-[#FFC107]">LOS BARBEIROS CBS</h1>
          </>
        ) : (
          <h1 className="font-montserrat font-semibold text-lg">{title}</h1>
        )}
      </div>
      
      <div className="flex items-center space-x-1">
        {!showBackButton && (
          <>
            <Button variant="ghost" size="icon" className="text-foreground" asChild>
              <a 
                href="https://www.google.com/maps/search/?api=1&query=-15.91295338%2C-47.76993942" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <MapPin className="h-5 w-5" />
              </a>
            </Button>
            <Button variant="ghost" size="icon" className="text-foreground" asChild>
              <Link href="/favorites">
                <Heart className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" className="text-foreground" asChild>
              <Link href="/profile">
                <User className="h-5 w-5" />
              </Link>
            </Button>
          </>
        )}
      </div>
    </header>
  );
};

const SidebarMenu = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'PROFESSIONAL';
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="text-foreground">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="bg-background border-r border-border p-0 w-[280px]">
        <div className="p-4 border-b border-border">
          <div className="flex items-center mb-6">
            <img 
              src={logoPath} 
              alt="Los Barbeiros Logo" 
              className="h-10 w-10 mr-3 rounded-full object-cover" 
            />
            <h2 className="font-montserrat font-bold text-lg text-[#FFC107]">LOS BARBEIROS CBS</h2>
          </div>
          
          <nav>
            <ul className="space-y-3">
              <li>
                <Link href="/">
                  <div className="flex items-center py-2 px-3 rounded-md hover:bg-secondary text-foreground">
                    <span className="mr-3">🏠</span>
                    <span>Início</span>
                  </div>
                </Link>
              </li>
              <li>
                <Link href="/appointments">
                  <div className="flex items-center py-2 px-3 rounded-md hover:bg-secondary text-foreground">
                    <span className="mr-3">📅</span>
                    <span>Minhas Reservas</span>
                  </div>
                </Link>
              </li>
              <li>
                <Link href="/profile">
                  <div className="flex items-center py-2 px-3 rounded-md hover:bg-secondary text-foreground">
                    <span className="mr-3">👤</span>
                    <span>Meu Perfil</span>
                  </div>
                </Link>
              </li>
              <li>
                <Link href="/products">
                  <div className="flex items-center py-2 px-3 rounded-md hover:bg-secondary text-foreground">
                    <span className="mr-3">🛍️</span>
                    <span>Produtos</span>
                  </div>
                </Link>
              </li>
              <li>
                <Link href="/loyalty">
                  <div className="flex items-center py-2 px-3 rounded-md hover:bg-secondary text-foreground">
                    <span className="mr-3">🏆</span>
                    <span>Fidelidade</span>
                  </div>
                </Link>
              </li>
              
              {isAdmin && (
                <li>
                  <Link href="/admin/dashboard">
                    <div className="flex items-center py-2 px-3 rounded-md bg-primary/10 hover:bg-primary/20 text-foreground">
                      <span className="mr-3">⚙️</span>
                      <span>Painel Administrativo</span>
                    </div>
                  </Link>
                </li>
              )}
              
              {/* Link para inicialização do sistema admin - visível para todos */}
              {!isAdmin && user && (
                <li>
                  <Link href="/admin/initialize">
                    <div className="flex items-center py-2 px-3 rounded-md bg-amber-100/50 hover:bg-amber-100 text-amber-800 border border-amber-200">
                      <span className="mr-3">🔐</span>
                      <span>Inicializar Sistema Admin</span>
                    </div>
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        </div>
        
        <div className="p-4">
          <h3 className="font-medium text-sm mb-3 text-muted-foreground">Informações</h3>
          <div className="text-sm space-y-4">
            <div>
              <h4 className="font-medium mb-1">Localização</h4>
              <p className="text-muted-foreground text-xs">Qd 05 Lt 48 loja 01 São José - São Sebastião DF</p>
              <a 
                href="https://www.google.com/maps/search/?api=1&query=-15.91295338%2C-47.76993942" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-primary text-xs mt-1 hover:underline"
              >
                <MapPin className="w-3 h-3 mr-1" /> Ver no Google Maps
              </a>
            </div>
            <div>
              <h4 className="font-medium mb-1">Horário de Funcionamento</h4>
              <p className="text-muted-foreground text-xs">Segunda a Sábado: 9:00 - 19:30</p>
              <p className="text-muted-foreground text-xs">Intervalo: 13:00 - 14:30</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Contato</h4>
              <a 
                href="https://api.whatsapp.com/send?phone=5561985533103" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-muted-foreground text-xs hover:text-primary"
              >
                <Phone className="w-3 h-3 mr-1" /> (61) 98553-3103
              </a>
            </div>
            <div>
              <h4 className="font-medium mb-1">Redes Sociais</h4>
              <div className="flex flex-wrap gap-2 mt-1">
                <a 
                  href="https://www.instagram.com/losbarbeiroscbs/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center text-muted-foreground text-xs hover:text-primary"
                >
                  <Instagram className="w-3 h-3 mr-1" /> Instagram
                </a>
                <a 
                  href="https://www.facebook.com/losbarbeirosdf" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center text-muted-foreground text-xs hover:text-primary ml-2"
                >
                  <Facebook className="w-3 h-3 mr-1" /> Facebook
                </a>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Header;
