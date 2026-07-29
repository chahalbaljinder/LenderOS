import { Router } from "express";
import { eq } from "drizzle-orm";
import {
  db,
  riskScoresTable,
  loanApplicationsTable,
  customersTable,
} from "@workspace/db";
import { requireAuth } from "../lib/auth";
import { genId } from "../lib/idgen";

const router = Router();

function computeRiskScore(customer: any, app: any): {
  score: number;
  grade: string;
  recommendation: string;
  explanation: string;
  creditScoreWeight: number;
  incomeWeight: number;
  debtToIncomeRatio: number;
  employmentStabilityScore: number;
  fraudRiskScore: number;
} {
  const creditScore = customer.creditScore ?? 650;
  const monthlyIncome = Number(customer.monthlyIncome ?? 30000);
  const requestedAmount = Number(app.requestedAmount);
  const tenure = app.requestedTenure;

  // Simple scoring model
  let score = 50;

  // Credit score component (40%)
  if (creditScore >= 750) score += 40;
  else if (creditScore >= 700) score += 30;
  else if (creditScore >= 650) score += 20;
  else if (creditScore >= 600) score += 10;
  else score -= 10;

  // Income component (30%)
  const monthlyEmi = requestedAmount / tenure;
  const dtiRatio = monthlyEmi / monthlyIncome;
  if (dtiRatio <= 0.3) score += 30;
  else if (dtiRatio <= 0.5) score += 15;
  else score -= 10;

  // Employment (20%)
  if (customer.employmentType === "salaried") score += 20;
  else if (customer.employmentType === "business") score += 15;
  else score += 5;

  // KYC (10%)
  if (customer.kycStatus === "verified") score += 10;

  score = Math.max(0, Math.min(100, score));

  let grade: string;
  if (score >= 90) grade = "A1";
  else if (score >= 80) grade = "A2";
  else if (score >= 70) grade = "B1";
  else if (score >= 60) grade = "B2";
  else if (score >= 50) grade = "C1";
  else if (score >= 40) grade = "C2";
  else if (score >= 30) grade = "D";
  else grade = "E";

  let recommendation: string;
  if (score >= 70) recommendation = "approve";
  else if (score >= 55) recommendation = "approve_with_conditions";
  else if (score >= 40) recommendation = "review";
  else recommendation = "reject";

  return {
    score,
    grade,
    recommendation,
    explanation: `Credit score ${creditScore} (${creditScore >= 700 ? "Good" : "Fair"}), DTI ratio ${(dtiRatio * 100).toFixed(1)}%, employment type ${customer.employmentType ?? "unknown"}. Overall risk grade ${grade}.`,
    creditScoreWeight: creditScore / 900,
    incomeWeight: Math.min(1, monthlyIncome / 100000),
    debtToIncomeRatio: dtiRatio,
    employmentStabilityScore: customer.employmentType === "salaried" ? 0.9 : 0.7,
    fraudRiskScore: Math.random() * 0.2,
  };
}

router.get("/risk/:applicationId/score", requireAuth, async (req, res): Promise<void> => {
  const applicationId = String(req.params.applicationId);
  const rows = await db.select().from(riskScoresTable)
    .where(eq(riskScoresTable.applicationId, applicationId)).limit(1);
  if (!rows.length) {
    res.status(404).json({ error: "Risk score not computed yet. POST to /analyze first." });
    return;
  }
  const r = rows[0];
  res.json({
    applicationId: r.applicationId,
    score: Number(r.score),
    grade: r.grade,
    recommendation: r.recommendation,
    creditScoreWeight: Number(r.creditScoreWeight),
    incomeWeight: Number(r.incomeWeight),
    debtToIncomeRatio: Number(r.debtToIncomeRatio),
    employmentStabilityScore: Number(r.employmentStabilityScore),
    fraudRiskScore: Number(r.fraudRiskScore),
    explanation: r.explanation,
    computedAt: r.computedAt.toISOString(),
  });
});

router.post("/risk/evaluate/:applicationId", requireAuth, async (req, res): Promise<void> => {
  const applicationId = String(req.params.applicationId);
  const appRows = await db.select().from(loanApplicationsTable)
    .where(eq(loanApplicationsTable.id, applicationId)).limit(1);
  if (!appRows.length) { res.status(404).json({ error: "Application not found" }); return; }
  const app = appRows[0];

  const customerRows = await db.select().from(customersTable)
    .where(eq(customersTable.id, app.customerId)).limit(1);
  const customer = customerRows[0] ?? {};

  const result = computeRiskScore(customer, app);

  // Upsert risk score
  await db.delete(riskScoresTable)
    .where(eq(riskScoresTable.applicationId, applicationId));

  const [saved] = await db.insert(riskScoresTable).values({
    id: genId(),
    applicationId,
    score: String(result.score),
    grade: result.grade,
    recommendation: result.recommendation,
    creditScoreWeight: String(result.creditScoreWeight),
    incomeWeight: String(result.incomeWeight),
    debtToIncomeRatio: String(result.debtToIncomeRatio),
    employmentStabilityScore: String(result.employmentStabilityScore),
    fraudRiskScore: String(result.fraudRiskScore),
    explanation: result.explanation,
  }).returning();

  // Update application with risk score
  const appId = String(req.params.applicationId);
  await db.update(loanApplicationsTable)
    .set({
      riskScore: String(result.score),
      riskGrade: result.grade,
      status: "offer_generated",
      updatedAt: new Date(),
    })
    .where(eq(loanApplicationsTable.id, appId));

  res.json({
    applicationId: req.params.applicationId,
    score: Number(saved.score),
    grade: saved.grade,
    recommendation: saved.recommendation,
    creditScoreWeight: Number(saved.creditScoreWeight),
    incomeWeight: Number(saved.incomeWeight),
    debtToIncomeRatio: Number(saved.debtToIncomeRatio),
    employmentStabilityScore: Number(saved.employmentStabilityScore),
    fraudRiskScore: Number(saved.fraudRiskScore),
    explanation: saved.explanation,
    computedAt: saved.computedAt.toISOString(),
  });
});

router.get("/risk/:applicationId/fraud", requireAuth, async (req, res): Promise<void> => {
  // Simulated fraud detection
  const fraudScore = Math.random() * 0.3;
  const riskLevel = fraudScore < 0.1 ? "low" : fraudScore < 0.2 ? "medium" : "high";
  res.json({
    applicationId: req.params.applicationId,
    isFraudulent: fraudScore > 0.25,
    riskLevel,
    flags: fraudScore > 0.15 ? [{ type: "multiple_applications", description: "Multiple recent applications detected", severity: "medium" }] : [],
    checkedAt: new Date().toISOString(),
  });
});

export default router;
