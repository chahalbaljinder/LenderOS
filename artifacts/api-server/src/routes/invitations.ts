import { Router } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db, invitationsTable, usersTable, customersTable, tenantsTable } from "@workspace/db";
import { genId } from "../lib/idgen";
import { requireAuth, isClerkConfigured } from "../lib/auth";
import { requireSuperAdmin, requireTenantAdmin, ensureTenantAccess } from "../middlewares/rbac";
import { v4 as uuidv4 } from "uuid";

const router = Router();

function getTenantId(req: any): string | null {
  const fromParams = req.params.tenantId;
  const fromQuery = req.query.tenantId;
  const fromBody = req.body.tenantId;
  
  if (fromParams) return fromParams;
  if (fromQuery) return Array.isArray(fromQuery) ? fromQuery[0] : fromQuery;
  if (fromBody) return fromBody;
  return null;
}

function generateToken(): string {
  return uuidv4().replace(/-/g, "").slice(0, 32);
}

function calculateExpiry(): Date {
  return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
}

router.post("/invitations", requireAuth, requireTenantAdmin(), ensureTenantAccess, async (req, res): Promise<void> => {
  try {
    const { email, role, metadata } = req.body;
    const tenantId = getTenantId(req);

    if (!email || !role) {
      res.status(400).json({ error: "Bad Request", message: "email and role are required" });
      return;
    }

    if (!tenantId) {
      res.status(400).json({ error: "Bad Request", message: "tenantId is required" });
      return;
    }

    const existing = await db
      .select()
      .from(invitationsTable)
      .where(
        and(
          eq(invitationsTable.email, email),
          eq(invitationsTable.tenantId, tenantId),
          eq(invitationsTable.status, "pending")
        )
      )
      .limit(1);

    if (existing.length > 0) {
      res.status(409).json({ error: "Conflict", message: "Pending invitation already exists for this email" });
      return;
    }

    const id = genId();
    const token = generateToken();
    const expiresAt = calculateExpiry();

    const [invitation] = await db
      .insert(invitationsTable)
      .values({
        id,
        email,
        tenantId,
        role,
        invitedBy: (req as any).user.id,
        status: "pending",
        token,
        expiresAt,
        metadata: metadata || {},
      })
      .returning();

    res.status(201).json({ ...invitation, acceptanceUrl: `/accept-invitation/${token}` });
  } catch (error) {
    console.error("Create invitation error:", error);
    res.status(500).json({ error: "Internal Server Error", message: "Failed to create invitation" });
  }
});

router.get("/invitations", requireAuth, requireTenantAdmin(), ensureTenantAccess, async (req, res): Promise<void> => {
  try {
    const tenantId = getTenantId(req);

    if (!tenantId) {
      res.status(400).json({ error: "Bad Request", message: "tenantId is required" });
      return;
    }

    const invitations = await db
      .select()
      .from(invitationsTable)
      .where(eq(invitationsTable.tenantId, tenantId))
      .orderBy(desc(invitationsTable.createdAt));

    res.json({ data: invitations });
  } catch (error) {
    console.error("List invitations error:", error);
    res.status(500).json({ error: "Internal Server Error", message: "Failed to list invitations" });
  }
});

router.get("/invitations/:id", requireAuth, requireTenantAdmin(), ensureTenantAccess, async (req, res): Promise<void> => {
  try {
    const tenantId = getTenantId(req);

    if (!tenantId) {
      res.status(400).json({ error: "Bad Request", message: "tenantId is required" });
      return;
    }

    const [invitation] = await db
      .select()
      .from(invitationsTable)
      .where(
        and(
          eq(invitationsTable.id, req.params.id),
          eq(invitationsTable.tenantId, tenantId)
        )
      )
      .limit(1);

    if (!invitation) {
      res.status(404).json({ error: "Not Found", message: "Invitation not found" });
      return;
    }

    res.json(invitation);
  } catch (error) {
    console.error("Get invitation error:", error);
    res.status(500).json({ error: "Internal Server Error", message: "Failed to get invitation" });
  }
});

router.post("/invitations/:id/resend", requireAuth, requireTenantAdmin(), ensureTenantAccess, async (req, res): Promise<void> => {
  try {
    const tenantId = getTenantId(req);

    if (!tenantId) {
      res.status(400).json({ error: "Bad Request", message: "tenantId is required" });
      return;
    }

    const [invitation] = await db
      .select()
      .from(invitationsTable)
      .where(
        and(
          eq(invitationsTable.id, req.params.id),
          eq(invitationsTable.tenantId, tenantId)
        )
      )
      .limit(1);

    if (!invitation) {
      res.status(404).json({ error: "Not Found", message: "Invitation not found" });
      return;
    }

    if (!["pending", "invited"].includes(invitation.status)) {
      res.status(400).json({ error: "Bad Request", message: "Can only resend pending invitations" });
      return;
    }

    const newToken = generateToken();
    const newExpiresAt = calculateExpiry();

    await db
      .update(invitationsTable)
      .set({
        token: newToken,
        expiresAt: newExpiresAt,
        status: "pending",
        updatedAt: new Date(),
      })
      .where(eq(invitationsTable.id, req.params.id));

    res.json({ message: "Invitation resent", acceptanceUrl: `/accept-invitation/${newToken}` });
  } catch (error) {
    console.error("Resend invitation error:", error);
    res.status(500).json({ error: "Internal Server Error", message: "Failed to resend invitation" });
  }
});

router.post("/invitations/:id/cancel", requireAuth, requireTenantAdmin(), ensureTenantAccess, async (req, res): Promise<void> => {
  try {
    const tenantId = getTenantId(req);

    if (!tenantId) {
      res.status(400).json({ error: "Bad Request", message: "tenantId is required" });
      return;
    }

    const [invitation] = await db
      .select()
      .from(invitationsTable)
      .where(
        and(
          eq(invitationsTable.id, req.params.id),
          eq(invitationsTable.tenantId, tenantId)
        )
      )
      .limit(1);

    if (!invitation) {
      res.status(404).json({ error: "Not Found", message: "Invitation not found" });
      return;
    }

    if (!["invited", "pending"].includes(invitation.status)) {
      res.status(400).json({ error: "Bad Request", message: "Can only cancel pending invitations" });
      return;
    }

    await db
      .update(invitationsTable)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(eq(invitationsTable.id, req.params.id));

    res.json({ message: "Invitation cancelled" });
  } catch (error) {
    console.error("Cancel invitation error:", error);
    res.status(500).json({ error: "Internal Server Error", message: "Failed to cancel invitation" });
  }
});

router.post("/invitations/:id/revoke", requireAuth, requireTenantAdmin(), ensureTenantAccess, async (req, res): Promise<void> => {
  try {
    const tenantId = getTenantId(req);

    if (!tenantId) {
      res.status(400).json({ error: "Bad Request", message: "tenantId is required" });
      return;
    }

    const [invitation] = await db
      .select()
      .from(invitationsTable)
      .where(
        and(
          eq(invitationsTable.id, req.params.id),
          eq(invitationsTable.tenantId, tenantId)
        )
      )
      .limit(1);

    if (!invitation) {
      res.status(404).json({ error: "Not Found", message: "Invitation not found" });
      return;
    }

    if (!["active", "provisioned"].includes(invitation.status)) {
      res.status(400).json({ error: "Bad Request", message: "Can only revoke active/provisioned invitations" });
      return;
    }

    if (invitation.clerkUserId) {
      await db
        .update(usersTable)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(usersTable.clerkId, invitation.clerkUserId));
    }

    await db
      .update(invitationsTable)
      .set({ status: "revoked", updatedAt: new Date() })
      .where(eq(invitationsTable.id, req.params.id));

    res.json({ message: "Invitation revoked, user deactivated" });
  } catch (error) {
    console.error("Revoke invitation error:", error);
    res.status(500).json({ error: "Internal Server Error", message: "Failed to revoke invitation" });
  }
});

export default router;