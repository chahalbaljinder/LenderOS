import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, tenantSettingsTable, auditLogsTable, apiKeysTable } from "@workspace/db";
import {
  UpdateTenantSettingsBody,
  ListAuditLogsQueryParams,
  CreateApiKeyBody,
} from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";
import { genId } from "../lib/idgen";
import { createHash, randomBytes } from "crypto";

const router = Router();

// ── Tenant Settings ──────────────────────────────────────────────────────────
router.get("/settings/tenant/:tenantId", requireAuth, async (req, res): Promise<void> => {
  const tenantId = String(req.params.tenantId);
  const rows = await db.select().from(tenantSettingsTable)
    .where(eq(tenantSettingsTable.tenantId, tenantId)).limit(1);

  if (!rows.length) {
    // Return defaults
    res.json({
      tenantId,
      primaryColor: null, secondaryColor: null, logo: null, favicon: null,
      domain: null, emailFromName: null, emailFromAddress: null, smsProvider: null,
      whatsappEnabled: false, autoApprovalEnabled: false, maxLoanAmount: null, minCreditScore: null,
    });
    return;
  }
  const s = rows[0];
  res.json({
    ...s,
    maxLoanAmount: s.maxLoanAmount ? Number(s.maxLoanAmount) : null,
  });
});

router.put("/settings/tenant/:tenantId", requireAuth, async (req, res): Promise<void> => {
  const tenantId = String(req.params.tenantId);
  const body = UpdateTenantSettingsBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: body.error.message }); return; }

  const existing = await db.select().from(tenantSettingsTable)
    .where(eq(tenantSettingsTable.tenantId, tenantId)).limit(1);

  const setData: any = { ...body.data, updatedAt: new Date() };
  if (body.data.maxLoanAmount !== undefined) {
    setData.maxLoanAmount = body.data.maxLoanAmount !== null ? String(body.data.maxLoanAmount) : null;
  }

  let updated: any;
  if (existing.length > 0) {
    const result = await db.update(tenantSettingsTable)
      .set(setData)
      .where(eq(tenantSettingsTable.tenantId, tenantId))
      .returning();
    updated = result[0];
  } else {
    const insertData: any = { tenantId, ...setData };
    const result = await db.insert(tenantSettingsTable)
      .values(insertData)
      .returning();
    updated = result[0];
  }

  res.json({ ...updated, maxLoanAmount: updated.maxLoanAmount ? Number(updated.maxLoanAmount) : null });
});

// ── Audit Logs ───────────────────────────────────────────────────────────────
router.get("/audit-logs", requireAuth, async (req, res): Promise<void> => {
  const query = ListAuditLogsQueryParams.safeParse(req.query);
  if (!query.success) { res.status(400).json({ error: query.error.message }); return; }
  const { entityType, entityId, action, userId, page = 1, limit = 50 } = query.data;
  const offset = (page - 1) * limit;

  const { and: _and, eq: _eq, count: _count, desc: _desc } = await import("drizzle-orm");

  const conditions: any[] = [];
  if (entityType) conditions.push(_eq(auditLogsTable.entityType, entityType));
  if (entityId) conditions.push(_eq(auditLogsTable.entityId, entityId));
  if (action) conditions.push(_eq(auditLogsTable.action, action));
  if (userId) conditions.push(_eq(auditLogsTable.userId, userId));

  const where = conditions.length > 0 ? _and(...conditions) : undefined;

  const [rows, totalRows] = await Promise.all([
    db.select().from(auditLogsTable).where(where)
      .orderBy(_desc(auditLogsTable.createdAt)).limit(limit).offset(offset),
    db.select({ count: _count() }).from(auditLogsTable).where(where),
  ]);

  res.json({
    data: rows.map(r => ({
      ...r,
      changes: r.changes ? JSON.parse(r.changes) : null,
      createdAt: r.createdAt.toISOString(),
    })),
    total: totalRows[0]?.count ?? 0,
    page,
    limit,
  });
});

// ── API Keys ─────────────────────────────────────────────────────────────────
router.get("/settings/api-keys", requireAuth, async (req, res): Promise<void> => {
  const clerkId = (req as any).clerkId;
  // In production, get tenantId from user context
  const rows = await db.select().from(apiKeysTable).limit(20);
  res.json(rows.map(k => ({
    id: k.id,
    name: k.name,
    keyPrefix: k.keyPrefix,
    tenantId: k.tenantId,
    isActive: k.isActive === "true",
    lastUsedAt: k.lastUsedAt?.toISOString() ?? null,
    expiresAt: k.expiresAt?.toISOString() ?? null,
    createdAt: k.createdAt.toISOString(),
  })));
});

router.post("/settings/api-keys", requireAuth, async (req, res): Promise<void> => {
  const body = CreateApiKeyBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: body.error.message }); return; }

  const rawKey = `los_${randomBytes(32).toString("hex")}`;
  const keyPrefix = rawKey.slice(0, 12);
  const keyHash = createHash("sha256").update(rawKey).digest("hex");
  const id = genId();
  const tenantId = (req as any).tenantId ?? "default-tenant";

  const [created] = await db.insert(apiKeysTable).values({
    id,
    name: body.data.name,
    keyHash,
    keyPrefix,
    tenantId,
    isActive: "true",
    expiresAt: body.data.expiresAt ? new Date(body.data.expiresAt) : undefined,
  }).returning();

  res.status(201).json({
    id: created.id,
    name: created.name,
    keyPrefix: created.keyPrefix,
    tenantId: created.tenantId,
    isActive: true,
    lastUsedAt: null,
    expiresAt: created.expiresAt?.toISOString() ?? null,
    createdAt: created.createdAt.toISOString(),
    // Return full key ONCE on creation
    key: rawKey,
  });
});

router.delete("/settings/api-keys/:keyId", requireAuth, async (req, res): Promise<void> => {
  const keyId = String(req.params.keyId);
  await db.update(apiKeysTable).set({ isActive: "false" })
    .where(eq(apiKeysTable.id, keyId));
  res.status(204).end();
});

export default router;
