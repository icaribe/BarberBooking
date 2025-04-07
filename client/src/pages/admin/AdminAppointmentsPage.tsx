import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
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
  DialogTitle
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { 
  Check, 
  X, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Scissors,
  CheckCircle2,
  XCircle,
  ClockIcon,
  CalendarDays
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Appointment } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { format, isToday, isAfter, isBefore, parseISO, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const updateStatusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"]),
  notes: z.string().optional(),
});

type StatusFormValues = z.infer<typeof updateStatusSchema>;

export default function AdminAppointmentsPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [activeTab, setActiveTab] = useState("today");
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Formulário para atualizar status
  const form = useForm<StatusFormValues>({
    resolver: zodResolver(updateStatusSchema),
    defaultValues: {
      status: "PENDING",
      notes: "",
    },
  });

  // Buscar agendamentos
  const { data: appointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ['/api/admin/appointments'],
  });

  // Buscar profissionais para filtro
  const { data: professionals } = useQuery({
    queryKey: ['/api/professionals'],
  });

  // Mutation para atualizar status do agendamento
  const updateStatusMutation = useMutation({
    mutationFn: (data: StatusFormValues & { id: number }) => 
      apiRequest('PUT', `/api/admin/appointments/${data.id}/status`, { 
        status: data.status, 
        notes: data.notes 
      }),
    onSuccess: () => {
      // Forçar atualização imediata de todas as queries relacionadas
      queryClient.invalidateQueries({ 
        queryKey: ['/api/admin/appointments'],
        refetchType: 'all',
        exact: false
      });
      queryClient.invalidateQueries({ 
        queryKey: ['/api/admin/dashboard'],
        refetchType: 'all',
        exact: false
      });
      toast({
        title: "Status atualizado com sucesso",
        description: "O agendamento foi atualizado",
      });
      setIsUpdateDialogOpen(false);
      setSelectedAppointment(null);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar status",
        description: error.message || "Ocorreu um erro ao tentar atualizar o agendamento",
      });
    },
  });

  // Filtrar agendamentos com base na aba selecionada
  const filteredAppointments = appointments?.filter(appointment => {
    const appointmentDate = parseISO(appointment.date);

    switch (activeTab) {
      case "today":
        return isToday(appointmentDate);
      case "upcoming":
        return isAfter(appointmentDate, startOfDay(new Date()));
      case "past":
        return isBefore(appointmentDate, startOfDay(new Date()));
      case "date":
        return selectedDate && 
          appointmentDate.getDate() === selectedDate.getDate() &&
          appointmentDate.getMonth() === selectedDate.getMonth() &&
          appointmentDate.getFullYear() === selectedDate.getFullYear();
      default:
        return true;
    }
  });

  // Manipuladores de eventos
  const handleUpdateStatus = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    form.reset({
      status: appointment.status,
      notes: appointment.notes || "",
    });
    setIsUpdateDialogOpen(true);
  };

  const handleUpdateSubmit = (data: StatusFormValues) => {
    if (selectedAppointment) {
      updateStatusMutation.mutate({ ...data, id: selectedAppointment.id });
    }
  };

  // Funções de formatação e utilitárias
  const formatAppointmentDate = (dateString: string) => {
    const date = parseISO(dateString);
    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const formatAppointmentTime = (timeString: string | null | undefined) => {
    try {
      // Verificar se o timeString está definido
      if (!timeString) return "--:--";

      // O formato esperado é HH:MM:SS ou HH:MM, vamos garantir que é válido
      // Adicionando validação através de regex
      if (!/^\d{2}:\d{2}(:\d{2})?$/.test(timeString)) {
        console.warn(`Formato de hora inválido: ${timeString}`);
        return timeString; // Retorna a string original se não estiver no formato esperado
      }

      try {
        // Convertendo a string de tempo para um objeto Date para formatação
        const timeDate = parseISO(`2000-01-01T${timeString}`);
        if (isNaN(timeDate.getTime())) {
          console.warn(`Data inválida gerada para: ${timeString}`);
          return timeString;
        }
        return format(timeDate, "HH:mm", { locale: ptBR });
      } catch (parseError) {
        console.error("Erro ao analisar data:", parseError);
        return timeString;
      }
    } catch (error) {
      console.error("Erro ao formatar hora:", error, timeString);
      return timeString || "--:--"; // Fallback para exibição
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Confirmado</Badge>;
      case "CANCELLED":
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">Cancelado</Badge>;
      case "COMPLETED":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Concluído</Badge>;
      default:
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pendente</Badge>;
    }
  };

  const getStatusActions = (appointment: Appointment) => {
    if (appointment.status === "PENDING") {
      return (
        <div className="flex space-x-1">
          <Button 
            size="sm" 
            variant="outline" 
            className="h-8 border-green-500 text-green-500 hover:bg-green-50"
            onClick={() => {
              setSelectedAppointment(appointment);
              form.reset({
                status: "CONFIRMED",
                notes: appointment.notes || "",
              });
              setIsUpdateDialogOpen(true);
            }}
          >
            <Check className="h-4 w-4 mr-1" />
            Confirmar
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="h-8 border-red-500 text-red-500 hover:bg-red-50"
            onClick={() => {
              setSelectedAppointment(appointment);
              form.reset({
                status: "CANCELLED",
                notes: appointment.notes || "",
              });
              setIsUpdateDialogOpen(true);
            }}
          >
            <X className="h-4 w-4 mr-1" />
            Cancelar
          </Button>
        </div>
      );
    }
    return (
      <Button 
        size="sm" 
        variant="outline" 
        className="h-8"
        onClick={() => handleUpdateStatus(appointment)}
      >
        Alterar Status
      </Button>
    );
  };

  return (
    <AdminLayout title="Gerenciamento de Agendamentos">
      <div className="mb-6">
        <p className="text-muted-foreground">
          Visualize e gerencie os agendamentos de serviços
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="today">Hoje</TabsTrigger>
          <TabsTrigger value="upcoming">Futuros</TabsTrigger>
          <TabsTrigger value="past">Passados</TabsTrigger>
          <TabsTrigger value="date">Por Data</TabsTrigger>
        </TabsList>

        {activeTab === "date" && (
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <Card className="w-full sm:w-auto">
              <CardContent className="p-4">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="border rounded-md"
                  locale={ptBR}
                />
              </CardContent>
            </Card>
            <div className="flex-1">
              <h3 className="text-lg font-medium mb-2">
                {selectedDate ? format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : "Selecione uma data"}
              </h3>
              <p className="text-muted-foreground">
                {filteredAppointments?.length || 0} agendamentos encontrados
              </p>
            </div>
          </div>
        )}

        <TabsContent value={activeTab} className="mt-0">
          {appointmentsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <Skeleton className="h-6 w-2/3 mb-2" />
                        <div className="flex flex-wrap gap-3 mb-2">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                        <Skeleton className="h-4 w-full" />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Skeleton className="h-9 w-24" />
                        <Skeleton className="h-9 w-24" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredAppointments?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground/60 mb-3" />
              <p>Nenhum agendamento encontrado para este período.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAppointments?.map((appointment) => (
                <Card key={appointment.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-medium">
                            {appointment.client_name || "Cliente"}
                          </h3>
                          <div className="lg:hidden">
                            {getStatusBadge(appointment.status)}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mb-2">
                          <div className="flex items-center">
                            <CalendarIcon className="mr-1 h-3.5 w-3.5" />
                            {formatAppointmentDate(appointment.date)}
                          </div>
                          <div className="flex items-center">
                            <Clock className="mr-1 h-3.5 w-3.5" />
                            {formatAppointmentTime(appointment.startTime || appointment.start_time)} - {formatAppointmentTime(appointment.endTime || appointment.end_time)}
                          </div>
                          <div className="flex items-center">
                            <User className="mr-1 h-3.5 w-3.5" />
                            {appointment.professional_name || "Profissional não especificado"}
                          </div>
                        </div>
                        <div className="flex items-start gap-1 text-sm text-muted-foreground">
                          <Scissors className="mr-1 h-3.5 w-3.5 mt-0.5" />
                          <span>{appointment.service_names?.join(', ') || "Serviço não especificado"}</span>
                        </div>
                        {appointment.notes && (
                          <div className="mt-2 text-sm border-l-2 border-muted-foreground/20 pl-2 italic text-muted-foreground">
                            {appointment.notes}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between lg:justify-end gap-3">
                        <div className="hidden lg:block">
                          {getStatusBadge(appointment.status)}
                        </div>
                        {getStatusActions(appointment)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog para Atualizar Status */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Atualizar Status do Agendamento</DialogTitle>
            <DialogDescription>
              Altere o status do agendamento e adicione observações se necessário
            </DialogDescription>
          </DialogHeader>
          <div className="bg-muted/50 p-3 rounded-md mb-4">
            <p className="font-medium">{selectedAppointment?.client_name}</p>
            <div className="text-sm text-muted-foreground">
              <div className="flex items-center">
                <CalendarIcon className="mr-1 h-3.5 w-3.5" />
                {selectedAppointment?.date && formatAppointmentDate(selectedAppointment.date)}
              </div>
              <div className="flex items-center">
                <Clock className="mr-1 h-3.5 w-3.5" />
                {formatAppointmentTime(selectedAppointment?.startTime || selectedAppointment?.start_time)} - {formatAppointmentTime(selectedAppointment?.endTime || selectedAppointment?.end_time)}
              </div>
              <div className="flex items-center">
                <User className="mr-1 h-3.5 w-3.5" />
                {selectedAppointment?.professional_name}
              </div>
              <div className="flex items-center">
                <Scissors className="mr-1 h-3.5 w-3.5" />
                {selectedAppointment?.service_names?.join(', ')}
              </div>
            </div>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdateSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status do Agendamento</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PENDING">
                          <div className="flex items-center">
                            <ClockIcon className="mr-2 h-4 w-4 text-yellow-500" />
                            Pendente
                          </div>
                        </SelectItem>
                        <SelectItem value="CONFIRMED">
                          <div className="flex items-center">
                            <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                            Confirmado
                          </div>
                        </SelectItem>
                        <SelectItem value="CANCELLED">
                          <div className="flex items-center">
                            <XCircle className="mr-2 h-4 w-4 text-red-500" />
                            Cancelado
                          </div>
                        </SelectItem>
                        <SelectItem value="COMPLETED">
                          <div className="flex items-center">
                            <CheckCircle2 className="mr-2 h-4 w-4 text-blue-500" />
                            Concluído
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações (opcional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        rows={3} 
                        {...field} 
                        placeholder="Adicione observações sobre o agendamento..."
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
                  onClick={() => setIsUpdateDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateStatusMutation.isPending}
                >
                  {updateStatusMutation.isPending ? (
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
    </AdminLayout>
  );
}