import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useListCustomers } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Plus, Search, Filter, User, Mail, Phone, ShieldCheck, MapPin, MoreHorizontal } from "lucide-react";

export default function CustomersList() {
  const { data: customersRes, isLoading } = useListCustomers();

  const columns = [
    {
      key: 'name',
      header: 'Customer',
      accessor: (row: any) => (
        <div>
          <div className="font-medium text-white">{row.fullName || row.firstName + ' ' + row.lastName}</div>
          <div className="text-xs font-mono text-zinc-500">{row.email}</div>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'phone',
      header: 'Phone',
      accessor: (row: any) => (
        <div className="font-mono text-sm text-zinc-300">{row.phone || '—'}</div>
      ),
      hideOnMobile: true,
    },
    {
      key: 'kycStatus',
      header: 'KYC',
      accessor: (row: any) => (
        <StatusBadge status={row.kycStatus} />
      ),
      width: '120px',
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
      key: 'tenant',
      header: 'Tenant',
      accessor: (row: any) => (
        <span className="font-mono text-xs text-zinc-400">{row.tenantName || '—'}</span>
      ),
      hideOnMobile: true,
    },
    {
      key: 'createdAt',
      header: 'Joined',
      accessor: (row: any) => (
        <span className="font-mono text-xs text-zinc-500">{new Date(row.createdAt).toLocaleDateString()}</span>
      ),
      sortable: true,
      hideOnMobile: true,
    },
  ];

  const data = customersRes?.data || [];
  const isEmpty = !isLoading && data.length === 0;

  return (
    <DashboardLayout activeTab="customers">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-white mb-2">Customers</h1>
            <p className="font-mono text-sm text-zinc-400">Customer registry and 360° profiles.</p>
          </div>
          <Link href="/customers/new" className="px-4 py-2 bg-white text-black hover:bg-zinc-200 font-semibold font-mono text-sm flex items-center gap-2 transition-colors">
            <Plus className="w-4 h-4" /> Add Customer
          </Link>
        </div>

        {isEmpty ? (
          <EmptyState
            illustration="add"
            title="No Customers Yet"
            description="Customer profiles will appear here once they're created or imported."
            action={{ label: "Add Customer", icon: <Plus className="w-4 h-4" />, onClick: () => {} }}
          />
        ) : (
          <DataTable
            columns={columns}
            data={data}
            isLoading={isLoading}
            rowKey={(row) => row.id}
            emptyMessage="No customers found"
            showSearch
            searchPlaceholder="Search by name, email, or phone..."
            pagination={{
              page: 1,
              pageSize: 20,
              total: customersRes?.total || 0,
              onPageChange: () => {},
              pageSizeOptions: [10, 25, 50, 100],
            }}
            onRowClick={(row) => {}}
            ariaLabel="Customers table"
          />
        )}
      </div>
    </DashboardLayout>
  );
}