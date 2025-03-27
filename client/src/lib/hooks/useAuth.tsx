import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { User, UserRegistration } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (userData: UserRegistration) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Check if user is already logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // For demo purposes, we're using localStorage
        // In a real app, this should be a session cookie
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Failed to restore authentication state', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // In a real app, this would be an API call to validate credentials
      // For now, we'll simulate with a simple check for demo users
      
      // Get a list of users to check against
      const response = await apiRequest('GET', '/api/users');
      
      const users = await response.json();
      
      // Find user with matching username
      // Note: In a real app, password should be hashed and verified on the server
      const foundUser = users.find((u: User) => u.username === username);
      
      if (foundUser) {
        // Simulate successful authentication
        setUser(foundUser);
        localStorage.setItem('user', JSON.stringify(foundUser));
        toast({
          title: "Login bem-sucedido",
          description: `Bem-vindo(a) de volta, ${foundUser.name || foundUser.username}!`,
        });
        return true;
      } else {
        toast({
          title: "Falha no login",
          description: "Usuário ou senha incorretos.",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Erro ao fazer login",
        description: "Ocorreu um erro ao tentar fazer login. Tente novamente.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: UserRegistration): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Create new user
      const response = await apiRequest('POST', '/api/users', userData);
      
      if (response.ok) {
        const newUser = await response.json();
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
        toast({
          title: "Registro concluído",
          description: "Sua conta foi criada com sucesso!",
        });
        return true;
      } else {
        const error = await response.json();
        toast({
          title: "Falha no registro",
          description: error.message || "Não foi possível criar sua conta.",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Erro ao registrar",
        description: "Ocorreu um erro ao tentar criar sua conta. Tente novamente.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    toast({
      title: "Logout realizado",
      description: "Você saiu da sua conta com sucesso.",
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
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