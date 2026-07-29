import { db, tenantsTable, usersTable, customersTable, loanProductsTable, loanApplicationsTable, loansTable, repaymentsTable, collectionsTable, kycRecordsTable, riskScoresTable, tenantSettingsTable } from "@workspace/db";
import { randomUUID } from "crypto";

const id = () => randomUUID();

async function seed() {
  console.log("Seeding...");

  // Tenants
  const t1 = id(), t2 = id(), t3 = id();
  await db.insert(tenantsTable).values([
    { id: t1, name: "CapitalFirst NBFC", type: "nbfc", status: "active", contactEmail: "ops@capitalfirst.in", logo: null, primaryColor: "#00c896", totalLoans: 1240, totalCustomers: 3800, totalDisbursed: "58000000" },
    { id: t2, name: "Swift Fintech", type: "fintech", status: "active", contactEmail: "admin@swiftfin.in", logo: null, primaryColor: "#6366f1", totalLoans: 870, totalCustomers: 2100, totalDisbursed: "32000000" },
    { id: t3, name: "Bharath LSP", type: "lsp", status: "pending", contactEmail: "contact@bharathlsp.in", logo: null, primaryColor: "#f59e0b", totalLoans: 0, totalCustomers: 0, totalDisbursed: "0" },
  ]).onConflictDoNothing();

  await db.insert(tenantSettingsTable).values([
    { tenantId: t1, primaryColor: "#00c896" },
    { tenantId: t2, primaryColor: "#6366f1" },
    { tenantId: t3, primaryColor: "#f59e0b" },
  ]).onConflictDoNothing();

  // Users
  const u1 = id(), u2 = id(), u3 = id(), u4 = id();
  await db.insert(usersTable).values([
    { id: u1, email: "superadmin@lendingtechplatform.in", firstName: "Arjun", lastName: "Sharma", role: "super_admin", tenantId: null, isActive: true },
    { id: u2, email: "admin@capitalfirst.in", firstName: "Priya", lastName: "Mehta", role: "tenant_admin", tenantId: t1, isActive: true },
    { id: u3, email: "rm@swiftfin.in", firstName: "Rahul", lastName: "Gupta", role: "relationship_manager", tenantId: t2, isActive: true },
    { id: u4, email: "vikram.singh@gmail.com", firstName: "Vikram", lastName: "Singh", role: "customer", tenantId: t1, isActive: true },
  ]).onConflictDoNothing();

  // Customers
  const c1 = id(), c2 = id(), c3 = id(), c4 = id();
  await db.insert(customersTable).values([
    { id: c1, tenantId: t1, firstName: "Vikram", lastName: "Singh", email: "vikram.singh@gmail.com", phone: "9876543210", panNumber: "ABCDE1234F", creditScore: 742, kycStatus: "verified", status: "active", employmentType: "salaried", monthlyIncome: "75000", totalLoans: 2, activeLoans: 1 },
    { id: c2, tenantId: t1, firstName: "Anita", lastName: "Patel", email: "anita.patel@gmail.com", phone: "9123456780", panNumber: "FGHIJ5678K", creditScore: 685, kycStatus: "verified", status: "active", employmentType: "self_employed", monthlyIncome: "120000", totalLoans: 1, activeLoans: 1 },
    { id: c3, tenantId: t2, firstName: "Deepak", lastName: "Kumar", email: "deepak.k@gmail.com", phone: "9988776655", panNumber: "KLMNO9012P", creditScore: 610, kycStatus: "partial", status: "active", employmentType: "salaried", monthlyIncome: "45000", totalLoans: 0, activeLoans: 0 },
    { id: c4, tenantId: t1, firstName: "Sunita", lastName: "Reddy", email: "sunita.r@gmail.com", phone: "9871234560", panNumber: null, creditScore: 590, kycStatus: "pending", status: "active", employmentType: "business", monthlyIncome: "200000", totalLoans: 0, activeLoans: 0 },
  ]).onConflictDoNothing();

  // Loan Products
  const p1 = id(), p2 = id(), p3 = id();
  await db.insert(loanProductsTable).values([
    { id: p1, tenantId: t1, name: "Personal Loan Prime", type: "personal", minAmount: "50000", maxAmount: "1000000", minTenureMonths: 12, maxTenureMonths: 60, interestRate: "13.5", processingFeePercent: "1", isActive: true },
    { id: p2, tenantId: t1, name: "MSME Business Loan", type: "msme", minAmount: "200000", maxAmount: "5000000", minTenureMonths: 12, maxTenureMonths: 84, interestRate: "15", processingFeePercent: "1.5", isActive: true },
    { id: p3, tenantId: t2, name: "Salary Advance", type: "salary_advance", minAmount: "10000", maxAmount: "150000", minTenureMonths: 1, maxTenureMonths: 12, interestRate: "18", processingFeePercent: "2", isActive: true },
  ]).onConflictDoNothing();

  // Loan Applications
  const a1 = id(), a2 = id(), a3 = id(), a4 = id();
  const ln1 = id(), ln2 = id();

  await db.insert(loanApplicationsTable).values([
    { id: a1, applicationNumber: "APP-001-2026", customerId: c1, tenantId: t1, productId: p1, requestedAmount: "500000", requestedTenure: 36, purpose: "Home renovation", status: "disbursed", riskScore: "78", riskGrade: "B1", approvedAmount: "500000", approvedTenure: 36, approvedRate: "13.5", disbursedAt: new Date("2026-03-15") },
    { id: a2, applicationNumber: "APP-002-2026", customerId: c2, tenantId: t1, productId: p2, requestedAmount: "2000000", requestedTenure: 60, purpose: "Business expansion", status: "approved", riskScore: "71", riskGrade: "B1", approvedAmount: "1800000", approvedTenure: 60, approvedRate: "15" },
    { id: a3, applicationNumber: "APP-003-2026", customerId: c3, tenantId: t2, productId: p3, requestedAmount: "80000", requestedTenure: 6, purpose: "Emergency medical", status: "under_review", riskScore: null, riskGrade: null },
    { id: a4, applicationNumber: "APP-004-2026", customerId: c4, tenantId: t1, productId: p1, requestedAmount: "300000", requestedTenure: 24, purpose: "Education", status: "kyc_pending", riskScore: null, riskGrade: null },
  ]).onConflictDoNothing();

  // KYC Records
  await db.insert(kycRecordsTable).values([
    { id: id(), applicationId: a1, panStatus: "verified", aadhaarStatus: "verified", faceStatus: "verified", employmentStatus: "verified", panNumber: "ABCDE1234F", verifiedAt: new Date("2026-03-10") },
    { id: id(), applicationId: a2, panStatus: "verified", aadhaarStatus: "verified", faceStatus: "verified", employmentStatus: "verified", panNumber: "FGHIJ5678K", verifiedAt: new Date("2026-05-01") },
    { id: id(), applicationId: a3, panStatus: "verified", aadhaarStatus: "pending", faceStatus: "pending", employmentStatus: "pending" },
    { id: id(), applicationId: a4, panStatus: "pending", aadhaarStatus: "pending", faceStatus: "pending", employmentStatus: "pending" },
  ]).onConflictDoNothing();

  // Risk Scores
  await db.insert(riskScoresTable).values([
    { id: id(), applicationId: a1, score: "78", grade: "B1", recommendation: "approve", creditScoreWeight: "0.82", incomeWeight: "0.75", debtToIncomeRatio: "0.28", employmentStabilityScore: "0.9", fraudRiskScore: "0.05", explanation: "Credit score 742 (Good), DTI ratio 28%, salaried employment. Grade B1.", computedAt: new Date("2026-03-09") },
    { id: id(), applicationId: a2, score: "71", grade: "B1", recommendation: "approve", creditScoreWeight: "0.76", incomeWeight: "0.88", debtToIncomeRatio: "0.32", employmentStabilityScore: "0.75", fraudRiskScore: "0.07", explanation: "Credit score 685, DTI 32%, self-employed business. Grade B1.", computedAt: new Date("2026-05-02") },
  ]).onConflictDoNothing();

  // Active Loans
  const nextEmi1 = new Date(); nextEmi1.setDate(15);
  const nextEmi2 = new Date(); nextEmi2.setDate(20);

  await db.insert(loansTable).values([
    { id: ln1, loanNumber: "LN-2026-0001", applicationId: a1, customerId: c1, tenantId: t1, principalAmount: "500000", outstandingAmount: "412000", totalPaid: "88000", interestRate: "13.5", tenure: 36, emiAmount: "16947", nextEmiDate: nextEmi1, status: "active", dpd: 0, disbursedAt: new Date("2026-03-15") },
    { id: ln2, loanNumber: "LN-2026-0002", applicationId: a2, customerId: c2, tenantId: t1, principalAmount: "1800000", outstandingAmount: "1740000", totalPaid: "60000", interestRate: "15", tenure: 60, emiAmount: "42824", nextEmiDate: nextEmi2, status: "active", dpd: 12, disbursedAt: new Date("2026-06-01") },
  ]).onConflictDoNothing();

  // Repayments
  for (let i = 1; i <= 5; i++) {
    const due = new Date("2026-03-15"); due.setMonth(due.getMonth() + i);
    const isPaid = i <= 5;
    await db.insert(repaymentsTable).values({
      id: id(), loanId: ln1, customerId: c1, installmentNumber: i,
      dueDate: due, emiAmount: "16947",
      paidAmount: isPaid ? "16947" : null,
      paidAt: isPaid ? new Date(due.getTime() - 86400000) : null,
      status: isPaid ? "paid" : "pending", dpd: 0,
    }).onConflictDoNothing();
  }
  // One overdue repayment for ln2
  const overdueDue = new Date("2026-06-20");
  await db.insert(repaymentsTable).values({
    id: id(), loanId: ln2, customerId: c2, installmentNumber: 1,
    dueDate: overdueDue, emiAmount: "42824", status: "overdue", dpd: 12,
  }).onConflictDoNothing();

  // Collections
  await db.insert(collectionsTable).values([
    { id: id(), loanId: ln2, customerId: c2, tenantId: t1, overdueAmount: "42824", dpd: 12, status: "in_progress", priority: "high", aiPriorityScore: "82", assignedTo: u2, notes: "Customer contacted — promised payment by 10th" },
  ]).onConflictDoNothing();

  console.log("Seed complete.");
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
