import { db, usersTable, tenantsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

async function main() {
  console.log("Seeding demo accounts...");

  const tenants = await db.select().from(tenantsTable);
  const t1 = tenants.find((t) => t.type === "nbfc")?.id || null;
  const t2 = tenants.find((t) => t.type === "fintech")?.id || null;

  const demoUsers = [
    {
      id: "u1_super",
      email: "superadmin@lendingtechplatform.in",
      firstName: "Arjun",
      lastName: "Sharma",
      role: "super_admin" as const,
      tenantId: null,
      isActive: true,
      clerkId: "user_demo_super_admin",
    },
    {
      id: "u2_admin",
      email: "admin@capitalfirst.in",
      firstName: "Priya",
      lastName: "Mehta",
      role: "tenant_admin" as const,
      tenantId: t1,
      isActive: true,
      clerkId: "user_demo_tenant_admin_t1",
    },
    {
      id: "u3_rm",
      email: "rm@swiftfin.in",
      firstName: "Rahul",
      lastName: "Gupta",
      role: "relationship_manager" as const,
      tenantId: t2,
      isActive: true,
      clerkId: "user_demo_rm_t2",
    },
    {
      id: "u4_cust",
      email: "vikram.singh@gmail.com",
      firstName: "Vikram",
      lastName: "Singh",
      role: "customer" as const,
      tenantId: t1,
      isActive: true,
      clerkId: "user_demo_customer_c1",
    },
  ];

  for (const u of demoUsers) {
    const existing = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, u.email));

    if (existing.length === 0) {
      await db.insert(usersTable).values(u);
    } else {
      await db
        .update(usersTable)
        .set({ clerkId: u.clerkId, tenantId: u.tenantId, role: u.role })
        .where(eq(usersTable.email, u.email));
    }
  }

  console.log("Demo accounts seeded successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
