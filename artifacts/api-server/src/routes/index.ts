import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import categoriesRouter from "./categories";
import auctionsRouter from "./auctions";
import bidsRouter from "./bids";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(categoriesRouter);
router.use(auctionsRouter);
router.use(bidsRouter);

export default router;
