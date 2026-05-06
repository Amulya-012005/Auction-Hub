import { Router } from "express";
import { db, bidsTable, auctionsTable, usersTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middleware/requireAuth";
import { PlaceBidBody } from "@workspace/api-zod";

const router = Router();

router.get("/auctions/:id/bids", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const bids = await db
    .select()
    .from(bidsTable)
    .where(eq(bidsTable.auctionId, id))
    .orderBy(desc(bidsTable.createdAt));

  res.json(bids);
});

router.post("/auctions/:id/bids", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const parsed = PlaceBidBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [auction] = await db.select().from(auctionsTable).where(eq(auctionsTable.id, id));
  if (!auction) { res.status(404).json({ error: "Auction not found" }); return; }
  if (auction.status !== "live") { res.status(400).json({ error: "Auction is not live" }); return; }
  if (auction.sellerId === req.user!.id) { res.status(400).json({ error: "Seller cannot bid on own auction" }); return; }

  const minBid = auction.currentBid > 0 ? auction.currentBid + 1 : auction.startingPrice;
  if (parsed.data.amount < minBid) {
    res.status(400).json({ error: `Bid must be at least ${minBid}` });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.id));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  const [bid] = await db.insert(bidsTable).values({
    auctionId: id,
    bidderId: req.user!.id,
    bidderName: user.name,
    amount: parsed.data.amount,
  }).returning();

  // Update auction's current bid and bid count
  await db.update(auctionsTable).set({
    currentBid: parsed.data.amount,
    bidCount: auction.bidCount + 1,
  }).where(eq(auctionsTable.id, id));

  // Emit socket event if io is available
  const io = (req as any).app.get("io");
  if (io) {
    io.to(`auction:${id}`).emit("bid:new", {
      bid,
      currentBid: parsed.data.amount,
      bidCount: auction.bidCount + 1,
    });
    io.emit("activity:new", {
      id: bid.id,
      bidderName: user.name,
      auctionTitle: auction.title,
      auctionId: id,
      amount: parsed.data.amount,
      createdAt: bid.createdAt,
    });
  }

  res.status(201).json(bid);
});

// Buyer routes
router.get("/buyer/bids", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const bids = await db
    .select({
      id: bidsTable.id,
      auctionId: bidsTable.auctionId,
      bidderId: bidsTable.bidderId,
      bidderName: bidsTable.bidderName,
      amount: bidsTable.amount,
      createdAt: bidsTable.createdAt,
      auctionTitle: auctionsTable.title,
      auctionStatus: auctionsTable.status,
      auctionEndTime: auctionsTable.endTime,
    })
    .from(bidsTable)
    .innerJoin(auctionsTable, eq(bidsTable.auctionId, auctionsTable.id))
    .where(eq(bidsTable.bidderId, req.user!.id))
    .orderBy(desc(bidsTable.createdAt));

  const withWinning = bids.map((b) => ({
    ...b,
    isWinning: b.auctionStatus === "live"
      ? false // simplified
      : b.auctionStatus === "sold"
      ? false // check separately if needed
      : false,
  }));

  res.json(withWinning);
});

router.get("/buyer/won", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const won = await db
    .select()
    .from(auctionsTable)
    .where(and(eq(auctionsTable.winnerId, req.user!.id), eq(auctionsTable.status, "sold")))
    .orderBy(desc(auctionsTable.updatedAt));

  res.json(won);
});

export default router;
