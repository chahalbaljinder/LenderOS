import { Router } from "express";
import { eq, and } from "drizzle-orm";
import { db, invitationsTable, usersTable, customersTable, tenantsTable } from "@workspace/db";
import { genId } from "../lib/idgen";
import { getOrCreateUser } from "../lib/auth";

const router = Router();

function verifyClerkSignature(payload: string, signature: string, secret: string): boolean {
  try {
    const crypto = require("crypto");
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  } catch {
    return false;
  }
}

async function provisionFromInvitation(invitation: any, clerkUser: any) {
  const { id: clerkId, email_addresses, first_name, last_name } = clerkUser;
  const email = email_addresses?.[0]?.email_address;

  if (!email) throw new Error("No email in Clerk user");

  await db
    .update(invitationsTable)
    .set({
      status: "provisioned",
      acceptedAt: new Date(),
      provisionedAt: new Date(),
      clerkUserId: clerkId,
      updatedAt: new Date(),
    })
    .where(eq(invitationsTable.id, invitation.id));

  const tenant = await db
    .select()
    .from(tenantsTable)
    .where(eq(tenantsTable.id, invitation.tenantId))
    .limit(1);

  if (!tenant.length) throw new Error("Tenant not found");

  const user = await getOrCreateUser(clerkId, email);

  if (!user) {
    await db.insert(usersTable).values({
      id: genId(),
      clerkId,
      email,
      firstName: first_name,
      lastName: last_name,
      role: invitation.role,
      tenantId: invitation.tenantId,
      isActive: true,
    });
  } else {
    await db
      .update(usersTable)
      .set({
        clerkId,
        role: invitation.role,
        tenantId: invitation.tenantId,
        isActive: true,
        firstName: first_name || user.firstName,
        lastName: last_name || user.lastName,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, user.id));
  }

  await db
    .update(invitationsTable)
    .set({ status: "active", updatedAt: new Date() })
    .where(eq(invitationsTable.id, invitation.id));

  console.log(`Provisioned user ${clerkId} for invitation ${invitation.id}`);
}

async function linkExistingCustomer(clerkUser: any) {
  const { id: clerkId, email_addresses, first_name, last_name } = clerkUser;
  const email = email_addresses?.[0]?.email_address;

  if (!email) throw new Error("No email in Clerk user");

  const customer = await db
    .select()
    .from(customersTable)
    .where(eq(customersTable.email, email))
    .limit(1);

  if (!customer.length) return false;

  await db
    .update(customersTable)
    .set({ clerkId })
    .where(eq(customersTable.id, customer[0].id));

  const existingUser = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.clerkId, clerkId))
    .limit(1);

  if (existingUser.length === 0) {
    await db.insert(usersTable).values({
      id: genId(),
      clerkId,
      email,
      firstName: first_name,
      lastName: last_name,
      role: "customer",
      tenantId: customer[0].tenantId,
      isActive: true,
    });
  }

  console.log(`Linked Clerk user ${clerkId} to existing customer ${customer[0].id}`);
  return true;
}

router.post("/webhooks/clerk", async (req, res): Promise<void> => {
  try {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.warn("CLERK_WEBHOOK_SECRET not configured");
      res.status(500).json({ error: "Webhook not configured" });
      return;
    }

    const signature = req.headers["clerk-signature"] as string;
    const payload = JSON.stringify(req.body);

    if (!verifyClerkSignature(payload, signature, webhookSecret)) {
      console.warn("Invalid Clerk webhook signature");
      res.status(401).json({ error: "Invalid signature" });
      return;
    }

    const { type, data } = req.body;

    if (type === "user.created") {
      const clerkUser = data;
      const email = clerkUser.email_addresses?.[0]?.email_address;

      if (!email) {
        console.warn("user.created webhook missing email");
        res.status(400).json({ error: "Missing email" });
        return;
      }

      const invitation = await db
        .select()
        .from(invitationsTable)
        .where(
          and(
            eq(invitationsTable.email, email),
            eq(invitationsTable.status, "pending")
          )
        )
        .limit(1);

      if (invitation.length > 0) {
        await provisionFromInvitation(invitation[0], clerkUser);
        res.json({ status: "provisioned_from_invitation" });
        return;
      }

      const linked = await linkExistingCustomer(clerkUser);
      if (linked) {
        res.json({ status: "linked_existing_customer" });
        return;
      }

      res.json({ status: "no_action_needed" });
    } else if (type === "user.updated") {
      res.json({ status: "ignored" });
    } else if (type === "user.deleted") {
      const clerkUser = data;
      const clerkId = clerkUser.id;

      await db
        .update(usersTable)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(usersTable.clerkId, clerkId));

      await db
        .update(customersTable)
        .set({ clerkId: null, updatedAt: new Date() })
        .where(eq(customersTable.clerkId, clerkId));

      await db
        .update(invitationsTable)
        .set({ status: "revoked", updatedAt: new Date() })
        .where(eq(invitationsTable.clerkUserId, clerkId));

      res.json({ status: "user_deactivated" });
    } else {
      res.json({ status: "ignored" });
    }
  } catch (error) {
    console.error("Clerk webhook error:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

export default router;