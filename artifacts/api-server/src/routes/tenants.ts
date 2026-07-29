import { Router } from "express";
import { eq, ilike, and, desc, count, sql } from "drizzle-orm";
import {
  db,
  tenantsTable,
  tenantSettingsTable,
  customersTable,
  loanApplicationsTable,
  loansTable,
} from "@workspace/db";
import {
  ListTenantsQueryParams,
  CreateTenantBody,
  GetTenantParams,
  UpdateTenantBody,
} from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";
import { genId } from "../lib/idgen";

const router = Router();

router.get("/tenants", requireAuth, async (req, res): Promise<void> => {
  const query = ListTenantsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  const { status, type, page = 1, limit = 20 } = query.data;
  const offset = (page - 1) * limit;

  const conditions: any[] = [];
  if (status) conditions.push(eq(tenantsTable.status, status as any));
  if (type) conditions.push(eq(tenantsTable.type, type as any));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, totalRows] = await Promise.all([
    db
      .select()
      .from(tenantsTable)
      .where(where)
      .orderBy(desc(tenantsTable.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ count: count() }).from(tenantsTable).where(where),
  ]);

  res.json({ data: rows, total: totalRows[0]?.count ?? 0, page, limit });
});

router.post("/tenants", requireAuth, async (req, res): Promise<void> => {
  const body = CreateTenantBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const id = genId();
  const [tenant] = await db
    .insert(tenantsTable)
    .values({ id, ...body.data, status: "pending" })
    .returning();

  await db
    .insert(tenantSettingsTable)
    .values({ tenantId: id, primaryColor: body.data.primaryColor })
    .onConflictDoNothing();

  res.status(201).json(tenant);
});

router.get("/tenants/:tenantId", requireAuth, async (req, res): Promise<void> => {
  const { tenantId } = GetTenantParams.parse(req.params);
  const rows = await db
    .select()
    .from(tenantsTable)
    .where(eq(tenantsTable.id, tenantId))
    .limit(1);
  if (!rows.length) {
    res.status(404).json({ error: "Tenant not found" });
    return;
  }
  res.json(rows[0]);
});

router.patch("/tenants/:tenantId", requireAuth, async (req, res): Promise<void> => {
  const { tenantId } = req.params;
  const body = UpdateTenantBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const [updated] = await db
    .update(tenantsTable)
    .set({ ...body.data, updatedAt: new Date() })
    .where(eq(tenantsTable.id, tenantId))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Tenant not found" });
    return;
  }
  res.json(updated);
});

router.delete("/tenants/:tenantId", requireAuth, async (req, res): Promise<void> => {
  await db.delete(tenantsTable).where(eq(tenantsTable.id, req.params.tenantId));
  res.status(204).end();
});

router.post("/tenants/:tenantId/approve", requireAuth, async (req, res): Promise<void> => {
  const [updated] = await db
    .update(tenantsTable)
    .set({ status: "active", updatedAt: new Date() })
    .where(eq(tenantsTable.id, req.params.tenantId))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Tenant not found" });
    return;
  }
  res.json(updated);
});

router.get("/tenants/:tenantId/stats", requireAuth, async (req, res): Promise<void> => {
  const { tenantId } = req.params;

  const [appStats, loanStats, customerStats] = await Promise.all([
    db
      .select({
        total: count(),
        approved: sql<number>`count(*) filter (where status = 'approved')`,
        rejected: sql<number>`count(*) filter (where status = 'rejected')`,
        pending: sql<number>`count(*) filter (where status in ('submitted','under_review','kyc_pending'))`,
        disbursed: sql<number>`count(*) filter (where status = 'disbursed')`,
      })
      .from(loanApplicationsTable)
      .where(eq(loanApplicationsTable.tenantId, tenantId)),
    db
      .select({
        total: count(),
        activeLoans: sql<number>`count(*) filter (where status = 'active')`,
        overdueLoans: sql<number>`count(*) filter (where dpd > 0)`,
        totalDisbursed: sql<number>`coalesce(sum(principal_amount),0)`,
        totalCollections: sql<number>`coalesce(sum(total_paid),0)`,
      })
      .from(loansTable)
      .where(eq(loansTable.tenantId, tenantId)),
    db
      .select({ total: count() })
      .from(customersTable)
      .where(eq(customersTable.tenantId, tenantId)),
  ]);

  const apps = appStats[0] ?? {};
  const lns = loanStats[0] ?? {};
  const custs = customerStats[0] ?? {};

  const totalDisbursed = Number(lns.totalDisbursed) || 0;
  const totalCollections = Number(lns.totalCollections) || 0;
  const totalLoans = Number(lns.total) || 0;

  res.json({
    totalApplications: Number(apps.total) || 0,
    totalLoans,
    totalDisbursed,
    totalCollections,
    activeCustomers: Number(custs.total) || 0,
    defaultRate: totalLoans > 0 ? (Number(lns.overdueLoans) / totalLoans) * 100 : 0,
    approvalRate: Number(apps.total) > 0 ? (Number(apps.approved) / Number(apps.total)) * 100 : 0,
    pendingApplications: Number(apps.pending) || 0,
    overdueLoans: Number(lns.overdueLoans) || 0,
  });
});

export default router;
