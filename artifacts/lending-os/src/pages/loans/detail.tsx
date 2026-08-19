import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useGetLoan, useGetLoanSchedule, useListRepayments } from "@workspace/api-client-react";
import { useParams, Link, useLocation } from "wouter";
import { ArrowLeft, CreditCard, DollarSign, Calendar, Clock, Loader2, AlertTriangle, CheckCircle, Download, TrendingUp, AlertCircle as AlertCircleIcon } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/ui/data-table";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function LoanDetailPage() {
  const params = useParams<{ loanId: string }>();
  const [, setLocation] = useLocation();
  const loanId = params.loanId;

  const { data: loan, isLoading: loanLoading } = useGetLoan({ path: { loanId: loanId || "" } });
  const { data: schedule, isLoading: scheduleLoading } = useGetLoanSchedule({ path: { loanId: loanId || "" } });
  const { data: repaymentsRes } = useListRepayments({ query: { loanId: loanId || "" } });

  if (loanLoading) {
    return (
      <DashboardLayout activeTab="loans">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!loan) {
    return (
      <DashboardLayout activeTab="loans">
        <div className="flex items-center justify-center h-64 text-zinc-400 font-mono">
          Loan not found
        </div>
      </DashboardLayout>
    );
  }

  const statusColors: Record<string, string> = {
    active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    closed: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    npa: "bg-red-500/20 text-red-400 border-red-500/30",
    written_off: "bg-gray-900/20 text-gray-500 border-gray-900/30",
  };

  const repayments = repaymentsRes?.data || [];

  return (
    <DashboardLayout activeTab="loans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link href="/loans" className="p-2 hover:bg-white/5 rounded transition-colors text-zinc-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-semibold text-white">
                  {loan.loanNumber || `LN-${loanId?.slice(0, 8).toUpperCase()}`}
                </h1>
                <span className={cn("px-2 py-1 rounded text-xs font-mono border", statusColors[loan.status] || "bg-gray-500/20 text-gray-400 border-gray-500/30")}>
                  {loan.status.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                </span>
              </div>
              <p className="font-mono text-sm text-zinc-400">
                {loan.customerName || "Unknown Customer"} • Disbursed {loan.disbursedAt ? format(new Date(loan.disbursedAt), "MMM d, yyyy") : "—"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/loans" className="px-3 py-1.5 border border-zinc-700 text-zinc-300 hover:bg-white/5 font-mono text-xs rounded transition-colors">
              Back to Loans
            </Link>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Core Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Financial Summary */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" /> Financial Summary
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="font-mono text-xs text-zinc-400">Principal Amount</p>
                  <p className="text-xl font-semibold text-white">₹{loan.principalAmount?.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="font-mono text-xs text-zinc-400">Outstanding</p>
                  <p className="text-xl font-semibold text-primary">₹{loan.outstandingAmount?.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="font-mono text-xs text-zinc-400">Total Paid</p>
                  <p className="text-xl font-semibold text-green-400">₹{loan.totalPaid?.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="font-mono text-xs text-zinc-400">Interest Rate</p>
                  <p className="text-xl font-semibold text-white">{loan.interestRate}%</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="font-mono text-xs text-zinc-400">EMI Amount</p>
                  <p className="text-xl font-semibold text-white">₹{loan.emiAmount?.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="font-mono text-xs text-zinc-400">Tenure</p>
                  <p className="text-xl font-semibold text-white">{loan.tenure} months</p>
                </div>
                <div className="space-y-1">
                  <p className="font-mono text-xs text-zinc-400">Next EMI Date</p>
                  <p className="text-xl font-semibold text-white">{loan.nextEmiDate ? format(new Date(loan.nextEmiDate), "MMM d, yyyy") : "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="font-mono text-xs text-zinc-400">DPD</p>
                  <p className={cn("text-xl font-semibold", (loan.dpd || 0) > 90 ? "text-destructive" : (loan.dpd || 0) > 30 ? "text-yellow-500" : (loan.dpd || 0) > 0 ? "text-blue-500" : "text-primary")}>
                    {loan.dpd === 0 ? "Current" : `${loan.dpd} days`}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="font-mono text-xs text-zinc-400">Disbursed Date</p>
                  <p className="text-sm font-medium text-white">{loan.disbursedAt ? format(new Date(loan.disbursedAt), "MMM d, yyyy") : "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="font-mono text-xs text-zinc-400">Closed Date</p>
                  <p className="text-sm font-medium text-white">{loan.closedAt ? format(new Date(loan.closedAt), "MMM d, yyyy") : "—"}</p>
                </div>
              </div>
            </div>

            {/* Loan Info */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" /> Loan Information
                </h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-mono text-xs text-zinc-400">Loan Number</span>
                    <span className="font-mono text-sm text-white">{loan.loanNumber || loan.id.slice(0, 8).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-mono text-xs text-zinc-400">Customer</span>
                    <span className="font-medium text-white">{loan.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-mono text-xs text-zinc-400">Loan ID</span>
                    <span className="font-mono text-sm text-zinc-300">{loan.id}</span>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" /> Key Metrics
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between p-3 bg-background/50 rounded">
                    <span className="font-mono text-xs text-zinc-400">Progress</span>
                    <span className="font-bold text-white">
                      {loan.principalAmount > 0 ? `${(((loan.principalAmount - loan.outstandingAmount) / loan.principalAmount) * 100).toFixed(1)}%` : "0%"}
                    </span>
                  </div>
                  <div className="flex justify-between p-3 bg-background/50 rounded">
                    <span className="font-mono text-xs text-zinc-400">Remaining Payments</span>
                    <span className="font-bold text-white">
                      {loan.tenure - Math.floor((loan.totalPaid || 0) / (loan.emiAmount || 1))} / {loan.tenure}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Repayment Schedule */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5" /> Repayment Schedule
                </h2>
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-mono rounded">
                  {schedule?.length || 0} installments
                </span>
              </div>

              {scheduleLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : schedule && schedule.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-xs font-mono uppercase tracking-wider text-zinc-500 border-b border-border">
                        <th className="pb-3">#</th>
                        <th className="pb-3 text-right">Due Date</th>
                        <th className="pb-3 text-right">EMI</th>
                        <th className="pb-3 text-right">Principal</th>
                        <th className="pb-3 text-right">Interest</th>
                        <th className="pb-3 text-right">Outstanding After</th>
                        <th className="pb-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {schedule.map((item: any, index: number) => (
                        <tr key={index} className="hover:bg-white/5">
                          <td className="py-3 font-mono">{item.installmentNumber}</td>
                          <td className="py-3 text-right font-mono text-zinc-400">{format(new Date(item.dueDate), "MMM d, yyyy")}</td>
                          <td className="py-3 text-right font-mono text-white">₹{item.emiAmount?.toLocaleString()}</td>
                          <td className="py-3 text-right font-mono text-green-400">₹{item.principal?.toLocaleString()}</td>
                          <td className="py-3 text-right font-mono text-yellow-400">₹{item.interest?.toLocaleString()}</td>
                          <td className="py-3 text-right font-mono text-zinc-300">₹{item.outstandingAfter?.toLocaleString()}</td>
                          <td className="py-3 text-right">
                            <StatusBadge status={item.status === "paid" ? "active_tenant" : item.status === "overdue" ? "suspended" : item.status === "partial" ? "pending_tenant" : "pending_tenant"} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-zinc-500 font-mono">
                  No repayment schedule available
                </div>
              )}
            </div>

            {/* Payment History */}
            {repayments.length > 0 && (
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" /> Payment History
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-xs font-mono uppercase tracking-wider text-zinc-500 border-b border-border">
                        <th className="pb-3">#</th>
                        <th className="pb-3">Due Date</th>
                        <th className="pb-3 text-right">EMI</th>
                        <th className="pb-3 text-right">Paid Amount</th>
                        <th className="pb-3 text-right">Paid Date</th>
                        <th className="pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {repayments.map((item: any) => (
                        <tr key={item.id} className="hover:bg-white/5">
                          <td className="py-3 font-mono">{item.installmentNumber}</td>
                          <td className="py-3 font-mono text-zinc-400">{item.dueDate ? format(new Date(item.dueDate), "MMM d, yyyy") : "—"}</td>
                          <td className="py-3 text-right font-mono text-white">₹{item.emiAmount?.toLocaleString()}</td>
                          <td className="py-3 text-right font-mono text-green-400">{item.paidAmount ? `₹${item.paidAmount.toLocaleString()}` : "—"}</td>
                          <td className="py-3 text-right font-mono text-zinc-400">{item.paidAt ? format(new Date(item.paidAt), "MMM d, yyyy") : "—"}</td>
                          <td className="py-3">
                            <StatusBadge status={item.status === "paid" ? "active_tenant" : item.status === "overdue" ? "suspended" : item.status === "partial" ? "pending_tenant" : "pending_tenant"} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Quick Info & Actions */}
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-lg p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-white mb-4">Quick Info</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-400 font-mono">Status</span>
                  <span className="font-medium text-white">{loan.status.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400 font-mono">DPD</span>
                  <span className={cn("font-bold", (loan.dpd || 0) > 90 ? "text-destructive" : (loan.dpd || 0) > 30 ? "text-yellow-500" : (loan.dpd || 0) > 0 ? "text-blue-500" : "text-primary")}>
                    {loan.dpd === 0 ? "Current" : `${loan.dpd} days`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400 font-mono">Disbursed</span>
                  <span className="font-mono text-white">{loan.disbursedAt ? format(new Date(loan.disbursedAt), "MMM d, yyyy") : "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400 font-mono">Next EMI</span>
                  <span className="font-mono text-white">{loan.nextEmiDate ? format(new Date(loan.nextEmiDate), "MMM d, yyyy") : "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400 font-mono">Interest Rate</span>
                  <span className="font-mono text-white">{loan.interestRate}%</span>
                </div>
              </div>
            </div>

            {loan.status === "active" && (
              <div className="bg-card border border-border rounded-lg p-6 sticky top-24">
                <h2 className="text-lg font-semibold text-white mb-4">Actions</h2>
                <div className="space-y-3">
                  <button className="w-full px-4 py-2 border border-zinc-700 text-zinc-300 hover:bg-white/5 font-semibold font-mono text-sm rounded transition-colors">
                    Record Repayment
                  </button>
                  <button className="w-full px-4 py-2 border border-zinc-700 text-zinc-300 hover:bg-white/5 font-semibold font-mono text-sm rounded transition-colors">
                    View Statement
                  </button>
                  <button className="w-full px-4 py-2 border border-zinc-700 text-zinc-300 hover:bg-white/5 font-semibold font-mono text-sm rounded transition-colors">
                    Restructure
                  </button>
                  {loan.dpd > 30 && (
                    <button className="w-full px-4 py-2 bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/30 font-semibold font-mono text-sm rounded transition-colors">
                      Initiate Collection
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}