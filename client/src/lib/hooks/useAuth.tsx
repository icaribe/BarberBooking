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

  // Obter informações do usuário atual
  const {
    data: user,
    isLoading,
    refetch: refetchUser,
  } = useQuery<User | null>({
    queryKey: ['/api/user'],
    queryFn: async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          return JSON.parse(storedUser) as User;
        }
        return null;
      } catch (error) {
        console.error('Failed to get user data:', error);
        return null;
      }
    },
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      try {
        // Simula autenticação - em uma aplicação real, isso seria uma chamada à API
        const response = await apiRequest('GET', '/api/users');
        const users = await response.json();
        
        // Encontra usuário com usuário correspondente
        const foundUser = users.find((u: User) => u.username === credentials.username);
        
        if (!foundUser) {
          throw new Error('Usuário ou senha incorretos');
        }
        
        // Simulação de autenticação bem-sucedida
        localStorage.setItem('user', JSON.stringify(foundUser));
        return foundUser;
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      }
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
      try {
        const response = await apiRequest('POST', '/api/users', userData);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Não foi possível criar sua conta");
        }
        const newUser = await response.json();
        localStorage.setItem('user', JSON.stringify(newUser));
        return newUser;
      } catch (error) {
        console.error('Registration error:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/user'], data);
      toast({
        title: "Registro concluído",
        description: "Sua conta foi criada com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Falha no registro",
        description: error.message || "Não foi possível criar sua conta.",
        variant: "destructive"
      });
    },
  });

  const logout = () => {
    localStorage.removeItem('user');
    queryClient.setQueryData(['/api/user'], null);
    toast({
      title: "Logout realizado",
      description: "Você saiu da sua conta com sucesso.",
    });
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