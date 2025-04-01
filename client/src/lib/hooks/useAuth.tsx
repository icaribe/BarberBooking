
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { User, UserRegistration } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginMutation: any;
  registerMutation: any;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();

  const {
    data: user,
    isLoading,
    refetch: refetchUser,
  } = useQuery<User | null>({
    queryKey: ['/api/user'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/user');
        if (!response.ok) {
          return null;
        }
        const userData = await response.json();
        return userData;
      } catch (error) {
        console.error('Failed to get user data:', error);
        return null;
      }
    },
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const response = await apiRequest('POST', '/api/login', credentials);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Falha no login');
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/user'], data);
      toast({
        title: "Login bem-sucedido",
        description: `Bem-vindo(a) de volta, ${data.name || data.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Falha no login",
        description: error.message || "Usuário ou senha incorretos.",
        variant: "destructive"
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: UserRegistration) => {
      const response = await apiRequest('POST', '/api/register', userData);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Falha no registro");
      }
      return response.json();
    },
    onSuccess: (data) => {
      // Atualiza o cache do usuário atual
      queryClient.setQueryData(['/api/user'], data);
      
      // Força a atualização do estado global do usuário
      refetchUser();
      
      toast({
        title: "Registro concluído",
        description: "Sua conta foi criada com sucesso!",
      });
      
      // Invalidar todas as queries relacionadas a agendamentos e perfil
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Falha no registro",
        description: error.message || "Não foi possível criar sua conta.",
        variant: "destructive"
      });
    },
  });

  const logout = async () => {
    try {
      await apiRequest('POST', '/api/logout');
      queryClient.setQueryData(['/api/user'], null);
      toast({
        title: "Logout realizado",
        description: "Você saiu da sua conta com sucesso.",
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user: user ?? null,
      isAuthenticated: !!user,
      isLoading,
      loginMutation,
      registerMutation,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
