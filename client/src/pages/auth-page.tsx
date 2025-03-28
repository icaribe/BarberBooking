import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/hooks/useAuth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Scissors, MapPin, Phone, MessageSquare } from "lucide-react";
import { Redirect, useLocation } from "wouter";

const loginSchema = z.object({
  username: z.string().min(1, "O nome de usuário é obrigatório"),
  password: z.string().min(1, "A senha é obrigatória"),
});

const registerSchema = z.object({
  username: z.string().min(3, "O nome de usuário deve ter pelo menos 3 caracteres"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  name: z.string().min(1, "O nome é obrigatório"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().min(1, "O telefone é obrigatório"),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [location, setLocation] = useLocation();
  
  // Pegando o parâmetro returnTo da URL, se existir
  const params = new URLSearchParams(location.split('?')[1] || '');
  const returnTo = params.get('returnTo');
  
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      name: "",
      email: "",
      phone: "",
    },
  });

  async function onLoginSubmit(data: LoginFormValues) {
    loginMutation.mutate(data);
  }

  async function onRegisterSubmit(data: RegisterFormValues) {
    registerMutation.mutate(data);
  }

  // Redirecionar se já estiver autenticado
  if (user) {
    // Se tiver um parâmetro de redirecionamento, redirecionar para ele, senão para a página principal
    if (returnTo) {
      return <Redirect to={returnTo} />;
    } else {
      return <Redirect to="/" />;
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Formulário de login/cadastro */}
      <div className="w-full md:w-1/2 p-4 flex items-center justify-center">
        <div className="w-full max-w-md">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mb-4" 
            onClick={() => setLocation("/")}
          >
            ← Voltar
          </Button>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="register">Cadastrar</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Faça login</CardTitle>
                  <CardDescription>Entre com sua conta para agendar serviços e comprar produtos.</CardDescription>
                </CardHeader>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Nome de usuário</Label>
                      <Input 
                        id="username" 
                        {...loginForm.register("username")}
                      />
                      {loginForm.formState.errors.username && (
                        <p className="text-sm text-red-500">{loginForm.formState.errors.username.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Senha</Label>
                      <Input 
                        id="password" 
                        type="password" 
                        {...loginForm.register("password")}
                      />
                      {loginForm.formState.errors.password && (
                        <p className="text-sm text-red-500">{loginForm.formState.errors.password.message}</p>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Entrando..." : "Entrar"}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
            
            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Criar uma conta</CardTitle>
                  <CardDescription>Crie sua conta para gerenciar agendamentos e compras.</CardDescription>
                </CardHeader>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="registerUsername">Nome de usuário</Label>
                      <Input 
                        id="registerUsername" 
                        {...registerForm.register("username")}
                      />
                      {registerForm.formState.errors.username && (
                        <p className="text-sm text-red-500">{registerForm.formState.errors.username.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="registerPassword">Senha</Label>
                      <Input 
                        id="registerPassword" 
                        type="password" 
                        {...registerForm.register("password")}
                      />
                      {registerForm.formState.errors.password && (
                        <p className="text-sm text-red-500">{registerForm.formState.errors.password.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome completo</Label>
                      <Input 
                        id="name" 
                        {...registerForm.register("name")}
                      />
                      {registerForm.formState.errors.name && (
                        <p className="text-sm text-red-500">{registerForm.formState.errors.name.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        {...registerForm.register("email")}
                      />
                      {registerForm.formState.errors.email && (
                        <p className="text-sm text-red-500">{registerForm.formState.errors.email.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input 
                        id="phone" 
                        {...registerForm.register("phone")}
                      />
                      {registerForm.formState.errors.phone && (
                        <p className="text-sm text-red-500">{registerForm.formState.errors.phone.message}</p>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? "Criando conta..." : "Criar Conta"}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Informações sobre a barbearia */}
      <div className="hidden md:flex md:w-1/2 bg-[#161616] text-white flex-col justify-center p-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Los Barbeiros CBS</h1>
          <p className="text-xl text-gray-300 mb-6">A melhor experiência em barbearia em Brasília.</p>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Scissors className="w-5 h-5" />
              <span>Cortes modernos e tradicionais</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5" />
              <span>Localizado em Sobradinho, Brasília-DF</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5" />
              <span>(61) 98553-3103</span>
            </div>
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5" />
              <span>@losbarbeiroscbs</span>
            </div>
          </div>
        </div>
        <div className="mt-auto">
          <p className="text-sm text-gray-400">© 2025 Los Barbeiros CBS. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
}