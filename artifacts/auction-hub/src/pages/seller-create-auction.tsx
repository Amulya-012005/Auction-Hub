import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateAuction, useListCategories } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

// Helper for date formatting for local datetime-local input
const getLocalDatetime = (offsetHours = 0) => {
  const d = new Date();
  d.setHours(d.getHours() + offsetHours);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  imageUrl: z.string().url("Must be a valid URL"),
  category: z.string().min(1, "Category is required"),
  startingPrice: z.coerce.number().min(1, "Price must be greater than 0"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  shippingInfo: z.string().optional(),
});

export default function SellerCreateAuction() {
  const [, setLocation] = useLocation();
  const createMutation = useCreateAuction();
  const { data: categories } = useListCategories();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
      category: "",
      startingPrice: 10,
      startTime: getLocalDatetime(0),
      endTime: getLocalDatetime(24),
      shippingInfo: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Ensure endTime is after startTime
    if (new Date(values.endTime) <= new Date(values.startTime)) {
      form.setError("endTime", { message: "End time must be after start time" });
      return;
    }

    createMutation.mutate(
      { data: values },
      {
        onSuccess: (data) => {
          toast.success("Listing created successfully");
          setLocation(`/seller/auction/${data.id}`);
        },
        onError: (err) => {
          toast.error(err.data?.error || "Failed to create listing");
        }
      }
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/seller/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-white uppercase tracking-wider mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Terminal
      </Link>
      
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white uppercase">New Listing Configuration</h1>
        <p className="text-muted-foreground">Deploy a new asset to the market floor.</p>
      </div>

      <Card className="border-border/50 shadow-xl bg-card">
        <CardContent className="p-6 md:p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-primary/20 pb-2">Asset Details</h3>
                
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs tracking-wider text-muted-foreground">Asset Title</FormLabel>
                    <FormControl><Input placeholder="Rare Vintage Item..." className="bg-background" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase text-xs tracking-wider text-muted-foreground">Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories?.map(c => <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}/>
                  
                  <FormField control={form.control} name="imageUrl" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase text-xs tracking-wider text-muted-foreground">Image URL</FormLabel>
                      <FormControl><Input placeholder="https://..." className="bg-background font-mono text-sm" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}/>
                </div>

                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs tracking-wider text-muted-foreground">Detailed Specs</FormLabel>
                    <FormControl><Textarea placeholder="Full details, condition, specs..." className="min-h-[120px] bg-background resize-y" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>
              </div>

              <div className="space-y-4 pt-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-primary/20 pb-2">Market Parameters</h3>
                
                <FormField control={form.control} name="startingPrice" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs tracking-wider text-muted-foreground">Opening Ask (USD)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">$</span>
                        <Input type="number" min="1" step="1" className="bg-background pl-8 font-mono text-lg" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="startTime" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase text-xs tracking-wider text-muted-foreground">Market Open</FormLabel>
                      <FormControl><Input type="datetime-local" className="bg-background font-mono text-sm" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}/>
                  <FormField control={form.control} name="endTime" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase text-xs tracking-wider text-muted-foreground">Market Close</FormLabel>
                      <FormControl><Input type="datetime-local" className="bg-background font-mono text-sm" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}/>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-primary/20 pb-2">Logistics</h3>
                <FormField control={form.control} name="shippingInfo" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs tracking-wider text-muted-foreground">Fulfillment Details</FormLabel>
                    <FormControl><Input placeholder="Will ship worldwide, insured..." className="bg-background" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>
              </div>

              <div className="pt-6 border-t border-border/50">
                <Button type="submit" size="lg" className="w-full font-bold tracking-widest bg-primary hover:bg-primary/90 text-white shadow-[0_0_15px_rgba(220,38,38,0.3)]" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "DEPLOYING ASSET..." : "DEPLOY LISTING"}
                </Button>
              </div>

            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
