import { useState } from "react";
import { useListAuctions, useListCategories } from "@workspace/api-client-react";
import { AuctionCard } from "@/components/auction-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";

export default function BuyerDashboard() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("");
  const [sort, setSort] = useState<string>("ending_soon");

  const { data: auctions, isLoading } = useListAuctions();
  const { data: categories } = useListCategories();

  // Client-side filtering since the hook doesn't accept dynamic params easily without refetching constantly
  const filteredAuctions = auctions?.filter(a => {
    if (search && !a.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (category && category !== "all" && a.category !== category) return false;
    return true;
  }).sort((a, b) => {
    if (sort === "ending_soon") return new Date(a.endTime).getTime() - new Date(b.endTime).getTime();
    if (sort === "newest") return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
    if (sort === "price_high") return b.currentBid - a.currentBid;
    if (sort === "price_low") return a.currentBid - b.currentBid;
    return 0;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between gap-4 items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-2">LIVE MARKET</h1>
          <p className="text-muted-foreground">Discover and bid on exclusive active listings.</p>
        </div>
        
        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search auctions..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-full sm:w-64 bg-card/50 border-border/50 focus-visible:ring-primary/50 font-mono"
            />
          </div>
          
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-full sm:w-40 bg-card/50 border-border/50">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ending_soon">Ending Soon</SelectItem>
              <SelectItem value="newest">Newly Listed</SelectItem>
              <SelectItem value="price_high">Price: High to Low</SelectItem>
              <SelectItem value="price_low">Price: Low to High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <Button 
          variant={category === "all" || !category ? "default" : "outline"} 
          size="sm" 
          onClick={() => setCategory("all")}
          className={category === "all" || !category ? "bg-primary hover:bg-primary/90 text-white" : "border-border/50"}
        >
          ALL
        </Button>
        {categories?.map(c => (
          <Button 
            key={c.id} 
            variant={category === c.slug ? "default" : "outline"} 
            size="sm"
            onClick={() => setCategory(c.slug)}
            className={category === c.slug ? "bg-primary hover:bg-primary/90 text-white" : "border-border/50"}
          >
            {c.name.toUpperCase()}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="w-full aspect-video rounded-xl" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex justify-between pt-4">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredAuctions && filteredAuctions.length > 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {filteredAuctions.map(auction => (
            <AuctionCard key={auction.id} auction={auction} />
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-24 bg-card/20 rounded-xl border border-border/50">
          <h3 className="text-xl font-bold text-muted-foreground mb-2">NO ACTIVE LISTINGS FOUND</h3>
          <p className="text-muted-foreground/60">Try adjusting your search or filters.</p>
          <Button variant="outline" className="mt-6" onClick={() => {setSearch(""); setCategory("all");}}>
            RESET FILTERS
          </Button>
        </div>
      )}
    </div>
  );
}
