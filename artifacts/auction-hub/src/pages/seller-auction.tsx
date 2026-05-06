import { useEffect } from "react";
import { useParams, Link } from "wouter";
import { 
  useGetAuction, 
  getGetAuctionQueryKey, 
  useListBids, 
  getListBidsQueryKey, 
  useAcceptWinner,
  useUpdateAuction
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import { useCountdown } from "@/hooks/use-countdown";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Clock, History, CheckCircle, AlertTriangle, Wifi } from "lucide-react";

export default function SellerAuctionDetail() {
  const params = useParams();
  const id = parseInt(params.id || "0", 10);
  const queryClient = useQueryClient();

  const { data: auction, isLoading: loadingAuction } = useGetAuction(id, {
    query: { enabled: !!id, queryKey: getGetAuctionQueryKey(id) }
  });

  const { data: bids, isLoading: loadingBids } = useListBids(id, {
    query: { enabled: !!id, queryKey: getListBidsQueryKey(id) }
  });

  const acceptWinnerMutation = useAcceptWinner();
  const updateMutation = useUpdateAuction();
  const { days, hours, minutes, seconds, isEnded } = useCountdown(auction?.endTime);

  useEffect(() => {
    if (!id) return;
    const socket = io(window.location.origin, { path: "/api/socket.io" });
    socket.emit("join", `auction:${id}`);
    socket.on("bid:new", () => {
      queryClient.invalidateQueries({ queryKey: getGetAuctionQueryKey(id) });
      queryClient.invalidateQueries({ queryKey: getListBidsQueryKey(id) });
    });
    return () => { socket.disconnect(); };
  }, [id, queryClient]);

  const handleEndEarly = () => {
    updateMutation.mutate({ id, data: { status: "ended", endTime: new Date().toISOString() } }, {
      onSuccess: () => {
        toast.success("Auction ended manually");
        queryClient.invalidateQueries({ queryKey: getGetAuctionQueryKey(id) });
      },
      onError: (err) => toast.error((err as any)?.data?.error || "Failed to end auction")
    });
  };

  const handleAcceptBid = (bidderId: number, amount: number) => {
    acceptWinnerMutation.mutate({ id, data: { winnerId: bidderId } }, {
      onSuccess: () => {
        toast.success(`Winner accepted at $${amount.toLocaleString()}`);
        queryClient.invalidateQueries({ queryKey: getGetAuctionQueryKey(id) });
      },
      onError: (err) => toast.error((err as any)?.data?.error || "Failed to accept winner")
    });
  };

  if (loadingAuction) return <div className="p-8"><Skeleton className="h-96 w-full rounded-xl" /></div>;
  if (!auction) return <div className="text-center py-24"><h2 className="text-2xl font-bold">NOT FOUND</h2></div>;

  const requiresAction = isEnded && auction.status === "ended" && !auction.winnerId && bids && bids.length > 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link href="/seller/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-white uppercase tracking-wider mb-2">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            {auction.status === "live" && !isEnded && (
              <Badge className="bg-primary animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.8)]">
                <Wifi className="w-3 h-3 mr-1" /> LIVE
              </Badge>
            )}
            {isEnded && auction.status === "ended" && <Badge variant="secondary">ENDED</Badge>}
            {auction.status === "sold" && <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30">SOLD</Badge>}
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase">{auction.title}</h1>
        </div>
        {!isEnded && auction.status === "live" && (
          <Button variant="outline" className="border-red-500/50 text-red-500 hover:bg-red-500/10 font-bold uppercase tracking-wider text-xs" onClick={handleEndEarly} disabled={updateMutation.isPending}>
            End Now
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 glass-card border-border/50">
          <CardContent className="p-6 flex flex-col items-center text-center gap-6">
            <div className="w-full bg-background/50 rounded-lg p-4 border border-border/50">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Current Ask</p>
              <p className="text-4xl font-mono font-bold text-primary drop-shadow-[0_0_5px_rgba(220,38,38,0.5)]">
                ${auction.currentBid.toLocaleString()}
              </p>
            </div>

            <div className="w-full bg-background/50 rounded-lg p-4 border border-border/50 flex flex-col items-center justify-center">
              <div className="flex items-center gap-2 text-white font-bold mb-1">
                <Clock className="w-4 h-4" />
                <span className="uppercase text-xs tracking-wider">Clock</span>
              </div>
              {isEnded ? (
                <div className="text-lg font-bold text-muted-foreground uppercase">Closed</div>
              ) : (
                <div className="text-2xl font-mono font-bold tracking-widest">
                  {days > 0 && `${days}:`}{hours.toString().padStart(2, "0")}:{minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
                </div>
              )}
            </div>

            <div className="w-full bg-background/50 rounded-lg p-3 border border-border/50">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Bids</p>
              <p className="text-2xl font-mono font-bold text-white">{bids?.length || 0}</p>
            </div>

            {requiresAction && (
              <div className="w-full bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-left">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-yellow-500 uppercase tracking-wider mb-1">Action Required</p>
                    <p className="text-xs text-muted-foreground">Review bids and accept a winner to finalize the sale.</p>
                  </div>
                </div>
              </div>
            )}

            {auction.status === "sold" && auction.winnerName && (
              <div className="w-full bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <p className="text-sm font-bold text-green-500 uppercase tracking-wider mb-1">Sale Finalized</p>
                <p className="text-lg font-bold text-white">{auction.winnerName}</p>
                <p className="text-xs text-muted-foreground mt-1">Pending Payment via Escrow</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2 glass-card border-border/50 h-[560px] flex flex-col">
          <div className="p-4 border-b border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-bold text-sm uppercase tracking-wider">Live Client Bids</h3>
              {auction.status === "live" && !isEnded && (
                <span className="flex items-center gap-1 text-xs text-green-400 font-bold">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" /> LIVE
                </span>
              )}
            </div>
            <span className="text-xs font-mono text-muted-foreground">{bids?.length || 0} Total</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {loadingBids ? (
              <div className="space-y-4">{Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
            ) : !bids || bids.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm uppercase tracking-widest">No bids yet</div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {bids.map((bid, i) => {
                    const isTopBid = i === 0;
                    const canAccept = requiresAction || (auction.status === "live" && isTopBid);
                    return (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={bid.id}
                        className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                          isTopBid ? "bg-primary/5 border-primary/30 shadow-[0_0_12px_rgba(220,38,38,0.1)]" : "bg-background/40 border-border/50"
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${isTopBid ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                              #{i + 1}
                            </div>
                            <p className="font-bold text-white">{bid.bidderName}</p>
                            {auction.winnerId === bid.bidderId && <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30 text-[10px]">WINNER</Badge>}
                          </div>
                          <p className="text-xs font-mono text-muted-foreground ml-8">{new Date(bid.createdAt).toLocaleString()}</p>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-6">
                          <div className={`text-xl font-mono font-bold ${isTopBid ? "text-primary drop-shadow-[0_0_4px_rgba(220,38,38,0.5)]" : "text-white"}`}>
                            ${bid.amount.toLocaleString()}
                          </div>
                          {canAccept && auction.status !== "sold" && (
                            <Button
                              size="sm"
                              className="glow-btn text-white font-bold tracking-widest text-xs h-8"
                              onClick={() => handleAcceptBid(bid.bidderId, bid.amount)}
                              disabled={acceptWinnerMutation.isPending}
                            >
                              ACCEPT
                            </Button>
                          )}
                          {auction.winnerId === bid.bidderId && (
                            <CheckCircle className="w-6 h-6 text-green-500" />
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
