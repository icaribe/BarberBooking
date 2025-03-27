import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_ENDPOINTS } from '../constants';
import { apiRequest } from '../queryClient';
import type { Professional, Schedule } from '../types';

export const useProfessionals = () => {
  const queryClient = useQueryClient();

  // Fetch all professionals
  const { 
    data: professionals = [], 
    isLoading: isLoadingProfessionals,
    error: professionalsError 
  } = useQuery<Professional[]>({ 
    queryKey: [API_ENDPOINTS.PROFESSIONALS] 
  });

  // Fetch schedules for a specific professional
  const getProfessionalSchedules = (professionalId: number) => {
    return useQuery<Schedule[]>({
      queryKey: [API_ENDPOINTS.SCHEDULES.replace(':professionalId', professionalId.toString())],
      enabled: !!professionalId,
    });
  };

  // Create a new professional
  const { mutateAsync: createProfessional, isPending: isCreating } = useMutation({
    mutationFn: async (professional: Omit<Professional, 'id'>) => {
      const response = await apiRequest('POST', API_ENDPOINTS.PROFESSIONALS, professional);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.PROFESSIONALS] });
    }
  });

  // Create a schedule for a professional
  const { mutateAsync: createSchedule, isPending: isCreatingSchedule } = useMutation({
    mutationFn: async (schedule: Omit<Schedule, 'id'>) => {
      const response = await apiRequest('POST', '/api/schedules', schedule);
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: [API_ENDPOINTS.SCHEDULES.replace(':professionalId', variables.professionalId.toString())] 
      });
    }
  });

  // Get a professional by ID
  const getProfessionalById = (id: number): Professional | undefined => {
    return professionals.find(professional => professional.id === id);
  };

  return {
    professionals,
    isLoadingProfessionals,
    getProfessionalSchedules,
    createProfessional,
    createSchedule,
    isCreating,
    isCreatingSchedule,
    getProfessionalById,
    error: professionalsError
  };
};
