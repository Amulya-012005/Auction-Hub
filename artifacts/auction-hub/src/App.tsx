import { Switch, Route } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { initApi } from "@/lib/api-setup";
import { Layout } from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";

// Pages
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Register from "@/pages/register";
import BuyerDashboard from "@/pages/buyer-dashboard";
import BuyerAuctionDetail from "@/pages/buyer-auction";
import BuyerMyBids from "@/pages/buyer-my-bids";
import BuyerWonAuctions from "@/pages/buyer-won";
import SellerDashboard from "@/pages/seller-dashboard";
import SellerCreateAuction from "@/pages/seller-create-auction";
import SellerAuctionDetail from "@/pages/seller-auction";

// Initialize API client
initApi();

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component, roleRequired, ...rest }: any) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="w-8 h-8 rounded-full bg-primary animate-ping"></div></div>;
  if (!user) return <Redirect to="/login" />;
  if (roleRequired && user.role !== roleRequired && user.role !== "both") {
    return <Redirect to={user.role === "seller" ? "/seller/dashboard" : "/buyer/dashboard"} />;
  }

  return <Component {...rest} />;
}

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        
        {/* Buyer Routes */}
        <Route path="/buyer/dashboard" component={() => <ProtectedRoute roleRequired="buyer" component={BuyerDashboard} />} />
        <Route path="/buyer/auction/:id" component={() => <ProtectedRoute roleRequired="buyer" component={BuyerAuctionDetail} />} />
        <Route path="/buyer/my-bids" component={() => <ProtectedRoute roleRequired="buyer" component={BuyerMyBids} />} />
        <Route path="/buyer/won" component={() => <ProtectedRoute roleRequired="buyer" component={BuyerWonAuctions} />} />
        
        {/* Seller Routes */}
        <Route path="/seller/dashboard" component={() => <ProtectedRoute roleRequired="seller" component={SellerDashboard} />} />
        <Route path="/seller/create-auction" component={() => <ProtectedRoute roleRequired="seller" component={SellerCreateAuction} />} />
        <Route path="/seller/auction/:id" component={() => <ProtectedRoute roleRequired="seller" component={SellerAuctionDetail} />} />
        
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster theme="dark" position="bottom-right" />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
