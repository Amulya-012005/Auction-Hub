import { useListBuyerWonAuctions } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useLocation } from "wouter";
import { Trophy, CreditCard, Shield } from "lucide-react";
import { motion } from "framer-motion";

export default function BuyerWonAuctions() {
  const { data: won, isLoading } = useListBuyerWonAuctions();
  const [, navigate] = useLocation();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white mb-2 flex items-center gap-3">
          <Trophy className="text-yellow-500 w-8 h-8" />
          WON AUCTIONS
        </h1>
        <p className="text-muted-foreground">Manage your winnings and complete secure payments via agent escrow.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      ) : won && won.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {won.map((auction, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={auction.id}
            >
              <Card className="glass-card overflow-hidden h-full flex flex-col relative border-t-2 border-t-yellow-500">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Trophy className="w-24 h-24 text-yellow-500" />
                </div>

                <CardContent className="p-6 flex flex-col flex-1 relative z-10">
                  <Badge variant="outline" className="w-fit bg-background/50 mb-4 text-yellow-500 border-yellow-500/30">
                    WON
                  </Badge>

                  <h3 className="font-bold text-xl mb-1 line-clamp-1">{auction.title}</h3>
                  <p className="text-sm text-muted-foreground mb-6">Sold by {auction.sellerName}</p>

                  <div className="mt-auto space-y-4">
                    <div className="bg-background/50 rounded-lg p-4 border border-border/50">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Final Price</p>
                      <p className="text-3xl font-mono font-bold text-primary drop-shadow-[0_0_6px_rgba(220,38,38,0.5)]">
                        ${auction.currentBid.toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-card/40 border border-border/30 rounded-lg p-2">
                      <Shield className="w-3 h-3 text-primary shrink-0" />
                      <span>Agent escrow — funds held until delivery</span>
                    </div>

                    {auction.status === "sold" ? (
                      <Button
                        className="w-full font-bold tracking-widest flex gap-2 items-center glow-btn text-white"
                        onClick={() => navigate(`/buyer/payment/${auction.id}`)}
                      >
                        <CreditCard className="w-4 h-4" />
                        PROCEED TO PAYMENT
                      </Button>
                    ) : (
                      <Button
                        className="w-full font-bold tracking-widest flex gap-2 items-center"
                        variant="secondary"
                        disabled
                      >
                        AWAITING SELLER CONFIRMATION
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 glass-card rounded-xl border border-border/50">
          <Trophy className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-muted-foreground mb-2">NO WINNINGS YET</h3>
          <p className="text-muted-foreground/60">Win an auction to see it appear here.</p>
          <Link href="/buyer/dashboard" className="inline-block mt-6 px-6 py-2 bg-primary text-white rounded-md font-bold text-sm hover:bg-primary/90 transition-colors tracking-widest">
            START BIDDING
          </Link>
        </div>
      )}
    </div>
  );
}
