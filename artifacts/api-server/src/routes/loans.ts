import { Router } from "express";
import { eq, and, desc, count } from "drizzle-orm";
import { db, loansTable, customersTable, repaymentsTable } from "@workspace/db";
import { ListLoansQueryParams } from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";

const router = Router();

router.get("/loans", requireAuth, async (req, res): Promise<void> => {
  const query = ListLoansQueryParams.safeParse(req.query);
  if (!query.success) { res.status(400).json({ error: query.error.message }); return; }
  const { status, customerId, page = 1, limit = 20 } = query.data;
  const offset = (page - 1) * limit;

  const conditions: any[] = [];
  if (status) conditions.push(eq(loansTable.status, status as any));
  if (customerId) conditions.push(eq(loansTable.customerId, customerId));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, totalRows] = await Promise.all([
    db.select().from(loansTable).where(where).orderBy(desc(loansTable.disbursedAt)).limit(limit).offset(offset),
    db.select({ count: count() }).from(loansTable).where(where),
  ]);

  const enriched = await Promise.all(rows.map(async (loan) => {
    const cust = await db.select({ firstName: customersTable.firstName, lastName: customersTable.lastName })
      .from(customersTable).where(eq(customersTable.id, loan.customerId)).limit(1);
    return {
      ...loan,
      principalAmount: Number(loan.principalAmount),
      outstandingAmount: Number(loan.outstandingAmount),
      totalPaid: Number(loan.totalPaid),
      interestRate: Number(loan.interestRate),
      emiAmount: Number(loan.emiAmount),
      nextEmiDate: loan.nextEmiDate?.toISOString() ?? null,
      disbursedAt: loan.disbursedAt.toISOString(),
      closedAt: loan.closedAt?.toISOString() ?? null,
      customerName: cust[0] ? `${cust[0].firstName} ${cust[0].lastName}` : "",
    };
  }));

  res.json({ data: enriched, total: totalRows[0]?.count ?? 0, page, limit });
});

router.get("/loans/:loanId", requireAuth, async (req, res): Promise<void> => {
  const rows = await db.select().from(loansTable)
    .where(eq(loansTable.id, req.params.loanId)).limit(1);
  if (!rows.length) { res.status(404).json({ error: "Loan not found" }); return; }
  const loan = rows[0];

  const cust = await db.select({ firstName: customersTable.firstName, lastName: customersTable.lastName })
    .from(customersTable).where(eq(customersTable.id, loan.customerId)).limit(1);

  res.json({
    ...loan,
    principalAmount: Number(loan.principalAmount),
    outstandingAmount: Number(loan.outstandingAmount),
    totalPaid: Number(loan.totalPaid),
    interestRate: Number(loan.interestRate),
    emiAmount: Number(loan.emiAmount),
    nextEmiDate: loan.nextEmiDate?.toISOString() ?? null,
    disbursedAt: loan.disbursedAt.toISOString(),
    closedAt: loan.closedAt?.toISOString() ?? null,
    customerName: cust[0] ? `${cust[0].firstName} ${cust[0].lastName}` : "",
  });
});

router.get("/loans/:loanId/schedule", requireAuth, async (req, res): Promise<void> => {
  const rows = await db.select().from(repaymentsTable)
    .where(eq(repaymentsTable.loanId, req.params.loanId))
    .orderBy(repaymentsTable.installmentNumber);

  const loanRows = await db.select().from(loansTable)
    .where(eq(loansTable.id, req.params.loanId)).limit(1);
  if (!loanRows.length) { res.status(404).json({ error: "Loan not found" }); return; }
  const loan = loanRows[0];

  let outstanding = Number(loan.principalAmount);
  const monthlyRate = Number(loan.interestRate) / 12 / 100;
  const emi = Number(loan.emiAmount);

  res.json(rows.map((r) => {
    const interest = outstanding * monthlyRate;
    const principal = emi - interest;
    outstanding = Math.max(0, outstanding - principal);
    return {
      installmentNumber: r.installmentNumber,
      dueDate: r.dueDate.toISOString(),
      emiAmount: Number(r.emiAmount),
      principal: Number(principal.toFixed(2)),
      interest: Number(interest.toFixed(2)),
      outstandingAfter: Number(outstanding.toFixed(2)),
      status: r.status,
      paidAt: r.paidAt?.toISOString() ?? null,
      paidAmount: r.paidAmount ? Number(r.paidAmount) : null,
    };
  }));
});

export default router;
