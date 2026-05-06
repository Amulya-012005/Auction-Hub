import { useGetSellerStats, useListSellerAuctions } from "@workspace/api-client-react";
import { Link } from "wouter";
import { AuctionCard } from "@/components/auction-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, Activity, DollarSign, LayoutList, CheckCircle } from "lucide-react";

export default function SellerDashboard() {
  const { data: stats, isLoading: loadingStats } = useGetSellerStats();
  const { data: auctions, isLoading: loadingAuctions } = useListSellerAuctions();

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-2 uppercase">Command Center</h1>
          <p className="text-muted-foreground">Manage your listings and monitor market performance.</p>
        </div>
        <Link href="/seller/create-auction" className="contents">
          <Button className="font-bold tracking-widest gap-2 bg-primary text-white hover:bg-primary/90">
            <PlusCircle className="w-4 h-4" /> NEW LISTING
          </Button>
        </Link>
      </div>

      {loadingStats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
      ) : stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card border-border/50 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Activity className="w-12 h-12" /></div>
            <CardContent className="p-6">
              <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">Active Listings</p>
              <p className="text-4xl font-mono font-bold text-white">{stats.activeAuctions}</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border/50 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><DollarSign className="w-12 h-12" /></div>
            <CardContent className="p-6">
              <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">Total Earnings</p>
              <p className="text-4xl font-mono font-bold text-primary drop-shadow-[0_0_8px_rgba(220,38,38,0.5)]">
                ${stats.totalEarnings.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border/50 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><CheckCircle className="w-12 h-12" /></div>
            <CardContent className="p-6">
              <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">Sold Items</p>
              <p className="text-4xl font-mono font-bold text-white">{stats.soldAuctions}</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border/50 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><LayoutList className="w-12 h-12" /></div>
            <CardContent className="p-6">
              <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">Total Bids</p>
              <p className="text-4xl font-mono font-bold text-white">{stats.totalBidsReceived}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="pt-4">
        <h2 className="text-xl font-bold tracking-wider uppercase mb-6 border-b border-border/50 pb-2">Your Inventory</h2>
        
        {loadingAuctions ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-80 w-full rounded-xl" />
            ))}
          </div>
        ) : auctions && auctions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {auctions.map(auction => (
              <AuctionCard key={auction.id} auction={auction} isSellerView={true} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-card/20 rounded-xl border border-border/50">
            <h3 className="text-xl font-bold text-muted-foreground mb-2">NO LISTINGS FOUND</h3>
            <p className="text-muted-foreground/60 mb-6">Create your first auction to start selling.</p>
            <Link href="/seller/create-auction" className="contents">
              <Button variant="outline" className="font-bold tracking-widest uppercase">Create Listing</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
