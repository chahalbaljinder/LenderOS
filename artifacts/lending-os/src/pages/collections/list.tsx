import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useListCollections } from "@workspace/api-client-react";
import { ShieldAlert, AlertTriangle, ArrowRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CollectionsList() {
  const { data: collectionsRes, isLoading } = useListCollections();

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
      value: collectionsRes?.data?.length || 24,
      icon: ShieldAlert,
      color: "text-yellow-500",
    },
    {
      label: "Critical (90+ DPD)",
      value: collectionsRes?.data?.filter((c: any) => (c.dpd || 0) > 90).length || 7,
      icon: AlertTriangle,
      color: "text-destructive",
    },
    {
      label: "Total Value at Risk",
      value: `₹${((collectionsRes?.data?.reduce((a: number, b: any) => a + (b.overdueAmount || 0), 0) || 420000) / 100000).toFixed(1)}L`,
      icon: MoreHorizontal,
      color: "text-white",
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="bg-card border border-border p-6 flex flex-col items-center text-center">
              <stat.icon className={`w-6 h-6 ${stat.color} mb-2`} aria-hidden="true" />
              <div className="font-mono text-sm text-zinc-400 mb-2">{stat.label.toUpperCase()}</div>
              <div className="text-3xl font-bold font-mono">{stat.value}</div>
            </div>
          ))}
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
            ariaLabel="Collections queue table"
          />
        )}
      </div>
    </DashboardLayout>
  );
}