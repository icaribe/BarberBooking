import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "./components/ui/toaster";
import { AuthProvider } from "./lib/hooks/useAuth";
import { CartProvider } from "./lib/hooks/useCart";
import { ProtectedRoute } from "./lib/protected-route";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Appointments from "@/pages/Appointments";
import Profile from "@/pages/Profile";
import AppointmentPage from "@/pages/AppointmentPage";
import ProductsPage from "@/pages/ProductsPage";
import AuthPage from "@/pages/auth-page";
import Settings from "@/pages/Settings";
import CartPage from "@/pages/CartPage";
import AdminPanel from './pages/AdminPanel';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <div className="bg-background text-foreground min-h-screen">
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/auth" component={AuthPage} />
              <ProtectedRoute path="/appointments" component={Appointments} />
              <ProtectedRoute path="/profile" component={Profile} />
              <ProtectedRoute path="/settings" component={Settings} />
              <Route path="/products" component={ProductsPage} />
              <Route path="/appointment/:serviceId" component={AppointmentPage} />
              <Route path="/cart" component={CartPage} />
              <ProtectedRoute path="/admin" component={AdminPanel} />
              <Route component={NotFound} />
            </Switch>
          </div>
          <Toaster />
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;