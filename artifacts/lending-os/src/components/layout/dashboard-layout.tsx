import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useClerk } from "@clerk/react";
import { LogOut, Settings, Users, Activity, Wallet, Shield, Home, Briefcase, FileText, ChevronDown } from "lucide-react";
import { useGetMe } from "@workspace/api-client-react";

export function DashboardLayout({ children, activeTab }: { children: React.ReactNode, activeTab: string }) {
  const { data: user } = useGetMe();
  const isSuper = user?.role === 'super_admin' || user?.role === 'platform_admin';
  
  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row font-sans">
      <Sidebar isSuper={isSuper} activeTab={activeTab} user={user} />
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <Header user={user} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function Sidebar({ isSuper, activeTab, user }: { isSuper: boolean, activeTab: string, user: any }) {
  const superLinks = [
    { id: 'dashboard', label: 'Platform Overview', icon: <Activity className="w-4 h-4" />, href: '/dashboard' },
    { id: 'tenants', label: 'Tenants', icon: <Briefcase className="w-4 h-4" />, href: '/tenants' },
    { id: 'analytics', label: 'Global Analytics', icon: <Activity className="w-4 h-4" />, href: '/platform/analytics' },
  ];

  const tenantLinks = [
    { id: 'dashboard', label: 'Command Center', icon: <Activity className="w-4 h-4" />, href: '/dashboard' },
    { id: 'applications', label: 'Applications', icon: <FileText className="w-4 h-4" />, href: '/applications' },
    { id: 'customers', label: 'Customers', icon: <Users className="w-4 h-4" />, href: '/customers' },
    { id: 'loans', label: 'Active Loans', icon: <Wallet className="w-4 h-4" />, href: '/loans' },
    { id: 'collections', label: 'Collections', icon: <Shield className="w-4 h-4" />, href: '/collections' },
    { id: 'products', label: 'Loan Products', icon: <Briefcase className="w-4 h-4" />, href: '/products' },
    { id: 'audit', label: 'Audit Logs', icon: <Shield className="w-4 h-4" />, href: '/audit' },
    { id: 'settings', label: 'Tenant Settings', icon: <Settings className="w-4 h-4" />, href: '/settings' },
  ];

  const links = isSuper ? superLinks : tenantLinks;

  return (
    <aside className="w-full md:w-64 border-r border-border bg-card flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <img src="/logo.svg" alt="LendingOS" className="h-5" />
      </div>
      
      {!isSuper && user?.tenantName && (
        <div className="px-6 py-4 border-b border-border bg-card/50">
          <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">Active Tenant</div>
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
            <Link key={link.id} href={link.href} className={`flex items-center gap-3 px-3 py-2 text-sm font-mono transition-colors ${active ? 'bg-primary/10 text-primary border-l-2 border-primary' : 'text-zinc-400 hover:bg-white/5 hover:text-white border-l-2 border-transparent'}`}>
              {link.icon}
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="h-8 w-8 bg-zinc-800 flex items-center justify-center font-mono text-xs text-white">
            {user?.firstName?.[0] || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{user?.firstName} {user?.lastName}</div>
            <div className="text-xs font-mono text-zinc-500 truncate">{user?.role}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function Header({ user }: { user: any }) {
  const { signOut } = useClerk();
  
  return (
    <header className="h-16 border-b border-border bg-card/50 flex items-center justify-between px-6">
      <div className="flex items-center gap-2 text-sm font-mono text-zinc-500">
        <span className="text-primary animate-pulse">●</span> SYSTEM_ONLINE
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 text-xs font-mono border border-border px-3 py-1 bg-background">
          <span className="text-zinc-500">USER:</span>
          <span className="text-white">{user?.email}</span>
        </div>
        <button 
          onClick={() => signOut({ redirectUrl: '/' })}
          className="flex items-center gap-2 text-sm font-mono text-zinc-400 hover:text-white transition-colors p-2"
          title="Disconnect Session"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
