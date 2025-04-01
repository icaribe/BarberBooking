import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/hooks/useAuth';
import { API_ENDPOINTS } from '@/lib/constants';
import { 
  Bell, 
  Moon, 
  Sun, 
  Shield, 
  Info, 
  HelpCircle,
  ChevronRight
} from 'lucide-react';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import type { User as UserType } from '@/lib/types';

const SettingsPage = () => {
  const { user: authUser } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  
  // Fetch user data
  const { 
    data: user,
    isLoading
  } = useQuery<UserType>({ 
    queryKey: [`${API_ENDPOINTS.USERS}/${authUser?.id ?? 1}`]
  });

  return (
    <div className="flex flex-col min-h-screen bg-secondary pb-16">
      <Header showBackButton title="Configurações" />
      
      <main className="flex-1 p-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-semibold mb-2">Preferências</h2>
            
            <Card className="bg-card border-border">
              <CardContent className="p-0">
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <Sun className="h-5 w-5 mr-3 text-primary" />
                    <span>Modo escuro</span>
                  </div>
                  <Switch 
                    checked={darkMode} 
                    onCheckedChange={setDarkMode} 
                  />
                </div>
                
                <Separator />
                
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <Bell className="h-5 w-5 mr-3 text-primary" />
                    <span>Notificações</span>
                  </div>
                  <Switch 
                    checked={notifications} 
                    onCheckedChange={setNotifications}
                  />
                </div>
              </CardContent>
            </Card>
            
            <h2 className="text-lg font-semibold mt-6 mb-2">Informações</h2>
            
            <Card className="bg-card border-border">
              <CardContent className="p-0">
                <a href="/privacy" className="p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 mr-3 text-primary" />
                    <span>Política de Privacidade</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </a>
                
                <Separator />
                
                <a href="/terms" className="p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <Info className="h-5 w-5 mr-3 text-primary" />
                    <span>Termos de Uso</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </a>
                
                <Separator />
                
                <a href="/help" className="p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <HelpCircle className="h-5 w-5 mr-3 text-primary" />
                    <span>Ajuda & Suporte</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </a>
              </CardContent>
            </Card>
            
            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>Versão 1.0.0</p>
              <p className="mt-1">© 2025 Los Barbeiros CBS</p>
            </div>
          </>
        )}
      </main>
      
      <BottomNav />
    </div>
  );
};

export default SettingsPage;