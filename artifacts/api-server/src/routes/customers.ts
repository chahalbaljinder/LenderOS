import { Router } from "express";
import { eq, and, desc, count, ilike, or, sql } from "drizzle-orm";
import { db, customersTable } from "@workspace/db";
import {
  ListCustomersQueryParams,
  CreateCustomerBody,
  UpdateCustomerBody,
  GetCustomerParams,
} from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";
import { genId } from "../lib/idgen";

const router = Router();

router.get("/customers", requireAuth, async (req, res): Promise<void> => {
  const query = ListCustomersQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  const { search, status, page = 1, limit = 20 } = query.data;
  const offset = (page - 1) * limit;

  const conditions: any[] = [];
  if (status) conditions.push(eq(customersTable.status, status as any));
  if (search) {
    conditions.push(
      or(
        ilike(customersTable.firstName, `%${search}%`),
        ilike(customersTable.lastName, `%${search}%`),
        ilike(customersTable.email, `%${search}%`),
        ilike(customersTable.phone, `%${search}%`),
      ),
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, totalRows] = await Promise.all([
    db
      .select()
      .from(customersTable)
      .where(where)
      .orderBy(desc(customersTable.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ count: count() }).from(customersTable).where(where),
  ]);

  res.json({ data: rows, total: totalRows[0]?.count ?? 0, page, limit });
});

router.post("/customers", requireAuth, async (req, res): Promise<void> => {
  const body = CreateCustomerBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  // tenantId required — pull from user's tenant or body
  const clerkId = (req as any).clerkId;
  const id = genId();
  const tenantId = (req as any).tenantId ?? "default";

  const [customer] = await db
    .insert(customersTable)
    .values({ id, tenantId, ...body.data })
    .returning();
  res.status(201).json(customer);
});

router.get("/customers/:customerId", requireAuth, async (req, res): Promise<void> => {
  const { customerId } = GetCustomerParams.parse(req.params);
  const rows = await db
    .select()
    .from(customersTable)
    .where(eq(customersTable.id, customerId))
    .limit(1);
  if (!rows.length) {
    res.status(404).json({ error: "Customer not found" });
    return;
  }
  res.json(rows[0]);
});

router.patch("/customers/:customerId", requireAuth, async (req, res): Promise<void> => {
  const body = UpdateCustomerBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const [updated] = await db
    .update(customersTable)
    .set({ ...body.data, updatedAt: new Date() })
    .where(eq(customersTable.id, req.params.customerId))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Customer not found" });
    return;
  }
  res.json(updated);
});

router.get("/customers/:customerId/credit-report", requireAuth, async (req, res): Promise<void> => {
  const { customerId } = req.params;
  const rows = await db
    .select()
    .from(customersTable)
    .where(eq(customersTable.id, customerId))
    .limit(1);
  if (!rows.length) {
    res.status(404).json({ error: "Customer not found" });
    return;
  }
  const customer = rows[0];
  // Simulated credit report
  const creditScore = customer.creditScore ?? Math.floor(Math.random() * 300) + 500;
  res.json({
    customerId,
    creditScore,
    bureau: "CIBIL",
    totalAccounts: 4,
    activeAccounts: 2,
    closedAccounts: 2,
    totalOutstanding: 250000,
    overdueAmount: 0,
    paymentHistory: "Regular",
    inquiries30Days: 1,
    reportDate: new Date().toISOString(),
  });
});

export default router;
