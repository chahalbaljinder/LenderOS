import { getAuth } from "@clerk/express";
import { Request, Response, NextFunction } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export function isClerkConfigured(): boolean {
  const rawClerkKey = process.env.CLERK_PUBLISHABLE_KEY;
  return Boolean(
    rawClerkKey &&
    rawClerkKey !== "pk_test_your_key_here" &&
    !rawClerkKey.includes("your_key_here") &&
    rawClerkKey.startsWith("pk_")
  );
}

export function isDemoMode(): boolean {
  return process.env.NODE_ENV !== "production" && !isClerkConfigured();
}

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  let clerkId: string | null | undefined;
  const configured = isClerkConfigured();
  const demoMode = isDemoMode();

  // 1. Prioritize demo header if provided (enables instant role switching in Demo Mode)
  const demoHeader = req.headers["x-demo-user-id"] as string | undefined;
  if (demoHeader) {
    clerkId = demoHeader;
  } else if (configured) {
    try {
      const auth = getAuth(req);
      clerkId = auth?.userId;
    } catch {
      clerkId = undefined;
    }
  }

  // 2. Handle missing authentication
  if (!clerkId) {
    if (demoMode) {
      // In demo mode, default to demo super admin
      clerkId = "user_demo_super_admin";
    } else {
      // In production with Clerk configured, require valid session
      res.status(401).json({
        error: "Unauthorized",
        message: "Authentication required",
      });
      return;
    }
  }

  (req as any).clerkId = clerkId;

  const email = (req.headers["x-demo-user-email"] as string | undefined) ?? undefined;
  const user = await getOrCreateUser(clerkId, email);
  if (user) {
    (req as any).userRole = user.role;
    (req as any).user = user;
  } else if (!demoMode) {
    res.status(401).json({
      error: "Unauthorized",
      message: "User not found",
    });
    return;
  }

  next();
};

export async function getOrCreateUser(clerkId: string, email?: string) {
  const existing = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.clerkId, clerkId))
    .limit(1);

  if (existing.length > 0) return existing[0];

  // Map demo clerk IDs to seeded users
  const demoMap: Record<string, string> = {
    user_demo_super_admin: "superadmin@lendingtechplatform.in",
    user_demo_tenant_admin_t1: "admin@capitalfirst.in",
    user_demo_rm_t2: "rm@swiftfin.in",
    user_demo_customer_c1: "vikram.singh@gmail.com",
  };

  const demoEmail = demoMap[clerkId];
  if (demoEmail) {
    const seeded = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, demoEmail))
      .limit(1);

    if (seeded.length > 0) {
      await db
        .update(usersTable)
        .set({ clerkId })
        .where(eq(usersTable.id, seeded[0].id));
      return { ...seeded[0], clerkId };
    }
  }

  if (!email) return null;

  const { randomUUID } = await import("crypto");
  const id = randomUUID();
  const [created] = await db
    .insert(usersTable)
    .values({
      id,
      clerkId,
      email,
      role: "customer",
      isActive: true,
    })
    .returning();
  return created;
}
