import { db, auctionsTable } from "@workspace/db";
import { eq, and, lt } from "drizzle-orm";
import { Server as SocketIOServer } from "socket.io";
import { logger } from "./logger";

const POLL_INTERVAL_MS = 30_000;

export function startAuctionExpiryJob(io: SocketIOServer): () => void {
  const run = async () => {
    try {
      const now = new Date();
      const expired = await db
        .update(auctionsTable)
        .set({ status: "ended" })
        .where(
          and(
            eq(auctionsTable.status, "live"),
            lt(auctionsTable.endTime, now),
          ),
        )
        .returning();

      if (expired.length > 0) {
        logger.info({ count: expired.length }, "Auctions auto-expired");
        for (const auction of expired) {
          const payload = {
            auctionId: auction.id,
            title: auction.title,
            finalBid: auction.currentBid,
            bidCount: auction.bidCount,
          };
          io.to(`auction:${auction.id}`).emit("auction:ended", payload);
          io.emit("auction:ended", payload);
          logger.info({ auctionId: auction.id }, "Emitted auction:ended");
        }
      }
    } catch (err) {
      logger.error({ err }, "Auction expiry job error");
    }
  };

  run();
  const intervalId = setInterval(run, POLL_INTERVAL_MS);
  logger.info({ intervalMs: POLL_INTERVAL_MS }, "Auction expiry job started");

  return () => clearInterval(intervalId);
}
