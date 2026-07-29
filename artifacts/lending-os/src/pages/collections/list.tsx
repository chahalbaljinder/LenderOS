import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useListCollections } from "@workspace/api-client-react";
import { ShieldAlert, AlertTriangle, Clock, ArrowRight } from "lucide-react";

export default function CollectionsList() {
  const { data: collectionsRes, isLoading } = useListCollections();

  return (
    <DashboardLayout activeTab="collections">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-white mb-2">Collections & NPA Management</h1>
            <p className="font-mono text-sm text-zinc-400">AI-prioritized queue of accounts in default.</p>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 border border-destructive/30 bg-destructive/10 text-destructive font-mono text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>High Risk Mode: ON</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card border border-border p-6 flex flex-col items-center text-center">
            <div className="font-mono text-sm text-zinc-400 mb-2">ACCOUNTS AT RISK</div>
            <div className="text-3xl font-bold font-mono text-yellow-500">24</div>
          </div>
          <div className="bg-card border border-border p-6 flex flex-col items-center text-center">
            <div className="font-mono text-sm text-zinc-400 mb-2">CRITICAL (90+ DPD)</div>
            <div className="text-3xl font-bold font-mono text-destructive">7</div>
          </div>
          <div className="bg-card border border-border p-6 flex flex-col items-center text-center">
            <div className="font-mono text-sm text-zinc-400 mb-2">TOTAL VALUE AT RISK</div>
            <div className="text-3xl font-bold font-mono text-white">₹4.2L</div>
          </div>
        </div>

        <h3 className="font-mono text-sm uppercase text-primary mb-4">AI Prioritized Queue</h3>
        <div className="bg-card border border-border overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center font-mono text-sm text-primary animate-pulse">FETCHING_QUEUE...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-black/50 font-mono text-xs uppercase text-zinc-500">
                  <th className="py-3 px-4 font-normal">Customer</th>
                  <th className="py-3 px-4 font-normal">DPD</th>
                  <th className="py-3 px-4 font-normal text-right">Overdue</th>
                  <th className="py-3 px-4 font-normal">Priority Score</th>
                  <th className="py-3 px-4 font-normal">Status</th>
                  <th className="py-3 px-4 font-normal"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {collectionsRes?.data.map((collection) => (
                  <tr key={collection.id} className="hover:bg-white/5 transition-colors group">
                    <td className="py-4 px-4">
                      <div className="text-sm font-semibold text-white">{collection.customerName}</div>
                      <div className="text-xs font-mono text-zinc-500">{collection.loanNumber || collection.loanId.slice(0, 8)}</div>
                    </td>
                    <td className="py-4 px-4 font-mono text-sm">
                      <span className={collection.dpd > 90 ? 'text-destructive font-bold' : collection.dpd > 30 ? 'text-yellow-500' : 'text-zinc-300'}>
                        {collection.dpd} Days
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono text-sm text-white text-right">
                      ₹{collection.overdueAmount?.toLocaleString()}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${collection.aiPriorityScore! > 80 ? 'bg-destructive' : collection.aiPriorityScore! > 50 ? 'bg-yellow-500' : 'bg-primary'}`}
                            style={{ width: `${collection.aiPriorityScore || 0}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs text-zinc-400">{collection.aiPriorityScore}/100</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-mono text-xs uppercase text-zinc-300">{collection.status.replace('_', ' ')}</span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button className="text-xs font-mono text-primary hover:text-white transition-colors opacity-0 group-hover:opacity-100 flex items-center justify-end gap-1 w-full">
                        ACTION <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
                {collectionsRes?.data.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-sm font-mono text-zinc-500">
                      NO_COLLECTIONS_PENDING
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
