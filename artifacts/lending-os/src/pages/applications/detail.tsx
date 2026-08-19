import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useGetLoanApplication, useGetKycStatus, useGetRiskScore, useListLoanApplications, useUpdateLoanApplication, useApproveLoanApplication, useRejectLoanApplication, useDisburseLoan, useSubmitLoanApplication } from "@workspace/api-client-react";
import { useParams, Link, useLocation } from "wouter";
import { ArrowLeft, CreditCard, Shield, Loader2, AlertCircle, CheckCircle, MoreHorizontal, FileText, User, Calendar, Clock, TrendingUp, Download, Eye, Edit, XCircle, Banknote, RotateCcw } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/ui/data-table";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function ApplicationDetailPage() {
  const params = useParams<{ applicationId: string }>();
  const [, setLocation] = useLocation();
  const applicationId = params.applicationId;

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDisburseModal, setShowDisburseModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [disburseForm, setDisburseForm] = useState({ bankAccount: "", ifscCode: "", disbursementMode: "neft" });

  const { data: app, isLoading: appLoading } = useGetLoanApplication({ path: { applicationId: applicationId || "" } });
  const { data: kyc } = useGetKycStatus({ path: { applicationId: applicationId || "" } });
  const { data: risk } = useGetRiskScore({ path: { applicationId: applicationId || "" } });
  const updateMutation = useUpdateLoanApplication();
  const submitMutation = useSubmitLoanApplication();
  const approveMutation = useApproveLoanApplication();
  const rejectMutation = useRejectLoanApplication();
  const disburseMutation = useDisburseLoan();

  if (appLoading) {
    return (
      <DashboardLayout activeTab="applications">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!app) {
    return (
      <DashboardLayout activeTab="applications">
        <div className="flex items-center justify-center h-64 text-zinc-400 font-mono">
          Application not found
        </div>
      </DashboardLayout>
    );
  }

  const statusColors: Record<string, string> = {
    draft: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    submitted: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    under_review: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    kyc_pending: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    kyc_verified: "bg-green-500/20 text-green-400 border-green-500/30",
    risk_assessment: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    offer_generated: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    offer_accepted: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    esign_pending: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
    approved: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    disbursed: "bg-green-500/20 text-green-400 border-green-500/30",
    rejected: "bg-red-500/20 text-red-400 border-red-500/30",
    withdrawn: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  };

  const riskGradeColors: Record<string, string> = {
    A1: "bg-primary/10 text-primary",
    A2: "bg-primary/10 text-primary",
    A3: "bg-primary/10 text-primary",
    B1: "bg-yellow-500/10 text-yellow-500",
    B2: "bg-yellow-500/10 text-yellow-500",
    B3: "bg-yellow-500/10 text-yellow-500",
    C1: "bg-destructive/10 text-destructive",
    C2: "bg-destructive/10 text-destructive",
    C3: "bg-destructive/10 text-destructive",
  };

  return (
    <DashboardLayout activeTab="applications">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link href="/applications" className="p-2 hover:bg-white/5 rounded transition-colors text-zinc-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-semibold text-white">
                  {app.applicationNumber || `APP-${applicationId?.slice(0, 8).toUpperCase()}`}
                </h1>
                <span className={cn("px-2 py-1 rounded text-xs font-mono border", statusColors[app.status] || "bg-gray-500/20 text-gray-400 border-gray-500/30")}>
                  {app.status.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                </span>
              </div>
              <p className="font-mono text-sm text-zinc-400">
                {app.productName || "Standard Loan"} • {app.customerName || "Unknown Customer"} • Created {format(new Date(app.createdAt), "MMM d, yyyy")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/applications" className="px-3 py-1.5 border border-zinc-700 text-zinc-300 hover:bg-white/5 font-mono text-xs rounded transition-colors">
              Back to List
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
                  <p className="font-mono text-xs text-zinc-400">Requested Amount</p>
                  <p className="text-xl font-semibold text-white">₹{app.requestedAmount?.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="font-mono text-xs text-zinc-400">Requested Tenure</p>
                  <p className="text-xl font-semibold text-white">{app.requestedTenure} months</p>
                </div>
                <div className="space-y-1">
                  <p className="font-mono text-xs text-zinc-400">Approved Amount</p>
                  <p className="text-xl font-semibold text-white">{app.approvedAmount ? `₹${app.approvedAmount.toLocaleString()}` : "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="font-mono text-xs text-zinc-400">Approved Rate</p>
                  <p className="text-xl font-semibold text-white">{app.approvedRate ? `${app.approvedRate}%` : "—"}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="font-mono text-xs text-zinc-400">EMI (Approved)</p>
                  <p className="text-xl font-semibold text-white">{app.approvedAmount && app.approvedRate && app.approvedTenure ? `₹${Math.round((app.approvedAmount * (app.approvedRate / 100 / 12) * Math.pow(1 + app.approvedRate / 100 / 12, app.approvedTenure)) / (Math.pow(1 + app.approvedRate / 100 / 12, app.approvedTenure) - 1)).toLocaleString()}` : "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="font-mono text-xs text-zinc-400">Disbursed</p>
                  <p className="text-xl font-semibold text-white">{app.disbursedAt ? format(new Date(app.disbursedAt), "MMM d, yyyy") : "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="font-mono text-xs text-zinc-400">Purpose</p>
                  <p className="text-sm font-medium text-white truncate">{app.purpose}</p>
                </div>
                <div className="space-y-1">
                  <p className="font-mono text-xs text-zinc-400">Rejection Reason</p>
                  <p className="text-sm font-medium text-red-400">{app.rejectionReason || "—"}</p>
                </div>
              </div>
            </div>

            {/* Customer & Product Info */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" /> Customer
                </h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-mono text-xs text-zinc-400">Name</span>
                    <span className="font-medium text-white">{app.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-mono text-xs text-zinc-400">Application ID</span>
                    <span className="font-mono text-sm text-zinc-300">{app.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-mono text-xs text-zinc-400">Product</span>
                    <span className="font-medium text-white">{app.productName}</span>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5" /> Risk Assessment
                </h2>
                <div className="space-y-3">
                  {risk ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-zinc-400">Risk Grade</span>
                        <span className={cn("inline-flex font-mono text-lg font-bold px-3 py-1 rounded", riskGradeColors[risk.grade] || "bg-gray-500/10 text-gray-400")}>
                          {risk.grade}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-zinc-400">Score</span>
                        <span className="font-mono text-xl font-bold text-white">{risk.score}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-zinc-400">Recommendation</span>
                        <span className={cn("font-mono text-sm font-semibold px-2 py-1 rounded",
                          risk.recommendation === "approve" ? "text-primary" :
                          risk.recommendation === "approve_with_conditions" ? "text-yellow-500" :
                          risk.recommendation === "review" ? "text-orange-500" : "text-destructive"
                        )}>
                          {risk.recommendation.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                        </span>
                      </div>
                      <div className="pt-3 border-t border-border grid grid-cols-2 gap-2 text-sm">
                        <div><span className="text-zinc-400">Credit Weight:</span> <span className="font-mono text-white ml-2">{risk.creditScoreWeight}</span></div>
                        <div><span className="text-zinc-400">Income Weight:</span> <span className="font-mono text-white ml-2">{risk.incomeWeight}</span></div>
                        <div><span className="text-zinc-400">DTI Ratio:</span> <span className="font-mono text-white ml-2">{risk.debtToIncomeRatio}</span></div>
                        <div><span className="text-zinc-400">Employment:</span> <span className="font-mono text-white ml-2">{risk.employmentStabilityScore}</span></div>
                        <div><span className="text-zinc-400">Fraud Risk:</span> <span className="font-mono text-white ml-2">{risk.fraudRiskScore}</span></div>
                      </div>
                      <div className="pt-3 border-t border-border">
                        <p className="font-mono text-xs text-zinc-400">{risk.explanation}</p>
                        <p className="font-mono text-xs text-zinc-500 mt-1">Computed: {format(new Date(risk.computedAt), "MMM d, yyyy HH:mm")}</p>
                      </div>
                    </>
                  ) : (
                    <p className="text-zinc-500 font-mono">Risk assessment not yet run</p>
                  )}
                </div>
              </div>
            </div>

            {/* KYC Status */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" /> KYC Verification
              </h2>
              {kyc ? (
                <div className="grid gap-3 md:grid-cols-4">
                  {[
                    { key: "pan", label: "PAN", status: kyc.panStatus, value: kyc.panNumber },
                    { key: "aadhaar", label: "Aadhaar", status: kyc.aadhaarStatus },
                    { key: "face", label: "Face/Liveness", status: kyc.faceStatus },
                    { key: "employment", label: "Employment", status: kyc.employmentStatus },
                  ].map((item) => (
                    <div key={item.key} className="p-3 bg-background/50 rounded border border-border/50">
                      <p className="font-mono text-xs text-zinc-400 mb-1">{item.label}</p>
                      <div className="flex items-center justify-between">
                        <StatusBadge status={item.status === "verified" ? "active_tenant" : item.status === "pending" ? "pending_tenant" : item.status === "failed" ? "suspended" : "suspended"} />
                        {item.value && <span className="font-mono text-sm text-zinc-300">{item.value}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-zinc-500 font-mono">KYC not yet initiated</p>
              )}
            </div>

            {/* Timeline */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" /> Timeline
              </h2>
              <div className="space-y-4">
                {[
                  { label: "Application Created", date: app.createdAt, icon: <FileText className="w-4 h-4" />, done: true },
                  { label: "Submitted", date: app.status !== "draft" ? app.createdAt : null, icon: <CreditCard className="w-4 h-4" />, done: app.status !== "draft" },
                  { label: "KYC Verified", date: kyc?.verifiedAt, icon: <Shield className="w-4 h-4" />, done: kyc?.verifiedAt != null },
                  { label: "Risk Assessed", date: risk?.computedAt, icon: <TrendingUp className="w-4 h-4" />, done: risk?.computedAt != null },
                  { label: "Approved", date: app.status === "approved" || app.status === "disbursed" ? app.updatedAt : null, icon: <CheckCircle className="w-4 h-4" />, done: app.status === "approved" || app.status === "disbursed" },
                  { label: "Disbursed", date: app.disbursedAt, icon: <Download className="w-4 h-4" />, done: app.disbursedAt != null },
                ].map((item, index) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <div className="relative flex flex-col items-center">
                      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center border-2", item.done ? "border-primary bg-primary" : "border-zinc-700 bg-background")}>
                        {item.done ? <CheckCircle className="w-4 h-4 text-black" /> : item.icon}
                      </div>
                      {index < 5 && <div className="w-0.5 h-full bg-zinc-800 mt-1" />}
                    </div>
                    <div className="flex-1 pt-1">
                      <p className={cn("font-medium", item.done ? "text-white" : "text-zinc-500")}>{item.label}</p>
                      {item.date && <p className="font-mono text-xs text-zinc-400">{format(new Date(item.date), "MMM d, yyyy HH:mm")}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

{/* Right Column - Actions */}
            <div className="space-y-4">
              <div className="bg-card border border-border rounded-lg p-6 sticky top-24">
                <h2 className="text-lg font-semibold text-white mb-4">Actions</h2>
                <div className="space-y-3">
                  {app.status === "draft" && (
                    <button
                      onClick={() => submitMutation.mutate({ applicationId: applicationId || "" })}
                      disabled={submitMutation.isPending}
                      className="w-full px-4 py-2 bg-primary hover:bg-primary/90 text-black font-semibold font-mono text-sm rounded transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {submitMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                      Submit for Review
                    </button>
                  )}
                  {["submitted", "under_review", "kyc_pending", "kyc_verified"].includes(app.status) && (
                    <>
                      <button
                        onClick={() => {
                          if (confirm("Approve this application?")) {
                            approveMutation.mutate({
                              applicationId: applicationId || "",
                              approvedAmount: app.requestedAmount || 0,
                              approvedTenure: app.requestedTenure || 12,
                              approvedRate: 13.5,
                            });
                          }
                        }}
                        disabled={approveMutation.isPending}
                        className="w-full px-4 py-2 bg-primary hover:bg-primary/90 text-black font-semibold font-mono text-sm rounded transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {approveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                        Approve
                      </button>
                      <button
                        onClick={() => setShowRejectModal(true)}
                        disabled={rejectMutation.isPending}
                        className="w-full px-4 py-2 border border-zinc-700 text-zinc-300 hover:bg-white/5 font-semibold font-mono text-sm rounded transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {rejectMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                        Reject
                      </button>
                    </>
                  )}
                  {app.status === "approved" && (
                    <button
                      onClick={() => setShowDisburseModal(true)}
                      disabled={disburseMutation.isPending}
                      className="w-full px-4 py-2 bg-green-500 hover:bg-green-500/90 text-white font-semibold font-mono text-sm rounded transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {disburseMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Banknote className="w-4 h-4" />}
                      Disburse
                    </button>
                  )}
                  {["approved", "disbursed"].includes(app.status) && (
                    <Link href={`/applications/${applicationId}/edit`} className="w-full px-4 py-2 border border-zinc-700 text-zinc-300 hover:bg-white/5 font-semibold font-mono text-sm rounded transition-colors text-center block flex items-center justify-center gap-2">
                      <Edit className="w-4 h-4" />
                      Edit Application
                    </Link>
                  )}
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6 sticky top-24">
                <h2 className="text-lg font-semibold text-white mb-4">Quick Info</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-400 font-mono">Status</span>
                    <span className="font-medium text-white">{app.status.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400 font-mono">Risk Grade</span>
                    <span className={cn("font-bold px-2 py-0.5 rounded text-xs", riskGradeColors[risk?.grade] || "bg-gray-500/10 text-gray-400")}>
                      {risk?.grade || "PENDING"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400 font-mono">Created</span>
                    <span className="font-mono text-white">{format(new Date(app.createdAt), "MMM d, yyyy")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400 font-mono">Updated</span>
                    <span className="font-mono text-white">{format(new Date(app.updatedAt), "MMM d, yyyy")}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Reject Modal */}
            {showRejectModal && (
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                <div className="bg-[#09090b] border border-[#1e1e24] rounded-lg p-6 w-full max-w-md">
                  <h3 className="text-lg font-bold font-mono tracking-tight mb-4">Reject Application</h3>
                  <p className="text-sm text-zinc-400 mb-4">Please provide a reason for rejection.</p>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={4}
                    className="w-full bg-zinc-800 border-zinc-700 text-white rounded px-3 py-2 font-mono focus:ring-1 focus:ring-primary focus:border-primary resize-none mb-4"
                    placeholder="Rejection reason..."
                    required
                  />
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => { setShowRejectModal(false); setRejectReason(""); }}
                      className="px-4 py-2 border border-zinc-700 text-zinc-300 hover:bg-white/5 font-mono text-sm rounded transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (rejectReason.trim()) {
                          rejectMutation.mutate({ applicationId: applicationId || "", reason: rejectReason });
                          setShowRejectModal(false);
                          setRejectReason("");
                        }
                      }}
                      disabled={rejectMutation.isPending || !rejectReason.trim()}
                      className="px-4 py-2 bg-red-500 hover:bg-red-500/90 text-white font-semibold font-mono text-sm rounded transition-colors disabled:opacity-50"
                    >
                      {rejectMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Reject Application"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Disburse Modal */}
            {showDisburseModal && (
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                <div className="bg-[#09090b] border border-[#1e1e24] rounded-lg p-6 w-full max-w-md">
                  <h3 className="text-lg font-bold font-mono tracking-tight mb-4 flex items-center gap-2">
                    <Banknote className="w-5 h-5" /> Disburse Loan
                  </h3>
                  <p className="text-sm text-zinc-400 mb-4">Enter bank details for disbursement.</p>
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-xs font-mono text-zinc-400 mb-1">Bank Account Number</label>
                      <input
                        type="text"
                        value={disburseForm.bankAccount}
                        onChange={(e) => setDisburseForm({ ...disburseForm, bankAccount: e.target.value })}
                        className="w-full bg-zinc-800 border-zinc-700 text-white rounded px-3 py-2 font-mono focus:ring-1 focus:ring-primary focus:border-primary"
                        placeholder="1234567890"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-zinc-400 mb-1">IFSC Code</label>
                      <input
                        type="text"
                        value={disburseForm.ifscCode}
                        onChange={(e) => setDisburseForm({ ...disburseForm, ifscCode: e.target.value })}
                        className="w-full bg-zinc-800 border-zinc-700 text-white rounded px-3 py-2 font-mono focus:ring-1 focus:ring-primary focus:border-primary"
                        placeholder="HDFC0001234"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-zinc-400 mb-1">Disbursement Mode</label>
                      <select
                        value={disburseForm.disbursementMode}
                        onChange={(e) => setDisburseForm({ ...disburseForm, disbursementMode: e.target.value })}
                        className="w-full bg-zinc-800 border-zinc-700 text-white rounded px-3 py-2 font-mono focus:ring-1 focus:ring-primary focus:border-primary"
                      >
                        <option value="neft">NEFT</option>
                        <option value="imps">IMPS</option>
                        <option value="upi">UPI</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => { setShowDisburseModal(false); setDisburseForm({ bankAccount: "", ifscCode: "", disbursementMode: "neft" }); }}
                      className="px-4 py-2 border border-zinc-700 text-zinc-300 hover:bg-white/5 font-mono text-sm rounded transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (disburseForm.bankAccount && disburseForm.ifscCode) {
                          disburseMutation.mutate({
                            applicationId: applicationId || "",
                            bankAccount: disburseForm.bankAccount,
                            ifscCode: disburseForm.ifscCode,
                            disbursementMode: disburseForm.disbursementMode,
                          });
                          setShowDisburseModal(false);
                          setDisburseForm({ bankAccount: "", ifscCode: "", disbursementMode: "neft" });
                        }
                      }}
                      disabled={disburseMutation.isPending || !disburseForm.bankAccount || !disburseForm.ifscCode}
                      className="px-4 py-2 bg-green-500 hover:bg-green-500/90 text-white font-semibold font-mono text-sm rounded transition-colors disabled:opacity-50"
                    >
                      {disburseMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Disburse Now"}
                    </button>
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>
    </DashboardLayout>
  );
}