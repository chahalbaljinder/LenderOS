import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useListLoanApplications } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Plus, Search, Filter, Activity, Check, X, Clock, FileText } from "lucide-react";

export default function ApplicationsList() {
  const { data: appsRes, isLoading } = useListLoanApplications();

  const getStatusDisplay = (status: string) => {
    switch(status) {
      case 'approved': return { color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20', icon: <Check className="w-3 h-3" /> };
      case 'rejected': return { color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/20', icon: <X className="w-3 h-3" /> };
      case 'draft': return { color: 'text-zinc-400', bg: 'bg-zinc-800', border: 'border-zinc-700', icon: <FileText className="w-3 h-3" /> };
      default: return { color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', icon: <Activity className="w-3 h-3" /> };
    }
  };

  return (
    <DashboardLayout activeTab="applications">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-white mb-2">Loan Applications</h1>
            <p className="font-mono text-sm text-zinc-400">Manage underwriting queue and active applications.</p>
          </div>
          <Link href="/applications/new" className="px-4 py-2 bg-white text-black hover:bg-zinc-200 font-semibold font-mono text-sm flex items-center gap-2 transition-colors">
            <Plus className="w-4 h-4" /> New Application
          </Link>
        </div>

        <div className="mb-6 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search by APP ID or customer name..." 
              className="w-full bg-card border border-border pl-10 pr-4 py-2 text-sm font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border text-sm font-mono text-zinc-400 hover:text-white transition-colors">
            <Filter className="w-4 h-4" /> Filters
          </button>
        </div>

        <div className="bg-card border border-border overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center font-mono text-sm text-primary animate-pulse">FETCHING_APPLICATIONS...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-black/50 font-mono text-xs uppercase text-zinc-500">
                  <th className="py-3 px-4 font-normal">App ID</th>
                  <th className="py-3 px-4 font-normal">Customer</th>
                  <th className="py-3 px-4 font-normal">Product</th>
                  <th className="py-3 px-4 font-normal text-right">Amount</th>
                  <th className="py-3 px-4 font-normal">Status</th>
                  <th className="py-3 px-4 font-normal">Risk</th>
                  <th className="py-3 px-4 font-normal"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {appsRes?.data.map((app) => {
                  const statusInfo = getStatusDisplay(app.status);
                  return (
                    <tr key={app.id} className="hover:bg-white/5 transition-colors group">
                      <td className="py-4 px-4 font-mono text-sm text-zinc-400">
                        {app.applicationNumber || app.id.slice(0, 8)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm font-semibold text-white">{app.customerName || 'Unknown'}</div>
                        <div className="text-xs font-mono text-zinc-500">{(new Date(app.createdAt)).toLocaleDateString()}</div>
                      </td>
                      <td className="py-4 px-4 font-mono text-sm text-zinc-300">
                        {app.productName || 'Standard Loan'}
                      </td>
                      <td className="py-4 px-4 font-mono text-sm text-white text-right">
                        ₹{app.requestedAmount?.toLocaleString()}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-[10px] font-mono border uppercase tracking-wider ${statusInfo.bg} ${statusInfo.color} ${statusInfo.border}`}>
                          {statusInfo.icon}
                          {app.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {app.riskGrade ? (
                          <span className={`inline-flex font-mono text-sm font-bold ${['A1','A2'].includes(app.riskGrade) ? 'text-primary' : ['B1','B2'].includes(app.riskGrade) ? 'text-yellow-500' : 'text-destructive'}`}>
                            {app.riskGrade}
                          </span>
                        ) : (
                          <span className="font-mono text-xs text-zinc-600">PENDING</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Link href={`/applications/${app.id}`} className="text-xs font-mono text-primary hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                          REVIEW →
                        </Link>
                      </td>
                    </tr>
                  )
                })}
                {appsRes?.data.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-sm font-mono text-zinc-500">
                      NO_APPLICATIONS_IN_QUEUE
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
