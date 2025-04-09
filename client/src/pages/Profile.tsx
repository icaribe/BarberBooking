import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { API_ENDPOINTS } from '@/lib/constants';
import { apiRequest } from '@/lib/queryClient';
import { User, Settings, LogOut, Award, Calendar, Phone, Mail, Edit } from 'lucide-react';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/hooks/useAuth'; // Importando o hook de autenticação
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { User as UserType } from '@/lib/types';

// Profile update schema
const profileFormSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").optional(),
  email: z.string().email("Email inválido").optional(),
  phone: z.string().min(8, "Telefone inválido").optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const ProfilePage = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user: authUser, logout } = useAuth(); // Hook de autenticação
  
  // Usando o ID do usuário autenticado em vez de um ID fixo
  const userId = authUser?.id ?? 1;
  
  // Fetch user data
  const { 
    data: user, 
    isLoading,
    error
  } = useQuery<UserType>({ 
    queryKey: [`${API_ENDPOINTS.USERS}/${userId}`]
  });
  
  // Update user profile mutation
  const { mutateAsync: updateProfile, isPending: isUpdating } = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      const response = await apiRequest('PATCH', `${API_ENDPOINTS.USERS}/${userId}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`${API_ENDPOINTS.USERS}/${userId}`] });
      setIsEditModalOpen(false);
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o perfil. Tente novamente.",
        variant: "destructive"
      });
    }
  });
  
  // Setup form
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    },
  });
  
  // Update form values when user data is loaded
  useState(() => {
    if (user) {
      form.reset({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  });
  
  const onSubmit = async (data: ProfileFormValues) => {
    await updateProfile(data);
  };
  
  // Calculate progress to next level (200 points)
  const loyaltyPoints = user?.loyaltyPoints || 0;
  const progressPercent = Math.min(Math.floor((loyaltyPoints / 200) * 100), 100);
  const pointsToNextLevel = 200 - (loyaltyPoints % 200);
  
  return (
    <div className="flex flex-col min-h-screen bg-secondary pb-16">
      <Header showBackButton title="Meu Perfil" />
      
      <main className="flex-1 p-4">

        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            Erro ao carregar perfil. Tente novamente.
          </div>
        ) : (
          <>
            {/* Profile Card */}
            <Card className="bg-card border-border mb-4">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Avatar className="h-16 w-16 mr-4">
                    <AvatarImage src="/default-avatar.png" alt={user?.name || "Usuário"} />
                    <AvatarFallback>{user?.name?.charAt(0) || user?.username.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h2 className="font-montserrat font-semibold text-lg">{user?.name || user?.username}</h2>
                    <div className="flex flex-col space-y-1 text-sm text-muted-foreground">
                      {user?.email && (
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          <span>{user.email}</span>
                        </div>
                      )}
                      {user?.phone && (
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-1" />
                          <span>{user.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setIsEditModalOpen(true)}>
                    <Edit className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Loyalty Card */}
            <Card className="bg-card border-border mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-montserrat flex items-center">
                  <Award className="mr-2 h-5 w-5 text-primary" />
                  Programa de Fidelidade
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-muted-foreground">Nível Atual</span>
                  <span className="text-primary font-semibold">
                    {Math.floor(loyaltyPoints / 200) + 1}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-muted-foreground">Pontos</span>
                  <span className="text-primary font-semibold">{loyaltyPoints}</span>
                </div>
                <div className="flex justify-between items-center text-sm mb-1">
                  <span>Próximo nível</span>
                  <span>{pointsToNextLevel} pontos restantes</span>
                </div>
                <Progress value={progressPercent} className="h-2" />
                <Button
                  className="w-full mt-4 bg-primary text-primary-foreground"
                  asChild
                >
                  <a href="/#loyalty">Ver Recompensas</a>
                </Button>
              </CardContent>
            </Card>
            
            {/* Quick Links */}
            <div className="space-y-2">
              <Button
                variant="secondary"
                className="w-full justify-start font-normal text-left h-auto py-3"
                asChild
              >
                <Link href="/appointments">
                  <Calendar className="mr-2 h-5 w-5 text-primary" />
                  Meus Agendamentos
                </Link>
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start font-normal text-left h-auto py-3"
                asChild
              >
                <a href="/settings">
                  <Settings className="mr-2 h-5 w-5 text-primary" />
                  Configurações
                </a>
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start font-normal text-left h-auto py-3"
                onClick={() => {
                  logout();
                  toast({
                    title: "Logout realizado",
                    description: "Você saiu da sua conta com sucesso."
                  });
                  // Redirecionar para a página inicial após o logout
                  window.location.href = '/';
                }}
              >
                <LogOut className="mr-2 h-5 w-5 text-primary" />
                Sair
              </Button>
            </div>
          </>
        )}
      </main>
      
      {/* Edit Profile Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
            <DialogDescription>
              Atualize suas informações pessoais abaixo.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu nome" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="seu.email@exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(00) 00000-0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <BottomNav />
    </div>
  );
};

export default ProfilePage;
