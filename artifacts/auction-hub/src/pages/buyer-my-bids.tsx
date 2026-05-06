import { useListBuyerBids } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

export default function BuyerMyBids() {
  const { data: bids, isLoading } = useListBuyerBids();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white mb-2">MY BIDS</h1>
        <p className="text-muted-foreground">Track your active and past auction activity.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      ) : bids && bids.length > 0 ? (
        <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase tracking-wider bg-background/50 border-b border-border/50">
                <tr>
                  <th className="px-6 py-4 font-bold">Auction</th>
                  <th className="px-6 py-4 font-bold text-right">My Bid</th>
                  <th className="px-6 py-4 font-bold">Date</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {bids.map((bid) => (
                  <tr key={bid.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/buyer/auction/${bid.auctionId}`} className="font-bold text-white hover:text-primary transition-colors">
                        {bid.auctionTitle}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-primary">
                      ${bid.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                      {new Date(bid.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Badge variant="outline" className="uppercase">
                          {bid.auctionStatus}
                        </Badge>
                        {bid.auctionStatus === 'live' && bid.isWinning && (
                          <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30 border-green-500/50">
                            WINNING
                          </Badge>
                        )}
                        {bid.auctionStatus === 'live' && !bid.isWinning && (
                          <Badge variant="destructive" className="bg-red-500/20 text-red-500 hover:bg-red-500/30 border-red-500/50">
                            OUTBID
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link href={`/buyer/auction/${bid.auctionId}`} className="text-xs uppercase font-bold tracking-wider text-muted-foreground hover:text-white transition-colors">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-24 bg-card/20 rounded-xl border border-border/50">
          <h3 className="text-xl font-bold text-muted-foreground mb-2">NO BIDS YET</h3>
          <p className="text-muted-foreground/60">You haven't placed any bids on the platform.</p>
          <Link href="/buyer/dashboard" className="inline-block mt-6 px-6 py-2 bg-primary text-white rounded-md font-bold text-sm hover:bg-primary/90 transition-colors tracking-widest">
            EXPLORE AUCTIONS
          </Link>
        </div>
      )}
    </div>
  );
}
