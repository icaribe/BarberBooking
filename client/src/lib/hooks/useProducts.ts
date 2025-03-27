import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_ENDPOINTS } from '../constants';
import { apiRequest } from '../queryClient';
import type { Product, ProductCategory } from '../types';

export const useProducts = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  // Fetch product categories
  const { 
    data: categories = [], 
    isLoading: isLoadingCategories,
    error: categoriesError 
  } = useQuery<ProductCategory[]>({ 
    queryKey: [API_ENDPOINTS.PRODUCT_CATEGORIES] 
  });

  // Fetch all products
  const { 
    data: allProducts = [], 
    isLoading: isLoadingAllProducts,
    error: allProductsError 
  } = useQuery<Product[]>({ 
    queryKey: [API_ENDPOINTS.PRODUCTS] 
  });

  // Fetch products by category if selectedCategoryId is set
  const { 
    data: categoryProducts = [], 
    isLoading: isLoadingCategoryProducts,
    error: categoryProductsError 
  } = useQuery<Product[]>({ 
    queryKey: [
      `${API_ENDPOINTS.PRODUCTS}?categoryId=${selectedCategoryId}`
    ],
    enabled: selectedCategoryId !== null,
  });

  // Get products based on whether a category is selected
  const products: Product[] = selectedCategoryId ? categoryProducts : allProducts;
  const isLoadingProducts = selectedCategoryId ? isLoadingCategoryProducts : isLoadingAllProducts;
  const productsError = selectedCategoryId ? categoryProductsError : allProductsError;

  // Create a new product
  const { mutateAsync: createProduct, isPending: isCreatingProduct } = useMutation({
    mutationFn: async (product: Omit<Product, 'id'>) => {
      const response = await apiRequest('POST', API_ENDPOINTS.PRODUCTS, product);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.PRODUCTS] });
      if (selectedCategoryId) {
        queryClient.invalidateQueries({ 
          queryKey: [`${API_ENDPOINTS.PRODUCTS}?categoryId=${selectedCategoryId}`] 
        });
      }
    }
  });

  // Create a new product category
  const { mutateAsync: createCategory, isPending: isCreatingCategory } = useMutation({
    mutationFn: async (category: Omit<ProductCategory, 'id'>) => {
      const response = await apiRequest('POST', API_ENDPOINTS.PRODUCT_CATEGORIES, category);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.PRODUCT_CATEGORIES] });
    }
  });

  // Get a product by ID
  const getProductById = (id: number): Product | undefined => {
    return allProducts.find(product => product.id === id);
  };

  // Get a category by ID
  const getCategoryById = (id: number): ProductCategory | undefined => {
    return categories.find(category => category.id === id);
  };

  // Get products by category ID
  const getProductsByCategory = (categoryId: number): Product[] => {
    return allProducts.filter(product => product.categoryId === categoryId);
  };

  return {
    products,
    categories,
    selectedCategoryId,
    setSelectedCategoryId,
    isLoadingProducts,
    isLoadingCategories,
    productsError,
    categoriesError,
    createProduct,
    createCategory,
    isCreatingProduct,
    isCreatingCategory,
    getProductById,
    getCategoryById,
    getProductsByCategory
  };
};
