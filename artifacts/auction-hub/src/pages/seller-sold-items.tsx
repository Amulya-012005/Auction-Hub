import { useListSellerSoldItems } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Package, DollarSign, User, Calendar, Truck } from "lucide-react";
import { motion } from "framer-motion";

export default function SellerSoldItems() {
  const { data: soldItems, isLoading } = useListSellerSoldItems();

  return (
    <div className="space-y-8">
      <Link href="/seller/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-white uppercase tracking-wider">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div>
        <h1 className="text-3xl font-black tracking-tight text-white uppercase">Sold Items</h1>
        <p className="text-muted-foreground">Complete sale history — items you have successfully sold.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      ) : !soldItems || soldItems.length === 0 ? (
        <div className="text-center py-24 bg-card/20 rounded-xl border border-border/50">
          <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-muted-foreground mb-2">NO SOLD ITEMS YET</h3>
          <p className="text-muted-foreground/60 mb-6">Accept a winning bid to move items here.</p>
          <Link href="/seller/dashboard" className="text-primary font-bold hover:underline uppercase tracking-widest text-sm">
            View Active Listings
          </Link>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {soldItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="bg-card border-border/50 hover:border-green-500/30 transition-colors">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row gap-0">
                    {/* Image */}
                    <div className="sm:w-48 shrink-0">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-40 sm:h-full object-cover rounded-t-lg sm:rounded-l-lg sm:rounded-tr-none"
                        />
                      ) : (
                        <div className="w-full h-40 sm:h-full bg-muted rounded-t-lg sm:rounded-l-lg sm:rounded-tr-none flex items-center justify-center">
                          <Package className="w-10 h-10 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 p-6 flex flex-col gap-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className="bg-green-500/20 text-green-500 border-green-500/30 hover:bg-green-500/30 text-xs font-bold">
                              SOLD
                            </Badge>
                            <Badge variant="outline" className="text-xs uppercase">{item.category}</Badge>
                          </div>
                          <h3 className="text-lg font-bold text-white">{item.title}</h3>
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Sale Price</p>
                          <p className="text-3xl font-mono font-bold text-green-400 drop-shadow-[0_0_6px_rgba(34,197,94,0.5)]">
                            ${item.soldAmount.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="w-4 h-4 text-muted-foreground shrink-0" />
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Buyer</p>
                            <p className="font-bold text-white">{item.winnerName || "—"}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Sold Date</p>
                            <p className="font-bold text-white">
                              {item.soldAt
                                ? new Date(item.soldAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })
                                : "—"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <Truck className="w-4 h-4 text-muted-foreground shrink-0" />
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Shipping</p>
                            <p className="font-bold text-white truncate max-w-[180px]">{item.shippingInfo || "Not specified"}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                        <DollarSign className="w-4 h-4 text-green-400" />
                        <p className="text-xs text-muted-foreground">
                          Payment pending escrow confirmation from buyer
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
