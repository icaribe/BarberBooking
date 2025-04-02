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
  });

  return {
    professionals,
    isLoadingProfessionals,
    error
  };
}