import { Route, Redirect } from "wouter";
import { useAuth } from "./hooks/useAuth";
import { ComponentType } from "react";

interface AdminProtectedRouteProps {
  component: ComponentType<any>;
  path: string;
}

export function AdminProtectedRoute({ component: Component, ...rest }: AdminProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    // Mostrar um estado de carregamento enquanto verificamos o usuário
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>;
  }

  return (
    <Route
      {...rest}
      component={(props: any) => {
        // Verificar se o usuário está autenticado e tem o papel adequado
        if (user && (user.role === 'ADMIN' || user.role === 'PROFESSIONAL')) {
          // Verificar se é uma rota restrita apenas para admins
          const isAdminRestrictedRoute = [
            '/admin/professionals',
            '/admin/products',
            '/admin/loyalty',
            '/admin/finance',
            '/admin/reports',
            '/admin/settings'
          ].includes(props.location || rest.path);

          if (isAdminRestrictedRoute && user.role !== 'ADMIN') {
            // Redirecionar para o dashboard se não for admin tentando acessar rota restrita
            return <Redirect to="/admin/dashboard" />;
          }

          // Renderizar o componente se o usuário tiver permissão
          return <Component {...props} />;
        } else {
          // Redirecionar para a página de login se não estiver autenticado
          return <Redirect to="/admin/login" />;
        }
      }}
    />
  );
}