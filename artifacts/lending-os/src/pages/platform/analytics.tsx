import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useGetPlatformSummary, useGetLoanFunnel, useGetCollectionRate, useGetRevenueTrend } from "@workspace/api-client-react";
import { Loader2, TrendingUp, TrendingDown, Users, CreditCard, DollarSign, AlertTriangle, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function PlatformAnalyticsPage() {
  const { data: summary, isLoading: summaryLoading } = useGetPlatformSummary();
  const { data: funnel } = useGetLoanFunnel({ query: { period: "30d" } });
  const { data: collectionRate } = useGetCollectionRate({ query: { period: "30d" } });
  const { data: revenueTrend } = useGetRevenueTrend({ query: { period: "30d" } });

  if (summaryLoading) {
    return (
      <DashboardLayout activeTab="analytics">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const statCards = [
    { label: "Total Tenants", value: summary?.totalTenants?.toLocaleString() || "0", change: summary?.pendingTenants ? `+${summary.pendingTenants} pending` : undefined, icon: <Users className="w-5 h-5" />, color: "text-blue-400", trend: "neutral" },
    { label: "Total Customers", value: summary?.totalCustomers?.toLocaleString() || "0", icon: <Users className="w-5 h-5" />, color: "text-purple-400", trend: "up" },
    { label: "Total Applications", value: summary?.totalApplications?.toLocaleString() || "0", icon: <CreditCard className="w-5 h-5" />, color: "text-orange-400", trend: "up" },
    { label: "Approved", value: summary?.approvedApplications?.toLocaleString() || "0", change: summary?.rejectedApplications ? `${summary.rejectedApplications} rejected` : undefined, icon: <AlertTriangle className="w-5 h-5" />, color: "text-green-400", trend: "up" },
    { label: "Total Disbursed", value: summary?.totalDisbursed ? `₹${(summary.totalDisbursed / 10000000).toFixed(1)}Cr` : "₹0.0Cr", icon: <DollarSign className="w-5 h-5" />, color: "text-yellow-400", trend: "up" },
    { label: "Outstanding", value: summary?.totalOutstanding ? `₹${(summary.totalOutstanding / 10000000).toFixed(1)}Cr` : "₹0.0Cr", icon: <DollarSign className="w-5 h-5" />, color: "text-red-400", trend: "down" },
    { label: "Default Rate", value: summary?.defaultRate ? `${summary.defaultRate.toFixed(1)}%` : "0%", change: summary?.collectionRate ? `Collection: ${summary.collectionRate.toFixed(1)}%` : undefined, icon: <AlertTriangle className="w-5 h-5" />, color: "text-red-400", trend: summary?.defaultRate && summary.defaultRate > 5 ? "down" : "up" },
    { label: "Platform Revenue", value: summary?.platformRevenue ? `₹${(summary.platformRevenue / 10000000).toFixed(1)}Cr` : "₹0.0Cr", icon: <DollarSign className="w-5 h-5" />, color: "text-green-400", trend: "up" },
  ];

  return (
    <DashboardLayout activeTab="analytics">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white mb-2">Platform Analytics</h1>
          <p className="font-mono text-sm text-zinc-400">Cross-tenant performance and risk signals</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
          {statCards.map((stat, index) => (
            <div key={stat.label} className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", stat.color.replace("text-", "bg-").replace("400", "100"))}>
                  {stat.icon}
                </div>
                {stat.trend === "up" && <ArrowUp className="w-4 h-4 text-green-400" />}
                {stat.trend === "down" && <ArrowDown className="w-4 h-4 text-red-400" />}
              </div>
              <p className="font-mono text-xs text-zinc-400 mb-1">{stat.label}</p>
              <p className="text-2xl font-semibold text-white">{stat.value}</p>
              {stat.change && <p className="font-mono text-xs text-zinc-500 mt-1">{stat.change}</p>}
            </div>
          ))}
        </div>

        {/* Top Tenants */}
        {summary?.topTenants && summary.topTenants.length > 0 && (
          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" /> Top Tenants by Disbursed
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-mono uppercase tracking-wider text-zinc-500 border-b border-border">
                    <th className="pb-3">Tenant</th>
                    <th className="pb-3 text-right">Disbursed</th>
                    <th className="pb-3 text-right">Applications</th>
                    <th className="pb-3 text-right">Customers</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {summary.topTenants.map((tenant: any, index: number) => (
                    <tr key={tenant.tenantId} className="hover:bg-white/5">
                      <td className="py-3 font-medium text-white">{tenant.name}</td>
                      <td className="py-3 text-right font-mono text-white">₹{tenant.disbursed ? (tenant.disbursed / 10000000).toFixed(1) + "Cr" : "0"}</td>
                      <td className="py-3 text-right font-mono text-zinc-400">{tenant.applications || 0}</td>
                      <td className="py-3 text-right font-mono text-zinc-400">{tenant.customers || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Funnel & Collection Rate */}
        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          {(funnel?.stages && funnel.stages.length > 0) && (
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingDown className="w-5 h-5" /> Loan Funnel ({funnel.period})
              </h2>
              <div className="space-y-3">
                {funnel.stages.map((stage: any, index: number) => (
                  <div key={stage.stage} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-white">{stage.stage.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</span>
                      <span className="font-mono text-white">{stage.count.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${index === 0 ? 100 : (stage.count / funnel.stages[0].count) * 100}%` }} />
                    </div>
                    {stage.dropoff && index > 0 && (
                      <p className="font-mono text-xs text-red-400 text-right">{stage.dropoff.toFixed(1)}% drop-off</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {(collectionRate?.trend && collectionRate.trend.length > 0) && (
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" /> Collection Rate ({collectionRate.period})
              </h2>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="font-mono text-xs text-zinc-400">Overall Rate</span>
                  <span className="font-semibold text-white">{collectionRate.overallRate.toFixed(1)}%</span>
                </div>
                <div className="h-4 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: `${collectionRate.overallRate}%` }} />
                </div>
              </div>
              <div className="h-48">
                <svg viewBox="0 0 400 200" className="w-full h-full">
                  {collectionRate.trend.map((point: any, index: number) => (
                    <g key={point.date}>
                      <circle
                        cx={(index / (collectionRate.trend.length - 1)) * 380 + 10}
                        cy={200 - (point.rate / 100) * 180 - 10}
                        r="4"
                        fill="#00cc88"
                      />
                      {index > 0 && (
                        <line
                          x1={((index - 1) / (collectionRate.trend.length - 1)) * 380 + 10}
                          y1={200 - (collectionRate.trend[index - 1].rate / 100) * 180 - 10}
                          x2={(index / (collectionRate.trend.length - 1)) * 380 + 10}
                          y2={200 - (point.rate / 100) * 180 - 10}
                          stroke="#00cc88"
                          strokeWidth="2"
                        />
                      )}
                    </g>
                  ))}
                </svg>
              </div>
            </div>
          )}

          {(revenueTrend?.trend && revenueTrend.trend.length > 0) && (
            <div className="bg-card border border-border rounded-lg p-6 lg:col-span-2">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5" /> Revenue Trend ({revenueTrend.period}) — Total: {revenueTrend.total ? `₹${(revenueTrend.total / 10000000).toFixed(1)}Cr` : "₹0"}
              </h2>
              <div className="h-64">
                <svg viewBox="0 0 800 200" className="w-full h-full">
                  {revenueTrend.trend.map((point: any, index: number) => {
                    const x = (index / (revenueTrend.trend.length - 1)) * 780 + 10;
                    const y = 200 - (point.total / (Math.max(...revenueTrend.trend.map((p: any) => p.total || 1))) * 180) - 10;
                    return (
                      <g key={point.date}>
                        <circle cx={x} cy={y} r="3" fill="#00cc88" />
                        {index > 0 && (
                          <line
                            x1={((index - 1) / (revenueTrend.trend.length - 1)) * 780 + 10}
                            y1={200 - (revenueTrend.trend[index - 1].total / (Math.max(...revenueTrend.trend.map((p: any) => p.total || 1))) * 180) - 10}
                            x2={x}
                            y2={y}
                            stroke="#00cc88"
                            strokeWidth="2"
                          />
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}