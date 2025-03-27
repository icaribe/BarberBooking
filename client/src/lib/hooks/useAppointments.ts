import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_ENDPOINTS } from '../constants';
import { apiRequest } from '../queryClient';
import type { Appointment, AppointmentCreation, AppointmentService } from '../types';

export const useAppointments = (userId?: number, professionalId?: number, date?: string) => {
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
    data: appointments = [], 
    isLoading,
    error
  } = useQuery<Appointment[]>({ 
    queryKey: [apiUrl],
    enabled: !!userId || !!professionalId || !!date,
  });

  // Get a specific appointment
  const getAppointment = (appointmentId: number) => {
    return useQuery<Appointment>({
      queryKey: [`${API_ENDPOINTS.APPOINTMENTS}/${appointmentId}`],
      enabled: !!appointmentId
    });
  };

  // Get services for a specific appointment
  const getAppointmentServices = (appointmentId: number) => {
    return useQuery<AppointmentService[]>({
      queryKey: [`${API_ENDPOINTS.APPOINTMENTS}/${appointmentId}/services`],
      enabled: !!appointmentId
    });
  };

  // Create a new appointment
  const { mutateAsync: createAppointment, isPending: isCreating } = useMutation({
    mutationFn: async (appointmentData: AppointmentCreation) => {
      const response = await apiRequest('POST', API_ENDPOINTS.APPOINTMENTS, appointmentData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.APPOINTMENTS] });
    }
  });

  // Update appointment status
  const { mutateAsync: updateAppointmentStatus, isPending: isUpdating } = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest('PATCH', `${API_ENDPOINTS.APPOINTMENTS}/${id}/status`, { status });
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.APPOINTMENTS] });
      queryClient.invalidateQueries({ queryKey: [`${API_ENDPOINTS.APPOINTMENTS}/${variables.id}`] });
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
    getAppointment,
    getAppointmentServices,
    createAppointment,
    updateAppointmentStatus,
    addServiceToAppointment,
    isCreating,
    isUpdating,
    isAddingService
  };
};
