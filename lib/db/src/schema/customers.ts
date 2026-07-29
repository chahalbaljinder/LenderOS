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

export const kycStatusEnum = pgEnum("kyc_status", [
  "pending",
  "partial",
  "verified",
  "rejected",
]);
export const customerStatusEnum = pgEnum("customer_status", [
  "active",
  "inactive",
  "blacklisted",
]);
export const employmentTypeEnum = pgEnum("employment_type", [
  "salaried",
  "self_employed",
  "business",
  "student",
  "retired",
]);

export const customersTable = pgTable("customers", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenantsTable.id),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  dateOfBirth: text("date_of_birth"),
  gender: text("gender"),
  panNumber: text("pan_number"),
  aadhaarNumber: text("aadhaar_number"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  pincode: text("pincode"),
  employmentType: employmentTypeEnum("employment_type"),
  monthlyIncome: numeric("monthly_income", { precision: 15, scale: 2 }),
  creditScore: integer("credit_score"),
  kycStatus: kycStatusEnum("kyc_status").notNull().default("pending"),
  status: customerStatusEnum("status").notNull().default("active"),
  totalLoans: integer("total_loans").notNull().default(0),
  activeLoans: integer("active_loans").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertCustomerSchema = createInsertSchema(customersTable).omit({
  createdAt: true,
  updatedAt: true,
  totalLoans: true,
  activeLoans: true,
});
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customersTable.$inferSelect;
