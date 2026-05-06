import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import bcrypt from "bcryptjs";
import { auctionsTable, bidsTable, usersTable } from "../lib/db/src/schema/index.js";

const { Pool } = pg;

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL required");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

const NOW = new Date();
const hoursFromNow = (h: number) => new Date(NOW.getTime() + h * 60 * 60 * 1000);
const hoursAgo = (h: number) => new Date(NOW.getTime() - h * 60 * 60 * 1000);

async function seed() {
  console.log("🌱 Seeding database…");

  const hash = await bcrypt.hash("password123", 12);

  await db.insert(usersTable).values([
    { email: "seller@demo.com",  passwordHash: hash, name: "Alex Chen",     role: "seller", rating: 4.9 },
    { email: "buyer@demo.com",   passwordHash: hash, name: "Jordan Lee",    role: "buyer",  rating: 4.7 },
    { email: "seller2@demo.com", passwordHash: hash, name: "Maya Williams", role: "seller", rating: 4.6 },
    { email: "buyer2@demo.com",  passwordHash: hash, name: "Sam Rivera",    role: "buyer",  rating: 4.8 },
  ]).onConflictDoNothing();

  const allUsers = await db.select().from(usersTable);
  const s1 = allUsers.find(u => u.email === "seller@demo.com")!;
  const s2 = allUsers.find(u => u.email === "seller2@demo.com")!;
  const b1 = allUsers.find(u => u.email === "buyer@demo.com")!;
  const b2 = allUsers.find(u => u.email === "buyer2@demo.com")!;
  console.log("✅ Users:", allUsers.map(u => `${u.name}(${u.role})`).join(", "));

  const liveAuctions = [
    {
      title: "1967 Gibson Les Paul Custom – Vintage Black Beauty",
      description: "Exceptionally rare original 1967 Les Paul Custom in ebony finish. All original PAF humbuckers, neck binding intact, original case included. This is a museum-quality instrument with stunning playability.",
      imageUrl: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&q=80",
      category: "Music",
      startingPrice: 4500, currentBid: 7200, bidCount: 14,
      sellerId: s1.id, sellerName: s1.name, sellerRating: s1.rating,
      status: "live" as const, startTime: hoursAgo(3), endTime: hoursFromNow(5),
    },
    {
      title: "Rolex Submariner Date Ref. 116610LN – 2019",
      description: "Full set Rolex Submariner in perfect condition. Ceramic bezel, oyster bracelet with Glidelock extension. Box, papers, and original receipt included.",
      imageUrl: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&q=80",
      category: "Watches",
      startingPrice: 8000, currentBid: 11500, bidCount: 23,
      sellerId: s2.id, sellerName: s2.name, sellerRating: s2.rating,
      status: "live" as const, startTime: hoursAgo(6), endTime: hoursFromNow(2),
    },
    {
      title: "Jean-Michel Basquiat Original Sketch (Authenticated)",
      description: "Original pen and ink sketch on paper, circa 1983. Authentication certificate from the Estate. Provenance includes private NY collection. Dimensions: 12×16 inches.",
      imageUrl: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&q=80",
      category: "Art",
      startingPrice: 15000, currentBid: 22400, bidCount: 9,
      sellerId: s1.id, sellerName: s1.name, sellerRating: s1.rating,
      status: "live" as const, startTime: hoursAgo(1), endTime: hoursFromNow(8),
    },
    {
      title: "Apple Mac Pro (2023) – M2 Ultra 24-Core, 192GB RAM",
      description: "Brand new sealed Apple Mac Pro with M2 Ultra chip, 24-core CPU, 60-core GPU, 192GB unified memory, 8TB SSD. Purchased from Apple Store, never opened.",
      imageUrl: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80",
      category: "Electronics",
      startingPrice: 6000, currentBid: 6800, bidCount: 7,
      sellerId: s2.id, sellerName: s2.name, sellerRating: s2.rating,
      status: "live" as const, startTime: hoursAgo(2), endTime: hoursFromNow(12),
    },
    {
      title: "Porsche 911 GT3 RS (2023) – Weissach Package",
      description: "One owner, 1,200 miles. Weissach Package, Pyro Silver Metallic, full carbon interior. PDK, factory roll cage, magnesium wheels. Clear title.",
      imageUrl: "https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=800&q=80",
      category: "Vehicles",
      startingPrice: 220000, currentBid: 258000, bidCount: 31,
      sellerId: s1.id, sellerName: s1.name, sellerRating: s1.rating,
      status: "live" as const, startTime: hoursAgo(5), endTime: hoursFromNow(3),
    },
    {
      title: "Leica M11 Monochrom – Full Kit with 50mm Summilux",
      description: "Leica M11 Monochrom body (60MP) plus Summilux-M 50mm f/1.4 ASPH lens. Mint condition, under 500 shutter actuations. Original boxes included.",
      imageUrl: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80",
      category: "Photography",
      startingPrice: 9500, currentBid: 12100, bidCount: 18,
      sellerId: s2.id, sellerName: s2.name, sellerRating: s2.rating,
      status: "live" as const, startTime: hoursAgo(4), endTime: hoursFromNow(6),
    },
    {
      title: "First Edition: The Great Gatsby – F. Scott Fitzgerald (1925)",
      description: "First edition, first printing. Original dust jacket present (rare). Light wear consistent with age, binding tight, text clean. Provenance: estate of a Columbia University professor.",
      imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80",
      category: "Collectibles",
      startingPrice: 3000, currentBid: 4750, bidCount: 12,
      sellerId: s1.id, sellerName: s1.name, sellerRating: s1.rating,
      status: "live" as const, startTime: hoursAgo(7), endTime: hoursFromNow(9),
    },
    {
      title: "Louis Vuitton x Virgil Abloh Keepall 50 – SS19",
      description: "Virgil Abloh debut collection Keepall 50 in Monogram Eclipse. Excellent condition, dust bag and original receipt. Rare piece from a historic LV collection.",
      imageUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80",
      category: "Fashion",
      startingPrice: 1800, currentBid: 3100, bidCount: 21,
      sellerId: s2.id, sellerName: s2.name, sellerRating: s2.rating,
      status: "live" as const, startTime: hoursAgo(2), endTime: hoursFromNow(4),
    },
  ];

  const inserted = await db.insert(auctionsTable).values(liveAuctions).returning();
  console.log(`✅ ${inserted.length} live auctions inserted`);

  // Bids for live auctions
  const bidsToInsert = [];
  for (const auction of inserted) {
    const count = auction.bidCount;
    const step = (auction.currentBid - auction.startingPrice) / Math.max(count, 1);
    let amount = auction.startingPrice;
    for (let i = 0; i < count; i++) {
      amount += step;
      bidsToInsert.push({
        auctionId: auction.id,
        bidderId: i % 2 === 0 ? b1.id : b2.id,
        bidderName: i % 2 === 0 ? b1.name : b2.name,
        amount: Math.round(Math.min(amount, auction.currentBid) * 100) / 100,
        createdAt: new Date(NOW.getTime() - (count - i) * 8 * 60 * 1000),
      });
    }
  }
  if (bidsToInsert.length) await db.insert(bidsTable).values(bidsToInsert);
  console.log(`✅ ${bidsToInsert.length} bids inserted`);

  // Sold auction for seller@demo.com
  const [soldAuction] = await db.insert(auctionsTable).values({
    title: "Banksy 'Girl with Balloon' – Authenticated Print",
    description: "Limited edition Banksy screen print from 2004. Signed in pencil, numbered 145/600. Pest Control certificate of authenticity included. UV-protective frame.",
    imageUrl: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800&q=80",
    category: "Art",
    startingPrice: 5000, currentBid: 18500, bidCount: 34,
    sellerId: s1.id, sellerName: s1.name, sellerRating: s1.rating,
    status: "sold",
    startTime: hoursAgo(72), endTime: hoursAgo(24),
    winnerId: b1.id, winnerName: b1.name,
    shippingInfo: "123 Oak Street, Brooklyn, NY 11201",
  }).returning();

  const soldBids = [];
  let soldAmt = 5000;
  for (let i = 0; i < 34; i++) {
    soldAmt += 400;
    soldBids.push({
      auctionId: soldAuction.id,
      bidderId: i % 2 === 0 ? b1.id : b2.id,
      bidderName: i % 2 === 0 ? b1.name : b2.name,
      amount: soldAmt,
      createdAt: new Date(NOW.getTime() - (72 - i * 2) * 60 * 60 * 1000),
    });
  }
  await db.insert(bidsTable).values(soldBids);
  console.log(`✅ Sold auction: "${soldAuction.title}" → winner: ${b1.name}`);

  console.log("\n🎉 Seed complete!");
  console.log("Demo accounts (password: password123):");
  console.log("  seller@demo.com  — Alex Chen (seller)");
  console.log("  buyer@demo.com   — Jordan Lee (buyer)");
  await pool.end();
}

seed().catch(err => { console.error("❌ Seed failed:", err); process.exit(1); });
