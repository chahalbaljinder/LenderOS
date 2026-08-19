import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useGetTenant, useGetTenantStats, useUpdateTenant, useListLoanProducts, useListLoanApplications } from "@workspace/api-client-react";
import { useParams, Link, useLocation } from "wouter";
import { ArrowLeft, Building2, Users, Wallet, Activity, Settings, Loader2, AlertCircle, CheckCircle, TrendingUp } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/ui/data-table";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function TenantDetailPage() {
  const params = useParams<{ tenantId: string }>();
  const [, setLocation] = useLocation();
  const tenantId = params.tenantId;

  const { data: tenant, isLoading: tenantLoading } = useGetTenant({ path: { tenantId: tenantId || "" } });
  const { data: stats, isLoading: statsLoading } = useGetTenantStats({ path: { tenantId: tenantId || "" } });
  const { data: productsRes } = useListLoanProducts({ query: { tenantId: tenantId || "" } });
  const { data: appsRes } = useListLoanApplications({ query: { tenantId: tenantId || "" } });

  const updateMutation = useUpdateTenant({
    onSuccess: () => {
      // Refetch would be handled by react-query invalidation
    },
    onError: (err) => alert(err.message),
  });

  if (tenantLoading) {
    return (
      <DashboardLayout activeTab="tenants">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!tenant) {
    return (
      <DashboardLayout activeTab="tenants">
        <div className="flex items-center justify-center h-64 text-zinc-400 font-mono">
          Tenant not found
        </div>
      </DashboardLayout>
    );
  }

  const handleStatusChange = (newStatus: string) => {
    updateMutation.mutate({ id: tenantId, status: newStatus as any });
  };

  const statCards = [
    { label: "Total Applications", value: stats?.totalApplications?.toLocaleString() || "0", icon: <Activity className="w-5 h-5" />, color: "text-blue-400" },
    { label: "Active Loans", value: stats?.totalLoans?.toLocaleString() || "0", icon: <Wallet className="w-5 h-5" />, color: "text-green-400" },
    { label: "Active Customers", value: stats?.activeCustomers?.toLocaleString() || "0", icon: <Users className="w-5 h-5" />, color: "text-purple-400" },
    { label: "Total Disbursed", value: stats?.totalDisbursed ? `₹${(stats.totalDisbursed / 10000000).toFixed(1)}Cr` : "₹0.0Cr", icon: <TrendingUp className="w-5 h-5" />, color: "text-yellow-400" },
  ];

  const productColumns = [
    { key: "name", header: "Product", accessor: (row: any) => <span className="font-medium text-white">{row.name}</span>, width: "200px" },
    { key: "type", header: "Type", accessor: (row: any) => <span className="font-mono text-sm text-zinc-400 uppercase">{row.type}</span>, width: "140px" },
    { key: "range", header: "Amount Range", accessor: (row: any) => <span className="font-mono text-sm text-white">₹{row.minAmount?.toLocaleString()} – ₹{row.maxAmount?.toLocaleString()}</span>, width: "180px" },
    { key: "rate", header: "Rate", accessor: (row: any) => <span className="font-mono text-sm text-white">{row.interestRate}%</span>, width: "100px" },
    { key: "status", header: "Status", accessor: (row: any) => <StatusBadge status={row.isActive ? "active_tenant" : "suspended"} />, width: "120px" },
  ];

  const appColumns = [
    { key: "appId", header: "App ID", accessor: (row: any) => <span className="font-mono text-sm text-zinc-400">{row.applicationNumber || row.id.slice(0, 8).toUpperCase()}</span>, width: "120px" },
    { key: "customer", header: "Customer", accessor: (row: any) => <div className="font-medium text-white">{row.customerName || "Unknown"}</div> },
    { key: "product", header: "Product", accessor: (row: any) => <span className="font-mono text-sm text-zinc-400">{row.productName || "Standard Loan"}</span>, width: "160px" },
    { key: "amount", header: "Amount", accessor: (row: any) => <div className="font-mono text-sm text-white text-right">₹{row.requestedAmount?.toLocaleString()}</div>, align: "right" as const, width: "140px" },
    { key: "status", header: "Status", accessor: (row: any) => <StatusBadge status={row.status} />, width: "140px" },
    { key: "risk", header: "Risk", accessor: (row: any) => {
      const grade = row.riskGrade;
      if (!grade) return <span className="font-mono text-xs text-zinc-600">PENDING</span>;
      return <span className={cn("inline-flex font-mono text-sm font-bold px-2 py-1 rounded", ["A1","A2"].includes(grade) ? "bg-primary/10 text-primary" : ["B1","B2"].includes(grade) ? "bg-yellow-500/10 text-yellow-500" : "bg-destructive/10 text-destructive")}>{grade}</span>;
    }, width: "100px" },
  ];

  return (
    <DashboardLayout activeTab="tenants">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/tenants" className="p-2 hover:bg-white/5 rounded transition-colors text-zinc-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-white">{tenant.name}</h1>
                <p className="font-mono text-sm text-zinc-400">{tenant.domain || "no-domain.lendingos.dev"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={tenant.status === "active" ? "active_tenant" : tenant.status === "pending" ? "pending_tenant" : "suspended"} />
            </div>
          </div>
          <Link href="/settings" className="px-4 py-2 border border-zinc-700 text-zinc-300 hover:bg-white/5 font-mono text-sm rounded transition-colors flex items-center gap-2">
            <Settings className="w-4 h-4" /> Settings
          </Link>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className={cn(stat.color)}>
                  {stat.icon}
                </div>
                <p className="font-mono text-sm text-zinc-400">{stat.label}</p>
              </div>
              <div className="mt-2 text-2xl font-semibold text-white">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Products & Applications Tabs */}
        <div className="space-y-8">
          {/* Loan Products */}
          <div>
            <div className="flex justify-between items-end mb-4">
              <div>
                <h2 className="text-lg font-semibold text-white mb-1">Loan Products</h2>
                <p className="font-mono text-sm text-zinc-400">{productsRes?.data?.length || 0} products configured</p>
              </div>
              <Link href="/products/new" className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-black font-semibold font-mono text-xs rounded transition-colors flex items-center gap-1">
                <Plus className="w-3 h-3" /> Add Product
              </Link>
            </div>
            <DataTable
              columns={productColumns}
              data={productsRes?.data || []}
              isLoading={false}
              rowKey={(row) => row.id}
              emptyMessage="No loan products configured"
              showSearch={false}
              pagination={false}
              onRowClick={(row) => {}}
              ariaLabel="Loan products table"
            />
          </div>

          {/* Recent Applications */}
          <div>
            <div className="flex justify-between items-end mb-4">
              <div>
                <h2 className="text-lg font-semibold text-white mb-1">Recent Applications</h2>
                <p className="font-mono text-sm text-zinc-400">{appsRes?.data?.length || 0} applications</p>
              </div>
              <Link href="/applications" className="px-3 py-1.5 border border-zinc-700 text-zinc-300 hover:bg-white/5 font-mono text-xs rounded transition-colors flex items-center gap-1">
                View All
              </Link>
            </div>
            <DataTable
              columns={appColumns}
              data={appsRes?.data?.slice(0, 10) || []}
              isLoading={false}
              rowKey={(row) => row.id}
              emptyMessage="No applications yet"
              showSearch={false}
              pagination={false}
              onRowClick={(row) => setLocation(`/applications/${row.id}`)}
              ariaLabel="Recent applications table"
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}