import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../hooks/use-toast';
import { API_ENDPOINTS, AppointmentStatus } from '../constants';

// Tipos para agendamentos
export interface AppointmentService {
  id: number;
  appointment_id: number;
  service_id: number;
  service_name: string;
  price: number;
}

export interface Appointment {
  id: number;
  date: string;
  time: string;
  status: AppointmentStatus;
  user_id: number;
  professional_id: number;
  created_at: string;
  updated_at?: string;
  customer_name: string;
  professional_name: string;
  services: AppointmentService[];
  total_price: number;
}

export interface CreateAppointmentData {
  date: string;
  time: string;
  professional_id: number;
  services: number[];
}

// Hook para gerenciar agendamentos
export function useAppointments() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState({ status: 'all' });
  
  // Buscar todos os agendamentos (com filtro opcional)
  const { data: appointments = [], isLoading, error } = useQuery<Appointment[]>({
    queryKey: ['appointments', filter],
    queryFn: async () => {
      let url = API_ENDPOINTS.APPOINTMENTS.BASE;
      
      if (filter.status && filter.status !== 'all') {
        url += `?status=${filter.status}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Erro ao buscar agendamentos');
      }
      return response.json();
    },
  });
  
  // Buscar um agendamento específico
  const getAppointment = (appointmentId: number) => {
    return useQuery({
      queryKey: ['appointment', appointmentId],
      queryFn: async () => {
        const response = await fetch(`${API_ENDPOINTS.APPOINTMENTS.BASE}/${appointmentId}`);
        if (!response.ok) {
          throw new Error('Erro ao buscar agendamento');
        }
        return response.json();
      },
      enabled: !!appointmentId,
    });
  };
  
  // Criar novo agendamento
  const { mutate: createAppointment, isPending: isCreating } = useMutation({
    mutationFn: async (data: CreateAppointmentData) => {
      const response = await fetch(API_ENDPOINTS.APPOINTMENTS.BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Erro ao criar agendamento');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast({
        title: 'Agendamento realizado',
        description: 'Seu agendamento foi realizado com sucesso.',
        variant: 'success',
      });
    },
    onError: () => {
      toast({
        title: 'Erro',
        description: 'Não foi possível realizar o agendamento. Tente novamente.',
        variant: 'destructive',
      });
    },
  });
  
  // Adicionar serviço a um agendamento existente
  const { mutate: addServiceToAppointment, isPending: isAddingService } = useMutation({
    mutationFn: async ({ appointmentId, serviceId }: { appointmentId: number; serviceId: number }) => {
      const response = await fetch(API_ENDPOINTS.APPOINTMENTS.APPOINTMENT_SERVICES, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointment_id: appointmentId,
          service_id: serviceId,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Erro ao adicionar serviço');
      }
      
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['appointment', variables.appointmentId] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast({
        title: 'Serviço adicionado',
        description: 'O serviço foi adicionado ao agendamento.',
        variant: 'success',
      });
    },
    onError: () => {
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar o serviço. Tente novamente.',
        variant: 'destructive',
      });
    },
  });
  
  // Cancelar agendamento
  const { mutate: cancelAppointment, isPending: isCancelling } = useMutation({
    mutationFn: async (appointmentId: number) => {
      const response = await fetch(`${API_ENDPOINTS.APPOINTMENTS.BASE}/${appointmentId}/cancel`, {
        method: 'PUT',
      });
      
      if (!response.ok) {
        throw new Error('Erro ao cancelar agendamento');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast({
        title: 'Agendamento cancelado',
        description: 'Seu agendamento foi cancelado com sucesso.',
        variant: 'success',
      });
    },
    onError: () => {
      toast({
        title: 'Erro',
        description: 'Não foi possível cancelar o agendamento. Tente novamente.',
        variant: 'destructive',
      });
    },
  });
  
  // Completar agendamento (marcar como concluído)
  const { mutate: completeAppointment, isPending: isCompleting } = useMutation({
    mutationFn: async (appointmentId: number) => {
      const response = await fetch(`${API_ENDPOINTS.APPOINTMENTS.BASE}/${appointmentId}/complete`, {
        method: 'PUT',
      });
      
      if (!response.ok) {
        throw new Error('Erro ao marcar agendamento como concluído');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast({
        title: 'Agendamento concluído',
        description: 'O agendamento foi marcado como concluído.',
        variant: 'success',
      });
    },
    onError: () => {
      toast({
        title: 'Erro',
        description: 'Não foi possível marcar o agendamento como concluído. Tente novamente.',
        variant: 'destructive',
      });
    },
  });
  
  // Filtrar agendamentos
  const filterAppointments = useCallback((status: string) => {
    setFilter({ status });
  }, []);
  
  return {
    appointments,
    isLoading,
    error,
    getAppointment,
    createAppointment,
    addServiceToAppointment,
    cancelAppointment,
    completeAppointment,
    filterAppointments,
    filter,
    isCreating,
    isCancelling,
    isCompleting,
    isAddingService,
  };
}