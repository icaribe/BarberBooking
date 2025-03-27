import { useState } from 'react';
import { Link } from 'wouter';
import { Menu, MapPin, Heart, User, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import logoPath from '@/assets/logo.svg';

const Header = () => {
  return (
    <header className="px-4 py-3 flex justify-between items-center bg-background shadow-md sticky top-0 z-30">
      <SidebarMenu />
      <div className="flex items-center">
        <img 
          src={logoPath} 
          alt="Los Barbeiros Logo" 
          className="h-8 mr-2" 
        />
        <h1 className="font-montserrat font-bold text-xl text-primary">Los Barbeiros</h1>
      </div>
      <div className="flex items-center space-x-1">
        <Button variant="ghost" size="icon" className="text-foreground" asChild>
          <Link href="/location">
            <MapPin className="h-5 w-5" />
          </Link>
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
      </div>
    </header>
  );
};

const SidebarMenu = () => {
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
              className="h-10 mr-3" 
            />
            <h2 className="font-montserrat font-bold text-lg text-primary">Los Barbeiros</h2>
          </div>
          
          <nav>
            <ul className="space-y-3">
              <li>
                <Link href="/">
                  <a className="flex items-center py-2 px-3 rounded-md hover:bg-secondary text-foreground">
                    <span className="mr-3">🏠</span>
                    <span>Início</span>
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/appointments">
                  <a className="flex items-center py-2 px-3 rounded-md hover:bg-secondary text-foreground">
                    <span className="mr-3">📅</span>
                    <span>Minhas Reservas</span>
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/profile">
                  <a className="flex items-center py-2 px-3 rounded-md hover:bg-secondary text-foreground">
                    <span className="mr-3">👤</span>
                    <span>Meu Perfil</span>
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/products">
                  <a className="flex items-center py-2 px-3 rounded-md hover:bg-secondary text-foreground">
                    <span className="mr-3">🛍️</span>
                    <span>Produtos</span>
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/loyalty">
                  <a className="flex items-center py-2 px-3 rounded-md hover:bg-secondary text-foreground">
                    <span className="mr-3">🏆</span>
                    <span>Fidelidade</span>
                  </a>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        
        <div className="p-4">
          <h3 className="font-medium text-sm mb-3 text-muted-foreground">Informações</h3>
          <div className="text-sm space-y-4">
            <div>
              <h4 className="font-medium mb-1">Localização</h4>
              <p className="text-muted-foreground text-xs">Quadra 5 lote 48, 48 - 71693-006 Vila São José</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Horário de Funcionamento</h4>
              <p className="text-muted-foreground text-xs">Segunda a Sábado: 9:00 - 19:30</p>
              <p className="text-muted-foreground text-xs">Intervalo: 13:00 - 14:30</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Contato</h4>
              <p className="text-muted-foreground text-xs">Tel: (61) 99999-9999</p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Header;
