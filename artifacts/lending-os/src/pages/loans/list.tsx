import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Link } from "wouter";

export default function LoansList() {
  return (
    <DashboardLayout activeTab="loans">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-white mb-2">Active Loans</h1>
        <p className="font-mono text-sm text-zinc-400 mb-8">Manage disbursed loans and repayment schedules.</p>
        <div className="bg-card border border-border p-12 text-center">
          <div className="font-mono text-sm text-zinc-500">TABLE_RENDER_PENDING</div>
        </div>
      </div>
    </DashboardLayout>
  );
}
