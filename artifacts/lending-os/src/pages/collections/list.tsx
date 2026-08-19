import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useListCollections, useGetCollectionRate } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { ShieldAlert, AlertTriangle, ArrowRight, MoreHorizontal, TrendingUp, TrendingDown, DollarSign, Users, Clock, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function CollectionsList() {
  const [, setLocation] = useLocation();
  const [showPerformance, setShowPerformance] = useState(true);
  const { data: collectionsRes, isLoading } = useListCollections();
  const { data: collectionRate, isLoading: rateLoading } = useGetCollectionRate({ query: { period: "30d" } });

  const columns: import("@/components/ui/data-table").Column<any>[] = [
    {
      key: "customer",
      header: "Customer",
      accessor: (row: any) => (
        <div>
          <div className="font-medium text-white">{row.customerName}</div>
          <div className="text-xs font-mono text-zinc-500">{row.loanNumber || row.loanId?.slice(0, 8)}</div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "dpd",
      header: "DPD",
      accessor: (row: any) => {
        const dpd = row.dpd || 0;
        return (
          <span className={cn("font-mono text-sm font-medium", dpd > 90 ? "text-destructive" : dpd > 30 ? "text-yellow-500" : dpd > 0 ? "text-blue-500" : "text-primary")}>
            {dpd === 0 ? "Current" : `${dpd} Days`}
          </span>
        );
      },
      width: "100px",
      sortable: true,
    },
    {
      key: "overdueAmount",
      header: "Overdue",
      accessor: (row: any) => (
        <div className="font-mono text-sm text-white text-right">₹{row.overdueAmount?.toLocaleString()}</div>
      ),
      align: "right" as const,
      width: "140px",
      sortable: true,
    },
    {
      key: "aiPriorityScore",
      header: "Priority",
      accessor: (row: any) => (
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-500",
                row.aiPriorityScore > 80 ? "bg-destructive" : row.aiPriorityScore > 50 ? "bg-yellow-500" : "bg-primary"
              )}
              style={{ width: `${row.aiPriorityScore || 0}%` }}
            />
          </div>
          <span className="font-mono text-xs text-zinc-400">{row.aiPriorityScore}/100</span>
        </div>
      ),
      width: "150px",
      hideOnMobile: true,
    },
    {
      key: "status",
      header: "Status",
      accessor: (row: any) => (
        <StatusBadge status={row.status} />
      ),
      width: "130px",
    },
  ];

  const data = collectionsRes?.data || [];
  const isEmpty = !isLoading && data.length === 0;

  const stats = [
    {
      label: "Accounts at Risk",
      value: collectionsRes?.data?.length || 0,
      icon: ShieldAlert,
      color: "text-yellow-500",
    },
    {
      label: "Critical (90+ DPD)",
      value: collectionsRes?.data?.filter((c: any) => (c.dpd || 0) > 90).length || 0,
      icon: AlertTriangle,
      color: "text-destructive",
    },
    {
      label: "Total Value at Risk",
      value: `₹${((collectionsRes?.data?.reduce((a: number, b: any) => a + (b.overdueAmount || 0), 0) || 0) / 100000).toFixed(1)}L`,
      icon: MoreHorizontal,
      color: "text-white",
    },
  ];

  const perfStats = [
    {
      label: "Collection Rate (30d)",
      value: rateLoading ? "—" : `${collectionRate?.overallRate?.toFixed(1) || 0}%`,
      icon: TrendingUp,
      color: "text-green-400",
    },
    {
      label: "Collected (30d)",
      value: collectionRate?.trend && collectionRate.trend.length > 0
        ? `₹${(collectionRate.trend[collectionRate.trend.length - 1].collected / 100000).toFixed(1)}L`
        : "₹0L",
      icon: DollarSign,
      color: "text-green-400",
    },
    {
      label: "Resolved Cases",
      value: collectionsRes?.data?.filter((c: any) => c.status === "resolved").length || 0,
      icon: CheckCircle,
      color: "text-blue-400",
    },
    {
      label: "Avg. Resolution",
      value: (() => {
        const resolved = collectionsRes?.data?.filter((c: any) => c.status === "resolved" && c.lastContactAt && c.createdAt);
        if (!resolved?.length) return "—";
        const avgDays = resolved.reduce((sum: number, c: any) => sum + (new Date(c.lastContactAt).getTime() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24), 0) / resolved.length;
        return `${avgDays.toFixed(1)}d`;
      })(),
      icon: Clock,
      color: "text-yellow-500",
    },
  ];

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

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="bg-card border border-border p-6 flex flex-col items-center text-center">
              <stat.icon className={`w-6 h-6 ${stat.color} mb-2`} aria-hidden="true" />
              <div className="font-mono text-sm text-zinc-400 mb-2">{stat.label.toUpperCase()}</div>
              <div className="text-3xl font-bold font-mono">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Performance Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {perfStats.map((stat, i) => (
            <div key={i} className="bg-card border border-border p-6 flex flex-col items-center text-center">
              <stat.icon className={`w-6 h-6 ${stat.color} mb-2`} aria-hidden="true" />
              <div className="font-mono text-sm text-zinc-400 mb-2">{stat.label.toUpperCase()}</div>
              <div className="text-3xl font-bold font-mono">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Collection Performance Dashboard */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-mono text-sm uppercase text-primary">Collection Performance (30 Days)</h3>
            <button
              onClick={() => setShowPerformance(!showPerformance)}
              className="px-3 py-1.5 border border-zinc-700 text-zinc-300 hover:bg-white/5 font-mono text-xs rounded transition-colors flex items-center gap-1"
            >
              {showPerformance ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
              {showPerformance ? "Hide" : "Show"} Performance
            </button>
          </div>

          {showPerformance && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-card border border-border p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs text-zinc-400">Overall Collection Rate</span>
                  <TrendingUp className="w-4 h-4 text-green-400" />
                </div>
                <div className="text-3xl font-bold font-mono text-white">
                  {rateLoading ? "—" : `${collectionRate?.overallRate?.toFixed(1) || "—"}%`}
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: `${collectionRate?.overallRate || 0}%` }} />
                </div>
              </div>

              <div className="bg-card border border-border p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs text-zinc-400">Total Collected</span>
                  <DollarSign className="w-4 h-4 text-green-400" />
                </div>
                <div className="text-3xl font-bold font-mono text-green-400">
                  {collectionRate?.trend && collectionRate.trend.length > 0
                    ? `₹${(collectionRate.trend[collectionRate.trend.length - 1].collected / 100000).toFixed(1)}L`
                    : "—"}
                </div>
                <p className="font-mono text-xs text-zinc-400 mt-1">This period</p>
              </div>

              <div className="bg-card border border-border p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs text-zinc-400">Total Overdue</span>
                  <DollarSign className="w-4 h-4 text-yellow-500" />
                </div>
                <div className="text-3xl font-bold font-mono text-yellow-500">
                  {collectionRate?.trend && collectionRate.trend.length > 0
                    ? `₹${(collectionRate.trend[collectionRate.trend.length - 1].overdue / 100000).toFixed(1)}L`
                    : "—"}
                </div>
                <p className="font-mono text-xs text-zinc-400 mt-1">Outstanding</p>
              </div>

              <div className="bg-card border border-border p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs text-zinc-400">Cases Resolved</span>
                  <CheckCircle className="w-4 h-4 text-green-400" />
                </div>
                <div className="text-3xl font-bold font-mono text-white">
                  {collectionsRes?.data?.filter((c: any) => c.status === "resolved").length || 0}
                </div>
                <p className="font-mono text-xs text-zinc-400 mt-1">Of {collectionsRes?.data?.length || 0} total</p>
              </div>
            </div>
          )}

          {/* Collection Rate Trend - outside grid to avoid JSX parsing issues */}
          {collectionRate?.trend && collectionRate.trend.length > 0 && (
            <div className="bg-card border border-border rounded-lg p-5 mb-6">
              <h4 className="font-mono text-xs text-zinc-400 mb-3">Collection Rate Trend (30 Days)</h4>
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

          {/* Agent Performance Summary */}
          <div className="mb-8">
            <h3 className="font-mono text-sm uppercase text-primary mb-4">Agent Performance Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card border border-border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span className="font-mono text-xs text-zinc-400">Total Agents</span>
                </div>
                <div className="text-2xl font-bold font-mono text-white">
                  {new Set(collectionsRes?.data?.map((c: any) => c.assignedTo).filter(Boolean)).size || 0}
                </div>
              </div>
              <div className="bg-card border border-border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="font-mono text-xs text-zinc-400">Resolved This Month</span>
                </div>
                <div className="text-2xl font-bold font-mono text-green-400">
                  {collectionsRes?.data?.filter((c: any) => c.status === "resolved" && c.lastContactAt && new Date(c.lastContactAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length || 0}
                </div>
              </div>
              <div className="bg-card border border-border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-yellow-500" />
                  <span className="font-mono text-xs text-zinc-400">Avg. Resolution Time</span>
                </div>
                <div className="text-2xl font-bold font-mono text-white">
                  {(() => {
                    const resolved = collectionsRes?.data?.filter((c: any) => c.status === "resolved" && c.lastContactAt && c.createdAt);
                    if (!resolved?.length) return "—";
                    const avgDays = resolved.reduce((sum: number, c: any) => sum + (new Date(c.lastContactAt).getTime() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24), 0) / resolved.length;
                    return `${avgDays.toFixed(1)} days`;
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>

        <h3 className="font-mono text-sm uppercase text-primary mb-4">AI Prioritized Queue</h3>

        {isEmpty ? (
          <EmptyState
            illustration="search"
            title="No Collection Cases"
            description="All accounts are current. Overdue accounts will be prioritized here automatically."
          />
        ) : (
          <DataTable
            columns={columns}
            data={data}
            isLoading={isLoading}
            rowKey={(row) => row.id}
            emptyMessage="No collection cases pending"
            showSearch
            searchPlaceholder="Search by customer name or loan number..."
            pagination={{
              page: 1,
              pageSize: 20,
              total: collectionsRes?.total || 0,
              onPageChange: () => {},
              pageSizeOptions: [10, 25, 50, 100],
            }}
            rowActions={[
              {
                label: "Action",
                icon: <ArrowRight className="w-3 h-3" />,
                variant: "outline",
                onClick: (row) => {},
              },
            ]}
            onRowClick={(row) => setLocation(`/collections/${row.id}`)}
            ariaLabel="Collections queue table"
          />
        )}
      </div>
    </DashboardLayout>
  );
}