import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_ENDPOINTS } from '../constants';
import { apiRequest } from '../queryClient';
import type { Service, ServiceCategory } from '../types';

export const useServices = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  
  const queryClient = useQueryClient();

  // Fetch service categories
  const { 
    data: categories = [], 
    isLoading: isLoadingCategories,
    error: categoriesError 
  } = useQuery<ServiceCategory[]>({ 
    queryKey: [API_ENDPOINTS.SERVICE_CATEGORIES] 
  });

  // Fetch services
  const { 
    data: allServices = [], 
    isLoading: isLoadingServices,
    error: servicesError 
  } = useQuery<Service[]>({ 
    queryKey: [API_ENDPOINTS.SERVICES] 
  });

  // Fetch services by category if selectedCategoryId is set
  const { 
    data: categoryServices = [], 
    isLoading: isLoadingCategoryServices,
    error: categoryServicesError 
  } = useQuery<Service[]>({ 
    queryKey: [
      `${API_ENDPOINTS.SERVICES}?categoryId=${selectedCategoryId}`
    ],
    enabled: selectedCategoryId !== null,
  });

  // Get services based on whether a category is selected
  const services: Service[] = selectedCategoryId ? categoryServices : allServices;
  const isLoadingCurrentServices = selectedCategoryId ? isLoadingCategoryServices : isLoadingServices;
  const currentServicesError = selectedCategoryId ? categoryServicesError : servicesError;

  // Create a new service
  const { mutateAsync: createService, isPending: isCreatingService } = useMutation({
    mutationFn: async (service: Omit<Service, 'id'>) => {
      const response = await apiRequest('POST', API_ENDPOINTS.SERVICES, service);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.SERVICES] });
      if (selectedCategoryId) {
        queryClient.invalidateQueries({ 
          queryKey: [`${API_ENDPOINTS.SERVICES}?categoryId=${selectedCategoryId}`] 
        });
      }
    }
  });

  // Create a new service category
  const { mutateAsync: createCategory, isPending: isCreatingCategory } = useMutation({
    mutationFn: async (category: Omit<ServiceCategory, 'id'>) => {
      const response = await apiRequest('POST', API_ENDPOINTS.SERVICE_CATEGORIES, category);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.SERVICE_CATEGORIES] });
    }
  });

  // Get a service by ID
  const getServiceById = (id: number): Service | undefined => {
    return allServices.find(service => service.id === id);
  };

  // Get a category by ID
  const getCategoryById = (id: number): ServiceCategory | undefined => {
    return categories.find(category => category.id === id);
  };

  // Get services by category ID
  const getServicesByCategory = (categoryId: number): Service[] => {
    return allServices.filter(service => service.categoryId === categoryId);
  };

  return {
    services,
    categories,
    selectedCategoryId,
    setSelectedCategoryId,
    isLoadingServices: isLoadingCurrentServices,
    isLoadingCategories,
    servicesError: currentServicesError,
    categoriesError,
    createService,
    createCategory,
    isCreatingService,
    isCreatingCategory,
    getServiceById,
    getCategoryById,
    getServicesByCategory
  };
};
