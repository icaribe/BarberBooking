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
import { UserPlus } from 'lucide-react';

const registerFormSchema = z.object({
  username: z.string().min(3, 'O nome de usuário deve ter pelo menos 3 caracteres'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  name: z.string().min(1, 'O nome é obrigatório'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
});

type RegisterFormValues = z.infer<typeof registerFormSchema>;

interface RegisterFormProps {
  onSuccess?: () => void;
  onLoginClick: () => void;
}

const RegisterForm = ({ onSuccess, onLoginClick }: RegisterFormProps) => {
  const { register, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      username: '',
      password: '',
      name: '',
      email: '',
      phone: '',
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setError(null);
    try {
      const success = await register({
        username: data.username,
        password: data.password,
        name: data.name || undefined,
        email: data.email || undefined,
        phone: data.phone || undefined,
      });

      if (success && onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      setError(error.message || "Erro ao criar conta. Tente novamente mais tarde.");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-card rounded-lg shadow-md">
      <div className="flex justify-center mb-6">
        <div className="bg-primary/10 p-3 rounded-full">
          <UserPlus className="h-6 w-6 text-primary" />
        </div>
      </div>
      <h2 className="text-2xl font-bold text-center mb-6 font-montserrat">Criar Conta</h2>

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
                    placeholder="Escolha um nome de usuário" 
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
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome completo</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Digite seu nome completo" 
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
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email (opcional)</FormLabel>
                <FormControl>
                  <Input 
                    type="email"
                    placeholder="Digite seu email" 
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
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone (opcional)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Digite seu telefone" 
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
                    placeholder="Escolha uma senha" 
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
              {isLoading ? 'Registrando...' : 'Criar Conta'}
            </Button>
          </div>

          <div className="text-center mt-4">
            <p className="text-sm text-muted-foreground">
              Já tem uma conta?{' '}
              <button
                type="button"
                onClick={onLoginClick}
                className="text-primary font-medium hover:underline"
              >
                Faça login
              </button>
            </p>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default RegisterForm;