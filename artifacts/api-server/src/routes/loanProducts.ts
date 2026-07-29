import { Router } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db, loanProductsTable } from "@workspace/db";
import {
  ListLoanProductsQueryParams,
  CreateLoanProductBody,
  UpdateLoanProductBody,
} from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";
import { genId } from "../lib/idgen";

const router = Router();

router.get("/loan-products", requireAuth, async (req, res): Promise<void> => {
  const query = ListLoanProductsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  const { type, active, tenantId } = query.data;

  const conditions: any[] = [];
  if (type) conditions.push(eq(loanProductsTable.type, type as any));
  if (active !== undefined) conditions.push(eq(loanProductsTable.isActive, active));
  if (tenantId) conditions.push(eq(loanProductsTable.tenantId, tenantId));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const rows = await db
    .select()
    .from(loanProductsTable)
    .where(where)
    .orderBy(desc(loanProductsTable.createdAt));

  res.json(rows);
});

router.post("/loan-products", requireAuth, async (req, res): Promise<void> => {
  const body = CreateLoanProductBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const id = genId();
  // tenantId from auth context in production
  const tenantId = (req as any).tenantId ?? "default-tenant";
  const [product] = await db
    .insert(loanProductsTable)
    .values({
      id,
      tenantId,
      ...body.data,
      minAmount: String(body.data.minAmount),
      maxAmount: String(body.data.maxAmount),
      interestRate: String(body.data.interestRate),
      processingFeePercent: String(body.data.processingFeePercent),
      requiredDocuments: body.data.requiredDocuments?.join(","),
    } as any)
    .returning();
  res.status(201).json(product);
});

router.get("/loan-products/:productId", requireAuth, async (req, res): Promise<void> => {
  const productId = String(req.params.productId);
  const rows = await db
    .select()
    .from(loanProductsTable)
    .where(eq(loanProductsTable.id, productId))
    .limit(1);
  if (!rows.length) {
    res.status(404).json({ error: "Loan product not found" });
    return;
  }
  res.json(rows[0]);
});

router.patch("/loan-products/:productId", requireAuth, async (req, res): Promise<void> => {
  const productId = String(req.params.productId);
  const body = UpdateLoanProductBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const updateData: any = { ...body.data, updatedAt: new Date() };
  if (body.data.minAmount) updateData.minAmount = String(body.data.minAmount);
  if (body.data.maxAmount) updateData.maxAmount = String(body.data.maxAmount);
  if (body.data.interestRate) updateData.interestRate = String(body.data.interestRate);
  if (body.data.processingFeePercent) updateData.processingFeePercent = String(body.data.processingFeePercent);

  const [updated] = await db
    .update(loanProductsTable)
    .set(updateData)
    .where(eq(loanProductsTable.id, productId))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json(updated);
});

export default router;
