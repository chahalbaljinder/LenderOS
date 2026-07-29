import {
  pgTable,
  text,
  timestamp,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { tenantsTable } from "./tenants";

export const userRoleEnum = pgEnum("user_role", [
  "super_admin",
  "platform_admin",
  "tenant_owner",
  "tenant_admin",
  "risk_manager",
  "loan_manager",
  "collection_manager",
  "customer_support",
  "sales_agent",
  "dsa",
  "relationship_manager",
  "customer",
  "auditor",
  "compliance_officer",
]);

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  clerkId: text("clerk_id").unique(),
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  role: userRoleEnum("role").notNull().default("customer"),
  tenantId: text("tenant_id").references(() => tenantsTable.id),
  isActive: boolean("is_active").notNull().default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({
  createdAt: true,
  updatedAt: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
