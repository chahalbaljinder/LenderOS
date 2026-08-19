import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useGetTenantDashboard, useGetLoanFunnel, useGetCollectionRate, useGetRevenueTrend } from "@workspace/api-client-react";
import { useParams, Link, useLocation } from "wouter";
import { Loader2, TrendingUp, TrendingDown, Users, CreditCard, DollarSign, AlertTriangle, ArrowUp, ArrowDown, Filter, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function TenantAnalyticsPage() {
  const params = useParams<{ tenantId: string }>();
  const [, setLocation] = useLocation();
  const tenantId = params.tenantId;

  const { data: dashboard, isLoading: dashboardLoading } = useGetTenantDashboard({ path: { tenantId: tenantId || "" } });
  const { data: funnel } = useGetLoanFunnel({ query: { tenantId: tenantId || "", period: "30d" } });
  const { data: collectionRate } = useGetCollectionRate({ query: { tenantId: tenantId || "", period: "30d" } });
  const { data: revenueTrend } = useGetRevenueTrend({ query: { tenantId: tenantId || "", period: "30d" } });

  if (dashboardLoading) {
    return (
      <DashboardLayout activeTab="analytics">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!dashboard) {
    return (
      <DashboardLayout activeTab="analytics">
        <div className="flex items-center justify-center h-64 text-zinc-400 font-mono">
          Tenant analytics not available
        </div>
      </DashboardLayout>
    );
  }

  const statCards = [
    { label: "Applications", value: dashboard.applications?.total?.toLocaleString() || "0", change: `${dashboard.applications?.approved || 0} approved`, icon: <CreditCard className="w-5 h-5" />, color: "text-blue-400", trend: "up" },
    { label: "Disbursed", value: dashboard.disbursals?.amount ? `₹${(dashboard.disbursals.amount / 10000000).toFixed(1)}Cr` : "₹0Cr", icon: <DollarSign className="w-5 h-5" />, color: "text-green-400", trend: "up" },
    { label: "Collections", value: dashboard.collections?.collected ? `₹${(dashboard.collections.collected / 10000000).toFixed(1)}Cr` : "₹0Cr", change: dashboard.collections?.rate ? `${dashboard.collections.rate.toFixed(1)}% rate` : undefined, icon: <DollarSign className="w-5 h-5" />, color: "text-yellow-400", trend: "up" },
    { label: "Revenue", value: dashboard.revenue?.total ? `₹${(dashboard.revenue.total / 10000000).toFixed(1)}Cr` : "₹0Cr", icon: <DollarSign className="w-5 h-5" />, color: "text-purple-400", trend: "up" },
    { label: "Customers", value: dashboard.customers?.total?.toLocaleString() || "0", change: `+${dashboard.customers?.new || 0} new`, icon: <Users className="w-5 h-5" />, color: "text-purple-400", trend: "up" },
    { label: "Default Rate", value: `${(dashboard.defaultRate || 0).toFixed(1)}%`, icon: <AlertTriangle className="w-5 h-5" />, color: "text-red-400", trend: "down" },
  ];

  return (
    <DashboardLayout activeTab="analytics">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 hover:bg-white/5 rounded transition-colors text-zinc-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-white mb-2">Tenant Analytics</h1>
              <p className="font-mono text-sm text-zinc-400">Operational performance and portfolio insights</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select className="bg-zinc-800 border-zinc-700 text-white rounded px-3 py-2 font-mono text-sm focus:ring-1 focus:ring-primary focus:border-primary">
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
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

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          {/* Loan Funnel */}
          {(funnel?.stages && funnel.stages.length > 0) && (
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5" /> Loan Funnel ({funnel.period})
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

          {/* Collection Rate */}
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
                <svg viewBox="0 0 600 200" className="w-full h-full">
                  {collectionRate.trend.map((point: any, index: number) => (
                    <g key={point.date}>
                      <circle
                        cx={(index / (collectionRate.trend.length - 1)) * 580 + 10}
                        cy={200 - (point.rate / 100) * 180 - 10}
                        r="3"
                        fill="#00cc88"
                      />
                      {index > 0 && (
                        <line
                          x1={((index - 1) / (collectionRate.trend.length - 1)) * 580 + 10}
                          y1={200 - (collectionRate.trend[index - 1].rate / 100) * 180 - 10}
                          x2={(index / (collectionRate.trend.length - 1)) * 580 + 10}
                          y2={200 - (point.rate / 100) * 180 - 10}
                          stroke="#00cc88"
                          strokeWidth="2"
                        />
                      )}
                    </g>
                  ))}
                </svg>
              </div>
              <div className="flex justify-between mt-2 text-xs font-mono text-zinc-500">
                <span>{format(new Date(collectionRate.trend[0].date), "MMM d")}</span>
                <span>{format(new Date(collectionRate.trend[collectionRate.trend.length - 1].date), "MMM d")}</span>
              </div>
            </div>
          )}

          {/* Revenue Trend */}
          {(revenueTrend?.trend && revenueTrend.trend.length > 0) && (
            <div className="bg-card border border-border rounded-lg p-6 lg:col-span-2">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5" /> Revenue Trend ({revenueTrend.period}) — Total: {revenueTrend.total ? `₹${(revenueTrend.total / 10000000).toFixed(1)}Cr` : "₹0"}
              </h2>
              <div className="h-64">
                <svg viewBox="0 0 800 200" className="w-full h-full">
                  {revenueTrend.trend.map((point: any, index: number) => {
                    const maxTotal = Math.max(...revenueTrend.trend.map((p: any) => p.total || 1));
                    const x = (index / (revenueTrend.trend.length - 1)) * 780 + 10;
                    const y = 200 - (point.total / maxTotal) * 180 - 10;
                    return (
                      <g key={point.date}>
                        <circle cx={x} cy={y} r="3" fill="#00cc88" />
                        {index > 0 && (
                          <line
                            x1={((index - 1) / (revenueTrend.trend.length - 1)) * 780 + 10}
                            y1={200 - (revenueTrend.trend[index - 1].total / maxTotal) * 180 - 10}
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

        {/* Application Details */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5" /> Application Pipeline
          </h2>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="bg-card border border-border p-4">
              <p className="font-mono text-xs text-zinc-400 mb-1">Total</p>
              <p className="text-2xl font-bold text-white">{dashboard.applications?.total?.toLocaleString() || "0"}</p>
            </div>
            <div className="bg-card border border-border p-4">
              <p className="font-mono text-xs text-zinc-400 mb-1">Approved</p>
              <p className="text-2xl font-bold text-green-400">{dashboard.applications?.approved?.toLocaleString() || "0"}</p>
            </div>
            <div className="bg-card border border-border p-4">
              <p className="font-mono text-xs text-zinc-400 mb-1">Rejected</p>
              <p className="text-2xl font-bold text-red-400">{dashboard.applications?.rejected?.toLocaleString() || "0"}</p>
            </div>
            <div className="bg-card border border-border p-4">
              <p className="font-mono text-xs text-zinc-400 mb-1">Pending</p>
              <p className="text-2xl font-bold text-yellow-400">{dashboard.applications?.pending?.toLocaleString() || "0"}</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}