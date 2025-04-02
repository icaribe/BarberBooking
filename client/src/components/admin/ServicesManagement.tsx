import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { formatCurrency } from "../../lib/constants";
import { useToast } from "../../hooks/use-toast";

interface Service {
  id: number;
  name: string;
  description: string;
  price: number; // em centavos
  duration: number; // em minutos
  image_url?: string;
  category_id: number;
}

interface ServiceCategory {
  id: number;
  name: string;
}

interface ServicesManagementProps {
  canEdit: boolean;
}

export default function ServicesManagement({ canEdit }: ServicesManagementProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("list");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [editMode, setEditMode] = useState(false);
  const [currentService, setCurrentService] = useState<Service | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration: "",
    image_url: "",
    category_id: ""
  });

  // Fetching services and categories
  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ["services"],
  });

  const { data: categories = [] } = useQuery<ServiceCategory[]>({
    queryKey: ["service-categories"],
  });

  // Mutations for service management
  const { mutate: createService, isPending: isCreating } = useMutation({
    mutationFn: async (data: Omit<Service, "id">) => {
      const response = await fetch("/api/services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create service");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      resetForm();
      setActiveTab("list");
      toast({
        title: "Serviço criado",
        description: "O serviço foi criado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível criar o serviço.",
        variant: "destructive",
      });
    },
  });

  const { mutate: updateService, isPending: isUpdating } = useMutation({
    mutationFn: async (data: Service) => {
      const response = await fetch(`/api/services/${data.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update service");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      resetForm();
      setEditMode(false);
      setActiveTab("list");
      toast({
        title: "Serviço atualizado",
        description: "O serviço foi atualizado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o serviço.",
        variant: "destructive",
      });
    },
  });

  const { mutate: deleteService } = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/services/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete service");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast({
        title: "Serviço removido",
        description: "O serviço foi removido com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível remover o serviço.",
        variant: "destructive",
      });
    },
  });

  // Helper functions
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      duration: "",
      image_url: "",
      category_id: ""
    });
    setCurrentService(null);
  };

  const handleEditService = (service: Service) => {
    setCurrentService(service);
    setFormData({
      name: service.name,
      description: service.description,
      price: (service.price / 100).toString(), // Convert cents to reais for display
      duration: service.duration.toString(),
      image_url: service.image_url || "",
      category_id: service.category_id.toString()
    });
    setEditMode(true);
    setActiveTab("add");
  };

  const handleDeleteService = (id: number) => {
    if (window.confirm("Tem certeza que deseja remover este serviço?")) {
      deleteService(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert price to cents
    const priceInCents = Math.round(parseFloat(formData.price) * 100);
    
    const serviceData = {
      name: formData.name,
      description: formData.description,
      price: priceInCents,
      duration: parseInt(formData.duration),
      image_url: formData.image_url,
      category_id: parseInt(formData.category_id)
    };

    if (editMode && currentService) {
      updateService({ id: currentService.id, ...serviceData });
    } else {
      createService(serviceData);
    }
  };

  // Filter services by category
  const filteredServices = selectedCategory === "all" 
    ? services 
    : services.filter(service => service.category_id.toString() === selectedCategory);

  // Get category name by id
  const getCategoryName = (categoryId: number) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : "Sem categoria";
  };

  // Format duration to display as "X min"
  const formatDuration = (minutes: number) => {
    return `${minutes} min`;
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="list">Lista de Serviços</TabsTrigger>
        <TabsTrigger value="add" disabled={!canEdit}>
          {editMode ? "Editar Serviço" : "Adicionar Serviço"}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="list" className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <Select
            value={selectedCategory}
            onValueChange={setSelectedCategory}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filteredServices.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            Nenhum serviço encontrado.
          </p>
        ) : (
          filteredServices.map((service) => (
            <Card key={service.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center border-b">
                  {service.image_url && (
                    <div className="w-24 h-24 flex-shrink-0">
                      <img
                        src={service.image_url}
                        alt={service.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4 flex-grow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{service.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {getCategoryName(service.category_id)}
                        </p>
                        <div className="flex gap-3 mt-1">
                          <p className="font-semibold">
                            {formatCurrency(service.price)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatDuration(service.duration)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {canEdit && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditService(service)}
                            >
                              Editar
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteService(service.id)}
                            >
                              Remover
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </TabsContent>

      <TabsContent value="add">
        <Card>
          <CardHeader>
            <CardTitle>{editMode ? "Editar Serviço" : "Adicionar Novo Serviço"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Serviço</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Preço (R$)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duração (minutos)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">URL da Imagem</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setEditMode(false);
                    setActiveTab("list");
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isCreating || isUpdating}>
                  {editMode ? "Atualizar" : "Adicionar"} Serviço
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}