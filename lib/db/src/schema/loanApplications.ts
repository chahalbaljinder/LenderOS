import {
  pgTable,
  text,
  timestamp,
  numeric,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { tenantsTable } from "./tenants";
import { customersTable } from "./customers";
import { loanProductsTable } from "./loanProducts";

export const applicationStatusEnum = pgEnum("application_status", [
  "draft",
  "submitted",
  "under_review",
  "kyc_pending",
  "kyc_verified",
  "risk_assessment",
  "offer_generated",
  "offer_accepted",
  "esign_pending",
  "approved",
  "disbursed",
  "rejected",
  "withdrawn",
]);

export const loanApplicationsTable = pgTable("loan_applications", {
  id: text("id").primaryKey(),
  applicationNumber: text("application_number").notNull().unique(),
  customerId: text("customer_id")
    .notNull()
    .references(() => customersTable.id),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenantsTable.id),
  productId: text("product_id")
    .notNull()
    .references(() => loanProductsTable.id),
  requestedAmount: numeric("requested_amount", {
    precision: 15,
    scale: 2,
  }).notNull(),
  requestedTenure: integer("requested_tenure").notNull(),
  purpose: text("purpose").notNull(),
  status: applicationStatusEnum("status").notNull().default("draft"),
  riskScore: numeric("risk_score", { precision: 5, scale: 2 }),
  riskGrade: text("risk_grade"),
  approvedAmount: numeric("approved_amount", { precision: 15, scale: 2 }),
  approvedTenure: integer("approved_tenure"),
  approvedRate: numeric("approved_rate", { precision: 5, scale: 2 }),
  rejectionReason: text("rejection_reason"),
  disbursedAt: timestamp("disbursed_at"),
  bankAccount: text("bank_account"),
  ifscCode: text("ifsc_code"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const kycRecordsTable = pgTable("kyc_records", {
  id: text("id").primaryKey(),
  applicationId: text("application_id")
    .notNull()
    .references(() => loanApplicationsTable.id),
  panStatus: text("pan_status").notNull().default("pending"),
  aadhaarStatus: text("aadhaar_status").notNull().default("pending"),
  faceStatus: text("face_status").notNull().default("pending"),
  employmentStatus: text("employment_status").notNull().default("pending"),
  panNumber: text("pan_number"),
  aadhaarNumber: text("aadhaar_number"),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const riskScoresTable = pgTable("risk_scores", {
  id: text("id").primaryKey(),
  applicationId: text("application_id")
    .notNull()
    .references(() => loanApplicationsTable.id),
  score: numeric("score", { precision: 5, scale: 2 }).notNull(),
  grade: text("grade").notNull(),
  recommendation: text("recommendation").notNull(),
  creditScoreWeight: numeric("credit_score_weight", { precision: 5, scale: 2 }),
  incomeWeight: numeric("income_weight", { precision: 5, scale: 2 }),
  debtToIncomeRatio: numeric("debt_to_income_ratio", { precision: 5, scale: 2 }),
  employmentStabilityScore: numeric("employment_stability_score", {
    precision: 5,
    scale: 2,
  }),
  fraudRiskScore: numeric("fraud_risk_score", { precision: 5, scale: 2 }),
  explanation: text("explanation"),
  computedAt: timestamp("computed_at").notNull().defaultNow(),
});

export const loanOffersTable = pgTable("loan_offers", {
  id: text("id").primaryKey(),
  applicationId: text("application_id")
    .notNull()
    .references(() => loanApplicationsTable.id),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenantsTable.id),
  offeredAmount: numeric("offered_amount", { precision: 15, scale: 2 }).notNull(),
  tenure: integer("tenure").notNull(),
  interestRate: numeric("interest_rate", { precision: 5, scale: 2 }).notNull(),
  emi: numeric("emi", { precision: 15, scale: 2 }).notNull(),
  processingFee: numeric("processing_fee", { precision: 15, scale: 2 }).notNull(),
  totalInterest: numeric("total_interest", { precision: 15, scale: 2 }).notNull(),
  totalRepayable: numeric("total_repayable", { precision: 15, scale: 2 }).notNull(),
  approvalProbability: numeric("approval_probability", { precision: 5, scale: 2 }),
  disbursementTime: text("disbursement_time"),
  isAccepted: text("is_accepted").notNull().default("false"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertLoanApplicationSchema = createInsertSchema(
  loanApplicationsTable,
).omit({
  createdAt: true,
  updatedAt: true,
});
export type InsertLoanApplication = z.infer<typeof insertLoanApplicationSchema>;
export type LoanApplication = typeof loanApplicationsTable.$inferSelect;
