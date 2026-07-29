import { Router } from "express";
import { eq, and, desc, count, ilike } from "drizzle-orm";
import { db, usersTable, tenantsTable } from "@workspace/db";
import {
  CreateUserBody,
  UpdateMeBody,
  UpdateUserBody,
  ListUsersQueryParams,
} from "@workspace/api-zod";
import { requireAuth, getOrCreateUser } from "../lib/auth";
import { genId } from "../lib/idgen";
import { getAuth } from "@clerk/express";

const router = Router();

router.get("/users/me", requireAuth, async (req, res): Promise<void> => {
  const clerkId = (req as any).clerkId;
  const auth = getAuth(req);
  const email = (auth?.sessionClaims as any)?.email as string | undefined;

  let user = await getOrCreateUser(clerkId, email ?? `${clerkId}@placeholder.com`);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  // Update last login
  await db
    .update(usersTable)
    .set({ lastLoginAt: new Date() })
    .where(eq(usersTable.id, user.id));

  // Enrich with tenant name
  let tenantName: string | null = null;
  if (user.tenantId) {
    const tenantRows = await db
      .select({ name: tenantsTable.name })
      .from(tenantsTable)
      .where(eq(tenantsTable.id, user.tenantId))
      .limit(1);
    tenantName = tenantRows[0]?.name ?? null;
  }

  res.json({ ...user, tenantName, lastLoginAt: new Date().toISOString() });
});

router.put("/users/me", requireAuth, async (req, res): Promise<void> => {
  const clerkId = (req as any).clerkId;
  const body = UpdateMeBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const userRows = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.clerkId, clerkId))
    .limit(1);
  if (!userRows.length) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const [updated] = await db
    .update(usersTable)
    .set({ ...body.data, updatedAt: new Date() })
    .where(eq(usersTable.clerkId, clerkId))
    .returning();

  res.json(updated);
});

router.get("/users", requireAuth, async (req, res): Promise<void> => {
  const query = ListUsersQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  const { tenantId, role, page = 1, limit = 20 } = query.data;
  const offset = (page - 1) * limit;

  const conditions: any[] = [];
  if (tenantId) conditions.push(eq(usersTable.tenantId, tenantId));
  if (role) conditions.push(eq(usersTable.role, role as any));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, totalRows] = await Promise.all([
    db
      .select()
      .from(usersTable)
      .where(where)
      .orderBy(desc(usersTable.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ count: count() }).from(usersTable).where(where),
  ]);

  const enriched = await Promise.all(
    rows.map(async (u) => {
      let tenantName: string | null = null;
      if (u.tenantId) {
        const t = await db
          .select({ name: tenantsTable.name })
          .from(tenantsTable)
          .where(eq(tenantsTable.id, u.tenantId))
          .limit(1);
        tenantName = t[0]?.name ?? null;
      }
      return { ...u, tenantName };
    }),
  );

  res.json({ data: enriched, total: totalRows[0]?.count ?? 0, page, limit });
});

router.post("/users", requireAuth, async (req, res): Promise<void> => {
  const body = CreateUserBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const id = genId();
  const [user] = await db
    .insert(usersTable)
    .values({ id, ...body.data })
    .returning();
  res.status(201).json(user);
});

router.get("/users/:userId", requireAuth, async (req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, req.params.userId))
    .limit(1);
  if (!rows.length) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(rows[0]);
});

router.patch("/users/:userId", requireAuth, async (req, res): Promise<void> => {
  const body = UpdateUserBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const [updated] = await db
    .update(usersTable)
    .set({ ...body.data, updatedAt: new Date() })
    .where(eq(usersTable.id, req.params.userId))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(updated);
});

export default router;
