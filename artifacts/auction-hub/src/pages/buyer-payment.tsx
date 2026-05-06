import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useGetAuction } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Smartphone, Shield, CheckCircle, Lock, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

type PaymentMethod = "upi" | "phonepe" | "card" | null;
type PaymentStatus = "pending" | "held_by_agent" | "completed";

const PAYMENT_METHODS = [
  {
    id: "upi" as const,
    label: "UPI",
    desc: "Pay via any UPI app",
    icon: "₹",
    color: "text-orange-400",
  },
  {
    id: "phonepe" as const,
    label: "PhonePe",
    desc: "Pay via PhonePe wallet",
    icon: "P",
    color: "text-purple-400",
  },
  {
    id: "card" as const,
    label: "Card",
    desc: "Debit / Credit Card",
    icon: <CreditCard className="w-5 h-5" />,
    color: "text-blue-400",
  },
];

export default function BuyerPayment() {
  const params = useParams();
  const id = parseInt(params.id || "0", 10);
  const [, navigate] = useLocation();

  const { data: auction, isLoading } = useGetAuction(id, {
    query: { enabled: !!id }
  });

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("pending");
  const [processing, setProcessing] = useState(false);

  const handleConfirmPayment = async () => {
    if (!selectedMethod) return;
    setProcessing(true);
    await new Promise(r => setTimeout(r, 2200));
    setPaymentStatus("held_by_agent");
    setProcessing(false);
    toast.success("Payment received — held by escrow agent", { duration: 5000 });
  };

  if (isLoading) return (
    <div className="max-w-xl mx-auto space-y-4 pt-8">
      <Skeleton className="h-10 w-2/3" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );

  if (!auction) return (
    <div className="text-center py-24">
      <h2 className="text-2xl font-bold">Auction not found</h2>
      <Link href="/buyer/won" className="inline-block mt-4 text-primary hover:underline">Back to won auctions</Link>
    </div>
  );

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <Link href="/buyer/won" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-white uppercase tracking-wider">
        <ArrowLeft className="w-4 h-4" /> Back to Won Auctions
      </Link>

      <div>
        <h1 className="text-3xl font-black tracking-tight text-white mb-1">PAYMENT</h1>
        <p className="text-muted-foreground text-sm">Secure checkout — funds held in escrow until delivery</p>
      </div>

      <Card className="glass-card border-primary/20">
        <CardContent className="p-6 space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Item</p>
              <p className="font-bold text-white leading-tight">{auction.title}</p>
              <p className="text-sm text-muted-foreground mt-0.5">by {auction.sellerName}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Amount Due</p>
              <p className="text-3xl font-mono font-bold text-primary drop-shadow-[0_0_6px_rgba(220,38,38,0.5)]">
                ${auction.currentBid.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence mode="wait">
        {paymentStatus === "pending" && (
          <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Select Payment Method</p>
              <div className="space-y-3">
                {PAYMENT_METHODS.map(method => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`w-full p-4 rounded-xl border flex items-center gap-4 transition-all duration-200 text-left ${
                      selectedMethod === method.id
                        ? "border-primary bg-primary/10 shadow-[0_0_16px_rgba(220,38,38,0.2)]"
                        : "border-border/50 bg-card/60 hover:border-primary/40 hover:bg-card"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg bg-background/80 flex items-center justify-center font-bold text-lg ${method.color}`}>
                      {typeof method.icon === "string" ? method.icon : method.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-white">{method.label}</p>
                      <p className="text-xs text-muted-foreground">{method.desc}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      selectedMethod === method.id ? "border-primary bg-primary" : "border-muted-foreground"
                    }`}>
                      {selectedMethod === method.id && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-start gap-2 text-xs text-muted-foreground bg-card/40 border border-border/40 rounded-lg p-3">
              <Shield className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white">Agent Escrow Protection:</span> Your payment is held by our agent until the item is confirmed delivered. No cash on delivery accepted.
              </div>
            </div>

            <Button
              className="w-full h-12 font-bold tracking-widest glow-btn text-white"
              disabled={!selectedMethod || processing}
              onClick={handleConfirmPayment}
            >
              {processing ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  CONFIRM & PAY ${auction.currentBid.toLocaleString()}
                </span>
              )}
            </Button>
          </motion.div>
        )}

        {paymentStatus === "held_by_agent" && (
          <motion.div key="held" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
            <Card className="glass-card border-yellow-500/30 shadow-[0_0_30px_rgba(234,179,8,0.1)]">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center mx-auto">
                  <Shield className="w-8 h-8 text-yellow-500" />
                </div>
                <div>
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/40 mb-3">HELD BY AGENT</Badge>
                  <h2 className="text-2xl font-black text-white mb-2">Payment Secured</h2>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Your payment of <span className="text-white font-bold">${auction.currentBid.toLocaleString()}</span> is safely held by our escrow agent. Funds will be released to the seller after you confirm delivery.
                  </p>
                </div>
                <div className="bg-background/60 rounded-lg p-4 border border-border/40 text-left space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Payment Status</span>
                    <span className="text-yellow-400 font-bold uppercase">Held by Agent</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Method</span>
                    <span className="text-white capitalize">{selectedMethod}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="text-white font-mono">${auction.currentBid.toLocaleString()}</span>
                  </div>
                </div>
                <Button
                  className="w-full h-12 font-bold tracking-widest bg-green-600 hover:bg-green-500 text-white"
                  onClick={() => {
                    setPaymentStatus("completed");
                    toast.success("Delivery confirmed! Funds released to seller.");
                  }}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  CONFIRM DELIVERY & RELEASE FUNDS
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {paymentStatus === "completed" && (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
            <Card className="glass-card border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.1)]">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <div>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/40 mb-3">TRANSACTION COMPLETE</Badge>
                  <h2 className="text-2xl font-black text-white mb-2">All Done!</h2>
                  <p className="text-muted-foreground text-sm">
                    Funds have been released to the seller. Enjoy your purchase!
                  </p>
                </div>
                <Link href="/buyer/dashboard">
                  <Button className="w-full h-12 font-bold tracking-widest glow-btn text-white">
                    BACK TO MARKET
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
