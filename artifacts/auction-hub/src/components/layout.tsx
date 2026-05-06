import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { AuctionHubLogoSVG } from "./logo";
import { Button } from "./ui/button";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const isAuthPage = location === "/login" || location === "/register";
  const isLanding = location === "/";

  if (isAuthPage || isLanding) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href={user?.role === "seller" ? "/seller/dashboard" : "/buyer/dashboard"} className="flex items-center gap-3">
            <AuctionHubLogoSVG size={36} />
            <span className="font-black tracking-widest text-lg text-primary drop-shadow-[0_0_8px_rgba(220,38,38,0.5)]">AUCTION-HUB</span>
          </Link>

          <nav className="flex items-center gap-6">
            {user?.role === "buyer" || user?.role === "both" ? (
              <>
                <Link href="/buyer/dashboard" className="text-sm font-medium hover:text-primary transition-colors">Auctions</Link>
                <Link href="/buyer/my-bids" className="text-sm font-medium hover:text-primary transition-colors">My Bids</Link>
                <Link href="/buyer/won" className="text-sm font-medium hover:text-primary transition-colors">Won</Link>
              </>
            ) : null}
            
            {user?.role === "seller" || user?.role === "both" ? (
              <>
                <Link href="/seller/dashboard" className="text-sm font-medium hover:text-primary transition-colors">Seller Dashboard</Link>
              </>
            ) : null}
          </nav>

          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground hidden sm:block">
              {user?.name} <span className="uppercase text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full ml-2">{user?.role}</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => logout()}>
              Log Out
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
