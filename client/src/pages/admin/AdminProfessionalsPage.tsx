import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Pencil, Plus, Trash2, Check, Star, MessageSquare, Users, ImageOff } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Professional } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

const professionalSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  avatar: z.string().optional(),
  bio: z.string().min(10, "Biografia deve ter pelo menos 10 caracteres"),
  specialties: z.string().min(3, "Especialidades são obrigatórias"),
});

type ProfessionalFormValues = z.infer<typeof professionalSchema>;

export default function AdminProfessionalsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar profissionais
  const { data: professionals, isLoading: professionalsLoading } = useQuery({
    queryKey: ['/api/admin/professionals'],
  });

  // Formulário para criar/editar profissional
  const form = useForm<ProfessionalFormValues>({
    resolver: zodResolver(professionalSchema),
    defaultValues: {
      name: "",
      avatar: "",
      bio: "",
      specialties: "",
    },
  });

  // Mutation para criar profissional
  const createProfessionalMutation = useMutation({
    mutationFn: (data: ProfessionalFormValues) => 
      apiRequest('/api/admin/professionals', { method: 'POST', data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/professionals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/professionals'] });
      toast({
        title: "Profissional cadastrado com sucesso",
        description: "O novo profissional foi adicionado à equipe",
      });
      setIsCreateDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erro ao cadastrar profissional",
        description: error.message || "Ocorreu um erro ao tentar cadastrar o profissional",
      });
    },
  });

  // Mutation para atualizar profissional
  const updateProfessionalMutation = useMutation({
    mutationFn: (data: ProfessionalFormValues & { id: number }) => 
      apiRequest(`/api/admin/professionals/${data.id}`, { method: 'PUT', data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/professionals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/professionals'] });
      toast({
        title: "Profissional atualizado com sucesso",
        description: "As alterações foram salvas com sucesso",
      });
      setIsEditDialogOpen(false);
      setSelectedProfessional(null);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar profissional",
        description: error.message || "Ocorreu um erro ao tentar atualizar o profissional",
      });
    },
  });

  // Mutation para excluir profissional
  const deleteProfessionalMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest(`/api/admin/professionals/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/professionals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/professionals'] });
      toast({
        title: "Profissional removido com sucesso",
        description: "O profissional foi removido da equipe",
      });
      setIsDeleteDialogOpen(false);
      setSelectedProfessional(null);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erro ao remover profissional",
        description: error.message || "Ocorreu um erro ao tentar remover o profissional",
      });
    },
  });

  // Manipuladores de eventos
  const handleCreateSubmit = (data: ProfessionalFormValues) => {
    createProfessionalMutation.mutate(data);
  };

  const handleEditSubmit = (data: ProfessionalFormValues) => {
    if (selectedProfessional) {
      updateProfessionalMutation.mutate({ ...data, id: selectedProfessional.id });
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedProfessional) {
      deleteProfessionalMutation.mutate(selectedProfessional.id);
    }
  };

  const handleEditClick = (professional: Professional) => {
    setSelectedProfessional(professional);
    form.reset({
      name: professional.name,
      avatar: professional.avatar || "",
      bio: professional.bio || "",
      specialties: professional.specialties || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (professional: Professional) => {
    setSelectedProfessional(professional);
    setIsDeleteDialogOpen(true);
  };

  return (
    <AdminLayout title="Gerenciamento de Profissionais">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-muted-foreground">
            Gerencie os profissionais que compõem a equipe da barbearia
          </p>
        </div>
        <Button onClick={() => {
          form.reset({
            name: "",
            avatar: "",
            bio: "",
            specialties: "",
          });
          setIsCreateDialogOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Profissional
        </Button>
      </div>

      {professionalsLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-20 w-20 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-6 w-2/3 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {professionals && professionals.length > 0 ? (
            professionals.map((professional) => (
              <Card key={professional.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="h-20 w-20 rounded-full bg-muted/50 overflow-hidden flex-shrink-0">
                      {professional.avatar ? (
                        <img
                          src={professional.avatar}
                          alt={professional.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          <ImageOff className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">{professional.name}</h3>
                          <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <Star className="mr-1 h-3.5 w-3.5 text-yellow-500" />
                            {professional.rating?.toFixed(1) || '0.0'} 
                            <span className="mx-1">•</span>
                            <MessageSquare className="mr-1 h-3.5 w-3.5" />
                            {professional.review_count || 0} avaliações
                          </div>
                          <p className="text-sm font-medium mt-2">Especialidades:</p>
                          <p className="text-sm text-muted-foreground">
                            {professional.specialties}
                          </p>
                        </div>
                        <div className="flex space-x-1">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={() => handleEditClick(professional)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="text-destructive" 
                            onClick={() => handleDeleteClick(professional)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm mt-2 line-clamp-2 text-muted-foreground">
                        {professional.bio}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              <Users className="mx-auto h-12 w-12 text-muted-foreground/60 mb-3" />
              <p>Não há profissionais cadastrados.</p>
              <p>Clique em "Novo Profissional" para adicionar o primeiro membro da equipe.</p>
            </div>
          )}
        </div>
      )}

      {/* Dialog para Criar Profissional */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Novo Profissional</DialogTitle>
            <DialogDescription>
              Adicione um novo profissional à equipe da barbearia
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Profissional</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="avatar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL da Foto (opcional)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="specialties"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Especialidades</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Ex: Corte masculino, Barba, Penteados..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Biografia</FormLabel>
                    <FormControl>
                      <Textarea 
                        rows={4} 
                        {...field} 
                        placeholder="Breve descrição sobre o profissional, experiência e habilidades..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={createProfessionalMutation.isPending}
                >
                  {createProfessionalMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Salvar
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog para Editar Profissional */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Editar Profissional</DialogTitle>
            <DialogDescription>
              Alterar informações do profissional
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEditSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Profissional</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="avatar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL da Foto (opcional)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="specialties"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Especialidades</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Ex: Corte masculino, Barba, Penteados..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Biografia</FormLabel>
                    <FormControl>
                      <Textarea 
                        rows={4} 
                        {...field} 
                        placeholder="Breve descrição sobre o profissional, experiência e habilidades..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateProfessionalMutation.isPending}
                >
                  {updateProfessionalMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Salvar
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog para Excluir Profissional */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Remover Profissional</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover este profissional da equipe? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-muted/50 p-3 rounded-md mb-2 flex gap-3">
            {selectedProfessional?.avatar ? (
              <img 
                src={selectedProfessional.avatar} 
                alt={selectedProfessional.name} 
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <ImageOff className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <div>
              <p className="font-medium">{selectedProfessional?.name}</p>
              <p className="text-sm text-muted-foreground">
                {selectedProfessional?.specialties}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleDeleteConfirm}
              disabled={deleteProfessionalMutation.isPending}
            >
              {deleteProfessionalMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                  Removendo...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remover
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}