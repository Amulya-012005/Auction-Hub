import { Link } from "wouter";
import { Auction } from "@workspace/api-client-react";
import { useCountdown } from "@/hooks/use-countdown";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export function AuctionCard({ auction, isSellerView = false }: { auction: Auction, isSellerView?: boolean }) {
  const { days, hours, minutes, seconds, isEnded } = useCountdown(auction.endTime);
  const href = isSellerView ? `/seller/auction/${auction.id}` : `/buyer/auction/${auction.id}`;

  return (
    <motion.div whileHover={{ y: -6, scale: 1.01 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
      <Link href={href} className="block group">
        <Card className="auction-card overflow-hidden h-full flex flex-col">
          <div className="relative aspect-video overflow-hidden bg-muted">
            {auction.imageUrl ? (
              <img
                src={auction.imageUrl}
                alt={auction.title}
                className="object-cover w-full h-full group-hover:scale-108 transition-transform duration-700"
                style={{ transition: "transform 0.7s ease" }}
                onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.08)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground/30 font-bold text-2xl">NO IMAGE</div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

            <div className="absolute top-2 left-2 flex gap-2">
              {auction.status === "live" && !isEnded && (
                <Badge className="bg-primary text-white font-bold tracking-wider animate-pulse shadow-[0_0_12px_rgba(220,38,38,0.9)]">
                  LIVE
                </Badge>
              )}
              {isEnded && <Badge variant="secondary" className="bg-background/80 backdrop-blur">ENDED</Badge>}
              <Badge variant="outline" className="bg-black/60 backdrop-blur text-xs uppercase border-white/20">
                {auction.category}
              </Badge>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-3">
              <div className="text-white font-mono font-medium text-sm tabular-nums flex items-center gap-2">
                {isEnded ? (
                  <span className="text-muted-foreground">Auction Finished</span>
                ) : (
                  <>
                    <span className="text-primary animate-pulse w-2 h-2 rounded-full bg-primary inline-block shadow-[0_0_6px_rgba(220,38,38,0.9)]" />
                    {days > 0 && `${days}d `}{hours}h {minutes}m {seconds}s
                  </>
                )}
              </div>
            </div>
          </div>

          <CardContent className="p-4 flex flex-col flex-1 gap-4">
            <div>
              <h3 className="font-semibold text-base line-clamp-1 group-hover:text-primary transition-colors duration-200">{auction.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                by {auction.sellerName} <span className="text-yellow-500">★ {auction.sellerRating}</span>
              </p>
            </div>

            <div className="mt-auto flex items-end justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Current Bid</p>
                <p className="text-2xl font-mono font-bold text-primary drop-shadow-[0_0_4px_rgba(220,38,38,0.6)]">
                  ${auction.currentBid.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Bids</p>
                <p className="text-lg font-mono font-medium">{auction.bidCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
