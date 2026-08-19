import { eq } from "drizzle-orm";
import { createHash } from "crypto";
import {
  db,
  tenantsTable,
  usersTable,
  customersTable,
  loanProductsTable,
  loanApplicationsTable,
  loansTable,
  repaymentsTable,
  collectionsTable,
  kycRecordsTable,
  riskScoresTable,
  tenantSettingsTable,
  invitationsTable,
} from "@workspace/db";

const id = (seed: string) => createHash("sha256").update(seed).digest("hex").slice(0, 32);

async function upsertTenant(input: any) {
  const existing = await db.select().from(tenantsTable).where(eq(tenantsTable.contactEmail, input.contactEmail)).limit(1);
  if (existing[0]) {
    const { id, ...rest } = input;
    await db.update(tenantsTable).set(rest).where(eq(tenantsTable.id, existing[0].id));
    return existing[0].id;
  }
  const [inserted] = await db.insert(tenantsTable).values(input).returning();
  return inserted.id;
}

async function upsertUser(input: any) {
  let existing = null as any;

  if (input.clerkId) {
    const match = await db.select().from(usersTable).where(eq(usersTable.clerkId, input.clerkId)).limit(1);
    existing = match[0] ?? null;
  }

  if (!existing) {
    const match = await db.select().from(usersTable).where(eq(usersTable.email, input.email)).limit(1);
    existing = match[0] ?? null;
  }

  if (existing) {
    const { id, ...rest } = input;
    await db.update(usersTable).set(rest).where(eq(usersTable.id, existing.id));
    return existing.id;
  }

  const [inserted] = await db.insert(usersTable).values(input).returning();
  return inserted.id;
}

async function upsertCustomer(input: any) {
  const existing = await db.select().from(customersTable).where(eq(customersTable.email, input.email)).limit(1);
  if (existing[0]) {
    const { id, ...rest } = input;
    await db.update(customersTable).set(rest).where(eq(customersTable.id, existing[0].id));
    return existing[0].id;
  }
  const [inserted] = await db.insert(customersTable).values(input).returning();
  return inserted.id;
}

async function upsertProduct(input: any) {
  const existing = await db.select().from(loanProductsTable).where(eq(loanProductsTable.name, input.name)).limit(1);
  if (existing[0]) {
    const { id, ...rest } = input;
    await db.update(loanProductsTable).set(rest).where(eq(loanProductsTable.id, existing[0].id));
    return existing[0].id;
  }
  const [inserted] = await db.insert(loanProductsTable).values(input).returning();
  return inserted.id;
}

async function upsertApplication(input: any) {
  const existing = await db.select().from(loanApplicationsTable).where(eq(loanApplicationsTable.applicationNumber, input.applicationNumber)).limit(1);
  if (existing[0]) {
    const { id, ...rest } = input;
    await db.update(loanApplicationsTable).set(rest).where(eq(loanApplicationsTable.id, existing[0].id));
    return existing[0].id;
  }
  const [inserted] = await db.insert(loanApplicationsTable).values(input).returning();
  return inserted.id;
}

async function upsertLoan(input: any) {
  const existing = await db.select().from(loansTable).where(eq(loansTable.loanNumber, input.loanNumber)).limit(1);
  if (existing[0]) {
    const { id, ...rest } = input;
    await db.update(loansTable).set(rest).where(eq(loansTable.id, existing[0].id));
    return existing[0].id;
  }
  const [inserted] = await db.insert(loansTable).values(input).returning();
  return inserted.id;
}

async function upsertKyc(input: any) {
  const existing = await db.select().from(kycRecordsTable).where(eq(kycRecordsTable.applicationId, input.applicationId)).limit(1);
  if (existing[0]) {
    const { id, ...rest } = input;
    await db.update(kycRecordsTable).set(rest).where(eq(kycRecordsTable.id, existing[0].id));
    return existing[0].id;
  }
  const [inserted] = await db.insert(kycRecordsTable).values(input).returning();
  return inserted.id;
}

async function upsertInvitation(input: any) {
  const existing = await db.select().from(invitationsTable).where(eq(invitationsTable.token, input.token)).limit(1);
  if (existing[0]) {
    const { id, ...rest } = input;
    await db.update(invitationsTable).set(rest).where(eq(invitationsTable.id, existing[0].id));
    return existing[0].id;
  }
  const [inserted] = await db.insert(invitationsTable).values(input).returning();
  return inserted.id;
}

async function upsertRisk(input: any) {
  const existing = await db.select().from(riskScoresTable).where(eq(riskScoresTable.applicationId, input.applicationId)).limit(1);
  if (existing[0]) {
    const { id, ...rest } = input;
    await db.update(riskScoresTable).set(rest).where(eq(riskScoresTable.id, existing[0].id));
    return existing[0].id;
  }
  const [inserted] = await db.insert(riskScoresTable).values(input).returning();
  return inserted.id;
}

async function seed() {
  console.log("Seeding...");

  const t1 = id("tenant-capitalfirst");
  const t2 = id("tenant-swift");
  const t3 = id("tenant-bharath");

  const tenant1Id = await upsertTenant({
    id: t1,
    name: "CapitalFirst NBFC",
    type: "nbfc",
    status: "active",
    contactEmail: "ops@capitalfirst.in",
    logo: null,
    primaryColor: "#00c896",
    totalLoans: 1240,
    totalCustomers: 3800,
    totalDisbursed: "58000000",
  });

  const tenant2Id = await upsertTenant({
    id: t2,
    name: "Swift Fintech",
    type: "fintech",
    status: "active",
    contactEmail: "admin@swiftfin.in",
    logo: null,
    primaryColor: "#6366f1",
    totalLoans: 870,
    totalCustomers: 2100,
    totalDisbursed: "32000000",
  });

  const tenant3Id = await upsertTenant({
    id: t3,
    name: "Bharath LSP",
    type: "lsp",
    status: "pending",
    contactEmail: "contact@bharathlsp.in",
    logo: null,
    primaryColor: "#f59e0b",
    totalLoans: 0,
    totalCustomers: 0,
    totalDisbursed: "0",
  });

  await db.insert(tenantSettingsTable).values([
    { tenantId: tenant1Id, primaryColor: "#00c896" },
    { tenantId: tenant2Id, primaryColor: "#6366f1" },
    { tenantId: tenant3Id, primaryColor: "#f59e0b" },
  ]).onConflictDoNothing();

  const u1 = await upsertUser({
    id: id("user-superadmin@test.com"),
    email: "superadmin@test.com",
    firstName: "Arjun",
    lastName: "Sharma",
    role: "super_admin",
    tenantId: null,
    clerkId: "user_demo_super_admin",
    isActive: true,
  });

  const u2 = await upsertUser({
    id: id("user-admin@test.com"),
    email: "admin@test.com",
    firstName: "Priya",
    lastName: "Mehta",
    role: "tenant_admin",
    tenantId: tenant1Id,
    clerkId: "user_demo_tenant_admin_t1",
    isActive: true,
  });

  const u3 = await upsertUser({
    id: id("user-rm@test.com"),
    email: "rm@test.com",
    firstName: "Rahul",
    lastName: "Gupta",
    role: "relationship_manager",
    tenantId: tenant2Id,
    clerkId: "user_demo_rm_t2",
    isActive: true,
  });

  const u4 = await upsertUser({
    id: id("user-customer@test.com"),
    email: "customer@test.com",
    firstName: "Vikram",
    lastName: "Singh",
    role: "customer",
    tenantId: tenant1Id,
    clerkId: "user_demo_customer_c1",
    isActive: true,
  });

  const c1 = await upsertCustomer({
    id: id("customer-vikram"),
    tenantId: tenant1Id,
    firstName: "Vikram",
    lastName: "Singh",
    email: "vikram.singh@gmail.com",
    phone: "9876543210",
    panNumber: "ABCDE1234F",
    creditScore: 742,
    kycStatus: "verified",
    status: "active",
    employmentType: "salaried",
    monthlyIncome: "75000",
    totalLoans: 2,
    activeLoans: 1,
  });

  const c2 = await upsertCustomer({
    id: id("customer-anita"),
    tenantId: tenant1Id,
    firstName: "Anita",
    lastName: "Patel",
    email: "anita.patel@gmail.com",
    phone: "9123456780",
    panNumber: "FGHIJ5678K",
    creditScore: 685,
    kycStatus: "verified",
    status: "active",
    employmentType: "self_employed",
    monthlyIncome: "120000",
    totalLoans: 1,
    activeLoans: 1,
  });

  const c3 = await upsertCustomer({
    id: id("customer-deepak"),
    tenantId: tenant2Id,
    firstName: "Deepak",
    lastName: "Kumar",
    email: "deepak.k@gmail.com",
    phone: "9988776655",
    panNumber: "KLMNO9012P",
    creditScore: 610,
    kycStatus: "partial",
    status: "active",
    employmentType: "salaried",
    monthlyIncome: "45000",
    totalLoans: 0,
    activeLoans: 0,
  });

  const c4 = await upsertCustomer({
    id: id("customer-sunita"),
    tenantId: tenant1Id,
    firstName: "Sunita",
    lastName: "Reddy",
    email: "sunita.r@gmail.com",
    phone: "9871234560",
    panNumber: null,
    creditScore: 590,
    kycStatus: "pending",
    status: "active",
    employmentType: "business",
    monthlyIncome: "200000",
    totalLoans: 0,
    activeLoans: 0,
  });

  const p1 = await upsertProduct({
    id: id("product-personal-prime"),
    tenantId: tenant1Id,
    name: "Personal Loan Prime",
    type: "personal",
    minAmount: "50000",
    maxAmount: "1000000",
    minTenureMonths: 12,
    maxTenureMonths: 60,
    interestRate: "13.5",
    processingFeePercent: "1",
    isActive: true,
  });

  const p2 = await upsertProduct({
    id: id("product-msme"),
    tenantId: tenant1Id,
    name: "MSME Business Loan",
    type: "msme",
    minAmount: "200000",
    maxAmount: "5000000",
    minTenureMonths: 12,
    maxTenureMonths: 84,
    interestRate: "15",
    processingFeePercent: "1.5",
    isActive: true,
  });

  const p3 = await upsertProduct({
    id: id("product-salary-advance"),
    tenantId: tenant2Id,
    name: "Salary Advance",
    type: "salary_advance",
    minAmount: "10000",
    maxAmount: "150000",
    minTenureMonths: 1,
    maxTenureMonths: 12,
    interestRate: "18",
    processingFeePercent: "2",
    isActive: true,
  });

  const a1 = await upsertApplication({
    id: id("application-APP-001-2026"),
    applicationNumber: "APP-001-2026",
    customerId: c1,
    tenantId: tenant1Id,
    productId: p1,
    requestedAmount: "500000",
    requestedTenure: 36,
    purpose: "Home renovation",
    status: "disbursed",
    riskScore: "78",
    riskGrade: "B1",
    approvedAmount: "500000",
    approvedTenure: 36,
    approvedRate: "13.5",
    disbursedAt: new Date("2026-03-15"),
  });

  const a2 = await upsertApplication({
    id: id("application-APP-002-2026"),
    applicationNumber: "APP-002-2026",
    customerId: c2,
    tenantId: tenant1Id,
    productId: p2,
    requestedAmount: "2000000",
    requestedTenure: 60,
    purpose: "Business expansion",
    status: "approved",
    riskScore: "71",
    riskGrade: "B1",
    approvedAmount: "1800000",
    approvedTenure: 60,
    approvedRate: "15",
  });

  const a3 = await upsertApplication({
    id: id("application-APP-003-2026"),
    applicationNumber: "APP-003-2026",
    customerId: c3,
    tenantId: tenant2Id,
    productId: p3,
    requestedAmount: "80000",
    requestedTenure: 6,
    purpose: "Emergency medical",
    status: "under_review",
    riskScore: null,
    riskGrade: null,
  });

  const a4 = await upsertApplication({
    id: id("application-APP-004-2026"),
    applicationNumber: "APP-004-2026",
    customerId: c4,
    tenantId: tenant1Id,
    productId: p1,
    requestedAmount: "300000",
    requestedTenure: 24,
    purpose: "Education",
    status: "kyc_pending",
    riskScore: null,
    riskGrade: null,
  });

  await upsertKyc({
    id: id("kyc-a1"),
    applicationId: a1,
    panStatus: "verified",
    aadhaarStatus: "verified",
    faceStatus: "verified",
    employmentStatus: "verified",
    panNumber: "ABCDE1234F",
    verifiedAt: new Date("2026-03-10"),
  });

  await upsertKyc({
    id: id("kyc-a2"),
    applicationId: a2,
    panStatus: "verified",
    aadhaarStatus: "verified",
    faceStatus: "verified",
    employmentStatus: "verified",
    panNumber: "FGHIJ5678K",
    verifiedAt: new Date("2026-05-01"),
  });

  await upsertKyc({
    id: id("kyc-a3"),
    applicationId: a3,
    panStatus: "verified",
    aadhaarStatus: "pending",
    faceStatus: "pending",
    employmentStatus: "pending",
  });

  await upsertKyc({
    id: id("kyc-a4"),
    applicationId: a4,
    panStatus: "pending",
    aadhaarStatus: "pending",
    faceStatus: "pending",
    employmentStatus: "pending",
  });

  await upsertRisk({
    id: id("risk-a1"),
    applicationId: a1,
    score: "78",
    grade: "B1",
    recommendation: "approve",
    creditScoreWeight: "0.82",
    incomeWeight: "0.75",
    debtToIncomeRatio: "0.28",
    employmentStabilityScore: "0.9",
    fraudRiskScore: "0.05",
    explanation: "Credit score 742 (Good), DTI ratio 28%, salaried employment. Grade B1.",
    computedAt: new Date("2026-03-09"),
  });

  await upsertRisk({
    id: id("risk-a2"),
    applicationId: a2,
    score: "71",
    grade: "B1",
    recommendation: "approve",
    creditScoreWeight: "0.76",
    incomeWeight: "0.88",
    debtToIncomeRatio: "0.32",
    employmentStabilityScore: "0.75",
    fraudRiskScore: "0.07",
    explanation: "Credit score 685, DTI 32%, self-employed business. Grade B1.",
    computedAt: new Date("2026-05-02"),
  });

  const nextEmi1 = new Date();
  nextEmi1.setDate(15);
  const nextEmi2 = new Date();
  nextEmi2.setDate(20);

  const ln1 = await upsertLoan({
    id: id("loan-LN-2026-0001"),
    loanNumber: "LN-2026-0001",
    applicationId: a1,
    customerId: c1,
    tenantId: tenant1Id,
    principalAmount: "500000",
    outstandingAmount: "412000",
    totalPaid: "88000",
    interestRate: "13.5",
    tenure: 36,
    emiAmount: "16947",
    nextEmiDate: nextEmi1,
    status: "active",
    dpd: 0,
    disbursedAt: new Date("2026-03-15"),
  });

  const ln2 = await upsertLoan({
    id: id("loan-LN-2026-0002"),
    loanNumber: "LN-2026-0002",
    applicationId: a2,
    customerId: c2,
    tenantId: tenant1Id,
    principalAmount: "1800000",
    outstandingAmount: "1740000",
    totalPaid: "60000",
    interestRate: "15",
    tenure: 60,
    emiAmount: "42824",
    nextEmiDate: nextEmi2,
    status: "active",
    dpd: 12,
    disbursedAt: new Date("2026-06-01"),
  });

  for (let i = 1; i <= 5; i++) {
    const due = new Date("2026-03-15");
    due.setMonth(due.getMonth() + i);
    const isPaid = i <= 5;
    await db.insert(repaymentsTable).values({
      id: id(`repayment-${ln1}-${i}`),
      loanId: ln1,
      customerId: c1,
      installmentNumber: i,
      dueDate: due,
      emiAmount: "16947",
      paidAmount: isPaid ? "16947" : null,
      paidAt: isPaid ? new Date(due.getTime() - 86400000) : null,
      status: isPaid ? "paid" : "pending",
      dpd: 0,
    }).onConflictDoNothing();
  }

  const overdueDue = new Date("2026-06-20");
  await db.insert(repaymentsTable).values({
    id: id(`repayment-${ln2}-1`),
    loanId: ln2,
    customerId: c2,
    installmentNumber: 1,
    dueDate: overdueDue,
    emiAmount: "42824",
    status: "overdue",
    dpd: 12,
  }).onConflictDoNothing();

  await db.insert(collectionsTable).values({
    id: id("collection-ln2"),
    loanId: ln2,
    customerId: c2,
    tenantId: tenant1Id,
    overdueAmount: "42824",
    dpd: 12,
    status: "in_progress",
    priority: "high",
    aiPriorityScore: "82",
    assignedTo: u2,
    notes: "Customer contacted — promised payment by 10th",
  }).onConflictDoNothing();

  // Demo invitations
  await upsertInvitation({
    id: id("invitation-nbfc-admin"),
    email: "nbfc.admin@newtenant.in",
    tenantId: tenant1Id,
    role: "tenant_admin",
    invitedBy: u1,
    status: "pending",
    token: "demo-invitation-nbfc-admin-token",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    metadata: { source: "demo", invitedByRole: "super_admin" },
  });

  await upsertInvitation({
    id: id("invitation-risk-manager"),
    email: "risk.manager@newtenant.in",
    tenantId: tenant1Id,
    role: "risk_manager",
    invitedBy: u2,
    status: "pending",
    token: "demo-invitation-risk-manager-token",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    metadata: { source: "demo", invitedByRole: "tenant_admin" },
  });

  console.log("Seed complete.");
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
