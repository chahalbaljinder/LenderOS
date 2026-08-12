import { Request, Response, NextFunction } from "express";

export type UserRole =
  | "super_admin"
  | "platform_admin"
  | "tenant_owner"
  | "tenant_admin"
  | "risk_manager"
  | "loan_manager"
  | "collection_manager"
  | "customer_support"
  | "sales_agent"
  | "dsa"
  | "relationship_manager"
  | "customer"
  | "auditor"
  | "compliance_officer";

const roleHierarchy: Record<UserRole, number> = {
  super_admin: 100,
  platform_admin: 90,
  tenant_owner: 80,
  tenant_admin: 70,
  risk_manager: 60,
  loan_manager: 50,
  collection_manager: 40,
  customer_support: 30,
  sales_agent: 20,
  dsa: 15,
  relationship_manager: 10,
  customer: 5,
  auditor: 5,
  compliance_officer: 5,
};

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userRole = (req as any).userRole as UserRole | undefined;

    if (!userRole) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Authentication required",
      });
      return;
    }

    const userLevel = roleHierarchy[userRole] ?? 0;
    const requiredLevel = Math.max(...allowedRoles.map((r) => roleHierarchy[r] ?? 0));

    if (userLevel < requiredLevel) {
      res.status(403).json({
        error: "Forbidden",
        message: `Required role: one of ${allowedRoles.join(", ")}`,
      });
      return;
    }

    next();
  };
}

export function requireSuperAdmin() {
  return requireRole("super_admin", "platform_admin");
}

export function requireTenantAdmin() {
  return requireRole("super_admin", "platform_admin", "tenant_owner", "tenant_admin");
}

export function requireTenantAccess() {
  return requireRole(
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
  );
}

export function requireCustomerAccess() {
  return requireRole(
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
  );
}

export function getTenantId(req: Request): string | undefined {
  const user = (req as any).user;
  return user?.tenantId;
}

export function ensureTenantAccess(req: Request, res: Response, next: NextFunction): void {
  const user = (req as any).user;
  const userRole = (req as any).userRole as UserRole | undefined;

  if (!user || !userRole) {
    res.status(401).json({ error: "Unauthorized", message: "Authentication required" });
    return;
  }

  const tenantId = req.params.tenantId ?? req.body.tenantId ?? req.query.tenantId;

  if (!tenantId) {
    next();
    return;
  }

  if (userRole === "super_admin" || userRole === "platform_admin") {
    next();
    return;
  }

  if (user.tenantId !== tenantId) {
    res.status(403).json({ error: "Forbidden", message: "Access denied to this tenant" });
    return;
  }

  next();
}