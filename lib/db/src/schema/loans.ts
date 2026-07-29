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
import { loanApplicationsTable } from "./loanApplications";

export const loanStatusEnum = pgEnum("loan_status", [
  "active",
  "closed",
  "npa",
  "written_off",
]);

export const repaymentStatusEnum = pgEnum("repayment_status", [
  "pending",
  "paid",
  "overdue",
  "partial",
]);

export const loansTable = pgTable("loans", {
  id: text("id").primaryKey(),
  loanNumber: text("loan_number").notNull().unique(),
  applicationId: text("application_id")
    .notNull()
    .references(() => loanApplicationsTable.id),
  customerId: text("customer_id")
    .notNull()
    .references(() => customersTable.id),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenantsTable.id),
  principalAmount: numeric("principal_amount", {
    precision: 15,
    scale: 2,
  }).notNull(),
  outstandingAmount: numeric("outstanding_amount", {
    precision: 15,
    scale: 2,
  }).notNull(),
  totalPaid: numeric("total_paid", { precision: 15, scale: 2 })
    .notNull()
    .default("0"),
  interestRate: numeric("interest_rate", { precision: 5, scale: 2 }).notNull(),
  tenure: integer("tenure").notNull(),
  emiAmount: numeric("emi_amount", { precision: 15, scale: 2 }).notNull(),
  nextEmiDate: timestamp("next_emi_date"),
  status: loanStatusEnum("status").notNull().default("active"),
  dpd: integer("dpd").notNull().default(0),
  disbursedAt: timestamp("disbursed_at").notNull().defaultNow(),
  closedAt: timestamp("closed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const repaymentsTable = pgTable("repayments", {
  id: text("id").primaryKey(),
  loanId: text("loan_id")
    .notNull()
    .references(() => loansTable.id),
  customerId: text("customer_id")
    .notNull()
    .references(() => customersTable.id),
  installmentNumber: integer("installment_number").notNull(),
  dueDate: timestamp("due_date").notNull(),
  emiAmount: numeric("emi_amount", { precision: 15, scale: 2 }).notNull(),
  paidAmount: numeric("paid_amount", { precision: 15, scale: 2 }),
  paidAt: timestamp("paid_at"),
  paymentMode: text("payment_mode"),
  transactionId: text("transaction_id"),
  status: repaymentStatusEnum("status").notNull().default("pending"),
  dpd: integer("dpd").notNull().default(0),
  penaltyAmount: numeric("penalty_amount", { precision: 15, scale: 2 })
    .notNull()
    .default("0"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const collectionsTable = pgTable("collections", {
  id: text("id").primaryKey(),
  loanId: text("loan_id")
    .notNull()
    .references(() => loansTable.id),
  customerId: text("customer_id")
    .notNull()
    .references(() => customersTable.id),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenantsTable.id),
  overdueAmount: numeric("overdue_amount", { precision: 15, scale: 2 }).notNull(),
  dpd: integer("dpd").notNull().default(0),
  status: text("status").notNull().default("new"),
  priority: text("priority").notNull().default("medium"),
  aiPriorityScore: numeric("ai_priority_score", { precision: 5, scale: 2 }),
  assignedTo: text("assigned_to"),
  lastContactAt: timestamp("last_contact_at"),
  nextFollowUpAt: timestamp("next_follow_up_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const auditLogsTable = pgTable("audit_logs", {
  id: text("id").primaryKey(),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id"),
  userId: text("user_id").notNull(),
  userName: text("user_name").notNull(),
  tenantId: text("tenant_id"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  changes: text("changes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const apiKeysTable = pgTable("api_keys", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  keyHash: text("key_hash").notNull(),
  keyPrefix: text("key_prefix").notNull(),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenantsTable.id),
  isActive: text("is_active").notNull().default("true"),
  lastUsedAt: timestamp("last_used_at"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertLoanSchema = createInsertSchema(loansTable).omit({
  createdAt: true,
  updatedAt: true,
});
export type InsertLoan = z.infer<typeof insertLoanSchema>;
export type Loan = typeof loansTable.$inferSelect;
