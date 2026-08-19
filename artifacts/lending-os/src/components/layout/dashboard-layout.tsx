import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { LogOut, Settings, Users, Activity, Wallet, Shield, Briefcase, FileText, ShieldCheck, UserCheck, ChevronDown, Mail } from "lucide-react";
import { useGetMe } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useClerk, useAuth } from "@clerk/react";

// Mirror the same check used in App.tsx — avoids calling useClerk() outside <ClerkProvider>.
const _rawKey = (import.meta as any).env?.VITE_CLERK_PUBLISHABLE_KEY ?? "";
const isClerkConfigured =
  Boolean(_rawKey) &&
  _rawKey !== "pk_test_your_key_here" &&
  !_rawKey.includes("your_key_here") &&
  _rawKey.startsWith("pk_");

export function DashboardLayout({
  children,
  activeTab,
  user: userProp,
}: {
  children: React.ReactNode;
  activeTab: string;
  user?: any;
}) {
  const { isLoaded, isSignedIn } = useAuth();
  const { data: userFromHook, isLoading, isError } = useGetMe();

  const user = userProp ?? userFromHook;

  // Wait for Clerk to load session before rendering
  if (!isLoaded || !isSignedIn) {
    return <div className="flex min-h-screen items-center justify-center font-mono text-primary animate-pulse">Loading session...</div>;
  }

  // If there's an auth error, don't render the layout
  if (isError && !userProp) {
    return <div className="flex min-h-screen items-center justify-center font-mono text-primary animate-pulse">Session expired, redirecting...</div>;
  }

  if (isLoading && !userProp) {
    return <div className="flex min-h-screen items-center justify-center font-mono text-primary animate-pulse">Loading Workspace...</div>;
  }

  const isSuper = user?.role === "super_admin" || user?.role === "platform_admin";

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row font-sans">
      <Sidebar isSuper={isSuper} activeTab={activeTab} user={user} />
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <Header user={user} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}

function Sidebar({
  isSuper,
  activeTab,
  user,
}: {
  isSuper: boolean;
  activeTab: string;
  user: any;
}) {
  const superLinks = [
    {
      id: "dashboard",
      label: "Platform Overview",
      icon: <Activity className="w-4 h-4" />,
      href: "/dashboard",
    },
    {
      id: "tenants",
      label: "Tenants",
      icon: <Briefcase className="w-4 h-4" />,
      href: "/tenants",
    },
    {
      id: "invitations",
      label: "Invitations",
      icon: <Mail className="w-4 h-4" />,
      href: "/invitations",
    },
    {
      id: "analytics",
      label: "Global Analytics",
      icon: <Activity className="w-4 h-4" />,
      href: "/platform/analytics",
    },
  ];

  const tenantLinks = [
    {
      id: "dashboard",
      label: "Command Center",
      icon: <Activity className="w-4 h-4" />,
      href: "/dashboard",
    },
    {
      id: "applications",
      label: "Applications",
      icon: <FileText className="w-4 h-4" />,
      href: "/applications",
    },
    {
      id: "customers",
      label: "Customers",
      icon: <Users className="w-4 h-4" />,
      href: "/customers",
    },
    {
      id: "loans",
      label: "Active Loans",
      icon: <Wallet className="w-4 h-4" />,
      href: "/loans",
    },
    {
      id: "collections",
      label: "Collections",
      icon: <Shield className="w-4 h-4" />,
      href: "/collections",
    },
    {
      id: "products",
      label: "Loan Products",
      icon: <Briefcase className="w-4 h-4" />,
      href: "/products",
    },
    {
      id: "audit",
      label: "Audit Logs",
      icon: <Shield className="w-4 h-4" />,
      href: "/audit",
    },
    {
      id: "settings",
      label: "Tenant Settings",
      icon: <Settings className="w-4 h-4" />,
      href: "/settings",
    },
    {
      id: "invitations",
      label: "Invitations",
      icon: <Mail className="w-4 h-4" />,
      href: "/invitations",
    },
  ];

  const links = isSuper ? superLinks : tenantLinks;

  return (
    <aside className="w-full md:w-64 border-r border-border bg-card flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <img src="/logo.svg" alt="LendingOS" className="h-5" />
      </div>

      {/* Demo mode indicator */}
      {!isClerkConfigured && (
        <div className="mx-3 mt-3 px-3 py-2 bg-emerald-950/60 border border-emerald-500/30 rounded flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-xs font-mono text-emerald-300">Demo Mode Active</span>
          </div>
        </div>
      )}

      {!isSuper && user?.tenantName && (
        <div className="px-6 py-4 border-b border-border bg-card/50">
          <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">
            Active Tenant
          </div>
          <div className="font-semibold flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            {user.tenantName}
          </div>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {links.map((link) => {
          const active = activeTab === link.id;
          return (
            <Link
              key={link.id}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2 text-sm font-mono transition-colors ${
                active
                  ? "bg-primary/10 text-primary border-l-2 border-primary"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white border-l-2 border-transparent"
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="h-8 w-8 bg-zinc-800 flex items-center justify-center font-mono text-xs text-white">
            {user?.firstName?.[0] || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">
              {user?.firstName} {user?.lastName}
            </div>
            <div className="text-xs font-mono text-zinc-300 truncate">
              {user?.role}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function DemoRoleSwitcher() {
  const queryClient = useQueryClient();
  const [currentDemoId, setCurrentDemoId] = useState<string>(() => {
    return localStorage.getItem("lenderos_demo_user_id") || "user_demo_super_admin";
  });

  const demoAccounts = [
    { id: "user_demo_super_admin", label: "👑 Super Admin (Arjun Sharma)" },
    { id: "user_demo_tenant_admin_t1", label: "🏢 Tenant Admin (Priya Mehta - CapitalFirst)" },
    { id: "user_demo_rm_t2", label: "💼 RM (Rahul Gupta - Swift Fintech)" },
    { id: "user_demo_customer_c1", label: "👤 Customer (Vikram Singh)" },
  ];

  const handleSwitch = (newId: string) => {
    localStorage.setItem("lenderos_demo_user_id", newId);
    setCurrentDemoId(newId);
    queryClient.clear();
    window.location.reload();
  };

  return (
    <div className="flex items-center gap-2 border border-emerald-500/40 bg-emerald-950/40 px-3 py-1.5 rounded">
      <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
      <span className="text-xs font-mono text-emerald-300 hidden lg:inline">Switch Role:</span>
      <select
        value={currentDemoId}
        onChange={(e) => handleSwitch(e.target.value)}
        className="bg-black text-xs font-mono text-emerald-200 border border-emerald-800 rounded px-2 py-1 focus:outline-none focus:border-emerald-400 cursor-pointer"
      >
        {demoAccounts.map((acc) => (
          <option key={acc.id} value={acc.id}>
            {acc.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function Header({ user }: { user: any }) {
  const [, setLocation] = useLocation();
  const { signOut } = useClerk();

  const handleSignOut = async () => {
    if (isClerkConfigured) {
      await signOut({ redirectUrl: "/" });
    } else {
      localStorage.removeItem("lenderos_demo_user_id");
      setLocation("/");
    }
  };

  return (
    <header className="h-16 border-b border-border bg-card/50 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm font-mono text-zinc-500">
          <span className="text-primary animate-pulse">●</span> SYSTEM_ONLINE
        </div>
        {!isClerkConfigured && <DemoRoleSwitcher />}
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 text-xs font-mono border border-border px-3 py-1 bg-background">
          <span className="text-zinc-300">USER:</span>
          <span className="text-foreground">{user?.email}</span>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-sm font-mono text-zinc-300 hover:text-white transition-colors p-2"
          title={isClerkConfigured ? "Disconnect Session" : "Exit Demo"}
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
