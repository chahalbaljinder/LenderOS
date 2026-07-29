import { Router } from "express";
import { eq, and, desc, count } from "drizzle-orm";
import { db, repaymentsTable, loansTable, customersTable } from "@workspace/db";
import { ListRepaymentsQueryParams, RecordRepaymentBody } from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";

const router = Router();

router.get("/repayments", requireAuth, async (req, res): Promise<void> => {
  const query = ListRepaymentsQueryParams.safeParse(req.query);
  if (!query.success) { res.status(400).json({ error: query.error.message }); return; }
  const { loanId, status, page = 1, limit = 20 } = query.data;
  const offset = (page - 1) * limit;

  const conditions: any[] = [];
  if (loanId) conditions.push(eq(repaymentsTable.loanId, loanId));
  if (status) conditions.push(eq(repaymentsTable.status, status as any));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, totalRows] = await Promise.all([
    db.select().from(repaymentsTable).where(where).orderBy(desc(repaymentsTable.dueDate)).limit(limit).offset(offset),
    db.select({ count: count() }).from(repaymentsTable).where(where),
  ]);

  const enriched = await Promise.all(rows.map(async (r) => {
    const cust = await db.select({ firstName: customersTable.firstName, lastName: customersTable.lastName })
      .from(customersTable).where(eq(customersTable.id, r.customerId)).limit(1);
    return {
      ...r,
      emiAmount: Number(r.emiAmount),
      paidAmount: r.paidAmount ? Number(r.paidAmount) : null,
      penaltyAmount: Number(r.penaltyAmount),
      dueDate: r.dueDate.toISOString(),
      paidAt: r.paidAt?.toISOString() ?? null,
      customerName: cust[0] ? `${cust[0].firstName} ${cust[0].lastName}` : "",
    };
  }));

  res.json({ data: enriched, total: totalRows[0]?.count ?? 0, page, limit });
});

router.post("/repayments/:repaymentId/record", requireAuth, async (req, res): Promise<void> => {
  const repaymentId = String(req.params.repaymentId);
  const body = RecordRepaymentBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: body.error.message }); return; }

  const rows = await db.select().from(repaymentsTable)
    .where(eq(repaymentsTable.id, repaymentId)).limit(1);
  if (!rows.length) { res.status(404).json({ error: "Repayment not found" }); return; }
  const repayment = rows[0];

  const emi = Number(repayment.emiAmount);
  const paid = body.data.paidAmount;
  const status = paid >= emi ? "paid" : "partial";
  const paidAt = body.data.paidAt ? new Date(body.data.paidAt) : new Date();

  const [updated] = await db.update(repaymentsTable)
    .set({
      paidAmount: String(paid),
      paidAt,
      paymentMode: body.data.paymentMode,
      transactionId: body.data.transactionId,
      status,
      dpd: 0,
      updatedAt: new Date(),
    })
    .where(eq(repaymentsTable.id, repaymentId))
    .returning();

  // Update loan outstanding
  if (status === "paid") {
    const loanRows = await db.select().from(loansTable)
      .where(eq(loansTable.id, repayment.loanId)).limit(1);
    if (loanRows.length > 0) {
      const loan = loanRows[0];
      const newOutstanding = Math.max(0, Number(loan.outstandingAmount) - paid);
      const newTotalPaid = Number(loan.totalPaid) + paid;
      const nextDate = new Date(paidAt);
      nextDate.setMonth(nextDate.getMonth() + 1);
      await db.update(loansTable)
        .set({
          outstandingAmount: String(newOutstanding),
          totalPaid: String(newTotalPaid),
          nextEmiDate: nextDate,
          status: newOutstanding <= 0 ? "closed" : "active",
          updatedAt: new Date(),
        })
        .where(eq(loansTable.id, repayment.loanId));
    }
  }

  res.json({
    ...updated,
    emiAmount: Number(updated.emiAmount),
    paidAmount: updated.paidAmount ? Number(updated.paidAmount) : null,
    penaltyAmount: Number(updated.penaltyAmount),
    dueDate: updated.dueDate.toISOString(),
    paidAt: updated.paidAt?.toISOString() ?? null,
  });
});

export default router;
