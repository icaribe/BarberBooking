import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DollarSign } from "lucide-react";
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

// Interface estendida para incluir os campos adicionais retornados pela API
interface EnhancedAppointment {
  id: number;
  status: string | null;
  date: string;
  userId: number;
  professionalId: number;
  startTime: string | null;
  endTime: string | null;
  client_name?: string;
  client_email?: string;
  professional_name?: string;
  service_names?: string[];
  service_ids?: number[];
  service_prices?: number[]; // Preços dos serviços individuais
  totalValue?: number; // Valor total do agendamento
  start_time?: string;
  end_time?: string;
  notes: string | null;
  createdAt: Date | null;
}

export default function AdminAppointmentsPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  // Iniciamos com o valor do localStorage se existir, ou "today" como padrão
  const savedTab = typeof window !== 'undefined' ? localStorage.getItem('appointmentsActiveTab') || "today" : "today";
  const [activeTab, setActiveTab] = useState(savedTab);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<EnhancedAppointment | null>(null);
  const [appointmentsState, setAppointmentsState] = useState<EnhancedAppointment[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Persistência da aba usando localStorage
  const updateActiveTab = useCallback((tab: string) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      localStorage.setItem('appointmentsActiveTab', tab);
      console.log(`Aba salva no localStorage: ${tab}`);
    }
  }, []);

  // Formulário para atualizar status
  const form = useForm<StatusFormValues>({
    resolver: zodResolver(updateStatusSchema),
    defaultValues: {
      status: "PENDING",
      notes: "",
    },
  });

  // Buscar agendamentos
  const { data: appointments, isLoading: appointmentsLoading } = useQuery<EnhancedAppointment[]>({
    queryKey: ['/api/admin/appointments'],
    staleTime: 60000 // 1 minuto
  });

  // Atualizar o estado local quando os dados são carregados
  useEffect(() => {
    if (appointments) {
      setAppointmentsState(appointments);
    }
  }, [appointments]);

  // Buscar profissionais para filtro
  const { data: professionals } = useQuery({
    queryKey: ['/api/professionals'],
  });

  // Mutation para atualizar status do agendamento
  const updateStatusMutation = useMutation({
    mutationFn: (data: (StatusFormValues & { id: number, status: string })) => {
      // Garantir que estamos enviando o status no formato correto para o backend
      console.log("Enviando para API - status:", data.status);

      return apiRequest('PUT', `/api/admin/appointments/${data.id}/status`, { 
        status: data.status,  // Já deve estar no formato do backend (minúsculo)
        notes: data.notes 
      });
    },
    onMutate: () => {
      // Salvar o estado atual da aba
      const currentTab = activeTab;
      console.log('Salvando a aba atual:', currentTab);
      return { currentTab };
    },
    onSuccess: (data, variables, context) => {
      // Log para verificar se a função está sendo chamada com o status correto
      console.log(`Agendamento #${variables.id} marcado como ${variables.status} - atualizando queries relacionadas`);

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

      // Sempre garantir que as queries financeiras sejam atualizadas quando o status mudar
      // Usar toLowerCase para comparação case-insensitive
      const statusLower = variables.status.toLowerCase();
      console.log('Status atual do agendamento:', statusLower);

      // Forçar atualizações em todas as queries de dados financeiros
      // Isso é necessário independentemente do novo status, já que precisamos
      // atualizar o financeiro tanto ao concluir quanto ao remover a conclusão
      setTimeout(() => {
        console.log('Forçando atualização de dados financeiros após alteração de status');

        // Invalidar todas as queries relacionadas ao fluxo de caixa
        queryClient.invalidateQueries({
          queryKey: ['/api/admin/cash-flow'],
          refetchType: 'all',
          exact: false
        });

        // Invalidar especificamente o resumo financeiro
        queryClient.invalidateQueries({
          queryKey: ['/api/admin/cash-flow/summary'],
          refetchType: 'all',
          exact: false
        });

        // Invalidar dashboard
        queryClient.invalidateQueries({
          queryKey: ['/api/admin/dashboard'],
          refetchType: 'all',
          exact: false
        });

        // Fazer uma solicitação explícita para o resumo financeiro atual
        apiRequest('GET', '/api/admin/cash-flow/summary')
          .then(data => {
            console.log('Resumo financeiro atualizado após alteração de status:', data);
          })
          .catch(err => {
            console.error('Erro ao solicitar resumo financeiro atualizado:', err);
          });

        // Fazer uma solicitação explícita para o dashboard também
        apiRequest('GET', '/api/admin/dashboard')
          .then(data => {
            console.log('Dashboard atualizado após alteração de status:', data);
          })
          .catch(err => {
            console.error('Erro ao solicitar dashboard atualizado:', err);
          });
      }, 1000); // Pequeno delay para garantir que o backend tenha concluído o processamento

      // Atualizar o status do agendamento localmente para refletir imediatamente na interface
      if (selectedAppointment && appointments) {
        // Log de depuração para rastrear o valor do status recebido
        console.log("Status recebido do backend:", data?.status);
        console.log("Status enviado no request:", variables.status);

        // Encontrar e atualizar o agendamento na lista local
        const updatedAppointments = [...appointments].map(appointment => {
          if (appointment.id === variables.id) {
            // Garantindo que notes não é undefined
            const updatedNotes = variables.notes === undefined ? null : variables.notes;

            // Verificar se o valor retornado pelo backend é um código HTTP
            // Se for, usamos o status enviado no request, caso contrário usamos o retornado pelo backend
            const isHttpStatusCode = typeof data?.status === 'number' && data?.status >= 100 && data?.status < 600;

            // Usar o status do request se o backend retornou apenas o código HTTP
            const updatedStatus = isHttpStatusCode ? variables.status : (data?.status || variables.status);

            // Garantir que o status seja uma string
            const normalizedStatus = String(updatedStatus);
            console.log(`Atualizando agendamento ${appointment.id} para status: ${normalizedStatus}, (código HTTP: ${isHttpStatusCode ? 'sim' : 'não'})`);

            return {
              ...appointment,
              status: normalizedStatus, // Usar a versão normalizada do status (já como string)
              notes: updatedNotes
            };
          }
          return appointment;
        });

        // Atualizar os estados locais - garantir que o tipo seja EnhancedAppointment[]
        setAppointmentsState(updatedAppointments as EnhancedAppointment[]);
      }

      toast({
        title: "Status atualizado com sucesso",
        description: "O agendamento foi atualizado",
      });
      setIsUpdateDialogOpen(false);
      setSelectedAppointment(null);

      // Garantir que a aba atual seja mantida
      if (context?.currentTab) {
        setActiveTab(context.currentTab);
      }
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar status",
        description: error.message || "Ocorreu um erro ao tentar atualizar o agendamento",
      });
    },
  });

  // Usar o estado local para filtragem, que será atualizado em tempo real
  const filteredAppointments = appointmentsState.filter(appointment => {
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
  const handleUpdateStatus = (appointment: EnhancedAppointment) => {
    setSelectedAppointment(appointment);

    // Mapear o status do backend para o frontend
    let mappedStatus = appointment.status?.trim().toLowerCase() || "";

    // Mapeamento de status em minúsculo do backend para maiúsculo do frontend
    if (mappedStatus === "scheduled") mappedStatus = "pending";
    if (mappedStatus === "completed") mappedStatus = "completed";
    if (mappedStatus === "cancelled") mappedStatus = "cancelled";
    if (mappedStatus === "confirmed") mappedStatus = "confirmed";

    // Normalizar para maiúsculo
    let normalizedStatus = mappedStatus.toUpperCase();

    // Garantir que o status é um dos valores aceitáveis pelo schema
    if (normalizedStatus !== "PENDING" && normalizedStatus !== "CONFIRMED" && 
        normalizedStatus !== "CANCELLED" && normalizedStatus !== "COMPLETED") {
      console.warn(`Status desconhecido normalizado para PENDING: ${appointment.status} -> ${normalizedStatus}`);
      normalizedStatus = "PENDING";
    }

    console.log("Abrindo dialog com status:", normalizedStatus);

    form.reset({
      status: normalizedStatus as "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED",
      notes: appointment.notes || "",
    });

    setIsUpdateDialogOpen(true);
  };

  // Função de mapeamento de status do frontend para o backend
  const mapFrontendStatusToBackend = (frontendStatus: string): string => {
    // Converter formato do frontend (MAIÚSCULO) para o backend (minúsculo)
    switch (frontendStatus) {
      case "PENDING":
        return "scheduled"; // No backend, agendamentos pendentes usam "scheduled"
      case "COMPLETED":
        return "completed";
      case "CANCELLED":
        return "cancelled";
      case "CONFIRMED":
        return "confirmed";
      default:
        console.warn(`Status desconhecido no frontend: ${frontendStatus}`);
        return frontendStatus.toLowerCase();
    }
  };

  // Referência para armazenar a aba atual
  const currentTabRef = useRef(activeTab);

  // Atualizar a referência sempre que a aba mudar
  useEffect(() => {
    currentTabRef.current = activeTab;
  }, [activeTab]);

  const handleUpdateSubmit = (data: StatusFormValues) => {
    if (selectedAppointment) {
      // Verificar se estamos indo ou voltando de um status "completed"
      // para garantir atualizações financeiras apropriadas
      const oldStatus = selectedAppointment.status?.toLowerCase() || '';
      const newStatus = mapFrontendStatusToBackend(data.status);
      const wasCompleted = oldStatus === 'completed';
      const isBecomingCompleted = newStatus === 'completed';

      console.log(`Status change analysis: ${oldStatus} -> ${newStatus}`);
      console.log(`Financial impact: ${wasCompleted ? 'removing transaction' : ''} ${isBecomingCompleted ? 'adding transaction' : ''}`);

      // Armazenar a aba atual para restauração após a mutação
      const tabToRestore = activeTab;
      console.log("Preservando aba atual:", tabToRestore);

      // Atualizar o estado local imediatamente
      const updatedAppointments = appointmentsState.map(appointment => {
        if (appointment.id === selectedAppointment.id) {
          return {
            ...appointment,
            status: newStatus,
            notes: data.notes || null // Garantir que será string | null, não undefined
          };
        }
        return appointment;
      });
      setAppointmentsState(updatedAppointments);

      // Executar a mutação com o status mapeado para o backend
      updateStatusMutation.mutate({ 
        ...data, 
        id: selectedAppointment.id,
        status: newStatus as any
      });

      // Forçar atualização imediata das queries financeiras e dashboard se for
      // uma mudança de completed -> outro status ou outro status -> completed
      if (wasCompleted || isBecomingCompleted) {
        setTimeout(() => {
          console.log("Forçando atualização dos dados financeiros e dashboard");

          queryClient.invalidateQueries({
            queryKey: ['/api/admin/cash-flow'],
            exact: false,
            refetchType: 'all'
          });

          queryClient.invalidateQueries({
            queryKey: ['/api/admin/dashboard'],
            exact: false,
            refetchType: 'all'
          });

          // Solicitar explicitamente os novos dados
          apiRequest('GET', '/api/admin/dashboard')
            .then(() => console.log("Dashboard recarregado"))
            .catch(e => console.error("Erro ao recarregar dashboard:", e));

          apiRequest('GET', '/api/admin/cash-flow/summary')
            .then(() => console.log("Dados financeiros recarregados"))
            .catch(e => console.error("Erro ao recarregar dados financeiros:", e));
        }, 1000);
      }

      // Armazenar a aba no localStorage e restaurá-la após a atualização
      localStorage.setItem('appointmentsActiveTab', tabToRestore);

      // Restaurar a aba mais de uma vez para garantir que ela seja mantida
      setTimeout(() => {
        updateActiveTab(tabToRestore);
        console.log("Aba restaurada (1º tentativa):", tabToRestore);
      }, 500);

      setTimeout(() => {
        updateActiveTab(tabToRestore);
        console.log("Aba restaurada (2º tentativa):", tabToRestore);
      }, 1500);
    }
  };

  // Funções de formatação e utilitárias
  const formatAppointmentDate = (dateString: string) => {
    const date = parseISO(dateString);
    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  // Formatação de valores monetários - MODIFICADA PARA DIVIDIR POR 100
  const formatCurrency = (value: number | undefined | null) => {
    if (value === undefined || value === null) return 'R$ 0,00';
    const valueInReais = value / 100; // Divide o valor por 100 para converter de centavos para reais
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valueInReais);
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

  const getStatusBadge = (status: string | null) => {
    // Log para depuração do valor do status
    console.log("Renderizando badge para status:", status);

    if (!status) return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pendente</Badge>;

    // Normalizar o status para minúsculo e remover espaços
    const normalizedStatus = status.trim().toLowerCase();
    
    // Log para depuração após normalização
    console.log("Status após normalização:", normalizedStatus);

    // Mapear os status usando o valor normalizado
    switch (normalizedStatus) {
      case "confirmed":
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Confirmado</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">Cancelado</Badge>;
      case "completed":
      case "complete":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Concluído</Badge>;
      case "scheduled":
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pendente</Badge>;
      default:
        console.log("Status não reconhecido:", status);
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pendente</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    // Normalizar o status para minúsculo
    const normalizedStatus = status.toLowerCase();
    
    // Log para depuração
    console.log("getStatusIcon para status:", status, "normalizado para:", normalizedStatus);
    
    switch (normalizedStatus) {
      case "confirmed":
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Confirmado</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">Cancelado</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Concluído</Badge>;
      case "pending":
      case "scheduled": // Adicionar suporte ao status "scheduled" vindo do backend
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pendente</Badge>;
      default:
        console.log("Status não reconhecido após normalização:", status);
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pendente</Badge>;
    }
  };

  const getStatusActions = (appointment: EnhancedAppointment) => {
    // Mapear os status do backend para os status do frontend
    let mappedStatus = appointment.status?.trim().toLowerCase() || "";

    // Mapeamento do status 'scheduled' para 'pending' para compatibilidade
    if (mappedStatus === "scheduled") mappedStatus = "pending";

    // Log para debug
    console.log("getStatusActions para appointment:", appointment.id, "status original:", appointment.status, "mapeado para:", mappedStatus);

    // Verificar se o status é pendente ou agendado
    if (mappedStatus === "pending" || mappedStatus === "scheduled") {
      return (
        <div className="flex space-x-1">
          <Button 
            size="sm" 
            variant="outline" 
            className="h-8 border-green-500 text-green-500 hover:bg-green-50"
            onClick={() => {
              setSelectedAppointment(appointment);
              form.reset({
                status: "CONFIRMED", // Mantemos em maiúsculo para o formulário
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
                status: "CANCELLED", // Mantemos em maiúsculo para o formulário
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

      <Tabs value={activeTab} onValueChange={updateActiveTab}>
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

                        {/* Adicionando informação de valor do serviço */}
                        <div className="flex items-start gap-1 text-sm mt-1 text-muted-foreground">
                          <DollarSign className="mr-1 h-3.5 w-3.5 mt-0.5" />
                          <span className="font-medium">
                            {formatCurrency(appointment.totalValue)}
                            {appointment.service_prices && appointment.service_prices.length > 0 && (
                              <span className="ml-2 text-xs text-muted-foreground/70">
                                ({appointment.service_prices.length} {appointment.service_prices.length === 1 ? 'serviço' : 'serviços'})
                              </span>
                            )}
                          </span>
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
              <div className="flex items-center mt-1">
                <DollarSign className="mr-1 h-3.5 w-3.5" />
                <span className="font-medium">{formatCurrency(selectedAppointment?.totalValue)}</span>
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
                      <Check className="mr-2h-4 w-4" />
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