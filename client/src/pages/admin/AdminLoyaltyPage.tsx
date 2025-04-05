import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Definir o schema de validação para os programas de fidelidade
const loyaltyProgramSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  pointsRequired: z.number().min(1, "Pontos necessários devem ser pelo menos 1"),
  icon: z.string().min(1, "Ícone é obrigatório")
});

type LoyaltyProgram = {
  id: number;
  name: string;
  description: string;
  pointsRequired: number;
  icon: string;
  isActive: boolean;
};

export default function AdminLoyaltyPage() {
  const [activeTab, setActiveTab] = useState("programas");
  const [editingProgram, setEditingProgram] = useState<LoyaltyProgram | null>(null);

  const form = useForm<z.infer<typeof loyaltyProgramSchema>>({
    resolver: zodResolver(loyaltyProgramSchema),
    defaultValues: {
      name: "",
      description: "",
      pointsRequired: 100,
      icon: "🎁"
    }
  });

  // Carregar programas de fidelidade
  const { data: loyaltyPrograms, isLoading, refetch } = useQuery({
    queryKey: ['/api/admin/loyalty/programs'],
    retry: 1
  });

  // Lidar com a criação/edição de um programa de fidelidade
  const handleSubmit = async (values: z.infer<typeof loyaltyProgramSchema>) => {
    try {
      if (editingProgram) {
        // Atualizar programa existente
        await apiRequest(`/api/admin/loyalty/programs/${editingProgram.id}`, {
          method: 'PATCH',
          data: values
        });
        toast({
          title: "Programa atualizado",
          description: `O programa ${values.name} foi atualizado com sucesso.`
        });
      } else {
        // Criar novo programa
        await apiRequest('/api/admin/loyalty/programs', {
          method: 'POST',
          data: values
        });
        toast({
          title: "Programa criado",
          description: `O programa ${values.name} foi criado com sucesso.`
        });
      }
      
      // Limpar formulário e recarregar dados
      form.reset();
      setEditingProgram(null);
      refetch();
    } catch (error) {
      console.error("Erro ao salvar programa:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível salvar o programa. Tente novamente."
      });
    }
  };

  // Lidar com a edição de um programa
  const handleEdit = (program: LoyaltyProgram) => {
    setEditingProgram(program);
    form.reset({
      name: program.name,
      description: program.description,
      pointsRequired: program.pointsRequired,
      icon: program.icon
    });
  };

  // Lidar com a exclusão de um programa
  const handleDelete = async (programId: number) => {
    if (window.confirm("Tem certeza que deseja excluir este programa?")) {
      try {
        await apiRequest(`/api/admin/loyalty/programs/${programId}`, {
          method: 'DELETE'
        });
        
        toast({
          title: "Programa excluído",
          description: "O programa foi excluído com sucesso."
        });
        
        refetch();
      } catch (error) {
        console.error("Erro ao excluir programa:", error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível excluir o programa. Tente novamente."
        });
      }
    }
  };

  return (
    <AdminLayout title="Programa de Fidelidade">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="programas">Programas de Recompensa</TabsTrigger>
          <TabsTrigger value="historico">Histórico de Clientes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="programas">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{editingProgram ? "Editar Programa" : "Novo Programa"}</CardTitle>
                <CardDescription>
                  Configure recompensas para seus clientes mais fiéis
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <FormProvider {...form}>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome da Recompensa</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: Corte Grátis" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Descrição</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: Um corte de cabelo gratuito" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="pointsRequired"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pontos Necessários</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="1" 
                                placeholder="100" 
                                {...field}
                                onChange={e => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="icon"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ícone</FormLabel>
                            <FormControl>
                              <Input placeholder="🎁" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex gap-2 pt-4">
                        <Button type="submit">
                          {editingProgram ? "Atualizar" : "Criar"} Programa
                        </Button>
                        
                        {editingProgram && (
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={() => {
                              setEditingProgram(null);
                              form.reset({
                                name: "",
                                description: "",
                                pointsRequired: 100,
                                icon: "🎁"
                              });
                            }}
                          >
                            Cancelar
                          </Button>
                        )}
                      </div>
                    </form>
                  </Form>
                </FormProvider>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Programas Ativos</CardTitle>
                <CardDescription>
                  Gerenciar programas de fidelidade existentes
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : loyaltyPrograms && loyaltyPrograms.length > 0 ? (
                  <div className="space-y-4">
                    {loyaltyPrograms.map((program: LoyaltyProgram) => (
                      <div key={program.id} className="flex items-center justify-between border p-3 rounded-md">
                        <div className="flex items-center">
                          <div className="text-2xl mr-3">{program.icon}</div>
                          <div>
                            <div className="font-medium">{program.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {program.pointsRequired} pontos
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleEdit(program)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleDelete(program.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Nenhum programa de fidelidade encontrado.</p>
                    <p>Crie seu primeiro programa!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="historico">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Pontos</CardTitle>
              <CardDescription>
                Veja o histórico de pontos de fidelidade dos clientes
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Input placeholder="Buscar cliente..." className="max-w-sm" />
                  <Button variant="outline">Buscar</Button>
                </div>
                
                <div className="rounded-md border">
                  <table className="min-w-full divide-y divide-border">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Cliente
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Pontos
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Última Atividade
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-background divide-y divide-border">
                      {isLoading ? (
                        Array(3).fill(0).map((_, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-3">
                              <Skeleton className="h-5 w-32" />
                            </td>
                            <td className="px-4 py-3">
                              <Skeleton className="h-5 w-12" />
                            </td>
                            <td className="px-4 py-3">
                              <Skeleton className="h-5 w-24" />
                            </td>
                            <td className="px-4 py-3">
                              <Skeleton className="h-9 w-20" />
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                            Nenhum histórico de fidelidade encontrado.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}