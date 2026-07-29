import { Router } from "express";
import { eq, and, desc, count } from "drizzle-orm";
import { db, collectionsTable, customersTable, loansTable } from "@workspace/db";
import { ListCollectionsQueryParams, UpdateCollectionBody } from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";

const router = Router();

router.get("/collections", requireAuth, async (req, res): Promise<void> => {
  const query = ListCollectionsQueryParams.safeParse(req.query);
  if (!query.success) { res.status(400).json({ error: query.error.message }); return; }
  const { status, priority, page = 1, limit = 20 } = query.data;
  const offset = (page - 1) * limit;

  const conditions: any[] = [];
  if (status) conditions.push(eq(collectionsTable.status, status));
  if (priority) conditions.push(eq(collectionsTable.priority, priority));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, totalRows] = await Promise.all([
    db.select().from(collectionsTable).where(where)
      .orderBy(desc(collectionsTable.createdAt)).limit(limit).offset(offset),
    db.select({ count: count() }).from(collectionsTable).where(where),
  ]);

  const enriched = await Promise.all(rows.map(async (c) => {
    const cust = await db.select({ firstName: customersTable.firstName, lastName: customersTable.lastName, phone: customersTable.phone })
      .from(customersTable).where(eq(customersTable.id, c.customerId)).limit(1);
    const loan = await db.select({ loanNumber: loansTable.loanNumber })
      .from(loansTable).where(eq(loansTable.id, c.loanId)).limit(1);
    return {
      ...c,
      overdueAmount: Number(c.overdueAmount),
      aiPriorityScore: c.aiPriorityScore ? Number(c.aiPriorityScore) : null,
      customerName: cust[0] ? `${cust[0].firstName} ${cust[0].lastName}` : "",
      customerPhone: cust[0]?.phone ?? "",
      loanNumber: loan[0]?.loanNumber ?? c.loanId,
      lastContactAt: c.lastContactAt?.toISOString() ?? null,
      nextFollowUpAt: c.nextFollowUpAt?.toISOString() ?? null,
      createdAt: c.createdAt.toISOString(),
    };
  }));

  res.json({ data: enriched, total: totalRows[0]?.count ?? 0, page, limit });
});

router.get("/collections/:collectionId", requireAuth, async (req, res): Promise<void> => {
  const rows = await db.select().from(collectionsTable)
    .where(eq(collectionsTable.id, req.params.collectionId)).limit(1);
  if (!rows.length) { res.status(404).json({ error: "Collection not found" }); return; }
  const c = rows[0];

  const [cust, loan] = await Promise.all([
    db.select({ firstName: customersTable.firstName, lastName: customersTable.lastName, phone: customersTable.phone })
      .from(customersTable).where(eq(customersTable.id, c.customerId)).limit(1),
    db.select({ loanNumber: loansTable.loanNumber })
      .from(loansTable).where(eq(loansTable.id, c.loanId)).limit(1),
  ]);

  res.json({
    ...c,
    overdueAmount: Number(c.overdueAmount),
    aiPriorityScore: c.aiPriorityScore ? Number(c.aiPriorityScore) : null,
    customerName: cust[0] ? `${cust[0].firstName} ${cust[0].lastName}` : "",
    customerPhone: cust[0]?.phone ?? "",
    loanNumber: loan[0]?.loanNumber ?? c.loanId,
    lastContactAt: c.lastContactAt?.toISOString() ?? null,
    nextFollowUpAt: c.nextFollowUpAt?.toISOString() ?? null,
    createdAt: c.createdAt.toISOString(),
  });
});

router.patch("/collections/:collectionId", requireAuth, async (req, res): Promise<void> => {
  const body = UpdateCollectionBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: body.error.message }); return; }

  const update: any = { ...body.data, updatedAt: new Date() };
  if (body.data.nextFollowUpAt) update.nextFollowUpAt = new Date(body.data.nextFollowUpAt);
  if (body.data.status === "resolved") update.lastContactAt = new Date();

  const [updated] = await db.update(collectionsTable)
    .set(update)
    .where(eq(collectionsTable.id, req.params.collectionId))
    .returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }

  res.json({
    ...updated,
    overdueAmount: Number(updated.overdueAmount),
    aiPriorityScore: updated.aiPriorityScore ? Number(updated.aiPriorityScore) : null,
    lastContactAt: updated.lastContactAt?.toISOString() ?? null,
    nextFollowUpAt: updated.nextFollowUpAt?.toISOString() ?? null,
    createdAt: updated.createdAt.toISOString(),
  });
});

export default router;
