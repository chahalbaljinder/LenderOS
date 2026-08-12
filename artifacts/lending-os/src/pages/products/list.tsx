import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useListLoanProducts } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Plus, Search, Filter, FileText, DollarSign, Calendar, MoreHorizontal, Shield, Edit, Trash2, ArrowRight } from "lucide-react";

export default function ProductsList() {
  const { data: productsRes, isLoading } = useListLoanProducts({ active: true });

  const columns: import("@/components/ui/data-table").Column<any>[] = [
    {
      key: 'name',
      header: 'Product Name',
      accessor: (row: any) => (
        <div>
          <div className="font-medium text-white">{row.name}</div>
          <div className="text-xs text-zinc-400 line-clamp-1">{row.description}</div>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'type',
      header: 'Type',
      accessor: (row: any) => (
        <span className="font-mono text-xs uppercase text-zinc-400">{row.type}</span>
      ),
      width: '120px',
      hideOnMobile: true,
    },
    {
      key: 'interestRate',
      header: 'Rate',
      accessor: (row: any) => (
        <div className="font-mono text-sm text-white">{row.interestRate}% <span className="text-zinc-500 text-xs">p.a.</span></div>
      ),
      width: '100px',
      sortable: true,
    },
    {
      key: 'amountRange',
      header: 'Amount Range',
      accessor: (row: any) => (
        <div className="font-mono text-sm text-zinc-300">
          ₹{row.minAmount?.toLocaleString()} - ₹{row.maxAmount?.toLocaleString()}
        </div>
      ),
      width: '160px',
      hideOnMobile: true,
    },
    {
      key: 'tenureRange',
      header: 'Tenure',
      accessor: (row: any) => (
        <div className="font-mono text-sm text-zinc-300">
          {row.minTenureMonths} - {row.maxTenureMonths} months
        </div>
      ),
      width: '130px',
      hideOnMobile: true,
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (row: any) => (
        <StatusBadge status={row.active ? 'active_product' : 'inactive'} />
      ),
      width: '120px',
    },
    {
      key: 'createdAt',
      header: 'Created',
      accessor: (row: any) => (
        <span className="font-mono text-xs text-zinc-500">{new Date(row.createdAt).toLocaleDateString()}</span>
      ),
      sortable: true,
      hideOnMobile: true,
    },
  ];

  const data = productsRes || [];
  const isEmpty = !isLoading && data.length === 0;

  return (
    <DashboardLayout activeTab="products">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-white mb-2">Loan Products</h1>
            <p className="font-mono text-sm text-zinc-400">Manage product catalog, pricing, and eligibility criteria.</p>
          </div>
          <Link href="/products/new" className="px-4 py-2 bg-white text-black hover:bg-zinc-200 font-semibold font-mono text-sm flex items-center gap-2 transition-colors">
            <Plus className="w-4 h-4" /> Create Product
          </Link>
        </div>

        {isEmpty ? (
          <EmptyState
            illustration="add"
            title="No Loan Products"
            description="Define your lending products with rates, terms, and eligibility criteria."
            action={{ label: "Create Product", icon: <Plus className="w-4 h-4" />, onClick: () => {} }}
          />
        ) : (
          <DataTable
            columns={columns}
            data={data}
            isLoading={isLoading}
            rowKey={(row) => row.id}
            emptyMessage="No loan products configured"
            showSearch
            searchPlaceholder="Search by product name or type..."
            pagination={{
              page: 1,
              pageSize: 20,
              total: data.length,
              onPageChange: () => {},
              pageSizeOptions: [10, 25, 50, 100],
            }}
            rowActions={[
              {
                label: 'Edit',
                icon: <Edit className="w-3 h-3" />,
                variant: 'outline',
                onClick: (row) => {},
              },
              {
                label: 'Archive',
                icon: <Trash2 className="w-3 h-3" />,
                variant: 'destructive',
                onClick: (row) => {},
              },
            ]}
            ariaLabel="Loan products table"
          />
        )}
      </div>
    </DashboardLayout>
  );
}