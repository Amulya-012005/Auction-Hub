import { useEffect, useState, useRef } from "react";
import { useParams } from "wouter";
import { 
  useGetAuction, 
  getGetAuctionQueryKey, 
  useListBids, 
  getListBidsQueryKey, 
  usePlaceBid 
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import { useCountdown } from "@/hooks/use-countdown";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, History, AlertTriangle, TrendingUp } from "lucide-react";

export default function BuyerAuctionDetail() {
  const params = useParams();
  const id = parseInt(params.id || "0", 10);
  const queryClient = useQueryClient();
  const [customBid, setCustomBid] = useState("");
  const [isBidding, setIsBidding] = useState(false);
  const bidDisplayRef = useRef<HTMLDivElement>(null);

  const { data: auction, isLoading: loadingAuction } = useGetAuction(id, {
    query: {
      enabled: !!id,
      queryKey: getGetAuctionQueryKey(id),
    }
  });

  const { data: bids, isLoading: loadingBids } = useListBids(id, {
    query: {
      enabled: !!id,
      queryKey: getListBidsQueryKey(id),
    }
  });

  const placeBidMutation = usePlaceBid();

  const { days, hours, minutes, seconds, isEnded } = useCountdown(auction?.endTime);

  useEffect(() => {
    if (!id) return;
    
    // Connect to websocket
    const socket = io(window.location.origin, {
      path: "/api/socket.io",
    });

    socket.emit("join", `auction:${id}`);

    socket.on("bid:new", (data) => {
      // Invalidate queries to get fresh data
      queryClient.invalidateQueries({ queryKey: getGetAuctionQueryKey(id) });
      queryClient.invalidateQueries({ queryKey: getListBidsQueryKey(id) });
      
      // Flash the bid amount
      if (bidDisplayRef.current) {
        bidDisplayRef.current.animate(
          [
            { transform: 'scale(1)', color: 'white' },
            { transform: 'scale(1.1)', color: 'hsl(355 85% 50%)' },
            { transform: 'scale(1)', color: 'white' }
          ],
          { duration: 500, easing: 'ease-out' }
        );
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [id, queryClient]);

  const handleBid = async (amount: number) => {
    if (!auction) return;
    if (amount <= auction.currentBid) {
      toast.error("Bid must be higher than current bid");
      return;
    }

    setIsBidding(true);
    placeBidMutation.mutate({ data: { amount } }, {
      onSuccess: () => {
        toast.success(`Successfully bid $${amount.toLocaleString()}`);
        setCustomBid("");
      },
      onError: (err) => {
        toast.error(err.data?.error || "Failed to place bid");
      },
      onSettled: () => {
        setIsBidding(false);
      }
    });
  };

  if (loadingAuction) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="w-full aspect-video rounded-xl" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-[400px] w-full rounded-xl" />
          <Skeleton className="h-[300px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!auction) {
    return <div className="text-center py-24"><h2 className="text-2xl font-bold">AUCTION NOT FOUND</h2></div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Details */}
      <div className="lg:col-span-2 space-y-8">
        <div className="bg-card rounded-xl overflow-hidden border border-border/50">
          {auction.imageUrl ? (
            <img src={auction.imageUrl} alt={auction.title} className="w-full aspect-video object-cover" />
          ) : (
            <div className="w-full aspect-video bg-muted flex items-center justify-center text-muted-foreground font-bold text-3xl">NO IMAGE AVAILABLE</div>
          )}
        </div>
        
        <div>
          <div className="flex items-center gap-3 mb-4">
            {auction.status === "live" && !isEnded && (
              <Badge className="bg-primary text-white font-bold animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.8)]">LIVE</Badge>
            )}
            {isEnded && <Badge variant="secondary">ENDED</Badge>}
            <Badge variant="outline" className="uppercase">{auction.category}</Badge>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-4">{auction.title}</h1>
          
          <div className="flex items-center justify-between py-4 border-y border-border/50 my-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
                {auction.sellerName.charAt(0)}
              </div>
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wider">Seller</p>
                <p className="font-bold">{auction.sellerName}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground uppercase tracking-wider">Rating</p>
              <p className="font-bold text-yellow-500">★ {auction.sellerRating.toFixed(1)}</p>
            </div>
          </div>
          
          <div className="prose prose-invert max-w-none">
            <h3 className="uppercase tracking-wider text-muted-foreground text-sm font-bold mb-2">Description</h3>
            <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">{auction.description}</p>
            
            {auction.shippingInfo && (
              <>
                <h3 className="uppercase tracking-wider text-muted-foreground text-sm font-bold mt-8 mb-2">Shipping Information</h3>
                <p className="text-foreground/80 leading-relaxed">{auction.shippingInfo}</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Bidding Terminal */}
      <div className="space-y-6">
        <Card className="border-primary/30 shadow-[0_0_30px_rgba(220,38,38,0.1)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold mb-2">Current Bid</p>
              <div 
                ref={bidDisplayRef}
                className="text-5xl font-black font-mono tracking-tighter text-white"
              >
                ${auction.currentBid.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground mt-2">{auction.bidCount} bids placed</p>
            </div>

            <div className="bg-background rounded-lg p-4 mb-6 border border-border/50 flex flex-col items-center justify-center gap-2">
              <div className="flex items-center gap-2 text-primary font-bold">
                <Clock className="w-5 h-5" />
                <span className="uppercase tracking-wider">Time Remaining</span>
              </div>
              {isEnded ? (
                <div className="text-xl font-bold text-muted-foreground uppercase mt-1">Auction Closed</div>
              ) : (
                <div className="text-3xl font-mono font-bold tracking-widest mt-1">
                  {days > 0 && `${days.toString().padStart(2, '0')}:`}{hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
                </div>
              )}
            </div>

            {!isEnded && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline" className="font-mono bg-card" onClick={() => handleBid(auction.currentBid + 100)} disabled={isBidding}>+ $100</Button>
                  <Button variant="outline" className="font-mono bg-card" onClick={() => handleBid(auction.currentBid + 500)} disabled={isBidding}>+ $500</Button>
                  <Button variant="outline" className="font-mono bg-card" onClick={() => handleBid(auction.currentBid + 1000)} disabled={isBidding}>+ $1K</Button>
                </div>
                
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">$</span>
                    <Input 
                      type="number" 
                      placeholder="Custom Amount" 
                      className="pl-8 font-mono bg-background"
                      value={customBid}
                      onChange={(e) => setCustomBid(e.target.value)}
                    />
                  </div>
                  <Button 
                    className="bg-primary hover:bg-primary/90 text-white font-bold tracking-widest"
                    onClick={() => {
                      const val = parseInt(customBid, 10);
                      if (val > 0) handleBid(val);
                    }}
                    disabled={isBidding || !customBid || parseInt(customBid, 10) <= auction.currentBid}
                  >
                    PLACE BID
                  </Button>
                </div>
                
                <div className="flex items-start gap-2 text-xs text-muted-foreground mt-4">
                  <AlertTriangle className="w-4 h-4 text-primary shrink-0" />
                  <p>By placing a bid, you commit to buy this item if you win. Bids cannot be retracted.</p>
                </div>
              </div>
            )}

            {isEnded && auction.winnerName && (
              <div className="bg-primary/10 border border-primary/30 p-4 rounded-lg text-center mt-4">
                <p className="text-sm uppercase tracking-wider text-primary mb-1 font-bold">Winner</p>
                <p className="text-xl font-bold">{auction.winnerName}</p>
                <p className="text-sm text-muted-foreground mt-2">Winning Bid: ${auction.currentBid.toLocaleString()}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-0">
            <div className="p-4 border-b border-border/50 flex items-center gap-2">
              <History className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-bold text-sm uppercase tracking-wider">Bid History</h3>
            </div>
            
            <div className="max-h-[300px] overflow-y-auto">
              {!bids || bids.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">No bids yet. Be the first!</div>
              ) : (
                <div className="divide-y divide-border/50">
                  <AnimatePresence>
                    {bids.map((bid, i) => (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        key={bid.id} 
                        className={`p-4 flex items-center justify-between ${i === 0 ? 'bg-primary/5' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-primary text-white shadow-[0_0_8px_rgba(220,38,38,0.5)]' : 'bg-muted text-muted-foreground'}`}>
                            {i === 0 ? <TrendingUp className="w-4 h-4" /> : i+1}
                          </div>
                          <div>
                            <p className="font-bold text-sm">{bid.bidderName}</p>
                            <p className="text-xs text-muted-foreground">{new Date(bid.createdAt).toLocaleTimeString()}</p>
                          </div>
                        </div>
                        <div className={`font-mono font-bold ${i === 0 ? 'text-primary' : 'text-white'}`}>
                          ${bid.amount.toLocaleString()}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
