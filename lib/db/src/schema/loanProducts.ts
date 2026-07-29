import {
  pgTable,
  text,
  timestamp,
  boolean,
  numeric,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { tenantsTable } from "./tenants";

export const loanTypeEnum = pgEnum("loan_type", [
  "personal",
  "business",
  "msme",
  "education",
  "medical",
  "home",
  "gold",
  "vehicle",
  "salary_advance",
  "bnpl",
  "credit_line",
]);

export const loanProductsTable = pgTable("loan_products", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenantsTable.id),
  name: text("name").notNull(),
  description: text("description"),
  type: loanTypeEnum("type").notNull(),
  minAmount: numeric("min_amount", { precision: 15, scale: 2 }).notNull(),
  maxAmount: numeric("max_amount", { precision: 15, scale: 2 }).notNull(),
  minTenureMonths: integer("min_tenure_months").notNull(),
  maxTenureMonths: integer("max_tenure_months").notNull(),
  interestRate: numeric("interest_rate", { precision: 5, scale: 2 }).notNull(),
  processingFeePercent: numeric("processing_fee_percent", {
    precision: 5,
    scale: 2,
  })
    .notNull()
    .default("1"),
  prepaymentPenaltyPercent: numeric("prepayment_penalty_percent", {
    precision: 5,
    scale: 2,
  })
    .notNull()
    .default("0"),
  isActive: boolean("is_active").notNull().default(true),
  requiredDocuments: text("required_documents"),
  eligibilityCriteria: text("eligibility_criteria"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertLoanProductSchema = createInsertSchema(
  loanProductsTable,
).omit({
  createdAt: true,
  updatedAt: true,
});
export type InsertLoanProduct = z.infer<typeof insertLoanProductSchema>;
export type LoanProduct = typeof loanProductsTable.$inferSelect;
