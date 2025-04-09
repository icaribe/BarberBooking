import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTheme } from '@/lib/hooks/useTheme';
import { API_ENDPOINTS } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
// Adicionar console.log para depuração
console.log('Página de configurações carregada');
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
  
  // Obter acesso direto aos valores do contexto de tema
  // Agora é seguro pois inicializamos o contexto com valores padrão
  const { theme, toggleTheme } = useTheme();
  console.log('useTheme carregado com sucesso:', theme);
  
  // Gerenciar estado de notificações
  const [notifications, setNotifications] = useState(() => {
    // Verificar se as notificações estão salvas no localStorage
    const savedNotifications = localStorage.getItem('notifications');
    // Retornar o valor salvo ou true como padrão
    return savedNotifications ? savedNotifications === 'true' : true;
  });
  
  const { toast } = useToast();
  
  // Handler para alternar notificações
  const handleNotificationsChange = (enabled: boolean) => {
    setNotifications(enabled);
    localStorage.setItem('notifications', String(enabled));
    
    // Implementar solicitação de permissão de notificação no navegador
    if (enabled && "Notification" in window) {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          toast({
            title: "Notificações ativadas",
            description: "Você receberá alertas sobre seus agendamentos",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Acesso negado",
            description: "Por favor, permita notificações no seu navegador",
          });
          // Reverter o switch se o usuário não conceder permissão
          setNotifications(false);
          localStorage.setItem('notifications', 'false');
        }
      });
    } else if (!enabled) {
      toast({
        title: "Notificações desativadas",
        description: "Você não receberá mais alertas",
      });
    }
  };
  
  // Fetch user data
  const { 
    data: user,
    isLoading,
    error: userError
  } = useQuery<UserType>({ 
    queryKey: [`${API_ENDPOINTS.USERS}/${authUser?.id ?? 1}`],
    enabled: !!authUser?.id
  });
  
  console.log('Estado do usuário:', { authUser, user, isLoading, userError });

  // Adicionar feedback visual em caso de erro
  if (userError) {
    console.error('Erro ao carregar dados do usuário:', userError);
  }

  return (
    <div className="flex flex-col min-h-screen bg-secondary pb-16">
      <Header showBackButton title="Configurações" />
      
      <main className="flex-1 p-4 space-y-4">
        {userError ? (
          <div className="py-8 text-center space-y-4">
            <p className="text-destructive font-medium">Não foi possível carregar as configurações</p>
            <p className="text-sm text-muted-foreground">Verifique sua conexão e tente novamente</p>
          </div>
        ) : isLoading ? (
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
                    checked={theme === 'dark'}
                    onCheckedChange={toggleTheme} 
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
                    onCheckedChange={handleNotificationsChange}
                  />
                </div>
              </CardContent>
            </Card>
            
            <h2 className="text-lg font-semibold mt-6 mb-2">Informações</h2>
            
            <Card className="bg-card border-border">
              <CardContent className="p-0">
                <Link href="/privacy" className="p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 mr-3 text-primary" />
                    <span>Política de Privacidade</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Link>
                
                <Separator />
                
                <Link href="/terms" className="p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <Info className="h-5 w-5 mr-3 text-primary" />
                    <span>Termos de Uso</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Link>
                
                <Separator />
                
                <Link href="/help" className="p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <HelpCircle className="h-5 w-5 mr-3 text-primary" />
                    <span>Ajuda & Suporte</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Link>
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