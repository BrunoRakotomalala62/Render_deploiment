import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import DeployNew from "@/pages/deploy-new";
import DeploymentPage from "@/pages/deployment";
import DeploymentSuccess from "@/pages/deployment-success";
import ProjectDetails from "@/pages/project-details";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/deploy/new" component={DeployNew} />
      <Route path="/deploy/success/:id" component={DeploymentSuccess} />
      <Route path="/deploy/:id" component={DeploymentPage} />
      <Route path="/project/:id" component={ProjectDetails} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">
              <Router />
            </main>
          </div>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
