import { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/hooks/useAuth';
import { User } from 'lucide-react';

const loginFormSchema = z.object({
  username: z.string().min(1, 'O nome de usuário é obrigatório'),
  password: z.string().min(1, 'A senha é obrigatória'),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
  onRegisterClick: () => void;
}

const LoginForm = ({ onSuccess, onRegisterClick }: LoginFormProps) => {
  const { login, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setError(null);
    const success = await login(data.username, data.password);
    
    if (success && onSuccess) {
      onSuccess();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-card rounded-lg shadow-md">
      <div className="flex justify-center mb-6">
        <div className="bg-primary/10 p-3 rounded-full">
          <User className="h-6 w-6 text-primary" />
        </div>
      </div>
      <h2 className="text-2xl font-bold text-center mb-6 font-montserrat">Login</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome de usuário</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Digite seu nome de usuário" 
                    {...field} 
                    className="bg-secondary" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder="Digite sua senha" 
                    {...field} 
                    className="bg-secondary" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {error && (
            <div className="text-destructive text-sm mt-2">{error}</div>
          )}

          <div className="pt-2">
            <Button 
              type="submit" 
              className="w-full py-6" 
              disabled={isLoading}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </div>

          <div className="text-center mt-4">
            <p className="text-sm text-muted-foreground">
              Não tem conta?{' '}
              <button
                type="button"
                onClick={onRegisterClick}
                className="text-primary font-medium hover:underline"
              >
                Registre-se
              </button>
            </p>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default LoginForm;