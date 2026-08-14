import { Router } from "express";
import tenantsRouter from "./tenants";
import usersRouter from "./users";
import customersRouter from "./customers";
import loanProductsRouter from "./loanProducts";
import loanApplicationsRouter from "./loanApplications";
import kycRouter from "./kyc";
import riskRouter from "./risk";
import offersRouter from "./offers";
import loansRouter from "./loans";
import repaymentsRouter from "./repayments";
import collectionsRouter from "./collections";
import analyticsRouter from "./analytics";
import settingsRouter from "./settings";
import healthRouter from "./health";
import invitationsRouter from "./invitations";
import webhooksRouter from "./webhooks";

const router = Router();

router.use(healthRouter);
router.use(tenantsRouter);
router.use(usersRouter);
router.use(customersRouter);
router.use(loanProductsRouter);
router.use(loanApplicationsRouter);
router.use(kycRouter);
router.use(riskRouter);
router.use(offersRouter);
router.use(loansRouter);
router.use(repaymentsRouter);
router.use(collectionsRouter);
router.use(analyticsRouter);
router.use(settingsRouter);
router.use(invitationsRouter);
router.use(webhooksRouter);

export default router;
