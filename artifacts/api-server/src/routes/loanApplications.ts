import { Router } from "express";
import { eq, and, desc, count } from "drizzle-orm";
import {
  db,
  loanApplicationsTable,
  customersTable,
  loanProductsTable,
  tenantsTable,
  kycRecordsTable,
  loansTable,
  repaymentsTable,
} from "@workspace/db";
import {
  ListLoanApplicationsQueryParams,
  CreateLoanApplicationBody,
  UpdateLoanApplicationBody,
  ApproveLoanApplicationBody,
  RejectLoanApplicationBody,
  DisburseLoanBody,
} from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";
import { genId, appNumber, loanNumber, calcEmi } from "../lib/idgen";

const router = Router();

async function enrichApp(app: any) {
  const [customer, product, tenant] = await Promise.all([
    db.select({ firstName: customersTable.firstName, lastName: customersTable.lastName })
      .from(customersTable).where(eq(customersTable.id, app.customerId)).limit(1),
    db.select({ name: loanProductsTable.name }).from(loanProductsTable)
      .where(eq(loanProductsTable.id, app.productId)).limit(1),
    db.select({ name: tenantsTable.name }).from(tenantsTable)
      .where(eq(tenantsTable.id, app.tenantId)).limit(1),
  ]);
  return {
    ...app,
    customerName: customer[0] ? `${customer[0].firstName} ${customer[0].lastName}` : "",
    productName: product[0]?.name ?? "",
    tenantName: tenant[0]?.name ?? "",
  };
}

router.get("/loan-applications", requireAuth, async (req, res): Promise<void> => {
  const query = ListLoanApplicationsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  const { status, customerId, tenantId, page = 1, limit = 20 } = query.data;
  const offset = (page - 1) * limit;

  const conditions: any[] = [];
  if (status) conditions.push(eq(loanApplicationsTable.status, status as any));
  if (customerId) conditions.push(eq(loanApplicationsTable.customerId, customerId));
  if (tenantId) conditions.push(eq(loanApplicationsTable.tenantId, tenantId));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, totalRows] = await Promise.all([
    db.select().from(loanApplicationsTable).where(where)
      .orderBy(desc(loanApplicationsTable.createdAt)).limit(limit).offset(offset),
    db.select({ count: count() }).from(loanApplicationsTable).where(where),
  ]);

  const enriched = await Promise.all(rows.map(enrichApp));
  res.json({ data: enriched, total: totalRows[0]?.count ?? 0, page, limit });
});

router.post("/loan-applications", requireAuth, async (req, res): Promise<void> => {
  const body = CreateLoanApplicationBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const id = genId();
  const applicationNumber = appNumber();
  const tenantId = (req as any).tenantId ?? "default-tenant";

  const [app] = await db
    .insert(loanApplicationsTable)
    .values({
      id,
      applicationNumber,
      tenantId,
      ...body.data,
      requestedAmount: String(body.data.requestedAmount),
      status: "draft",
    })
    .returning();

  // create KYC record
  await db.insert(kycRecordsTable).values({ id: genId(), applicationId: id }).onConflictDoNothing();

  res.status(201).json(await enrichApp(app));
});

router.get("/loan-applications/:applicationId", requireAuth, async (req, res): Promise<void> => {
  const applicationId = String(req.params.applicationId);
  const rows = await db.select().from(loanApplicationsTable)
    .where(eq(loanApplicationsTable.id, applicationId)).limit(1);
  if (!rows.length) {
    res.status(404).json({ error: "Application not found" });
    return;
  }
  res.json(await enrichApp(rows[0]));
});

router.patch("/loan-applications/:applicationId", requireAuth, async (req, res): Promise<void> => {
  const applicationId = String(req.params.applicationId);
  const body = UpdateLoanApplicationBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const updateData: any = { ...body.data, updatedAt: new Date() };
  if (body.data.requestedAmount) updateData.requestedAmount = String(body.data.requestedAmount);

  const [updated] = await db.update(loanApplicationsTable)
    .set(updateData)
    .where(eq(loanApplicationsTable.id, applicationId))
    .returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(await enrichApp(updated));
});

router.post("/loan-applications/:applicationId/submit", requireAuth, async (req, res): Promise<void> => {
  const applicationId = String(req.params.applicationId);
  const [updated] = await db.update(loanApplicationsTable)
    .set({ status: "submitted", updatedAt: new Date() })
    .where(eq(loanApplicationsTable.id, applicationId))
    .returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(await enrichApp(updated));
});

router.post("/loan-applications/:applicationId/approve", requireAuth, async (req, res): Promise<void> => {
  const applicationId = String(req.params.applicationId);
  const body = ApproveLoanApplicationBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: body.error.message }); return; }
  const [updated] = await db.update(loanApplicationsTable)
    .set({
      status: "approved",
      approvedAmount: String(body.data.approvedAmount),
      approvedTenure: body.data.approvedTenure,
      approvedRate: String(body.data.approvedRate),
      updatedAt: new Date(),
    })
    .where(eq(loanApplicationsTable.id, applicationId))
    .returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(await enrichApp(updated));
});

router.post("/loan-applications/:applicationId/reject", requireAuth, async (req, res): Promise<void> => {
  const applicationId = String(req.params.applicationId);
  const body = RejectLoanApplicationBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: body.error.message }); return; }
  const [updated] = await db.update(loanApplicationsTable)
    .set({ status: "rejected", rejectionReason: body.data.reason, updatedAt: new Date() })
    .where(eq(loanApplicationsTable.id, applicationId))
    .returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(await enrichApp(updated));
});

router.post("/loan-applications/:applicationId/disburse", requireAuth, async (req, res): Promise<void> => {
  const applicationId = String(req.params.applicationId);
  const body = DisburseLoanBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: body.error.message }); return; }

  const appRows = await db.select().from(loanApplicationsTable)
    .where(eq(loanApplicationsTable.id, applicationId)).limit(1);
  if (!appRows.length) { res.status(404).json({ error: "Not found" }); return; }
  const app = appRows[0];

  const principal = Number(app.approvedAmount ?? app.requestedAmount);
  const rate = Number(app.approvedRate ?? 12);
  const tenure = app.approvedTenure ?? app.requestedTenure;
  const emi = calcEmi(principal, rate, tenure);
  const nextEmiDate = new Date();
  nextEmiDate.setMonth(nextEmiDate.getMonth() + 1);

  const lnId = genId();
  const ln = loanNumber();
  await db.insert(loansTable).values({
    id: lnId,
    loanNumber: ln,
    applicationId: app.id,
    customerId: app.customerId,
    tenantId: app.tenantId,
    principalAmount: String(principal),
    outstandingAmount: String(principal),
    interestRate: String(rate),
    tenure,
    emiAmount: String(emi),
    nextEmiDate,
    status: "active",
  });

  // Create repayment schedule
  let outstanding = principal;
  const monthlyRate = rate / 12 / 100;
  const scheduleItems = [];
  for (let i = 1; i <= tenure; i++) {
    const interest = outstanding * monthlyRate;
    const principalPart = emi - interest;
    outstanding -= principalPart;
    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + i);
    scheduleItems.push({
      id: genId(),
      loanId: lnId,
      customerId: app.customerId,
      installmentNumber: i,
      dueDate,
      emiAmount: String(emi),
      status: "pending" as const,
    });
  }
  if (scheduleItems.length > 0) {
    await db.insert(repaymentsTable).values(scheduleItems);
  }

  const [updated] = await db.update(loanApplicationsTable)
    .set({ status: "disbursed", disbursedAt: new Date(), bankAccount: body.data.bankAccount, updatedAt: new Date() })
    .where(eq(loanApplicationsTable.id, app.id))
    .returning();

  res.json(await enrichApp(updated));
});

export default router;
