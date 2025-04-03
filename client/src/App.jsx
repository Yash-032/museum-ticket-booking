import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import ExhibitionsPage from "@/pages/exhibitions-page";
import TicketsPage from "@/pages/tickets-page";
import AuthPage from "@/pages/auth-page";
import MyTicketsPage from "@/pages/my-tickets-page";
import CheckoutPage from "@/pages/checkout-page";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminUsers from "@/pages/admin/users";
import AdminTickets from "@/pages/admin/tickets";
import AdminExhibitions from "@/pages/admin/exhibitions";
import AdminAnalytics from "@/pages/admin/analytics";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/exhibitions" component={ExhibitionsPage} />
      <Route path="/tickets" component={TicketsPage} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/my-tickets" component={MyTicketsPage} />
      <ProtectedRoute path="/checkout" component={CheckoutPage} />
      <ProtectedRoute path="/admin" component={AdminDashboard} />
      <ProtectedRoute path="/admin/users" component={AdminUsers} />
      <ProtectedRoute path="/admin/tickets" component={AdminTickets} />
      <ProtectedRoute path="/admin/exhibitions" component={AdminExhibitions} />
      <ProtectedRoute path="/admin/analytics" component={AdminAnalytics} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-grow">
            <Router />
          </main>
          <Footer />
        </div>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
