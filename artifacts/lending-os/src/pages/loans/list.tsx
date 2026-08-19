import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useListLoans } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { Plus, Search, Filter, CreditCard, DollarSign, Calendar, MoreHorizontal, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoansList() {
  const [, setLocation] = useLocation();
  const { data: loansRes, isLoading } = useListLoans();

  const columns: import("@/components/ui/data-table").Column<any>[] = [
    {
      key: 'loanNumber',
      header: 'Loan #',
      accessor: (row: any) => (
        <div className="font-mono text-sm text-white">{row.loanNumber || row.id.slice(0, 8).toUpperCase()}</div>
      ),
      sortable: true,
    },
    {
      key: 'customer',
      header: 'Customer',
      accessor: (row: any) => (
        <div>
          <div className="font-medium text-white">{row.customerName}</div>
          <div className="text-xs font-mono text-zinc-500">{row.productName}</div>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'principal',
      header: 'Principal',
      accessor: (row: any) => (
        <div className="font-mono text-sm text-white text-right">₹{row.principalAmount?.toLocaleString()}</div>
      ),
      align: 'right' as const,
      width: '140px',
    },
    {
      key: 'outstanding',
      header: 'Outstanding',
      accessor: (row: any) => (
        <div className="font-mono text-sm text-primary text-right">₹{row.outstandingAmount?.toLocaleString()}</div>
      ),
      align: 'right' as const,
      width: '140px',
      hideOnMobile: true,
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (row: any) => (
        <StatusBadge status={row.status} />
      ),
      width: '130px',
    },
    {
      key: 'nextDueDate',
      header: 'Next Due',
      accessor: (row: any) => (
        <div className="font-mono text-sm text-zinc-300">{row.nextDueDate ? new Date(row.nextDueDate).toLocaleDateString() : '—'}</div>
      ),
      width: '130px',
      hideOnMobile: true,
    },
    {
      key: 'dpd',
      header: 'DPD',
      accessor: (row: any) => {
        const dpd = row.dpd || 0;
        return (
          <span className={cn(
            "font-mono text-sm font-medium",
            dpd > 90 ? 'text-destructive' : dpd > 30 ? 'text-yellow-500' : dpd > 0 ? 'text-blue-500' : 'text-primary'
          )}>
            {dpd === 0 ? 'Current' : `${dpd} days`}
          </span>
        );
      },
      width: '100px',
    },
  ];

  const data = loansRes?.data || [];
  const isEmpty = !isLoading && data.length === 0;

  return (
    <DashboardLayout activeTab="loans">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-white mb-2">Active Loans</h1>
            <p className="font-mono text-sm text-zinc-400">Manage disbursed loans and repayment schedules.</p>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border p-4 rounded-lg">
            <div className="font-mono text-xs text-zinc-400 mb-1">Total Outstanding</div>
            <div className="text-2xl font-bold font-mono text-white">₹{((loansRes?.data ?? []).reduce((a: number, b: any) => a + (b.outstandingAmount || 0), 0) || 0).toLocaleString()}</div>
          </div>
          <div className="bg-card border border-border p-4 rounded-lg">
            <div className="font-mono text-xs text-zinc-400 mb-1">Active Loans</div>
            <div className="text-2xl font-bold font-mono text-white">{(loansRes?.data ?? []).filter((l: any) => l.status === 'active').length}</div>
          </div>
          <div className="bg-card border border-border p-4 rounded-lg">
            <div className="font-mono text-xs text-zinc-400 mb-1">Overdue ({'>'}30 DPD)</div>
            <div className="text-2xl font-bold font-mono text-yellow-500">{(loansRes?.data ?? []).filter((l: any) => (l.dpd || 0) > 30).length}</div>
          </div>
          <div className="bg-card border border-border p-4 rounded-lg">
            <div className="font-mono text-xs text-zinc-400 mb-1">NPA ({'>'}90 DPD)</div>
            <div className="text-2xl font-bold font-mono text-destructive">{(loansRes?.data ?? []).filter((l: any) => (l.dpd || 0) > 90).length}</div>
          </div>
        </div>

        {isEmpty ? (
          <EmptyState
            illustration="data"
            title="No Active Loans"
            description="Approved and disbursed loans will appear here for portfolio management."
            action={{ label: "View Applications", variant: "outline", onClick: () => {} }}
          />
        ) : (
          <DataTable
            columns={columns}
            data={data}
            isLoading={isLoading}
            rowKey={(row) => row.id}
            emptyMessage="No active loans"
            showSearch
            searchPlaceholder="Search by loan #, customer, or product..."
            pagination={{
              page: 1,
              pageSize: 20,
              total: loansRes?.total || 0,
              onPageChange: () => {},
              pageSizeOptions: [10, 25, 50, 100],
            }}
            onRowClick={(row) => setLocation(`/loans/${row.id}`)}
            ariaLabel="Active loans table"
          />
        )}
      </div>
    </DashboardLayout>
  );
}