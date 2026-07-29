import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Link } from "wouter";

export default function CustomersList() {
  return (
    <DashboardLayout activeTab="customers">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-white mb-2">Customers</h1>
        <p className="font-mono text-sm text-zinc-400 mb-8">Customer registry and 360 profiles.</p>
        <div className="bg-card border border-border p-12 text-center">
          <div className="font-mono text-sm text-zinc-500">TABLE_RENDER_PENDING</div>
        </div>
      </div>
    </DashboardLayout>
  );
}
