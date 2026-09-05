import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import contactsRouter from "./contacts";
import productsRouter from "./products";
import salesRouter from "./sales";
import purchasesRouter from "./purchases";
import paymentsRouter from "./payments";
import accountingRouter from "./accounting";
import budgetsRouter from "./budgets";
import reportsRouter from "./reports";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(contactsRouter);
router.use(productsRouter);
router.use(salesRouter);
router.use(purchasesRouter);
router.use(paymentsRouter);
router.use(accountingRouter);
router.use(budgetsRouter);
router.use(reportsRouter);

export default router;
