import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatCard } from "@/components/ui/stat-card";
import { useGetPlatformSummary } from "@workspace/api-client-react";
import { Building2, Users, CreditCard, AlertTriangle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function SuperAdminDashboard() {
  const { data: summary, isLoading } = useGetPlatformSummary();

  const mockRevenueData = [
    { name: 'Jan', value: 4000 },
    { name: 'Feb', value: 3000 },
    { name: 'Mar', value: 2000 },
    { name: 'Apr', value: 2780 },
    { name: 'May', value: 1890 },
    { name: 'Jun', value: 2390 },
    { name: 'Jul', value: 3490 },
  ];

  return (
    <DashboardLayout activeTab="dashboard">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white mb-2">Platform Overview</h1>
          <p className="font-mono text-sm text-zinc-400">Global metrics across all tenants</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Tenants" 
            value={summary?.totalTenants || "0"} 
            trend={{ value: "2", label: "this month", positive: true }}
            icon={<Building2 className="w-4 h-4" />}
            loading={isLoading}
          />
          <StatCard 
            title="Total End Customers" 
            value={summary?.totalCustomers?.toLocaleString() || "0"} 
            trend={{ value: "12%", label: "vs last month", positive: true }}
            icon={<Users className="w-4 h-4" />}
            loading={isLoading}
          />
          <StatCard 
            title="Total AUM" 
            value={`₹${((summary?.totalOutstanding || 0) / 10000000).toFixed(2)}Cr`} 
            icon={<CreditCard className="w-4 h-4" />}
            loading={isLoading}
          />
          <StatCard 
            title="Platform Default Rate" 
            value={`${summary?.defaultRate || 0}%`} 
            trend={{ value: "0.1%", label: "vs last quarter", positive: false }}
            icon={<AlertTriangle className="w-4 h-4" />}
            loading={isLoading}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card border border-border p-6">
            <h3 className="font-mono text-xs uppercase text-zinc-400 mb-6">Platform Revenue (Mock)</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockRevenueData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(160 100% 40%)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(160 100% 40%)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 10% 12%)" vertical={false} />
                  <XAxis dataKey="name" stroke="hsl(240 10% 40%)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(240 10% 40%)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(240 10% 6%)', border: '1px solid hsl(240 10% 12%)', borderRadius: 0, fontFamily: 'monospace' }}
                    itemStyle={{ color: 'hsl(160 100% 40%)' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="hsl(160 100% 40%)" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-card border border-border p-6">
            <h3 className="font-mono text-xs uppercase text-zinc-400 mb-6">Top Volume Tenants</h3>
            <div className="space-y-4">
              {summary?.topTenants?.map((tenant, i) => (
                <div key={tenant.tenantId} className="flex items-center justify-between p-3 border border-border bg-background">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-zinc-800 flex items-center justify-center font-mono text-xs text-white">
                      {i + 1}
                    </div>
                    <span className="font-medium text-sm">{tenant.name}</span>
                  </div>
                  <span className="font-mono text-xs text-primary">₹{(tenant.disbursed / 10000000).toFixed(1)}Cr</span>
                </div>
              ))}
              {(!summary?.topTenants || summary.topTenants.length === 0) && (
                <div className="text-center text-sm font-mono text-zinc-500 py-8">NO_DATA_AVAILABLE</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
