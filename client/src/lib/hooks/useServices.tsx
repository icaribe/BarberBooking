import { useQuery } from '@tanstack/react-query';
import { API_ENDPOINTS } from '../constants';
import { Service, ServiceCategory } from '../types';

export function useServices(categoryId?: number) {
  // Fetch all services
  const { 
    data: services = [], 
    isLoading: isLoadingServices,
    error
  } = useQuery<Service[]>({
    queryKey: [API_ENDPOINTS.SERVICES, categoryId],
    queryFn: async () => {
      const url = categoryId 
        ? `${API_ENDPOINTS.SERVICES}?categoryId=${categoryId}` 
        : API_ENDPOINTS.SERVICES;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }
      return response.json();
    }
  });

  // Fetch service categories
  const {
    data: categories = [],
    isLoading: isLoadingCategories
  } = useQuery<ServiceCategory[]>({
    queryKey: [API_ENDPOINTS.SERVICE_CATEGORIES],
    queryFn: async () => {
      const response = await fetch(API_ENDPOINTS.SERVICE_CATEGORIES);
      if (!response.ok) {
        throw new Error('Failed to fetch service categories');
      }
      return response.json();
    }
  });

  return {
    services,
    categories,
    isLoadingServices,
    isLoadingCategories,
    error
  };
}