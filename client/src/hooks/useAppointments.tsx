import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { apiRequest } from "../lib/queryClient";
import { API_ENDPOINTS } from "../lib/constants";
import { Appointment, AppointmentService } from "../lib/types";

type AppointmentCreation = {
  userId: number;
  professionalId: number;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  notes?: string;
  services: number[];
};

export const useAppointments = (userId?: number, professionalId?: number, date?: string) => {
  console.log("useAppointments hook chamado com:", { userId, professionalId, date });
  const queryClient = useQueryClient();

  // Build the query parameters
  const queryParams = new URLSearchParams();
  if (userId) queryParams.append('userId', userId.toString());
  if (professionalId) queryParams.append('professionalId', professionalId.toString());
  if (date) queryParams.append('date', date);
  
  const queryString = queryParams.toString();
  const apiUrl = queryString ? `${API_ENDPOINTS.APPOINTMENTS}?${queryString}` : API_ENDPOINTS.APPOINTMENTS;

  // Fetch appointments based on filters
  const { 
    data: rawAppointments = [], 
    isLoading,
    error
  } = useQuery<Appointment[]>({ 
    queryKey: [apiUrl],
    // Sempre habilitar a consulta, mesmo que os parâmetros sejam undefined
    // Nesse caso, retornará todos os agendamentos
    staleTime: 0, // Sempre buscar dados atualizados
    refetchOnMount: true, // Refazer a consulta sempre que o componente montar
    refetchOnWindowFocus: true // Refazer a consulta quando o usuário focar na janela
  });
  
  // Normalizar os status dos agendamentos para garantir consistência
  // Uma vez que o banco armazena em minúsculas e a aplicação usa constantes
  const appointments = useMemo(() => {
    return rawAppointments.map(appointment => {
      // Garantir que temos um valor de status válido
      const rawStatus = appointment.status?.toLowerCase() || 'scheduled';
      
      // Log para debug
      console.log(`Normalizando status do agendamento #${appointment.id}: ${appointment.status} -> ${rawStatus}`);
      
      return {
        ...appointment,
        status: rawStatus
      };
    });
  }, [rawAppointments]);

  // Create a new appointment
  const { mutateAsync: createAppointment, isPending: isCreating } = useMutation({
    mutationFn: async (appointmentData: AppointmentCreation) => {
      const response = await apiRequest('POST', API_ENDPOINTS.APPOINTMENTS, appointmentData);
      return response.json();
    },
    onSuccess: () => {
      // Invalidar todas as queries de agendamentos para atualizar todas as visualizações
      queryClient.invalidateQueries({ 
        queryKey: [API_ENDPOINTS.APPOINTMENTS],
        refetchType: 'all',
        exact: false 
      });
      
      // Se temos parâmetros específicos, também invalidamos a consulta específica
      if (userId || professionalId || date) {
        queryClient.invalidateQueries({ queryKey: [apiUrl] });
      }
    }
  });

  // Update appointment status
  const { mutateAsync: updateAppointmentStatus, isPending: isUpdating } = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest('PATCH', `${API_ENDPOINTS.APPOINTMENTS}/${id}/status`, { status });
      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidar todas as queries de agendamentos para garantir atualização em todas as telas
      queryClient.invalidateQueries({ 
        queryKey: [API_ENDPOINTS.APPOINTMENTS],
        refetchType: 'all',
        exact: false 
      });
      
      // Invalidar também a query específica do appointment atualizado
      queryClient.invalidateQueries({ 
        queryKey: [`${API_ENDPOINTS.APPOINTMENTS}/${variables.id}`] 
      });
      
      // Se temos parâmetros específicos, também invalidamos a consulta específica
      if (userId || professionalId || date) {
        queryClient.invalidateQueries({ queryKey: [apiUrl] });
      }
    }
  });

  // Add a service to an appointment
  const { mutateAsync: addServiceToAppointment, isPending: isAddingService } = useMutation({
    mutationFn: async ({ appointmentId, serviceId }: { appointmentId: number; serviceId: number }) => {
      const response = await apiRequest('POST', API_ENDPOINTS.APPOINTMENT_SERVICES, {
        appointmentId,
        serviceId
      });
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [`${API_ENDPOINTS.APPOINTMENTS}/${variables.appointmentId}/services`] });
    }
  });

  return {
    appointments,
    isLoading,
    error,
    createAppointment,
    updateAppointmentStatus,
    addServiceToAppointment,
    isCreating,
    isUpdating,
    isAddingService
  };
}