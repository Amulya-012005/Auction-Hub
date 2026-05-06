import { Router } from "express";
import { db, categoriesTable, auctionsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

router.get("/categories", async (_req, res): Promise<void> => {
  const categories = await db.select().from(categoriesTable);

  const withCounts = await Promise.all(
    categories.map(async (cat) => {
      const [row] = await db
        .select({ count: sql<number>`count(*)` })
        .from(auctionsTable)
        .where(eq(auctionsTable.category, cat.slug));
      return { ...cat, auctionCount: Number(row?.count ?? 0) };
    }),
  );

  res.json(withCounts);
});

export default router;
