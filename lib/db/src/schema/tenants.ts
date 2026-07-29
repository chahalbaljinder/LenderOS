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

export const tenantTypeEnum = pgEnum("tenant_type", [
  "nbfc",
  "bank",
  "lsp",
  "fintech",
]);
export const tenantStatusEnum = pgEnum("tenant_status", [
  "active",
  "pending",
  "suspended",
  "inactive",
]);

export const tenantsTable = pgTable("tenants", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: tenantTypeEnum("type").notNull(),
  status: tenantStatusEnum("status").notNull().default("pending"),
  domain: text("domain"),
  logo: text("logo"),
  primaryColor: text("primary_color"),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone"),
  licenseNumber: text("license_number"),
  totalLoans: integer("total_loans").notNull().default(0),
  totalCustomers: integer("total_customers").notNull().default(0),
  totalDisbursed: numeric("total_disbursed", { precision: 20, scale: 2 })
    .notNull()
    .default("0"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const tenantSettingsTable = pgTable("tenant_settings", {
  tenantId: text("tenant_id")
    .primaryKey()
    .references(() => tenantsTable.id),
  primaryColor: text("primary_color"),
  secondaryColor: text("secondary_color"),
  logo: text("logo"),
  favicon: text("favicon"),
  domain: text("domain"),
  emailFromName: text("email_from_name"),
  emailFromAddress: text("email_from_address"),
  smsProvider: text("sms_provider"),
  whatsappEnabled: boolean("whatsapp_enabled").notNull().default(false),
  autoApprovalEnabled: boolean("auto_approval_enabled").notNull().default(false),
  maxLoanAmount: numeric("max_loan_amount", { precision: 20, scale: 2 }),
  minCreditScore: integer("min_credit_score"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertTenantSchema = createInsertSchema(tenantsTable).omit({
  createdAt: true,
  updatedAt: true,
  totalLoans: true,
  totalCustomers: true,
  totalDisbursed: true,
});
export type InsertTenant = z.infer<typeof insertTenantSchema>;
export type Tenant = typeof tenantsTable.$inferSelect;
export type TenantSettings = typeof tenantSettingsTable.$inferSelect;
