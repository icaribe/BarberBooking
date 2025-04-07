import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Pencil, Plus, Trash2, Check, AlignLeft, Clock, CircleDollarSign } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Service, ServiceCategory } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

const priceTypes = [
  { label: "Fixo", value: "FIXED" },
  { label: "A partir de", value: "FROM" }
];

const serviceSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  price: z.coerce.number().min(0, "Preço não pode ser negativo"),
  price_type: z.enum(["FIXED", "FROM"]),
  duration_minutes: z.coerce.number().min(15, "Duração mínima é de 15 minutos"),
  category_id: z.coerce.number().min(1, "Categoria é obrigatória"),
  description: z.string().optional(),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

export default function AdminServicesPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar categorias de serviços
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['/api/service-categories'],
  });

  // Buscar serviços
  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ['/api/admin/services'],
  });

  // Formulário para criar/editar serviço
  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: "",
      price: 0,
      price_type: "FIXED",
      duration_minutes: 30,
      category_id: 0,
      description: "",
    },
  });

  // Filtrar serviços por categoria
  const filteredServices = useMemo(() => {
    if (!services) return [];
    return activeTab === "all" 
      ? services 
      : services.filter(service => service.category_id === parseInt(activeTab));
  }, [services, activeTab]);

  // Agrupar serviços por categoria para exibição
  const servicesByCategory = services?.reduce<Record<number, Service[]>>((acc, service) => {
    if (!acc[service.category_id]) {
      acc[service.category_id] = [];
    }
    acc[service.category_id].push(service);
    return acc;
  }, {});

  // Mutation para criar serviço
  const createServiceMutation = useMutation({
    mutationFn: (data: ServiceFormValues) => 
      apiRequest('/api/admin/services', { method: 'POST', data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/services'] });
      queryClient.invalidateQueries({ queryKey: ['/api/services'] });
      toast({
        title: "Serviço criado com sucesso",
        description: "O novo serviço foi adicionado à lista de serviços disponíveis",
      });
      setIsCreateDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erro ao criar serviço",
        description: error.message || "Ocorreu um erro ao tentar criar o serviço",
      });
    },
  });

  // Mutation para atualizar serviço
  const updateServiceMutation = useMutation({
    mutationFn: (data: ServiceFormValues & { id: number }) => 
      apiRequest(`/api/admin/services/${data.id}`, { method: 'PUT', data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/services'] });
      queryClient.invalidateQueries({ queryKey: ['/api/services'] });
      toast({
        title: "Serviço atualizado com sucesso",
        description: "As alterações foram salvas com sucesso",
      });
      setIsEditDialogOpen(false);
      setSelectedService(null);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar serviço",
        description: error.message || "Ocorreu um erro ao tentar atualizar o serviço",
      });
    },
  });

  // Mutation para excluir serviço
  const deleteServiceMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest(`/api/admin/services/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/services'] });
      queryClient.invalidateQueries({ queryKey: ['/api/services'] });
      toast({
        title: "Serviço excluído com sucesso",
        description: "O serviço foi removido permanentemente",
      });
      setIsDeleteDialogOpen(false);
      setSelectedService(null);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erro ao excluir serviço",
        description: error.message || "Ocorreu um erro ao tentar excluir o serviço",
      });
    },
  });

  // Manipuladores de eventos
  const handleCreateSubmit = (data: ServiceFormValues) => {
    createServiceMutation.mutate(data);
  };

  const handleEditSubmit = (data: ServiceFormValues) => {
    if (selectedService) {
      updateServiceMutation.mutate({ ...data, id: selectedService.id });
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedService) {
      deleteServiceMutation.mutate(selectedService.id);
    }
  };

  const handleEditClick = (service: Service) => {
    setSelectedService(service);
    form.reset({
      name: service.name,
      price: service.price,
      price_type: service.price_type,
      duration_minutes: service.duration_minutes,
      category_id: service.category_id,
      description: service.description || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (service: Service) => {
    setSelectedService(service);
    setIsDeleteDialogOpen(true);
  };

  // Formatar preço
  const formatPrice = (price: number, priceType: string) => {
    const formattedPrice = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price / 100);
    
    return priceType === 'FROM' ? `A partir de ${formattedPrice}` : formattedPrice;
  };

  // Encontrar nome da categoria pelo ID
  const getCategoryName = (categoryId: number) => {
    const category = categories?.find(cat => cat.id === categoryId);
    return category ? category.name : "Categoria não encontrada";
  };

  return (
    <AdminLayout title="Gerenciamento de Serviços">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-muted-foreground">
            Gerencie os serviços oferecidos pela barbearia
          </p>
        </div>
        <Button onClick={() => {
          form.reset({
            name: "",
            price: 0,
            price_type: "FIXED",
            duration_minutes: 30,
            category_id: categories?.[0]?.id || 0,
            description: "",
          });
          setIsCreateDialogOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Serviço
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">Todos</TabsTrigger>
          {categories?.map((category) => (
            <TabsTrigger key={category.id} value={String(category.id)}>
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          {servicesLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-2/3 mb-2" />
                    <Skeleton className="h-4 w-1/3 mb-2" />
                    <Skeleton className="h-4 w-1/4 mb-1" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredServices && filteredServices.length > 0 ? (
                filteredServices.map((service) => (
                  <Card key={service.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium">{service.name}</h3>
                            <p className="text-sm text-muted-foreground mb-1">
                              {getCategoryName(service.category_id)}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center">
                                <CircleDollarSign className="mr-1 h-3.5 w-3.5" />
                                {formatPrice(service.price, service.price_type)}
                              </div>
                              <div className="flex items-center">
                                <Clock className="mr-1 h-3.5 w-3.5" />
                                {service.duration_minutes} min
                              </div>
                            </div>
                            {service.description && (
                              <div className="flex items-start mt-2 text-sm text-muted-foreground">
                                <AlignLeft className="mr-1 h-3.5 w-3.5 mt-0.5" />
                                <span className="line-clamp-2">{service.description}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex space-x-1">
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => handleEditClick(service)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="text-destructive" 
                              onClick={() => handleDeleteClick(service)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-2 text-center py-8 text-muted-foreground">
                  Nenhum serviço encontrado para esta categoria.
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog para Criar Serviço */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Novo Serviço</DialogTitle>
            <DialogDescription>
              Adicione um novo serviço ao catálogo da barbearia
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Serviço</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço (em R$)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          step="0.01"
                          onChange={(e) => field.onChange(parseFloat(e.target.value) * 100)}
                          value={field.value / 100}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Preço</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {priceTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="duration_minutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duração (minutos)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="15" 
                          step="5"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))} 
                        defaultValue={field.value ? field.value.toString() : ''}
                        value={field.value ? field.value.toString() : ''}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories?.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição (opcional)</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                  disabled={createServiceMutation.isPending}
                >
                  {createServiceMutation.isPending ? (
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

      {/* Dialog para Editar Serviço */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Serviço</DialogTitle>
            <DialogDescription>
              Alterar informações do serviço
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEditSubmit)} className="space-y-4">
            <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Serviço</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço (em R$)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          step="0.01"
                          onChange={(e) => field.onChange(parseFloat(e.target.value) * 100)}
                          value={field.value / 100}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Preço</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {priceTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="duration_minutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duração (minutos)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="15" 
                          step="5"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))} 
                        defaultValue={field.value ? field.value.toString() : ''}
                        value={field.value ? field.value.toString() : ''}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories?.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição (opcional)</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                  disabled={updateServiceMutation.isPending}
                >
                  {updateServiceMutation.isPending ? (
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

      {/* Dialog para Excluir Serviço */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Excluir Serviço</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este serviço? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-muted/50 p-3 rounded-md mb-2">
            <p className="font-medium">{selectedService?.name}</p>
            <p className="text-sm text-muted-foreground">
              {selectedService && getCategoryName(selectedService.category_id)}
            </p>
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
              disabled={deleteServiceMutation.isPending}
            >
              {deleteServiceMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                  Excluindo...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}