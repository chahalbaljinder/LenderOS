import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useListLoanApplications } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Plus, Search, Filter, MoreHorizontal, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ApplicationsList() {
  const { data: appsRes, isLoading } = useListLoanApplications();

  const columns: import("@/components/ui/data-table").Column<any>[] = [
    {
      key: "appId",
      header: "App ID",
      accessor: (row: any) => (
        <span className="font-mono text-sm text-zinc-400">{row.applicationNumber || row.id.slice(0, 8).toUpperCase()}</span>
      ),
      width: "120px",
      sortable: true,
    },
    {
      key: "customer",
      header: "Customer",
      accessor: (row: any) => (
        <div>
          <div className="font-medium text-white">{row.customerName || "Unknown"}</div>
          <div className="text-xs font-mono text-zinc-500">{(new Date(row.createdAt)).toLocaleDateString()}</div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "product",
      header: "Product",
      accessor: (row: any) => (
        <span className="font-mono text-sm text-zinc-300">{row.productName || "Standard Loan"}</span>
      ),
      hideOnMobile: true,
    },
    {
      key: "amount",
      header: "Amount",
      accessor: (row: any) => (
        <div className="font-mono text-sm text-white text-right">₹{row.requestedAmount?.toLocaleString()}</div>
      ),
      align: "right" as const,
      width: "140px",
      sortable: true,
    },
    {
      key: "status",
      header: "Status",
      accessor: (row: any) => (
        <StatusBadge status={row.status} />
      ),
      width: "140px",
    },
    {
      key: "risk",
      header: "Risk Grade",
      accessor: (row: any) => {
        const grade = row.riskGrade;
        if (!grade) return <span className="font-mono text-xs text-zinc-600">PENDING</span>;
        return (
          <span className={cn(
            "inline-flex font-mono text-sm font-bold px-2 py-1 rounded",
            ["A1", "A2"].includes(grade) ? "bg-primary/10 text-primary" :
            ["B1", "B2"].includes(grade) ? "bg-yellow-500/10 text-yellow-500" : "bg-destructive/10 text-destructive"
          )}>
            {grade}
          </span>
        );
      },
      width: "110px",
      hideOnMobile: true,
    },
  ];

  const data = appsRes?.data || [];
  const isEmpty = !isLoading && data.length === 0;

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

        {isEmpty ? (
          <EmptyState
            illustration="add"
            title="No Applications Yet"
            description="Start by creating your first loan application. The underwriting queue will populate here."
            action={{ label: "Create Application", icon: <Plus className="w-4 h-4" />, onClick: () => {} }}
          />
        ) : (
          <DataTable
            columns={columns}
            data={data}
            isLoading={isLoading}
            rowKey={(row) => row.id}
            emptyMessage="No applications in queue"
            showSearch
            searchPlaceholder="Search by APP ID or customer name..."
            pagination={{
              page: 1,
              pageSize: 20,
              total: appsRes?.total || 0,
              onPageChange: () => {},
              pageSizeOptions: [10, 25, 50, 100],
            }}
            rowActions={[
              {
                label: "Review",
                icon: <ArrowRight className="w-3 h-3" />,
                variant: "outline",
                onClick: (row, e) => { e.stopPropagation(); },
              },
            ]}
            onRowClick={(row) => {}}
            ariaLabel="Loan applications table"
          />
        )}
      </div>
    </DashboardLayout>
  );
}