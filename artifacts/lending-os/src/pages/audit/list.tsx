import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useListAuditLogs } from "@workspace/api-client-react";
import { Search, Filter, Download, Shield, User, AlertTriangle, FileText, MoreHorizontal } from "lucide-react";
import { useState } from "react";

export default function AuditList() {
  const { data: auditRes, isLoading } = useListAuditLogs();
  const [dateRange, setDateRange] = useState('30d');
  const [actionFilter, setActionFilter] = useState('');

  const columns = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      accessor: (row: any) => (
        <div className="font-mono text-sm text-white whitespace-nowrap">
          {new Date(row.timestamp).toLocaleString()}
        </div>
      ),
      sortable: true,
      width: '180px',
    },
    {
      key: 'actor',
      header: 'Actor',
      accessor: (row: any) => (
        <div>
          <div className="flex items-center gap-2">
            <User className="w-3 h-3 text-zinc-500" />
            <span className="font-medium text-white">{row.actorName || 'System'}</span>
          </div>
          <div className="text-xs font-mono text-zinc-500">{row.actorEmail}</div>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'action',
      header: 'Action',
      accessor: (row: any) => (
        <div>
          <span className="inline-flex font-mono text-[10px] uppercase px-2 py-1 rounded bg-primary/10 text-primary border border-primary/20">{row.action}</span>
          <div className="text-xs text-zinc-400 mt-1 line-clamp-1">{row.description}</div>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'resource',
      header: 'Resource',
      accessor: (row: any) => (
        <div className="flex items-center gap-2">
          <FileText className="w-3 h-3 text-zinc-500" />
          <span className="font-mono text-sm text-zinc-300">{row.resourceType}</span>
          <span className="text-xs text-zinc-500">#{row.resourceId?.slice(0, 8)}</span>
        </div>
      ),
      hideOnMobile: true,
    },
    {
      key: 'tenant',
      header: 'Tenant',
      accessor: (row: any) => (
        <span className="font-mono text-xs text-zinc-400">{row.tenantName || 'Platform'}</span>
      ),
      hideOnMobile: true,
    },
    {
      key: 'ip',
      header: 'IP Address',
      accessor: (row: any) => (
        <span className="font-mono text-xs text-zinc-500">{row.ipAddress || '—'}</span>
      ),
      hideOnMobile: true,
    },
    {
      key: 'severity',
      header: 'Severity',
      accessor: (row: any) => (
        <StatusBadge 
          status={
            row.severity === 'critical' ? 'critical' :
            row.severity === 'high' ? 'danger' :
            row.severity === 'medium' ? 'warning' : 'info'
          }
        />
      ),
      width: '100px',
    },
  ];

  const data = auditRes?.data || [];
  const isEmpty = !isLoading && data.length === 0;

  const mockStats = [
    { label: 'Total Events', value: auditRes?.total || 0, icon: Shield },
    { label: 'Critical', value: auditRes?.data?.filter((a: any) => a.severity === 'critical').length || 0, icon: AlertTriangle, color: 'text-destructive' },
    { label: 'High', value: auditRes?.data?.filter((a: any) => a.severity === 'high').length || 0, icon: AlertTriangle, color: 'text-yellow-500' },
    { label: 'Unique Actors', value: new Set(auditRes?.data?.map((a: any) => a.actorId)).size || 0, icon: User },
  ];

  return (
    <DashboardLayout activeTab="audit">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-white mb-2">Audit Logs</h1>
            <p className="font-mono text-sm text-zinc-400">Track admin actions and compliance events.</p>
          </div>
          <div className="flex gap-2">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-card border border-border px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-primary rounded"
            >
              <option value="1d">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="all">All Time</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border text-sm font-mono text-zinc-400 hover:text-white transition-colors">
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {mockStats.map((stat, i) => (
            <div key={i} className="bg-card border border-border p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-mono text-xs text-zinc-400">{stat.label}</div>
                  <div className="text-2xl font-bold font-mono text-white">{stat.value.toLocaleString()}</div>
                </div>
                <stat.icon className={`w-6 h-6 ${stat.color || 'text-primary'}`} aria-hidden="true" />
              </div>
            </div>
          ))}
        </div>

        <div className="mb-4 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="search"
              placeholder="Search by action, resource, or actor..."
              className="w-full bg-card border border-border pl-10 pr-4 py-2 text-sm font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary"
            />
          </div>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-card border border-border px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-primary rounded"
          >
            <option value="">All Actions</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
            <option value="APPROVE">APPROVE</option>
            <option value="REJECT">REJECT</option>
            <option value="LOGIN">LOGIN</option>
            <option value="EXPORT">EXPORT</option>
          </select>
        </div>

        {isEmpty ? (
          <EmptyState
            illustration="data"
            title="No Audit Logs"
            description="System events and admin actions will be recorded here for compliance tracking."
          />
        ) : (
          <DataTable
            columns={columns}
            data={data}
            isLoading={isLoading}
            rowKey={(row) => row.id}
            emptyMessage="No audit logs found"
            showSearch={false}
            pagination={{
              page: 1,
              pageSize: 25,
              total: auditRes?.total || 0,
              onPageChange: () => {},
              pageSizeOptions: [10, 25, 50, 100],
            }}
            ariaLabel="Audit logs table"
          />
        )}
      </div>
    </DashboardLayout>
  );
}