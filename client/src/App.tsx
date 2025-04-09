import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./lib/hooks/useAuth";
import { ThemeProvider } from "./lib/hooks/useTheme";
import { ProtectedRoute } from "./lib/protected-route";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Appointments from "@/pages/Appointments";
import Profile from "@/pages/Profile";
import AppointmentPage from "@/pages/AppointmentPage";
import ProductsPage from "@/pages/ProductsPage";
import AuthPage from "@/pages/auth-page";
import Settings from "@/pages/Settings";
import AdminInitPage from "@/pages/AdminInitPage";

// Admin Pages
import AdminLoginPage from "@/pages/admin/AdminLoginPage";
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import AdminServicesPage from "@/pages/admin/AdminServicesPage";
import AdminProductsPage from "@/pages/admin/AdminProductsPage";
import AdminProfessionalsPage from "@/pages/admin/AdminProfessionalsPage";
import AdminAppointmentsPage from "@/pages/admin/AdminAppointmentsPage";
import AdminLoyaltyPage from "@/pages/admin/AdminLoyaltyPage";
import AdminFinancePage from "@/pages/admin/AdminFinancePage";
import AdminReportsPage from "@/pages/admin/AdminReportsPage";
import AdminSettingsPage from "@/pages/admin/AdminSettingsPage";

// Admin Protected Route
import { AdminProtectedRoute } from "@/lib/admin-protected-route";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
        <div className="bg-background text-foreground min-h-screen">
          <Switch>
            {/* Client Routes */}
            <Route path="/" component={Home} />
            <Route path="/auth" component={AuthPage} />
            <ProtectedRoute path="/appointments" component={Appointments} />
            <ProtectedRoute path="/profile" component={Profile} />
            <ProtectedRoute path="/settings" component={Settings} />
            <Route path="/products" component={ProductsPage} />
            <Route path="/appointment/:serviceId" component={AppointmentPage} />
            
            {/* Admin Routes */}
            <Route path="/admin/login" component={AdminLoginPage} />
            <Route path="/admin/initialize" component={AdminInitPage} />
            <AdminProtectedRoute path="/admin/dashboard" component={AdminDashboardPage} />
            <AdminProtectedRoute path="/admin/services" component={AdminServicesPage} />
            <AdminProtectedRoute path="/admin/products" component={AdminProductsPage} />
            <AdminProtectedRoute path="/admin/professionals" component={AdminProfessionalsPage} />
            <AdminProtectedRoute path="/admin/appointments" component={AdminAppointmentsPage} />
            <AdminProtectedRoute path="/admin/loyalty" component={AdminLoyaltyPage} />
            <AdminProtectedRoute path="/admin/finance" component={AdminFinancePage} />
            <AdminProtectedRoute path="/admin/reports" component={AdminReportsPage} />
            <AdminProtectedRoute path="/admin/settings" component={AdminSettingsPage} />
            
            <Route component={NotFound} />
          </Switch>
        </div>
        <Toaster />
      </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
