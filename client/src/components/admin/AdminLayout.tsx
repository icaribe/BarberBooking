import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/hooks/useAuth";
import { 
  LayoutDashboard, 
  Scissors, 
  Users, 
  Package, 
  CalendarRange, 
  Award, 
  Settings, 
  DollarSign,
  BarChart3,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Redirect } from "wouter";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

type NavItem = {
  label: string;
  icon: React.ElementType;
  href: string;
  adminOnly?: boolean;
};

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  // Verificar se o usuário está autenticado e tem permissões
  if (!user) {
    return <Redirect to="/admin/login" />;
  }

  if (user.role !== 'ADMIN' && user.role !== 'PROFESSIONAL') {
    return <Redirect to="/" />;
  }

  const isAdmin = user.role === 'ADMIN';

  const navItems: NavItem[] = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
    { label: 'Serviços', icon: Scissors, href: '/admin/services' },
    { label: 'Profissionais', icon: Users, href: '/admin/professionals', adminOnly: true },
    { label: 'Produtos', icon: Package, href: '/admin/products', adminOnly: true },
    { label: 'Agendamentos', icon: CalendarRange, href: '/admin/appointments' },
    { label: 'Fidelidade', icon: Award, href: '/admin/loyalty', adminOnly: true },
    { label: 'Caixa', icon: DollarSign, href: '/admin/finance', adminOnly: true },
    { label: 'Relatórios', icon: BarChart3, href: '/admin/reports', adminOnly: true },
    { label: 'Configurações', icon: Settings, href: '/admin/settings', adminOnly: true },
  ];

  // Filtrar itens visíveis com base na função do usuário
  const visibleNavItems = isAdmin 
    ? navItems 
    : navItems.filter(item => !item.adminOnly);

  function NavLinks() {
    return (
      <div className="space-y-1">
        {visibleNavItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <a>
              <Button
                variant={location === item.href ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  location === item.href ? "font-medium" : ""
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            </a>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar para desktop */}
      <aside className="hidden md:flex w-64 flex-col bg-card shadow-md p-4">
        <div className="flex items-center mb-6 px-2">
          <h2 className="font-bold text-xl">Los Barbeiros</h2>
        </div>
        
        <Separator className="mb-4" />
        
        <div className="flex-1">
          <NavLinks />
        </div>
        
        <Separator className="my-4" />
        
        <div className="rounded-md border p-3 bg-card">
          <div className="font-medium">{user.name}</div>
          <div className="text-xs text-muted-foreground mb-3">{user.role}</div>
          <Button variant="destructive" size="sm" className="w-full" onClick={() => logout()}>
            <LogOut className="mr-2 h-3.5 w-3.5" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className="md:hidden absolute left-4 top-4 z-10">
          <Button size="icon" variant="outline">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4">
              <h2 className="font-bold text-xl">Los Barbeiros</h2>
              <Button size="icon" variant="ghost" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <Separator className="mb-4" />
            
            <div className="flex-1 px-4">
              <div className="space-y-1">
                {visibleNavItems.map((item) => (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    onClick={() => setOpen(false)}
                  >
                    <a>
                      <Button
                        variant={location === item.href ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start",
                          location === item.href ? "font-medium" : ""
                        )}
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.label}
                      </Button>
                    </a>
                  </Link>
                ))}
              </div>
            </div>
            
            <Separator className="mt-4" />
            
            <div className="p-4">
              <div className="rounded-md border p-3 bg-card">
                <div className="font-medium">{user.name}</div>
                <div className="text-xs text-muted-foreground mb-3">{user.role}</div>
                <Button variant="destructive" size="sm" className="w-full" onClick={() => logout()}>
                  <LogOut className="mr-2 h-3.5 w-3.5" />
                  Sair
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="md:ml-0 ml-12">
              <h1 className="text-2xl font-bold">{title}</h1>
            </div>
          </div>
          
          {children}
        </div>
      </main>
    </div>
  );
}