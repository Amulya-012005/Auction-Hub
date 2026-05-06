import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { AuctionHubLogoSVG } from "./logo";
import { Button } from "./ui/button";
import { AnimatedBackground } from "./animated-bg";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const isAuthPage = location === "/login" || location === "/register";
  const isLanding = location === "/";

  if (isAuthPage || isLanding) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col text-foreground relative">
      <AnimatedBackground />

      <header className="border-b border-white/5 sticky top-0 z-50 backdrop-blur-xl bg-black/30 shadow-[0_1px_30px_rgba(220,38,38,0.08)]">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href={user?.role === "seller" ? "/seller/dashboard" : "/buyer/dashboard"} className="flex items-center gap-3 group">
            <AuctionHubLogoSVG size={34} />
            <span className="font-black tracking-widest text-base text-primary drop-shadow-[0_0_8px_rgba(220,38,38,0.6)] group-hover:drop-shadow-[0_0_14px_rgba(220,38,38,0.9)] transition-all">
              AUCTION-HUB
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {(user?.role === "buyer" || user?.role === "both") && (
              <>
                <NavLink href="/buyer/dashboard" active={location.startsWith("/buyer/dashboard")}>Auctions</NavLink>
                <NavLink href="/buyer/my-bids" active={location.startsWith("/buyer/my-bids")}>My Bids</NavLink>
                <NavLink href="/buyer/won" active={location.startsWith("/buyer/won")}>Won</NavLink>
              </>
            )}
            {(user?.role === "seller" || user?.role === "both") && (
              <NavLink href="/seller/dashboard" active={location.startsWith("/seller/dashboard")}>Seller Dashboard</NavLink>
            )}
          </nav>

          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground hidden sm:flex items-center gap-2">
              <span>{user?.name}</span>
              <span className="uppercase text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full border border-primary/30">
                {user?.role}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => logout()}
              className="border-border/50 text-muted-foreground hover:text-white hover:border-primary/50 hover:bg-primary/10 hover:shadow-[0_0_10px_rgba(220,38,38,0.2)] transition-all font-bold tracking-wider text-xs"
            >
              Log Out
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 relative z-10">
        {children}
      </main>
    </div>
  );
}

function NavLink({ href, children, active }: { href: string; children: React.ReactNode; active: boolean }) {
  return (
    <Link
      href={href}
      className={`px-3 py-2 rounded-md text-sm font-bold tracking-wide transition-all duration-200 ${
        active
          ? "text-primary bg-primary/10 shadow-[0_0_10px_rgba(220,38,38,0.15)]"
          : "text-muted-foreground hover:text-white hover:bg-white/5 hover:shadow-[0_0_10px_rgba(220,38,38,0.1)]"
      }`}
    >
      {children}
    </Link>
  );
}
