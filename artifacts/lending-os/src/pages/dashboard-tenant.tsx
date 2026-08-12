import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatCard } from "@/components/ui/stat-card";
import { useGetTenantDashboard, useGetMe } from "@workspace/api-client-react";
import { FileText, CheckCircle, RefreshCcw, Wallet, ChevronLeft, ChevronRight } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { useState } from "react";

export default function TenantDashboard() {
  const { data: user } = useGetMe();
  const tenantId = user?.tenantId;
  const { data: dashboard, isLoading } = useGetTenantDashboard({ period: "30d" });
  const [period, setPeriod] = useState("30d");

  const mockTrendData = dashboard?.trend || [
    { date: "W1", disbursals: 4000, collections: 2400 },
    { date: "W2", disbursals: 3000, collections: 1398 },
    { date: "W3", disbursals: 2000, collections: 9800 },
    { date: "W4", disbursals: 2780, collections: 3908 },
  ];

  const chartConfig = {
    disbursals: { label: "Disbursed", color: "hsl(var(--primary))" },
    collections: { label: "Collected", color: "hsl(var(--muted-foreground))" },
  };

  const periods = [
    { value: "7d", label: "7D" },
    { value: "30d", label: "30D" },
    { value: "90d", label: "90D" },
    { value: "ytd", label: "YTD" },
  ];

  return (
    <DashboardLayout activeTab="dashboard">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-white mb-2">Command Center</h1>
            <p className="font-mono text-sm text-zinc-400">Last 30 days operational metrics</p>
          </div>
          <div className="hidden md:flex gap-1 bg-zinc-900/50 border border-zinc-800 rounded p-1">
            {periods.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-3 py-1.5 font-mono text-xs rounded transition-colors ${
                  period === p.value
                    ? "bg-primary text-black"
                    : "text-zinc-500 hover:text-white"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Applications"
            value={dashboard?.applications?.total || 0}
            trend={{ value: `${dashboard?.applications?.pending || 0}`, label: "pending review", positive: true }}
            icon={<FileText className="w-4 h-4" />}
            loading={isLoading}
          />
          <StatCard
            title="Approved Volume"
            value={`₹${((dashboard?.disbursals?.amount || 0) / 100000).toFixed(2)}L`}
            trend={{ value: `${dashboard?.applications?.approved || 0}`, label: "loans approved", positive: true }}
            icon={<CheckCircle className="w-4 h-4" />}
            loading={isLoading}
          />
          <StatCard
            title="Collections Rate"
            value={`${dashboard?.collections?.rate || 0}%`}
            trend={{ value: `₹${((dashboard?.collections?.overdue || 0) / 100000).toFixed(1)}L`, label: "overdue", positive: false }}
            icon={<RefreshCcw className="w-4 h-4" />}
            loading={isLoading}
          />
          <StatCard
            title="Revenue Yield"
            value={`₹${((dashboard?.revenue?.total || 0) / 100000).toFixed(2)}L`}
            icon={<Wallet className="w-4 h-4" />}
            loading={isLoading}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card border border-border p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-mono text-xs uppercase text-zinc-400">Disbursals vs Collections</h3>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded" />
                  <span className="text-xs font-mono">Disbursed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-zinc-600 rounded" />
                  <span className="text-xs font-mono">Collected</span>
                </div>
              </div>
            </div>
            <div className="h-72 w-full">
              <ChartContainer config={chartConfig} className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockTrendData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      fontFamily="var(--font-mono)"
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      fontFamily="var(--font-mono)"
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => `₹${val}`}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value, name) => [`₹${value.toLocaleString()}`, name === "disbursals" ? "Disbursed" : "Collected"]}
                        />
                      }
                      cursor={{ fill: "hsl(var(--muted))" }}
                    />
                    <Bar dataKey="disbursals" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="collections" fill="hsl(var(--muted-foreground))" radius={[2, 2, 0, 0]} />
                    <ChartLegend>
                      <ChartLegendContent />
                    </ChartLegend>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </div>

          <div className="bg-card border border-border p-6 flex flex-col">
            <h3 className="font-mono text-xs uppercase text-zinc-400 mb-6">Action Queue</h3>

            <div className="flex-1 space-y-3">
              <div className="p-3 border border-primary/30 bg-primary/5 flex items-center justify-between cursor-pointer hover:bg-primary/10 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-sm font-medium">Pending Approvals</span>
                </div>
                <span className="font-mono font-bold text-primary">{dashboard?.applications?.pending || 0}</span>
              </div>

              <div className="p-3 border border-border bg-background flex items-center justify-between cursor-pointer hover:bg-zinc-900 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-destructive" />
                  <span className="text-sm font-medium text-zinc-300">High Priority Collections</span>
                </div>
                <span className="font-mono font-bold text-destructive">12</span>
              </div>

              <div className="p-3 border border-border bg-background flex items-center justify-between cursor-pointer hover:bg-zinc-900 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <span className="text-sm font-medium text-zinc-300">KYC Exceptions</span>
                </div>
                <span className="font-mono font-bold text-yellow-500">4</span>
              </div>
            </div>

            <button className="mt-4 w-full py-2 bg-white/5 hover:bg-white/10 text-white font-mono text-xs uppercase tracking-wider transition-colors">
              View All Tasks
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}