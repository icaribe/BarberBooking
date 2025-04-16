import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/hooks/useAuth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Shield, ArrowLeft, Key } from "lucide-react";
import { Redirect, useLocation } from "wouter";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const loginSchema = z.object({
  username: z.string().min(1, "Nome de usuário é obrigatório"),
  password: z.string().min(1, "Senha é obrigatória"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const { user, loginMutation } = useAuth();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [debugMode, setDebugMode] = useState(true);
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  // Função para preencher rapidamente credenciais de administrador
  const fillAdminCredentials = () => {
    form.setValue('username', 'johnata');
    form.setValue('password', 'admin123');
  };

  async function onSubmit(data: LoginFormValues) {
    loginMutation.mutate(data, {
      onSuccess: (userData) => {
        if (userData.role === 'ADMIN' || userData.role === 'PROFESSIONAL') {
          toast({
            title: "Login realizado com sucesso",
            description: "Bem-vindo ao painel administrativo",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Acesso negado",
            description: "Você não tem permissão para acessar o painel administrativo",
          });
        }
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Erro ao realizar login",
          description: "Verifique suas credenciais e tente novamente",
        });
      },
    });
  }

  // Redirecionar se já estiver autenticado
  if (user) {
    if (user.role === 'ADMIN' || user.role === 'PROFESSIONAL') {
      return <Redirect to="/admin/dashboard" />;
    } else {
      // Se o usuário não tiver permissão, redirecionar para a página inicial
      return <Redirect to="/" />;
    }
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      <div className="w-full p-8 flex flex-col items-center justify-center">
        <Button 
          variant="ghost" 
          size="sm" 
          className="self-start mb-6" 
          onClick={() => setLocation("/")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao site
        </Button>
        
        <div className="w-full max-w-md">
          <Card className="shadow-lg">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl text-center">Painel Administrativo</CardTitle>
              <CardDescription className="text-center">
                Entre com suas credenciais para acessar o painel de gerenciamento da barbearia
              </CardDescription>
            </CardHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome de usuário</FormLabel>
                        <FormControl>
                          <Input placeholder="Digite seu nome de usuário" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Digite sua senha" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                
                <CardFooter className="flex flex-col">
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                        Entrando...
                      </>
                    ) : (
                      "Entrar"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  );
}