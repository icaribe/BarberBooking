import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useQuery } from "@tanstack/react-query";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

// Definir o schema de validação para configurações do sistema
const businessSettingsSchema = z.object({
  businessName: z.string().min(1, "Nome do estabelecimento é obrigatório"),
  address: z.string().min(1, "Endereço é obrigatório"),
  phone: z.string().min(1, "Telefone é obrigatório"),
  email: z.string().email("Email inválido"),
  openingHours: z.string().min(1, "Horário de funcionamento é obrigatório"),
  logo: z.string().optional(),
  description: z.string().optional()
});

// Definir o schema de validação para configurações de notificações
const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean().default(true),
  smsNotifications: z.boolean().default(false),
  appointmentReminders: z.boolean().default(true),
  marketingEmails: z.boolean().default(false),
  reminderTime: z.string().default("24")
});

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("geral");
  
  // Buscar os dados de usuários e profissionais
  const { data: professionals, isLoading: professionalsLoading } = useQuery({
    queryKey: ['/api/admin/professionals'],
  });
  
  // Formulário para configurações do negócio
  const businessForm = useForm<z.infer<typeof businessSettingsSchema>>({
    resolver: zodResolver(businessSettingsSchema),
    defaultValues: {
      businessName: "",
      address: "",
      phone: "",
      email: "",
      openingHours: "",
      logo: "",
      description: ""
    }
  });
  
  // Formulário para configurações de notificações
  const notificationForm = useForm<z.infer<typeof notificationSettingsSchema>>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      emailNotifications: true,
      smsNotifications: false,
      appointmentReminders: true,
      marketingEmails: false,
      reminderTime: "24"
    }
  });

  // Carregar configurações do negócio
  const { data: businessSettings, isLoading: isLoadingBusinessSettings } = useQuery({
    queryKey: ['/api/admin/settings/business'],
    retry: 1,
    onSuccess: (data) => {
      if (data) {
        businessForm.reset(data);
      }
    }
  });

  // Carregar configurações de notificações
  const { data: notificationSettings, isLoading: isLoadingNotificationSettings } = useQuery({
    queryKey: ['/api/admin/settings/notifications'],
    retry: 1,
    onSuccess: (data) => {
      if (data) {
        notificationForm.reset(data);
      }
    }
  });

  // Lidar com a submissão do formulário de configurações do negócio
  const handleBusinessSubmit = async (values: z.infer<typeof businessSettingsSchema>) => {
    try {
      await apiRequest('/api/admin/settings/business', {
        method: 'POST',
        data: values
      });
      
      toast({
        title: "Configurações salvas",
        description: "As configurações do negócio foram atualizadas com sucesso."
      });
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível salvar as configurações. Tente novamente."
      });
    }
  };

  // Lidar com a submissão do formulário de configurações de notificações
  const handleNotificationSubmit = async (values: z.infer<typeof notificationSettingsSchema>) => {
    try {
      await apiRequest('/api/admin/settings/notifications', {
        method: 'POST',
        data: values
      });
      
      toast({
        title: "Configurações salvas",
        description: "As configurações de notificações foram atualizadas com sucesso."
      });
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível salvar as configurações. Tente novamente."
      });
    }
  };

  return (
    <AdminLayout title="Configurações">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
          <TabsTrigger value="usuarios">Usuários</TabsTrigger>
        </TabsList>
        
        <TabsContent value="geral">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Estabelecimento</CardTitle>
              <CardDescription>
                Gerencie as informações básicas do seu estabelecimento
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {isLoadingBusinessSettings ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <FormProvider {...businessForm}>
                  <Form {...businessForm}>
                    <form onSubmit={businessForm.handleSubmit(handleBusinessSubmit)} className="space-y-4">
                      <FormField
                        control={businessForm.control}
                        name="businessName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome do Estabelecimento</FormLabel>
                            <FormControl>
                              <Input placeholder="Los Barbeiros" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={businessForm.control}
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
                        
                        <FormField
                          control={businessForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input placeholder="contato@losbarbeiros.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={businessForm.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Endereço</FormLabel>
                            <FormControl>
                              <Input placeholder="Rua das Barbearias, 123" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={businessForm.control}
                        name="openingHours"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Horário de Funcionamento</FormLabel>
                            <FormControl>
                              <Input placeholder="Seg-Sex: 9h às 19h, Sáb: 9h às 16h" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={businessForm.control}
                        name="logo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>URL do Logo</FormLabel>
                            <FormControl>
                              <Input placeholder="https://exemplo.com/logo.png" {...field} />
                            </FormControl>
                            <FormDescription>
                              URL da imagem do logo do estabelecimento
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={businessForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Descrição</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Breve descrição do seu estabelecimento" 
                                className="min-h-[100px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button type="submit">Salvar Configurações</Button>
                    </form>
                  </Form>
                </FormProvider>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notificacoes">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Notificações</CardTitle>
              <CardDescription>
                Gerencie como e quando o sistema enviará notificações
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {isLoadingNotificationSettings ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <FormProvider {...notificationForm}>
                  <Form {...notificationForm}>
                    <form onSubmit={notificationForm.handleSubmit(handleNotificationSubmit)} className="space-y-6">
                      <div className="space-y-4">
                        <FormField
                          control={notificationForm.control}
                          name="emailNotifications"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Notificações por Email</FormLabel>
                                <FormDescription>
                                  Receba notificações por email sobre agendamentos
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={notificationForm.control}
                          name="smsNotifications"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Notificações por SMS</FormLabel>
                                <FormDescription>
                                  Receba notificações por SMS sobre agendamentos
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={notificationForm.control}
                          name="appointmentReminders"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Lembretes de Agendamento</FormLabel>
                                <FormDescription>
                                  Enviar lembretes aos clientes antes dos agendamentos
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={notificationForm.control}
                          name="marketingEmails"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Emails de Marketing</FormLabel>
                                <FormDescription>
                                  Enviar promoções e novidades aos clientes
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <FormField
                          control={notificationForm.control}
                          name="reminderTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tempo de Antecedência para Lembretes (horas)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="1" 
                                  max="72" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormDescription>
                                Quantas horas antes do agendamento o lembrete deve ser enviado
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <Button type="submit">Salvar Configurações</Button>
                    </form>
                  </Form>
                </FormProvider>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <CardTitle>Backup e Restauração</CardTitle>
              <CardDescription>
                Gerencie backups do seu sistema e dados
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Backup Manual</h3>
                  <p className="text-sm text-muted-foreground">
                    Realize um backup completo dos dados do sistema
                  </p>
                  <div className="flex gap-4 mt-2">
                    <Button>Criar Backup</Button>
                    <Button variant="outline">Baixar Último Backup</Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Backups Automáticos</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure a frequência de backups automáticos
                  </p>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="flex items-center space-x-2">
                      <input type="radio" id="daily" name="backup-frequency" className="form-radio" />
                      <label htmlFor="daily">Diário</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="radio" id="weekly" name="backup-frequency" className="form-radio" checked />
                      <label htmlFor="weekly">Semanal</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="radio" id="monthly" name="backup-frequency" className="form-radio" />
                      <label htmlFor="monthly">Mensal</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="radio" id="disabled" name="backup-frequency" className="form-radio" />
                      <label htmlFor="disabled">Desativado</label>
                    </div>
                  </div>
                  <Button className="mt-2">Salvar Configurações</Button>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Restaurar Backup</h3>
                  <p className="text-sm text-muted-foreground">
                    Restaure o sistema a partir de um backup anterior (todos os dados atuais serão substituídos)
                  </p>
                  <div className="flex flex-col gap-4 mt-2">
                    <Input type="file" />
                    <Button variant="destructive">Restaurar Sistema</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="usuarios">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Usuários</CardTitle>
              <CardDescription>
                Gerencie usuários administradores e suas permissões
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Usuários Administrativos</h3>
                  <Button>Adicionar Usuário</Button>
                </div>
                
                <div className="rounded-md border">
                  <table className="min-w-full divide-y divide-border">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Nome
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Função
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-background divide-y divide-border">
                      {/* Admin (Johnata) sempre fixo */}
                      <tr>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                              JL
                            </div>
                            <div>Johnata Lima</div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          johnatanlima26@gmail.com
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/10">
                            Administrador
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right">
                          <Button variant="ghost" size="sm" disabled>Editar</Button>
                        </td>
                      </tr>
                      
                      {/* Profissionais dinâmicos */}
                      {professionalsLoading ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-4 text-center">
                            Carregando profissionais...
                          </td>
                        </tr>
                      ) : (
                        professionals && professionals.map((professional) => (
                          <tr key={professional.id}>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                                  {professional.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                </div>
                                <div>{professional.name}</div>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              {`${professional.name.toLowerCase().replace(/\s/g, '')}@example.com`}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-300">
                                Profissional
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-right">
                              <Button variant="ghost" size="sm">Editar</Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                
                <div className="space-y-2 mt-6">
                  <h3 className="text-lg font-medium">Configurações de Senha</h3>
                  <div className="flex items-center space-x-2 rounded-md border p-4">
                    <div className="flex-1">
                      <div className="font-medium">Redefinir senhas dos usuários</div>
                      <div className="text-sm text-muted-foreground">
                        Envie um link para redefinição de senha para um usuário específico
                      </div>
                    </div>
                    <Button variant="outline">Redefinir Senha</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}