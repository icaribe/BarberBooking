import { useQuery } from '@tanstack/react-query';
import { API_ENDPOINTS } from '../constants';
import { Product, ProductCategory } from '../types';

export function useProducts(categoryId?: number) {
  // Fetch all products
  const { 
    data: products = [], 
    isLoading: isLoadingProducts,
    error
  } = useQuery<Product[]>({
    queryKey: [API_ENDPOINTS.PRODUCTS, categoryId],
    queryFn: async () => {
      const url = categoryId 
        ? `${API_ENDPOINTS.PRODUCTS}?categoryId=${categoryId}` 
        : API_ENDPOINTS.PRODUCTS;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      return response.json();
    }
  });

  // Fetch product categories
  const {
    data: categories = [],
    isLoading: isLoadingCategories
  } = useQuery<ProductCategory[]>({
    queryKey: [API_ENDPOINTS.PRODUCT_CATEGORIES],
    queryFn: async () => {
      const response = await fetch(API_ENDPOINTS.PRODUCT_CATEGORIES);
      if (!response.ok) {
        throw new Error('Failed to fetch product categories');
      }
      return response.json();
    }
  });

  return {
    products,
    categories,
    isLoadingProducts,
    isLoadingCategories,
    error
  };
}