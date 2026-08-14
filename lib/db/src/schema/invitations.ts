import {
  pgTable,
  text,
  timestamp,
  pgEnum,
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { tenantsTable } from "./tenants";
import { usersTable } from "./users";
import { userRoleEnum } from "./users";

export const invitationStatusEnum = pgEnum("invitation_status", [
  "invited",
  "pending",
  "accepted",
  "provisioned",
  "active",
  "expired",
  "cancelled",
  "revoked",
]);

export const invitationsTable = pgTable("invitations", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenantsTable.id),
  role: userRoleEnum("role").notNull(),
  invitedBy: text("invited_by")
    .notNull()
    .references(() => usersTable.id),
  status: invitationStatusEnum("status").notNull().default("invited"),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  acceptedAt: timestamp("accepted_at"),
  provisionedAt: timestamp("provisioned_at"),
  clerkUserId: text("clerk_user_id"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertInvitationSchema = createInsertSchema(invitationsTable).omit({
  createdAt: true,
  updatedAt: true,
});
export type InsertInvitation = z.infer<typeof insertInvitationSchema>;
export type Invitation = typeof invitationsTable.$inferSelect;