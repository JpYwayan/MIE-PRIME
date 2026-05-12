import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import { DashboardLayoutSkeleton } from "./components/DashboardLayoutSkeleton";
import { useAuth } from "./_core/hooks/useAuth";

// Pages
import Dashboard from "./pages/Dashboard";
import NewTransaction from "./pages/NewTransaction";
import Journal from "./pages/Journal";
import Ledger from "./pages/Ledger";
import TrialBalance from "./pages/TrialBalance";
import Reports from "./pages/Reports";
import Expenses from "./pages/Expenses";
import Sales from "./pages/Sales";
import Activities from "./pages/Activities";
import Account from "./pages/Account";
import Help from "./pages/Help";
import Home from "./pages/Home";
import Login from "./pages/Login";

const IS_DEV = import.meta.env.DEV;

function Router() {
  const { isAuthenticated, loading } = useAuth();

  if (loading && !IS_DEV) {
    return <DashboardLayoutSkeleton />;
  }

  const showRoutes = IS_DEV || isAuthenticated || loading;

  return (
    <Switch>
      <Route path="/">
        {isAuthenticated ? (
          <DashboardLayout><Dashboard /></DashboardLayout>
        ) : (
          <Home />
        )}
      </Route>

      <Route path="/login" component={Login} />

      {showRoutes && (
        <>
          <Route path="/dashboard">
            <DashboardLayout><Dashboard /></DashboardLayout>
          </Route>
          <Route path="/transaction">
            <DashboardLayout><NewTransaction /></DashboardLayout>
          </Route>
          <Route path="/journal">
            <DashboardLayout><Journal /></DashboardLayout>
          </Route>
          <Route path="/ledger">
            <DashboardLayout><Ledger /></DashboardLayout>
          </Route>
          <Route path="/trial-balance">
            <DashboardLayout><TrialBalance /></DashboardLayout>
          </Route>
          <Route path="/reports">
            <DashboardLayout><Reports /></DashboardLayout>
          </Route>
          <Route path="/expenses">
            <DashboardLayout><Expenses /></DashboardLayout>
          </Route>
          <Route path="/sales">
            <DashboardLayout><Sales /></DashboardLayout>
          </Route>
          <Route path="/activities">
            <DashboardLayout><Activities /></DashboardLayout>
          </Route>
          <Route path="/account">
            <DashboardLayout><Account /></DashboardLayout>
          </Route>
          <Route path="/help">
            <DashboardLayout><Help /></DashboardLayout>
          </Route>
        </>
      )}

      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
