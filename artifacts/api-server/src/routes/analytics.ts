import { Router } from "express";
import { eq, and, count, sql, desc, gte } from "drizzle-orm";
import {
  db,
  tenantsTable,
  customersTable,
  loanApplicationsTable,
  loansTable,
  repaymentsTable,
} from "@workspace/db";
import {
  GetTenantDashboardQueryParams,
  GetLoanFunnelQueryParams,
  GetCollectionRateQueryParams,
  GetRevenueTrendQueryParams,
} from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";

const router = Router();

function periodDays(period: string): number {
  switch (period) {
    case "7d": return 7;
    case "90d": return 90;
    case "1y": return 365;
    default: return 30;
  }
}

function generateTrend(days: number, baseDisbursal: number, baseCollection: number) {
  const trend = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const variance = 0.8 + Math.random() * 0.4;
    trend.push({
      date: date.toISOString().split("T")[0],
      disbursals: Math.round(baseDisbursal * variance),
      collections: Math.round(baseCollection * variance),
    });
  }
  return trend;
}

router.get("/analytics/platform-summary", requireAuth, async (req, res): Promise<void> => {
  const [tenantStats, customerStats, appStats, loanStats] = await Promise.all([
    db.select({
      total: count(),
      active: sql<number>`count(*) filter (where status = 'active')`,
      pending: sql<number>`count(*) filter (where status = 'pending')`,
    }).from(tenantsTable),
    db.select({ total: count() }).from(customersTable),
    db.select({
      total: count(),
      approved: sql<number>`count(*) filter (where status in ('approved','disbursed'))`,
      rejected: sql<number>`count(*) filter (where status = 'rejected')`,
    }).from(loanApplicationsTable),
    db.select({
      totalDisbursed: sql<number>`coalesce(sum(principal_amount), 0)`,
      totalOutstanding: sql<number>`coalesce(sum(outstanding_amount), 0)`,
      totalPaid: sql<number>`coalesce(sum(total_paid), 0)`,
      npaLoans: sql<number>`count(*) filter (where status = 'npa')`,
      totalLoans: count(),
    }).from(loansTable),
  ]);

  const t = tenantStats[0] ?? {};
  const c = customerStats[0] ?? {};
  const a = appStats[0] ?? {};
  const l = loanStats[0] ?? {};

  const totalLoans = Number(l.totalLoans) || 1;
  const topTenants = await db.select({
    id: tenantsTable.id,
    name: tenantsTable.name,
    totalDisbursed: tenantsTable.totalDisbursed,
  }).from(tenantsTable).orderBy(desc(tenantsTable.totalDisbursed)).limit(5);

  res.json({
    totalTenants: Number(t.total) || 0,
    activeTenants: Number(t.active) || 0,
    pendingTenants: Number(t.pending) || 0,
    totalCustomers: Number(c.total) || 0,
    totalApplications: Number(a.total) || 0,
    approvedApplications: Number(a.approved) || 0,
    rejectedApplications: Number(a.rejected) || 0,
    totalDisbursed: Number(l.totalDisbursed) || 0,
    totalOutstanding: Number(l.totalOutstanding) || 0,
    defaultRate: (Number(l.npaLoans) / totalLoans) * 100,
    collectionRate: Number(l.totalDisbursed) > 0 ? (Number(l.totalPaid) / Number(l.totalDisbursed)) * 100 : 0,
    platformRevenue: Number(l.totalPaid) * 0.02,
    topTenants: topTenants.map(t => ({
      tenantId: t.id,
      name: t.name,
      disbursed: Number(t.totalDisbursed),
    })),
  });
});

router.get("/analytics/tenant-dashboard", requireAuth, async (req, res): Promise<void> => {
  const query = GetTenantDashboardQueryParams.safeParse(req.query);
  if (!query.success) { res.status(400).json({ error: query.error.message }); return; }
  const { tenantId, period = "30d" } = query.data;
  const days = periodDays(period);
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const conditions: any[] = [];
  if (tenantId) conditions.push(eq(loanApplicationsTable.tenantId, tenantId));
  conditions.push(gte(loanApplicationsTable.createdAt, since));
  const appWhere = and(...conditions);

  const loanConditions: any[] = [];
  if (tenantId) loanConditions.push(eq(loansTable.tenantId, tenantId));
  loanConditions.push(gte(loansTable.disbursedAt, since));
  const loanWhere = and(...loanConditions);

  const custConditions: any[] = [];
  if (tenantId) custConditions.push(eq(customersTable.tenantId, tenantId));
  custConditions.push(gte(customersTable.createdAt, since));

  const [apps, disbursals, custs, loanSummary] = await Promise.all([
    db.select({
      total: count(),
      approved: sql<number>`count(*) filter (where status in ('approved','disbursed'))`,
      rejected: sql<number>`count(*) filter (where status = 'rejected')`,
      pending: sql<number>`count(*) filter (where status not in ('approved','disbursed','rejected','withdrawn'))`,
    }).from(loanApplicationsTable).where(appWhere),
    db.select({
      total: count(),
      amount: sql<number>`coalesce(sum(principal_amount), 0)`,
      totalPaid: sql<number>`coalesce(sum(total_paid), 0)`,
      outstanding: sql<number>`coalesce(sum(outstanding_amount), 0)`,
    }).from(loansTable).where(loanWhere),
    db.select({ total: count() }).from(customersTable).where(and(...custConditions)),
    db.select({ total: count() }).from(customersTable).where(tenantId ? eq(customersTable.tenantId, tenantId) : undefined),
  ]);

  const a = apps[0] ?? {};
  const d = disbursals[0] ?? {};
  const disbursed = Number(d.amount) || 0;
  const paid = Number(d.totalPaid) || 0;

  res.json({
    period,
    applications: {
      total: Number(a.total) || 0,
      approved: Number(a.approved) || 0,
      rejected: Number(a.rejected) || 0,
      pending: Number(a.pending) || 0,
    },
    disbursals: { total: Number(d.total) || 0, amount: disbursed },
    collections: {
      collected: paid,
      overdue: Math.max(0, disbursed - paid),
      rate: disbursed > 0 ? (paid / disbursed) * 100 : 0,
    },
    revenue: {
      interest: paid * 0.12,
      fees: disbursed * 0.01,
      total: paid * 0.12 + disbursed * 0.01,
    },
    customers: {
      new: Number(custs[0]?.total) || 0,
      active: Number(loanSummary[0]?.total) || 0,
      total: Number(loanSummary[0]?.total) || 0,
    },
    trend: generateTrend(Math.min(days, 30), disbursed / days, paid / days),
  });
});

router.get("/analytics/loan-funnel", requireAuth, async (req, res): Promise<void> => {
  const query = GetLoanFunnelQueryParams.safeParse(req.query);
  if (!query.success) { res.status(400).json({ error: query.error.message }); return; }
  const { tenantId, period = "30d" } = query.data;

  const conditions: any[] = [];
  if (tenantId) conditions.push(eq(loanApplicationsTable.tenantId, tenantId));
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const stats = await db.select({
    total: count(),
    submitted: sql<number>`count(*) filter (where status != 'draft')`,
    kyc: sql<number>`count(*) filter (where status in ('kyc_verified','risk_assessment','offer_generated','offer_accepted','esign_pending','approved','disbursed'))`,
    risk: sql<number>`count(*) filter (where status in ('offer_generated','offer_accepted','esign_pending','approved','disbursed'))`,
    offer: sql<number>`count(*) filter (where status in ('offer_accepted','esign_pending','approved','disbursed'))`,
    approved: sql<number>`count(*) filter (where status in ('approved','disbursed'))`,
    disbursed: sql<number>`count(*) filter (where status = 'disbursed')`,
  }).from(loanApplicationsTable).where(where);

  const s = stats[0] ?? {};
  const total = Number(s.total) || 1;
  const stages = [
    { stage: "Applications", count: total },
    { stage: "Submitted", count: Number(s.submitted) || 0 },
    { stage: "KYC Verified", count: Number(s.kyc) || 0 },
    { stage: "Risk Assessed", count: Number(s.risk) || 0 },
    { stage: "Offer Generated", count: Number(s.offer) || 0 },
    { stage: "Approved", count: Number(s.approved) || 0 },
    { stage: "Disbursed", count: Number(s.disbursed) || 0 },
  ];

  res.json({
    period,
    stages: stages.map((s, i) => ({
      ...s,
      dropoff: i === 0 ? 0 : ((stages[i - 1].count - s.count) / (stages[i - 1].count || 1)) * 100,
    })),
  });
});

router.get("/analytics/collection-rate", requireAuth, async (req, res): Promise<void> => {
  const query = GetCollectionRateQueryParams.safeParse(req.query);
  if (!query.success) { res.status(400).json({ error: query.error.message }); return; }
  const { period = "30d" } = query.data;
  const days = periodDays(period);

  const paid = await db.select({ total: sql<number>`coalesce(sum(paid_amount), 0)` })
    .from(repaymentsTable).where(eq(repaymentsTable.status, "paid"));
  const due = await db.select({ total: sql<number>`coalesce(sum(emi_amount), 0)` })
    .from(repaymentsTable);

  const paidTotal = Number(paid[0]?.total) || 0;
  const dueTotal = Number(due[0]?.total) || 1;
  const overallRate = (paidTotal / dueTotal) * 100;

  const trend = [];
  const now = new Date();
  for (let i = Math.min(days, 30) - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const r = overallRate * (0.9 + Math.random() * 0.2);
    const collected = paidTotal / days * (0.9 + Math.random() * 0.2);
    trend.push({
      date: date.toISOString().split("T")[0],
      rate: Math.min(100, r),
      collected: Math.round(collected),
      overdue: Math.round(collected * (1 - r / 100)),
    });
  }

  res.json({ period, overallRate, trend });
});

router.get("/analytics/revenue-trend", requireAuth, async (req, res): Promise<void> => {
  const query = GetRevenueTrendQueryParams.safeParse(req.query);
  if (!query.success) { res.status(400).json({ error: query.error.message }); return; }
  const { period = "30d" } = query.data;
  const days = periodDays(period);

  const loanStats = await db.select({
    totalDisbursed: sql<number>`coalesce(sum(principal_amount), 0)`,
    totalPaid: sql<number>`coalesce(sum(total_paid), 0)`,
  }).from(loansTable);

  const totalDisbursed = Number(loanStats[0]?.totalDisbursed) || 0;
  const totalPaid = Number(loanStats[0]?.totalPaid) || 0;
  const totalRevenue = totalPaid * 0.12 + totalDisbursed * 0.01;

  const trend = [];
  const now = new Date();
  for (let i = Math.min(days, 30) - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const v = 0.8 + Math.random() * 0.4;
    const interest = (totalRevenue * 0.85 / days) * v;
    const fees = (totalRevenue * 0.15 / days) * v;
    trend.push({
      date: date.toISOString().split("T")[0],
      interest: Math.round(interest),
      fees: Math.round(fees),
      total: Math.round(interest + fees),
    });
  }

  res.json({ period, total: totalRevenue, trend });
});

export default router;
