import { useQuery } from '@tanstack/react-query';
import { API_ENDPOINTS } from '../constants';
import { Professional } from '../types';

export function useProfessionals() {
  const { 
    data: professionals = [], 
    isLoading: isLoadingProfessionals,
    error
  } = useQuery<Professional[]>({
    queryKey: [API_ENDPOINTS.PROFESSIONALS],
    queryFn: async () => {
      const response = await fetch(API_ENDPOINTS.PROFESSIONALS);
      if (!response.ok) {
        throw new Error('Failed to fetch professionals');
      }
      return response.json();
    }
  });

  return {
    professionals,
    isLoadingProfessionals,
    error
  };
}