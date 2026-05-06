import { useEffect } from "react";
import { useGetSellerStats, useListSellerAuctions, getListSellerAuctionsQueryKey, getGetSellerStatsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import { Link } from "wouter";
import { AuctionCard } from "@/components/auction-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, Activity, DollarSign, CheckCircle, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function SellerDashboard() {
  const queryClient = useQueryClient();
  const { data: stats, isLoading: loadingStats } = useGetSellerStats();
  const { data: auctions, isLoading: loadingAuctions } = useListSellerAuctions();

  useEffect(() => {
    const socket = io(window.location.origin, { path: "/api/socket.io" });

    socket.on("bid:new", (data: { bid: { bidderName: string; amount: number }; currentBid: number }) => {
      queryClient.invalidateQueries({ queryKey: getListSellerAuctionsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetSellerStatsQueryKey() });
      toast.success(`New bid: $${data.currentBid.toLocaleString()} by ${data.bid.bidderName}`, {
        icon: "⚡",
        duration: 4000,
      });
    });

    socket.on("auction:ended", (data: { auctionId: number; title: string; finalBid: number }) => {
      queryClient.invalidateQueries({ queryKey: getListSellerAuctionsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetSellerStatsQueryKey() });
      toast.warning(`"${data.title}" has expired — final bid $${data.finalBid.toLocaleString()}. Accept a winner to close the sale.`, {
        icon: "⏱️",
        duration: 8000,
      });
    });

    socket.on("auction:sold", () => {
      queryClient.invalidateQueries({ queryKey: getListSellerAuctionsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetSellerStatsQueryKey() });
    });

    return () => { socket.disconnect(); };
  }, [queryClient]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-black tracking-tight text-white uppercase">Command Center</h1>
            <span className="flex items-center gap-1.5 text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-full border border-green-400/20">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              LIVE
            </span>
          </div>
          <p className="text-muted-foreground">Realtime bid monitoring — dashboard updates instantly as bids arrive.</p>
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
        <AnimatePresence mode="wait">
          <motion.div
            key={stats.totalBidsReceived}
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
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
                <motion.p
                  key={stats.totalEarnings}
                  initial={{ scale: 1.05, color: "#22c55e" }}
                  animate={{ scale: 1, color: "hsl(var(--primary))" }}
                  transition={{ duration: 0.4 }}
                  className="text-4xl font-mono font-bold drop-shadow-[0_0_8px_rgba(220,38,38,0.5)]"
                >
                  ${stats.totalEarnings.toLocaleString()}
                </motion.p>
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
              <div className="absolute top-0 right-0 p-4 opacity-10"><Zap className="w-12 h-12" /></div>
              <CardContent className="p-6">
                <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">Total Bids</p>
                <motion.p
                  key={stats.totalBidsReceived}
                  initial={{ scale: 1.1, color: "#a855f7" }}
                  animate={{ scale: 1, color: "#ffffff" }}
                  transition={{ duration: 0.3 }}
                  className="text-4xl font-mono font-bold"
                >
                  {stats.totalBidsReceived}
                </motion.p>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
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
