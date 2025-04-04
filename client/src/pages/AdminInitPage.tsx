import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

export default function AdminInitPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isInitializing, setIsInitializing] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Redirecionar para página de login se não estiver autenticado
  useEffect(() => {
    if (!user) {
      toast({
        title: 'Acesso restrito',
        description: 'Você precisa estar logado para acessar esta página.',
        variant: 'destructive'
      });
      navigate('/auth');
    }
  }, [user, navigate, toast]);

  const handleInitialize = async () => {
    if (!user) return;
    
    setIsInitializing(true);
    
    try {
      const response = await apiRequest('/admin/initialize', {
        method: 'POST',
        data: { userId: user.id }
      });
      
      if (response.success) {
        setInitialized(true);
        toast({
          title: 'Sistema inicializado',
          description: 'Você agora tem acesso administrativo ao sistema.',
        });
        
        // Forçar recarregamento da sessão para atualizar o papel do usuário
        setTimeout(() => {
          window.location.href = '/admin/dashboard';
        }, 2000);
      } else {
        toast({
          title: 'Erro na inicialização',
          description: response.message || 'Erro ao inicializar o sistema administrativo.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Erro na inicialização do sistema administrativo:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao tentar inicializar o sistema administrativo.',
        variant: 'destructive'
      });
    } finally {
      setIsInitializing(false);
    }
  };

  if (!user) {
    return null; // Será redirecionado pelo useEffect
  }

  return (
    <div className="container mx-auto py-10 flex flex-col items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Inicialização do Sistema Administrativo</CardTitle>
          <CardDescription>
            {initialized 
              ? 'Sistema inicializado com sucesso!' 
              : 'Configure o primeiro usuário administrador para o sistema Los Barbeiros.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {initialized ? (
            <div className="text-center py-4">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <p className="text-lg font-medium">Sistema Administrativo Inicializado</p>
              <p className="text-muted-foreground mt-2">
                Você será redirecionado para o painel administrativo em instantes...
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 text-amber-800 rounded-lg border border-amber-200">
                <p className="text-sm">
                  <strong>Atenção:</strong> Esta ação irá configurar o usuário 
                  <strong> {user.name} ({user.email})</strong> como administrador do sistema.
                </p>
              </div>
              
              <div className="p-4 bg-blue-50 text-blue-800 rounded-lg border border-blue-200">
                <p className="text-sm">
                  <strong>Nota:</strong> Esta página só pode ser acessada uma vez durante a configuração inicial
                  do sistema. Após a inicialização, novos administradores só poderão ser adicionados
                  por administradores existentes.
                </p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          {!initialized && (
            <Button 
              onClick={handleInitialize} 
              disabled={isInitializing}
              size="lg"
              className="w-full"
            >
              {isInitializing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isInitializing ? 'Inicializando...' : 'Inicializar Sistema Administrativo'}
            </Button>
          )}
          
          {initialized && (
            <Button 
              variant="outline"
              onClick={() => navigate('/admin/dashboard')}
              size="lg"
              className="w-full"
            >
              Ir para o Painel Administrativo
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}