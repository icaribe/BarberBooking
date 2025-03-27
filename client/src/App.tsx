import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./lib/hooks/useAuth";
import { ProtectedRoute } from "./lib/protected-route";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Appointments from "@/pages/Appointments";
import Profile from "@/pages/Profile";
import AppointmentPage from "@/pages/AppointmentPage";
import ProductsPage from "@/pages/ProductsPage";
import AuthPage from "@/pages/auth-page";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="bg-background text-foreground min-h-screen">
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/auth" component={AuthPage} />
            <ProtectedRoute path="/appointments" component={Appointments} />
            <ProtectedRoute path="/profile" component={Profile} />
            <Route path="/products" component={ProductsPage} />
            <ProtectedRoute path="/appointment/:serviceId" component={AppointmentPage} />
            <Route component={NotFound} />
          </Switch>
        </div>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
