import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useListTenants } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Plus, Search, Building2, Server, Globe, PowerOff } from "lucide-react";

export default function TenantsList() {
  const { data: tenantsRes, isLoading } = useListTenants();

  return (
    <DashboardLayout activeTab="tenants">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-white mb-2">Tenant Environments</h1>
            <p className="font-mono text-sm text-zinc-400">Manage all lender instances deployed on LendingOS.</p>
          </div>
          <Link href="/tenants/new" className="px-4 py-2 bg-primary hover:bg-primary/90 text-black font-semibold font-mono text-sm flex items-center gap-2 transition-colors">
            <Plus className="w-4 h-4" /> New Environment
          </Link>
        </div>

        <div className="mb-6 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search by name or ID..." 
              className="w-full bg-card border border-border pl-10 pr-4 py-2 text-sm font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary"
            />
          </div>
          <select className="bg-card border border-border px-4 py-2 text-sm font-mono text-white focus:outline-none focus:border-primary appearance-none">
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        <div className="bg-card border border-border overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center font-mono text-sm text-primary animate-pulse">FETCHING_TENANTS...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-black/50 font-mono text-xs uppercase text-zinc-500">
                  <th className="py-3 px-4 font-normal">Tenant Name</th>
                  <th className="py-3 px-4 font-normal">Status</th>
                  <th className="py-3 px-4 font-normal">Type</th>
                  <th className="py-3 px-4 font-normal text-right">Volume</th>
                  <th className="py-3 px-4 font-normal">Created</th>
                  <th className="py-3 px-4 font-normal"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tenantsRes?.data.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-white/5 transition-colors group">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white">{tenant.name}</div>
                          <div className="text-xs font-mono text-zinc-500">{tenant.domain || 'no-domain.lendingos.dev'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-mono border ${
                        tenant.status === 'active' ? 'bg-primary/10 border-primary/20 text-primary' :
                        tenant.status === 'pending' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' :
                        'bg-red-500/10 border-red-500/20 text-red-500'
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {tenant.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono text-sm text-zinc-300 uppercase">{tenant.type}</td>
                    <td className="py-4 px-4 font-mono text-sm text-white text-right">
                      {tenant.totalDisbursed ? `₹${(tenant.totalDisbursed / 10000000).toFixed(1)}Cr` : '₹0.0Cr'}
                    </td>
                    <td className="py-4 px-4 font-mono text-xs text-zinc-500">
                      {new Date(tenant.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link href={`/tenants/${tenant.id}`} className="text-xs font-mono text-primary hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                        INSPECT →
                      </Link>
                    </td>
                  </tr>
                ))}
                {tenantsRes?.data.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-sm font-mono text-zinc-500">
                      NO_TENANTS_FOUND
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
