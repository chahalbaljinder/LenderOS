import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, kycRecordsTable, loanApplicationsTable, customersTable } from "@workspace/db";
import {
  SubmitPanVerificationBody,
  SubmitAadhaarVerificationBody,
  SubmitFaceVerificationBody,
  SubmitEmploymentVerificationBody,
} from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";
import { genId } from "../lib/idgen";

const router = Router();

function overallStatus(record: any): string {
  const statuses = [record.panStatus, record.aadhaarStatus, record.faceStatus, record.employmentStatus];
  if (statuses.every(s => s === "verified")) return "verified";
  if (statuses.some(s => s === "failed")) return "rejected";
  if (statuses.some(s => s === "verified")) return "partial";
  return "pending";
}

async function getOrCreateKyc(applicationId: string) {
  const rows = await db.select().from(kycRecordsTable)
    .where(eq(kycRecordsTable.applicationId, applicationId)).limit(1);
  if (rows.length > 0) return rows[0];
  const [created] = await db.insert(kycRecordsTable)
    .values({ id: genId(), applicationId }).returning();
  return created;
}

router.get("/kyc/:applicationId", requireAuth, async (req, res): Promise<void> => {
  const record = await getOrCreateKyc(req.params.applicationId);
  res.json({
    applicationId: req.params.applicationId,
    overallStatus: overallStatus(record),
    panStatus: record.panStatus,
    aadhaarStatus: record.aadhaarStatus,
    faceStatus: record.faceStatus,
    employmentStatus: record.employmentStatus,
    panNumber: record.panNumber,
    aadhaarNumber: record.aadhaarNumber,
    verifiedAt: record.verifiedAt?.toISOString() ?? null,
  });
});

router.post("/kyc/:applicationId/pan", requireAuth, async (req, res): Promise<void> => {
  const body = SubmitPanVerificationBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: body.error.message }); return; }

  const record = await getOrCreateKyc(req.params.applicationId);
  // Simulate PAN verification (in production, call NSDL API)
  const isValid = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(body.data.panNumber);
  const panStatus = isValid ? "verified" : "failed";

  const [updated] = await db.update(kycRecordsTable)
    .set({ panStatus, panNumber: body.data.panNumber, updatedAt: new Date() })
    .where(eq(kycRecordsTable.applicationId, req.params.applicationId))
    .returning();

  // Update customer PAN
  const appRows = await db.select().from(loanApplicationsTable)
    .where(eq(loanApplicationsTable.id, req.params.applicationId)).limit(1);
  if (appRows.length > 0 && isValid) {
    await db.update(customersTable)
      .set({ panNumber: body.data.panNumber })
      .where(eq(customersTable.id, appRows[0].customerId));
  }

  const overall = overallStatus(updated);
  if (overall === "verified") {
    await db.update(loanApplicationsTable)
      .set({ status: "kyc_verified", updatedAt: new Date() })
      .where(eq(loanApplicationsTable.id, req.params.applicationId));
    await db.update(kycRecordsTable)
      .set({ verifiedAt: new Date() })
      .where(eq(kycRecordsTable.applicationId, req.params.applicationId));
  } else {
    await db.update(loanApplicationsTable)
      .set({ status: "kyc_pending", updatedAt: new Date() })
      .where(eq(loanApplicationsTable.id, req.params.applicationId));
  }

  res.json({
    applicationId: req.params.applicationId,
    overallStatus: overall,
    panStatus: updated.panStatus,
    aadhaarStatus: updated.aadhaarStatus,
    faceStatus: updated.faceStatus,
    employmentStatus: updated.employmentStatus,
    panNumber: updated.panNumber,
    aadhaarNumber: updated.aadhaarNumber,
    verifiedAt: updated.verifiedAt?.toISOString() ?? null,
  });
});

router.post("/kyc/:applicationId/aadhaar", requireAuth, async (req, res): Promise<void> => {
  const body = SubmitAadhaarVerificationBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: body.error.message }); return; }

  const aadhaarStatus = "verified";
  const [updated] = await db.update(kycRecordsTable)
    .set({ aadhaarStatus, aadhaarNumber: body.data.aadhaarNumber, updatedAt: new Date() })
    .where(eq(kycRecordsTable.applicationId, req.params.applicationId))
    .returning();
  if (!updated) { res.status(404).json({ error: "KYC record not found" }); return; }

  const overall = overallStatus(updated);
  res.json({
    applicationId: req.params.applicationId,
    overallStatus: overall,
    panStatus: updated.panStatus,
    aadhaarStatus: updated.aadhaarStatus,
    faceStatus: updated.faceStatus,
    employmentStatus: updated.employmentStatus,
    panNumber: updated.panNumber,
    aadhaarNumber: updated.aadhaarNumber,
    verifiedAt: updated.verifiedAt?.toISOString() ?? null,
  });
});

router.post("/kyc/:applicationId/face", requireAuth, async (req, res): Promise<void> => {
  const faceStatus = "verified";
  const [updated] = await db.update(kycRecordsTable)
    .set({ faceStatus, updatedAt: new Date() })
    .where(eq(kycRecordsTable.applicationId, req.params.applicationId))
    .returning();
  if (!updated) { res.status(404).json({ error: "KYC record not found" }); return; }

  const overall = overallStatus(updated);
  res.json({
    applicationId: req.params.applicationId,
    overallStatus: overall,
    panStatus: updated.panStatus,
    aadhaarStatus: updated.aadhaarStatus,
    faceStatus: updated.faceStatus,
    employmentStatus: updated.employmentStatus,
    panNumber: updated.panNumber,
    aadhaarNumber: updated.aadhaarNumber,
    verifiedAt: updated.verifiedAt?.toISOString() ?? null,
  });
});

router.post("/kyc/:applicationId/employment", requireAuth, async (req, res): Promise<void> => {
  const body = SubmitEmploymentVerificationBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: body.error.message }); return; }

  const employmentStatus = "verified";
  const [updated] = await db.update(kycRecordsTable)
    .set({ employmentStatus, updatedAt: new Date() })
    .where(eq(kycRecordsTable.applicationId, req.params.applicationId))
    .returning();
  if (!updated) { res.status(404).json({ error: "KYC record not found" }); return; }

  // Update customer income
  const appRows = await db.select().from(loanApplicationsTable)
    .where(eq(loanApplicationsTable.id, req.params.applicationId)).limit(1);
  if (appRows.length > 0) {
    await db.update(customersTable)
      .set({ monthlyIncome: String(body.data.monthlyIncome), employmentType: body.data.employmentType as any })
      .where(eq(customersTable.id, appRows[0].customerId));
  }

  const overall = overallStatus(updated);
  if (overall === "verified") {
    await db.update(loanApplicationsTable)
      .set({ status: "kyc_verified", updatedAt: new Date() })
      .where(eq(loanApplicationsTable.id, req.params.applicationId));
    await db.update(kycRecordsTable)
      .set({ verifiedAt: new Date() })
      .where(eq(kycRecordsTable.applicationId, req.params.applicationId));
  }

  res.json({
    applicationId: req.params.applicationId,
    overallStatus: overall,
    panStatus: updated.panStatus,
    aadhaarStatus: updated.aadhaarStatus,
    faceStatus: updated.faceStatus,
    employmentStatus: updated.employmentStatus,
    panNumber: updated.panNumber,
    aadhaarNumber: updated.aadhaarNumber,
    verifiedAt: updated.verifiedAt?.toISOString() ?? null,
  });
});

export default router;
