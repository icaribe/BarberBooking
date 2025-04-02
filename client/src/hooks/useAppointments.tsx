import { useState, useEffect } from 'react';
import { useToast } from './toast-context';
import { API_ENDPOINTS, AppointmentStatus } from '../lib/constants';

export interface Professional {
  id: string;
  name: string;
  avatar_url?: string;
  specialty?: string;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number; // em centavos
  duration: number; // em minutos
  category_id: string;
}

export interface Appointment {
  id: string;
  user_id: string;
  professional_id: string;
  service_id: string;
  date: string; // formato ISO
  status: AppointmentStatus;
  notes?: string;
  created_at: string;
  
  // Dados relacionados (para exibição)
  professional?: Professional;
  service?: Service;
}

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  // Função para buscar todos os agendamentos do usuário
  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(API_ENDPOINTS.APPOINTMENTS);
      
      if (!response.ok) {
        throw new Error('Falha ao buscar agendamentos');
      }
      
      const data = await response.json();
      setAppointments(data);
    } catch (err) {
      setError('Erro ao carregar agendamentos.');
      console.error('Erro ao buscar agendamentos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Criar um novo agendamento
  const createAppointment = async (appointmentData: Partial<Appointment>) => {
    setLoading(true);
    
    try {
      const response = await fetch(API_ENDPOINTS.APPOINTMENTS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      });
      
      if (!response.ok) {
        throw new Error('Falha ao criar agendamento');
      }
      
      const newAppointment = await response.json();
      
      // Atualizar a lista de agendamentos
      setAppointments(prev => [...prev, newAppointment]);
      
      addToast({
        title: 'Agendamento confirmado',
        description: 'Seu horário foi agendado com sucesso!',
        type: 'success',
      });
      
      return newAppointment;
    } catch (err) {
      console.error('Erro ao criar agendamento:', err);
      
      addToast({
        title: 'Erro no agendamento',
        description: 'Não foi possível concluir seu agendamento.',
        type: 'error',
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Cancelar um agendamento
  const cancelAppointment = async (appointmentId: string) => {
    setLoading(true);
    
    try {
      const response = await fetch(`${API_ENDPOINTS.APPOINTMENTS}/${appointmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: AppointmentStatus.CANCELLED }),
      });
      
      if (!response.ok) {
        throw new Error('Falha ao cancelar agendamento');
      }
      
      // Atualizar o estado local
      setAppointments(prev => 
        prev.map(appointment => 
          appointment.id === appointmentId
            ? { ...appointment, status: AppointmentStatus.CANCELLED }
            : appointment
        )
      );
      
      addToast({
        title: 'Agendamento cancelado',
        description: 'Seu agendamento foi cancelado com sucesso.',
        type: 'info',
      });
      
      return true;
    } catch (err) {
      console.error('Erro ao cancelar agendamento:', err);
      
      addToast({
        title: 'Erro ao cancelar',
        description: 'Não foi possível cancelar seu agendamento.',
        type: 'error',
      });
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Verificar disponibilidade
  const checkAvailability = async (professional_id: string, date: string) => {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.APPOINTMENTS}/availability?professional_id=${professional_id}&date=${date}`
      );
      
      if (!response.ok) {
        throw new Error('Falha ao verificar disponibilidade');
      }
      
      return await response.json();
    } catch (err) {
      console.error('Erro ao verificar disponibilidade:', err);
      return { available: false };
    }
  };

  return {
    appointments,
    loading,
    error,
    fetchAppointments,
    createAppointment,
    cancelAppointment,
    checkAvailability,
  };
}