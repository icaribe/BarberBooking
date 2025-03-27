import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Appointments from "@/pages/Appointments";
import Profile from "@/pages/Profile";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="bg-background text-foreground min-h-screen">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/appointments" component={Appointments} />
          <Route path="/profile" component={Profile} />
          <Route component={NotFound} />
        </Switch>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
