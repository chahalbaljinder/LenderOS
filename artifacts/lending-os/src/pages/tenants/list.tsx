import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useListTenants } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Plus, Search, Building2, ArrowRight } from "lucide-react";

export default function TenantsList() {
  const { data: tenantsRes, isLoading } = useListTenants();

  const columns: import("@/components/ui/data-table").Column<any>[] = [
    {
      key: "name",
      header: "Tenant Name",
      accessor: (row: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">{row.name}</div>
            <div className="text-xs font-mono text-zinc-500">{row.domain || "no-domain.lendingos.dev"}</div>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "status",
      header: "Status",
      accessor: (row: any) => (
        <StatusBadge status={row.status === "active" ? "active_tenant" : row.status === "pending" ? "pending_tenant" : "suspended"} />
      ),
      width: "130px",
    },
    {
      key: "type",
      header: "Type",
      accessor: (row: any) => (
        <span className="font-mono text-sm text-zinc-300 uppercase">{row.type}</span>
      ),
      width: "120px",
      hideOnMobile: true,
    },
    {
      key: "volume",
      header: "Volume",
      accessor: (row: any) => (
        <div className="font-mono text-sm text-white text-right">
          {row.totalDisbursed ? `₹${(row.totalDisbursed / 10000000).toFixed(1)}Cr` : "₹0.0Cr"}
        </div>
      ),
      align: "right" as const,
      width: "140px",
      sortable: true,
    },
    {
      key: "createdAt",
      header: "Created",
      accessor: (row: any) => (
        <span className="font-mono text-xs text-zinc-500">{new Date(row.createdAt).toLocaleDateString()}</span>
      ),
      width: "130px",
      sortable: true,
      hideOnMobile: true,
    },
  ];

  const data = tenantsRes?.data || [];
  const isEmpty = !isLoading && data.length === 0;

  return (
    <DashboardLayout activeTab="tenants">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-white mb-2">Tenant Environments</h1>
            <p className="font-mono text-sm text-zinc-400">Manage all lender instances deployed on LenderOS.</p>
          </div>
          <Link href="/tenants/new" className="px-4 py-2 bg-primary hover:bg-primary/90 text-black font-semibold font-mono text-sm flex items-center gap-2 transition-colors">
            <Plus className="w-4 h-4" /> New Environment
          </Link>
        </div>

        {isEmpty ? (
          <EmptyState
            illustration="add"
            title="No Tenant Environments"
            description="Deploy your first lender instance to start onboarding customers and processing loans."
            action={{ label: "Create Environment", icon: <Plus className="w-4 h-4" />, onClick: () => {} }}
          />
        ) : (
          <DataTable
            columns={columns}
            data={data}
            isLoading={isLoading}
            rowKey={(row) => row.id}
            emptyMessage="No tenant environments found"
            showSearch
            searchPlaceholder="Search by name or domain..."
            pagination={{
              page: 1,
              pageSize: 20,
              total: tenantsRes?.total || 0,
              onPageChange: () => {},
              pageSizeOptions: [10, 25, 50, 100],
            }}
            rowActions={[
              {
                label: "Inspect",
                icon: <ArrowRight className="w-3 h-3" />,
                variant: "outline",
                onClick: (row, e) => { e.stopPropagation(); },
              },
            ]}
            onRowClick={(row) => {}}
            ariaLabel="Tenant environments table"
          />
        )}
      </div>
    </DashboardLayout>
  );
}