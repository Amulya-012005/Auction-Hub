import { Router } from "express";
import { db, auctionsTable, bidsTable, usersTable } from "@workspace/db";
import { eq, desc, ilike, gte, lte, and, sql, lt, asc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middleware/requireAuth";
import {
  CreateAuctionBody,
  UpdateAuctionBody,
  AcceptWinnerBody,
  ListAuctionsQueryParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/auctions", async (req, res): Promise<void> => {
  const query = ListAuctionsQueryParams.safeParse(req.query);
  const params = query.success ? query.data : {};

  let conditions: ReturnType<typeof eq>[] = [];

  if (params.category) conditions.push(eq(auctionsTable.category, params.category));
  if (params.status) conditions.push(eq(auctionsTable.status, params.status));

  let rows = await db
    .select()
    .from(auctionsTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(auctionsTable.createdAt));

  if (params.search) {
    const s = params.search.toLowerCase();
    rows = rows.filter(
      (r) =>
        r.title.toLowerCase().includes(s) ||
        r.description.toLowerCase().includes(s) ||
        r.category.toLowerCase().includes(s),
    );
  }

  if (params.minPrice != null) rows = rows.filter((r) => r.currentBid >= Number(params.minPrice));
  if (params.maxPrice != null) rows = rows.filter((r) => r.currentBid <= Number(params.maxPrice));

  if (params.sort === "price_asc") rows.sort((a, b) => a.currentBid - b.currentBid);
  else if (params.sort === "price_desc") rows.sort((a, b) => b.currentBid - a.currentBid);
  else if (params.sort === "ending_soon") rows.sort((a, b) => new Date(a.endTime).getTime() - new Date(b.endTime).getTime());

  res.json(rows);
});

router.post("/auctions", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const parsed = CreateAuctionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const seller = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.id));
  if (!seller[0]) {
    res.status(404).json({ error: "Seller not found" });
    return;
  }

  const [auction] = await db
    .insert(auctionsTable)
    .values({
      ...parsed.data,
      currentBid: parsed.data.startingPrice,
      sellerId: req.user!.id,
      sellerName: seller[0].name,
      sellerRating: seller[0].rating,
      status: "live",
    })
    .returning();

  res.status(201).json(auction);
});

router.get("/auctions/stats/summary", async (_req, res): Promise<void> => {
  const [liveRow] = await db
    .select({ count: sql<number>`count(*)` })
    .from(auctionsTable)
    .where(eq(auctionsTable.status, "live"));

  const [bidsRow] = await db.select({ count: sql<number>`count(*)` }).from(bidsTable);

  const [valueRow] = await db
    .select({ total: sql<number>`coalesce(sum(current_bid), 0)` })
    .from(auctionsTable)
    .where(eq(auctionsTable.status, "live"));

  const now = new Date();
  const soon = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours
  const [endingSoonRow] = await db
    .select({ count: sql<number>`count(*)` })
    .from(auctionsTable)
    .where(and(eq(auctionsTable.status, "live"), lt(auctionsTable.endTime, soon)));

  res.json({
    liveCount: Number(liveRow?.count ?? 0),
    totalBids: Number(bidsRow?.count ?? 0),
    totalValue: Number(valueRow?.total ?? 0),
    endingSoon: Number(endingSoonRow?.count ?? 0),
  });
});

router.get("/auctions/activity/recent", async (_req, res): Promise<void> => {
  const recentBids = await db
    .select({
      id: bidsTable.id,
      bidderName: bidsTable.bidderName,
      auctionId: bidsTable.auctionId,
      amount: bidsTable.amount,
      createdAt: bidsTable.createdAt,
      auctionTitle: auctionsTable.title,
    })
    .from(bidsTable)
    .innerJoin(auctionsTable, eq(bidsTable.auctionId, auctionsTable.id))
    .orderBy(desc(bidsTable.createdAt))
    .limit(20);

  res.json(recentBids);
});

router.get("/auctions/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [auction] = await db.select().from(auctionsTable).where(eq(auctionsTable.id, id));
  if (!auction) { res.status(404).json({ error: "Auction not found" }); return; }

  const recentBids = await db
    .select()
    .from(bidsTable)
    .where(eq(bidsTable.auctionId, id))
    .orderBy(desc(bidsTable.createdAt))
    .limit(10);

  res.json({ ...auction, recentBids });
});

router.patch("/auctions/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const parsed = UpdateAuctionBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [auction] = await db.select().from(auctionsTable).where(eq(auctionsTable.id, id));
  if (!auction) { res.status(404).json({ error: "Not found" }); return; }
  if (auction.sellerId !== req.user!.id) { res.status(403).json({ error: "Forbidden" }); return; }

  const [updated] = await db.update(auctionsTable).set(parsed.data).where(eq(auctionsTable.id, id)).returning();
  res.json(updated);
});

router.post("/auctions/:id/accept-winner", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const parsed = AcceptWinnerBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [auction] = await db.select().from(auctionsTable).where(eq(auctionsTable.id, id));
  if (!auction) { res.status(404).json({ error: "Not found" }); return; }
  if (auction.sellerId !== req.user!.id) { res.status(403).json({ error: "Forbidden" }); return; }

  const [winner] = await db.select().from(usersTable).where(eq(usersTable.id, parsed.data.winnerId));
  if (!winner) { res.status(404).json({ error: "Winner not found" }); return; }

  const [updated] = await db
    .update(auctionsTable)
    .set({ winnerId: winner.id, winnerName: winner.name, status: "sold" })
    .where(eq(auctionsTable.id, id))
    .returning();

  res.json(updated);
});

// Seller routes
router.get("/seller/auctions", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const rows = await db
    .select()
    .from(auctionsTable)
    .where(eq(auctionsTable.sellerId, req.user!.id))
    .orderBy(desc(auctionsTable.createdAt));
  res.json(rows);
});

router.get("/seller/stats", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const sellerId = req.user!.id;

  const allAuctions = await db.select().from(auctionsTable).where(eq(auctionsTable.sellerId, sellerId));
  const totalBids = await db
    .select({ count: sql<number>`count(*)` })
    .from(bidsTable)
    .innerJoin(auctionsTable, eq(bidsTable.auctionId, auctionsTable.id))
    .where(eq(auctionsTable.sellerId, sellerId));

  res.json({
    totalAuctions: allAuctions.length,
    activeAuctions: allAuctions.filter((a) => a.status === "live").length,
    totalEarnings: allAuctions.filter((a) => a.status === "sold").reduce((s, a) => s + a.currentBid, 0),
    pendingAuctions: allAuctions.filter((a) => a.status === "pending").length,
    soldAuctions: allAuctions.filter((a) => a.status === "sold").length,
    totalBidsReceived: Number(totalBids[0]?.count ?? 0),
  });
});

export default router;
