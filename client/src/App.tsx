import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./lib/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Appointments from "@/pages/Appointments";
import Profile from "@/pages/Profile";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="bg-background text-foreground min-h-screen">
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/appointments" component={Appointments} />
            <Route path="/profile" component={Profile} />
            <Route component={NotFound} />
          </Switch>
        </div>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
