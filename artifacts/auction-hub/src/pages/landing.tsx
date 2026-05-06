import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { AuctionHubLogoSVG } from "@/components/logo";
import { useGetAuctionsSummary, useGetRecentActivity } from "@workspace/api-client-react";
import { motion } from "framer-motion";

export default function Landing() {
  const { data: summary } = useGetAuctionsSummary();
  const { data: activity } = useGetRecentActivity();

  return (
    <div className="min-h-screen bg-[#050508] text-foreground overflow-hidden relative selection:bg-primary/30">
      <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: "radial-gradient(circle at 50% 50%, rgba(220,38,38,0.2) 0%, transparent 50%)" }} />
      
      <div className="container mx-auto px-4 pt-24 pb-32 relative z-10 flex flex-col items-center text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          <AuctionHubLogoSVG size={180} />
        </motion.div>
        
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-5xl md:text-7xl font-black tracking-tight text-white mb-6"
        >
          WHERE <span className="text-primary drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]">SMART BIDDING</span><br/> MEETS TRUSTED SELLING
        </motion.h1>
        
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl font-light"
        >
          The premier live auction platform for serious buyers and verified sellers. Real-time data, instant execution.
        </motion.p>
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-6"
        >
          <Link href="/login" className="contents">
            <Button size="lg" className="h-16 px-10 text-lg font-bold tracking-widest bg-primary hover:bg-primary/90 shadow-[0_0_20px_rgba(220,38,38,0.4)]">
              START BIDDING
            </Button>
          </Link>
          <Link href="/login" className="contents">
            <Button variant="outline" size="lg" className="h-16 px-10 text-lg font-bold tracking-widest border-primary/50 text-white hover:bg-primary/10">
              START SELLING
            </Button>
          </Link>
        </motion.div>
      </div>

      {summary && (
        <div className="border-y border-border bg-card/30 backdrop-blur py-12 relative z-10">
          <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-mono font-bold text-white mb-2">{summary.liveCount}</div>
              <div className="text-sm tracking-widest uppercase text-muted-foreground">Live Auctions</div>
            </div>
            <div>
              <div className="text-4xl font-mono font-bold text-white mb-2">${summary.totalValue.toLocaleString()}</div>
              <div className="text-sm tracking-widest uppercase text-muted-foreground">Total Value</div>
            </div>
            <div>
              <div className="text-4xl font-mono font-bold text-primary drop-shadow-[0_0_8px_rgba(220,38,38,0.5)] mb-2">{summary.totalBids}</div>
              <div className="text-sm tracking-widest uppercase text-muted-foreground">Bids Placed</div>
            </div>
            <div>
              <div className="text-4xl font-mono font-bold text-white mb-2">{summary.endingSoon}</div>
              <div className="text-sm tracking-widest uppercase text-muted-foreground">Ending Soon</div>
            </div>
          </div>
        </div>
      )}

      {activity && activity.length > 0 && (
        <div className="container mx-auto px-4 py-24 relative z-10">
          <h2 className="text-2xl font-bold tracking-wider mb-8 text-center uppercase border-b border-border/50 pb-4 inline-block mx-auto">Live Market Feed</h2>
          <div className="max-w-4xl mx-auto space-y-4">
            {activity.map((item, i) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + (i * 0.1) }}
                key={item.id} 
                className="bg-card/50 backdrop-blur border border-border/50 p-4 rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <div>
                    <span className="font-bold text-white">{item.bidderName}</span> bid on <span className="text-muted-foreground">{item.auctionTitle}</span>
                  </div>
                </div>
                <div className="font-mono text-primary font-bold text-lg">
                  ${item.amount.toLocaleString()}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
