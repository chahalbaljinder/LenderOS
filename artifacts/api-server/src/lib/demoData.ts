import type { Request } from "express";

interface DemoFallbackResponse {
  statusCode: number;
  body: unknown;
}

const tenantSeed = [
  {
    id: "tenant_capitalfirst",
    name: "CapitalFirst NBFC",
    type: "nbfc",
    status: "active",
    domain: "capitalfirst.local",
    primaryColor: "#00c896",
    contactEmail: "ops@capitalfirst.in",
    contactPhone: "+91-9876543210",
    createdAt: "2026-01-10T00:00:00.000Z",
    updatedAt: "2026-01-10T00:00:00.000Z",
  },
  {
    id: "tenant_swiftfin",
    name: "Swift Fintech",
    type: "fintech",
    status: "active",
    domain: "swiftfin.local",
    primaryColor: "#6366f1",
    contactEmail: "admin@swiftfin.in",
    contactPhone: "+91-9123456780",
    createdAt: "2026-02-01T00:00:00.000Z",
    updatedAt: "2026-02-01T00:00:00.000Z",
  },
  {
    id: "tenant_bharath",
    name: "Bharath LSP",
    type: "lsp",
    status: "pending",
    domain: "bharath.local",
    primaryColor: "#f59e0b",
    contactEmail: "contact@bharathlsp.in",
    contactPhone: "+91-9988776655",
    createdAt: "2026-03-05T00:00:00.000Z",
    updatedAt: "2026-03-05T00:00:00.000Z",
  },
];

const userSeed = [
  {
    id: "user_super_admin",
    clerkId: "user_demo_super_admin",
    email: "superadmin@lendingtechplatform.in",
    firstName: "Arjun",
    lastName: "Sharma",
    role: "super_admin",
    tenantId: null,
    isActive: true,
    createdAt: "2026-01-10T00:00:00.000Z",
    updatedAt: "2026-01-10T00:00:00.000Z",
  },
  {
    id: "user_tenant_admin",
    clerkId: "user_demo_tenant_admin_t1",
    email: "admin@capitalfirst.in",
    firstName: "Priya",
    lastName: "Mehta",
    role: "tenant_admin",
    tenantId: "tenant_capitalfirst",
    isActive: true,
    createdAt: "2026-01-11T00:00:00.000Z",
    updatedAt: "2026-01-11T00:00:00.000Z",
  },
  {
    id: "user_rm",
    clerkId: "user_demo_rm_t2",
    email: "rm@swiftfin.in",
    firstName: "Rahul",
    lastName: "Gupta",
    role: "relationship_manager",
    tenantId: "tenant_swiftfin",
    isActive: true,
    createdAt: "2026-02-03T00:00:00.000Z",
    updatedAt: "2026-02-03T00:00:00.000Z",
  },
  {
    id: "user_customer",
    clerkId: "user_demo_customer_c1",
    email: "vikram.singh@gmail.com",
    firstName: "Vikram",
    lastName: "Singh",
    role: "customer",
    tenantId: "tenant_capitalfirst",
    isActive: true,
    createdAt: "2026-02-20T00:00:00.000Z",
    updatedAt: "2026-02-20T00:00:00.000Z",
  },
];

const customerSeed = [
  {
    id: "customer_vikram",
    tenantId: "tenant_capitalfirst",
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
    createdAt: "2026-02-20T00:00:00.000Z",
  },
  {
    id: "customer_anita",
    tenantId: "tenant_capitalfirst",
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
    createdAt: "2026-02-22T00:00:00.000Z",
  },
];

const loanProductSeed = [
  {
    id: "product_personal",
    tenantId: "tenant_capitalfirst",
    name: "Personal Loan Prime",
    type: "personal",
    minAmount: "50000",
    maxAmount: "1000000",
    minTenureMonths: 12,
    maxTenureMonths: 60,
    interestRate: "13.5",
    processingFeePercent: "1",
    isActive: true,
  },
  {
    id: "product_msme",
    tenantId: "tenant_capitalfirst",
    name: "MSME Business Loan",
    type: "msme",
    minAmount: "200000",
    maxAmount: "5000000",
    minTenureMonths: 12,
    maxTenureMonths: 84,
    interestRate: "15",
    processingFeePercent: "1.5",
    isActive: true,
  },
];

const loanApplicationSeed = [
  {
    id: "application_001",
    applicationNumber: "APP-001-2026",
    customerId: "customer_vikram",
    tenantId: "tenant_capitalfirst",
    productId: "product_personal",
    requestedAmount: "500000",
    requestedTenure: 36,
    purpose: "Home renovation",
    status: "disbursed",
    riskScore: "78",
    riskGrade: "B1",
    approvedAmount: "500000",
    approvedTenure: 36,
    approvedRate: "13.5",
  },
  {
    id: "application_002",
    applicationNumber: "APP-002-2026",
    customerId: "customer_anita",
    tenantId: "tenant_capitalfirst",
    productId: "product_msme",
    requestedAmount: "2000000",
    requestedTenure: 60,
    purpose: "Business expansion",
    status: "approved",
    riskScore: "71",
    riskGrade: "B1",
    approvedAmount: "1800000",
    approvedTenure: 60,
    approvedRate: "15",
  },
];

const loanSeed = [
  {
    id: "loan_active_001",
    loanNumber: "LN-2026-0001",
    applicationId: "application_001",
    customerId: "customer_vikram",
    tenantId: "tenant_capitalfirst",
    principalAmount: "500000",
    outstandingAmount: "412000",
    totalPaid: "88000",
    interestRate: "13.5",
    tenure: 36,
    emiAmount: "16947",
    status: "active",
    dpd: 0,
  },
];

const collectionSeed = [
  {
    id: "collection_001",
    loanId: "loan_active_001",
    customerId: "customer_vikram",
    tenantId: "tenant_capitalfirst",
    overdueAmount: "42824",
    dpd: 12,
    status: "in_progress",
    priority: "high",
    aiPriorityScore: "82",
    assignedTo: "user_tenant_admin",
    notes: "Customer contacted — promised payment by the 10th.",
  },
];

function getDemoUser(req: Request) {
  const demoHeader = req.headers["x-demo-user-id"];
  const selected = typeof demoHeader === "string" ? demoHeader : undefined;

  if (selected === "user_demo_tenant_admin_t1") {
    return {
      ...userSeed[1],
      tenantName: "CapitalFirst NBFC",
    };
  }

  if (selected === "user_demo_rm_t2") {
    return {
      ...userSeed[2],
      tenantName: "Swift Fintech",
    };
  }

  if (selected === "user_demo_customer_c1") {
    return {
      ...userSeed[3],
      tenantName: "CapitalFirst NBFC",
    };
  }

  return {
    ...userSeed[0],
    tenantName: null,
  };
}

export function shouldUseDemoFallback(error: unknown): boolean {
  const message = (error instanceof Error ? error.message : String(error)).toLowerCase();
  return [
    "failed query",
    "connect",
    "ecconnrefused",
    "relation",
    "does not exist",
    "timeout",
    "database",
  ].some((token) => message.includes(token));
}

export function getDemoFallbackResponse(req: Request): DemoFallbackResponse | null {
  const pathname = req.path.replace(/^\/api/, "");
  const segments = pathname.split("/").filter(Boolean);

  if (pathname === "/healthz") {
    return { statusCode: 200, body: { status: "ok", source: "demo" } };
  }

  if (segments[0] === "tenants") {
    if (segments[1]) {
      const tenant = tenantSeed.find((item) => item.id === segments[1]);
      return {
        statusCode: tenant ? 200 : 404,
        body: tenant ?? { error: "Tenant not found", source: "demo" },
      };
    }

    return {
      statusCode: 200,
      body: {
        data: tenantSeed,
        total: tenantSeed.length,
        page: 1,
        limit: 20,
        source: "demo",
      },
    };
  }

  if (segments[0] === "users") {
    if (segments[1] === "me") {
      return {
        statusCode: 200,
        body: getDemoUser(req),
      };
    }

    if (segments[1]) {
      const user = userSeed.find((item) => item.id === segments[1]);
      return {
        statusCode: user ? 200 : 404,
        body: user ?? { error: "User not found", source: "demo" },
      };
    }

    return {
      statusCode: 200,
      body: {
        data: userSeed,
        total: userSeed.length,
        page: 1,
        limit: 20,
        source: "demo",
      },
    };
  }

  if (segments[0] === "customers") {
    return {
      statusCode: 200,
      body: {
        data: customerSeed,
        total: customerSeed.length,
        page: 1,
        limit: 20,
        source: "demo",
      },
    };
  }

  if (segments[0] === "loan-products") {
    return {
      statusCode: 200,
      body: {
        data: loanProductSeed,
        total: loanProductSeed.length,
        page: 1,
        limit: 20,
        source: "demo",
      },
    };
  }

  if (segments[0] === "loan-applications") {
    return {
      statusCode: 200,
      body: {
        data: loanApplicationSeed,
        total: loanApplicationSeed.length,
        page: 1,
        limit: 20,
        source: "demo",
      },
    };
  }

  if (segments[0] === "loans") {
    return {
      statusCode: 200,
      body: {
        data: loanSeed,
        total: loanSeed.length,
        page: 1,
        limit: 20,
        source: "demo",
      },
    };
  }

  if (segments[0] === "collections") {
    return {
      statusCode: 200,
      body: {
        data: collectionSeed,
        total: collectionSeed.length,
        page: 1,
        limit: 20,
        source: "demo",
      },
    };
  }

  if (segments[0] === "analytics") {
    return {
      statusCode: 200,
      body: {
        totalApplications: 2,
        totalLoans: 1,
        totalDisbursed: 500000,
        totalCollections: 88000,
        activeCustomers: 2,
        defaultRate: 12,
        approvalRate: 100,
        pendingApplications: 0,
        overdueLoans: 1,
        source: "demo",
      },
    };
  }

  if (segments[0] === "settings") {
    return {
      statusCode: 200,
      body: {
        tenantId: "tenant_capitalfirst",
        primaryColor: "#00c896",
        secondaryColor: "#0f172a",
        autoApprovalEnabled: false,
        source: "demo",
      },
    };
  }

  if (segments[0] === "offers") {
    return {
      statusCode: 200,
      body: {
        data: [
          {
            id: "offer_001",
            tenantId: "tenant_capitalfirst",
            status: "draft",
            amount: "500000",
          },
        ],
        total: 1,
        source: "demo",
      },
    };
  }

  return null;
}
