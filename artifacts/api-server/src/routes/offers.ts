import { Router } from "express";
import { eq, and } from "drizzle-orm";
import {
  db,
  loanApplicationsTable,
  loanOffersTable,
  tenantsTable,
  riskScoresTable,
} from "@workspace/db";
import { AcceptOfferBody, CalculateEmiBody } from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";
import { genId, calcEmi } from "../lib/idgen";

const router = Router();

router.get("/offers/:applicationId", requireAuth, async (req, res): Promise<void> => {
  const appRows = await db.select().from(loanApplicationsTable)
    .where(eq(loanApplicationsTable.id, req.params.applicationId)).limit(1);
  if (!appRows.length) { res.status(404).json({ error: "Application not found" }); return; }
  const app = appRows[0];

  // Get existing offers or generate them
  const existing = await db.select().from(loanOffersTable)
    .where(eq(loanOffersTable.applicationId, req.params.applicationId));

  if (existing.length > 0) {
    const tenants = await db.select({ id: tenantsTable.id, name: tenantsTable.name, logo: tenantsTable.logo })
      .from(tenantsTable);
    const tenantMap = Object.fromEntries(tenants.map(t => [t.id, t]));

    res.json(existing.map(o => ({
      id: o.id,
      applicationId: o.applicationId,
      tenantId: o.tenantId,
      tenantName: tenantMap[o.tenantId]?.name ?? o.tenantId,
      tenantLogo: tenantMap[o.tenantId]?.logo ?? null,
      offeredAmount: Number(o.offeredAmount),
      tenure: o.tenure,
      interestRate: Number(o.interestRate),
      emi: Number(o.emi),
      processingFee: Number(o.processingFee),
      totalInterest: Number(o.totalInterest),
      totalRepayable: Number(o.totalRepayable),
      approvalProbability: Number(o.approvalProbability),
      disbursementTime: o.disbursementTime ?? "2-3 days",
      expiresAt: o.expiresAt.toISOString(),
      isAccepted: o.isAccepted === "true",
    })));
    return;
  }

  // Generate offers from active tenants
  const tenants = await db.select().from(tenantsTable)
    .where(eq(tenantsTable.status, "active")).limit(5);

  const riskRows = await db.select().from(riskScoresTable)
    .where(eq(riskScoresTable.applicationId, req.params.applicationId)).limit(1);
  const riskScore = riskRows.length > 0 ? Number(riskRows[0].score) : 65;

  const principal = Number(app.approvedAmount ?? app.requestedAmount);
  const tenure = app.approvedTenure ?? app.requestedTenure;
  const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);

  const offers = tenants.map((tenant, i) => {
    const baseRate = 12 + i * 0.5 + (100 - riskScore) * 0.1;
    const interestRate = Math.min(24, Math.max(8, baseRate));
    const emi = calcEmi(principal, interestRate, tenure);
    const totalRepayable = emi * tenure;
    const totalInterest = totalRepayable - principal;
    const processingFee = principal * 0.01 * (1 + i * 0.2);
    const approvalProbability = Math.min(0.95, riskScore / 100 + 0.1 + i * 0.02);

    return {
      id: genId(),
      applicationId: req.params.applicationId,
      tenantId: tenant.id,
      offeredAmount: String(principal),
      tenure,
      interestRate: String(interestRate.toFixed(2)),
      emi: String(emi.toFixed(2)),
      processingFee: String(processingFee.toFixed(2)),
      totalInterest: String(totalInterest.toFixed(2)),
      totalRepayable: String(totalRepayable.toFixed(2)),
      approvalProbability: String(approvalProbability.toFixed(2)),
      disbursementTime: ["24 hours", "2-3 days", "3-5 days"][i % 3],
      isAccepted: "false",
      expiresAt,
    };
  });

  if (offers.length > 0) {
    await db.insert(loanOffersTable).values(offers);
  }

  res.json(offers.map((o, i) => ({
    id: o.id,
    applicationId: o.applicationId,
    tenantId: o.tenantId,
    tenantName: tenants[i]?.name ?? "",
    tenantLogo: tenants[i]?.logo ?? null,
    offeredAmount: Number(o.offeredAmount),
    tenure: o.tenure,
    interestRate: Number(o.interestRate),
    emi: Number(o.emi),
    processingFee: Number(o.processingFee),
    totalInterest: Number(o.totalInterest),
    totalRepayable: Number(o.totalRepayable),
    approvalProbability: Number(o.approvalProbability),
    disbursementTime: o.disbursementTime,
    expiresAt: o.expiresAt.toISOString(),
    isAccepted: false,
  })));
});

router.post("/offers/:applicationId/accept", requireAuth, async (req, res): Promise<void> => {
  const body = AcceptOfferBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: body.error.message }); return; }

  const offerRows = await db.select().from(loanOffersTable)
    .where(and(
      eq(loanOffersTable.id, body.data.offerId),
      eq(loanOffersTable.applicationId, req.params.applicationId),
    )).limit(1);
  if (!offerRows.length) { res.status(404).json({ error: "Offer not found" }); return; }
  const offer = offerRows[0];

  await db.update(loanOffersTable)
    .set({ isAccepted: "true" })
    .where(eq(loanOffersTable.id, offer.id));

  const [updated] = await db.update(loanApplicationsTable)
    .set({
      status: "offer_accepted",
      approvedAmount: offer.offeredAmount,
      approvedTenure: offer.tenure,
      approvedRate: offer.interestRate,
      updatedAt: new Date(),
    })
    .where(eq(loanApplicationsTable.id, req.params.applicationId))
    .returning();

  res.json(updated);
});

router.post("/offers/calculate-emi", async (req, res): Promise<void> => {
  const body = CalculateEmiBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: body.error.message }); return; }

  const { principal, annualRate, tenureMonths } = body.data;
  const emi = calcEmi(principal, annualRate, tenureMonths);
  const totalPayable = emi * tenureMonths;
  const totalInterest = totalPayable - principal;
  const processingFee = principal * 0.01;

  // Build schedule
  let outstanding = principal;
  const monthlyRate = annualRate / 12 / 100;
  const schedule = [];
  for (let i = 1; i <= tenureMonths; i++) {
    const interest = outstanding * monthlyRate;
    const principalPart = emi - interest;
    outstanding = Math.max(0, outstanding - principalPart);
    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + i);
    schedule.push({
      installmentNumber: i,
      dueDate: dueDate.toISOString(),
      emiAmount: emi,
      principal: Number(principalPart.toFixed(2)),
      interest: Number(interest.toFixed(2)),
      outstandingAfter: Number(outstanding.toFixed(2)),
    });
  }

  res.json({ emi, totalPayable, totalInterest, processingFee, schedule });
});

export default router;
