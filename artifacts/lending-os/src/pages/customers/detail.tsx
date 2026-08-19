import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useGetCustomer, useUpdateCustomer, useGetCustomerCreditReport, useListLoanApplications, useListLoans } from "@workspace/api-client-react";
import { useParams, Link, useLocation } from "wouter";
import { ArrowLeft, Loader2, CreditCard, User, Calendar, DollarSign, Shield, FileText, AlertTriangle, CheckCircle, AlertCircle, TrendingUp, Download, Eye, Edit, Mail, Phone, MapPin, Clock, Shield as ShieldIcon } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/ui/data-table";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function CustomerDetailPage() {
  const params = useParams<{ customerId: string }>();
  const [, setLocation] = useLocation();
  const customerId = params.customerId;

  const { data: customer, isLoading: loading, isError } = useGetCustomer({ path: { customerId: customerId || "" } });
  const { data: applicationsRes } = useListLoanApplications({ query: { customerId: customerId || "" } });
  const { data: loansRes } = useListLoans({ query: { customerId: customerId || "" } });
  const { data: creditReport } = useGetCustomerCreditReport({ path: { customerId: customerId || "" } });
  const updateMutation = useUpdateCustomer();

  if (loading) {
    return (
      <DashboardLayout activeTab="customers">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (isError || !customer) {
    return (
      <DashboardLayout activeTab="customers">
        <div className="flex items-center justify-center h-64 text-zinc-400 font-mono">
          Customer not found
        </div>
      </DashboardLayout>
    );
  }

  const [activeTab, setActiveTab] = useState("profile");

  const handleUpdate = (field: string, value: string) => {
    updateMutation.mutate({
      path: { customerId: customerId || "" },
      [field]: value,
    });
  };

  const applications = applicationsRes?.data || [];
  const loans = loansRes?.data || [];

  const statusColors: Record<string, string> = {
    active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    inactive: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    blacklisted: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  const applicationStatusColors: Record<string, string> = {
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

  const loanStatusColors: Record<string, string> = {
    active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    closed: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    npa: "bg-red-500/20 text-red-400 border-red-500/30",
    written_off: "bg-gray-900/20 text-gray-500 border-gray-900/30",
  };

  return (
    <DashboardLayout activeTab="customers">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link href="/customers" className="p-2 hover:bg-white/5 rounded transition-colors text-zinc-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-semibold text-white">
                  {customer.firstName} {customer.lastName}
                </h1>
                <span className={cn("px-2 py-1 rounded text-xs font-mono border", statusColors[customer.status] || "bg-gray-500/20 text-gray-400 border-gray-500/30")}>
                  {customer.status?.charAt(0).toUpperCase() + customer.status?.slice(1) || "Active"}
                </span>
              </div>
              <p className="font-mono text-sm text-zinc-400">
                {customer.email} • {customer.phone} • CID: {customerId?.slice(0, 8)}...
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/customers" className="px-3 py-1.5 border border-zinc-700 text-zinc-300 hover:bg-white/5 font-mono text-xs rounded transition-colors">
              Back to List
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border mb-6">
          {[
            { id: "profile", label: "Profile", icon: <User className="w-4 h-4" /> },
            { id: "applications", label: "Applications", icon: <FileText className="w-4 h-4" /> },
            { id: "loans", label: "Loans", icon: <CreditCard className="w-4 h-4" /> },
            { id: "credit", label: "Credit Report", icon: <ShieldIcon className="w-4 h-4" /> },
            { id: "kyc", label: "KYC", icon: <Shield className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-mono border-b-2 transition-colors",
                activeTab === tab.id
                  ? "text-primary border-primary"
                  : "text-zinc-400 hover:text-white border-transparent"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            {/* Personal Info */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5" /> Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="font-mono text-xs text-zinc-400">Full Name</p>
                  <p className="text-white">{customer.firstName} {customer.lastName}</p>
                </div>
                <div className="space-y-1">
                  <p className="font-mono text-xs text-zinc-400">Email</p>
                  <p className="text-white">{customer.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="font-mono text-xs text-zinc-400">Phone</p>
                  <p className="text-white">{customer.phone}</p>
                </div>
                <div className="space-y-1">
                  <p className="font-mono text-xs text-zinc-400">Date of Birth</p>
                  <p className="text-white">{customer.dateOfBirth ? format(new Date(customer.dateOfBirth), "MMM d, yyyy") : "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="font-mono text-xs text-zinc-400">Gender</p>
                  <p className="text-white">{customer.gender || "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="font-mono text-xs text-zinc-400">PAN</p>
                  <p className="font-mono text-white">{customer.panNumber || "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="font-mono text-xs text-zinc-400">Aadhaar</p>
                  <p className="font-mono text-white">{customer.aadhaarNumber || "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="font-mono text-xs text-zinc-400">Employment</p>
                  <p className="text-white">{customer.employmentType || "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="font-mono text-xs text-zinc-400">Monthly Income</p>
                  <p className="text-white">{customer.monthlyIncome ? `₹${Number(customer.monthlyIncome).toLocaleString()}` : "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="font-mono text-xs text-zinc-400">Credit Score</p>
                  <p className="text-white">{customer.creditScore?.toString() || "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="font-mono text-xs text-zinc-400">KYC Status</p>
                  <p className="text-white">{customer.kycStatus || "pending"}</p>
                </div>
                <div className="space-y-1">
                  <p className="font-mono text-xs text-zinc-400">Status</p>
                  <p className="text-white">
                    <StatusBadge status={customer.status} />
                  </p>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" /> Address
              </h2>
              <div className="space-y-2">
                <p className="text-white">{customer.address || "No address provided"}</p>
                <p className="text-sm text-zinc-400">
                  {customer.city || "—"}, {customer.state || "—"} {customer.pincode || ""}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setActiveTab("applications")}
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-black font-semibold font-mono text-sm rounded transition-colors flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" /> View Applications
                </button>
                <button
                  onClick={() => setActiveTab("loans")}
                  className="px-4 py-2 border border-zinc-700 text-zinc-300 hover:bg-white/5 font-semibold font-mono text-sm rounded transition-colors"
                >
                  <CreditCard className="w-4 h-4" /> View Loans
                </button>
                <button
                  onClick={() => setActiveTab("credit")}
                  className="px-4 py-2 border border-zinc-700 text-zinc-300 hover:bg-white/5 font-semibold font-mono text-sm rounded transition-colors"
                >
                  <ShieldIcon className="w-4 h-4" /> Credit Report
                </button>
                <button
                  onClick={() => setActiveTab("kyc")}
                  className="px-4 py-2 border border-zinc-700 text-zinc-300 hover:bg-white/5 font-semibold font-mono text-sm rounded transition-colors"
                >
                  <Shield className="w-4 h-4" /> View KYC
                </button>
</div>
        </div>
      </div>
      )}

      {/* Applications Tab */}
        {activeTab === "applications" && (
          <div>
            <div className="flex justify-between items-end mb-4">
              <h2 className="text-lg font-semibold text-white">Loan Applications ({applications.length})</h2>
              <Link href="/applications/new" className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-black font-semibold font-mono text-xs rounded transition-colors flex items-center gap-1">
                <Plus className="w-3 h-3" /> New Application
              </Link>
            </div>
            <DataTable
              columns={[
                { key: "appId", header: "App ID", accessor: (row: any) => <span className="font-mono text-sm text-zinc-400">{row.applicationNumber || row.id.slice(0, 8).toUpperCase()}</span>, width: "120px" },
                { key: "product", header: "Product", accessor: (row: any) => <span className="font-mono text-sm text-zinc-400">{row.productName || "Standard Loan"}</span> },
                { key: "amount", header: "Amount", accessor: (row: any) => <div className="font-mono text-sm text-white text-right">₹{row.requestedAmount?.toLocaleString()}</div>, align: "right" as const, width: "140px" },
                { key: "status", header: "Status", accessor: (row: any) => <StatusBadge status={row.status} />, width: "140px" },
                { key: "risk", header: "Risk", accessor: (row: any) => {
                  const grade = row.riskGrade;
                  if (!grade) return <span className="font-mono text-xs text-zinc-600">PENDING</span>;
                  return <span className={cn("inline-flex font-mono text-sm font-bold px-2 py-1 rounded", ["A1","A2"].includes(grade) ? "bg-primary/10 text-primary" : ["B1","B2"].includes(grade) ? "bg-yellow-500/10 text-yellow-500" : "bg-destructive/10 text-destructive")}>{grade}</span>;
                }, width: "100px" },
                { key: "date", header: "Created", accessor: (row: any) => <span className="font-mono text-sm text-zinc-400">{format(new Date(row.createdAt), "MMM d, yyyy")}</span>, width: "120px" },
              ]}
              data={applications}
              isLoading={false}
              rowKey={(row) => row.id}
              emptyMessage="No applications found"
              showSearch={false}
              pagination={false}
              onRowClick={(row) => setLocation(`/applications/${row.id}`)}
              ariaLabel="Customer applications table"
            />
          </div>
        )}

        {/* Loans Tab */}
        {activeTab === "loans" && (
          <div>
            <div className="flex justify-between items-end mb-4">
              <h2 className="text-lg font-semibold text-white">Active Loans ({loans.length})</h2>
            </div>
            {loans.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-white mb-2">No Active Loans</h2>
                <p className="text-zinc-400 font-mono">This customer has no active loans.</p>
              </div>
            ) : (
              <DataTable
                columns={[
                  { key: "loanNumber", header: "Loan #", accessor: (row: any) => <div className="font-mono text-sm text-white">{row.loanNumber || row.id.slice(0, 8).toUpperCase()}</div>, width: "120px" },
                  { key: "principal", header: "Principal", accessor: (row: any) => <div className="font-mono text-sm text-white text-right">₹{row.principalAmount?.toLocaleString()}</div>, align: "right" as const, width: "140px" },
                  { key: "outstanding", header: "Outstanding", accessor: (row: any) => <div className="font-mono text-sm text-primary text-right">₹{row.outstandingAmount?.toLocaleString()}</div>, align: "right" as const, width: "140px" },
                  { key: "emi", header: "EMI", accessor: (row: any) => <div className="font-mono text-sm text-white text-right">₹{row.emiAmount?.toLocaleString()}</div>, align: "right" as const, width: "120px" },
                  { key: "nextEmi", header: "Next Due", accessor: (row: any) => <div className="font-mono text-sm text-zinc-300">{row.nextEmiDate ? format(new Date(row.nextEmiDate), "MMM d, yyyy") : "—"}</div>, width: "130px" },
                  { key: "dpd", header: "DPD", accessor: (row: any) => {
                    const dpd = row.dpd || 0;
                    return <span className={cn("font-mono text-sm font-medium", dpd > 90 ? "text-destructive" : dpd > 30 ? "text-yellow-500" : dpd > 0 ? "text-blue-500" : "text-primary")}>{dpd === 0 ? "Current" : `${dpd} days`}</span>;
                  }, width: "100px" },
                  { key: "status", header: "Status", accessor: (row: any) => <StatusBadge status={row.status} />, width: "130px" },
                ]}
                data={loans}
                isLoading={false}
                rowKey={(row) => row.id}
                emptyMessage="No loans found"
                showSearch={false}
                pagination={false}
                onRowClick={(row) => setLocation(`/loans/${row.id}`)}
                ariaLabel="Customer loans table"
              />
            )}
          </div>
        )}

        {/* Credit Report Tab */}
        {activeTab === "credit" && (
          <div>
            <div className="flex justify-between items-end mb-4">
              <h2 className="text-lg font-semibold text-white">Credit Report</h2>
              <p className="font-mono text-sm text-zinc-400">Latest credit bureau report</p>
            </div>
            {creditReport ? (
              <div className="space-y-6">
                <div className="bg-card border border-border rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <ShieldIcon className="w-5 h-5" /> Credit Score Overview
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-primary/10 border border-primary/30 rounded-lg p-5">
                      <p className="font-mono text-xs text-zinc-400 mb-1">Credit Score</p>
                      <p className="text-4xl font-bold text-white">{creditReport.creditScore || "—"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="font-mono text-xs text-zinc-400">Bureau</p>
                      <p className="font-medium text-white">{creditReport.bureau || "—"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="font-mono text-xs text-zinc-400">Report Date</p>
                      <p className="font-mono text-white">{creditReport.reportDate ? format(new Date(creditReport.reportDate), "MMM d, yyyy") : "—"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="font-mono text-xs text-zinc-400">Total Accounts</p>
                      <p className="font-mono text-white">{creditReport.totalAccounts?.toString() || "—"}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div><p className="font-mono text-xs text-zinc-400 mb-1">Active Accounts</p><p className="font-mono text-white">{creditReport.activeAccounts?.toString() || "—"}</p></div>
                    <div><p className="font-mono text-xs text-zinc-400 mb-1">Closed Accounts</p><p className="font-mono text-white">{creditReport.closedAccounts?.toString() || "—"}</p></div>
                    <div><p className="font-mono text-xs text-zinc-400 mb-1">Total Outstanding</p><p className="font-mono text-white">₹{creditReport.totalOutstanding?.toLocaleString() || "0"}</p></div>
                    <div><p className="font-mono text-xs text-zinc-400 mb-1">Overdue Amount</p><p className="font-mono text-white text-red-400">₹{creditReport.overdueAmount?.toLocaleString() || "0"}</p></div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="font-mono text-xs text-zinc-400 mb-1">Payment History</p>
                    <p className="font-mono text-white">{creditReport.paymentHistory || "—"}</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="bg-card border border-border rounded-lg p-6">
                    <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" /> Inquiries (Last 30 Days)
                    </h3>
                    <p className="text-3xl font-bold font-mono text-white">{creditReport.inquiries30Days || 0}</p>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-6">
                    <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                      <FileText className="w-5 h-5" /> Report Details
                    </h3>
                    <p className="text-zinc-400 font-mono">Bureau: {creditReport.bureau || "—"}</p>
                    <p className="text-zinc-400 font-mono mt-1">Generated: {creditReport.reportDate ? format(new Date(creditReport.reportDate), "MMM d, yyyy") : "—"}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <ShieldIcon className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-white mb-2">No Credit Report Available</h2>
                <p className="text-zinc-400 font-mono mb-6">No credit bureau report found for this customer.</p>
              </div>
            )}
          </div>
        )}

        {/* KYC Tab */}
        {activeTab === "kyc" && (
          <div>
            <div className="flex justify-between items-end mb-4">
              <h2 className="text-lg font-semibold text-white">KYC Verification</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[
                { key: "pan", label: "PAN Verification", icon: <FileText className="w-5 h-5" />, status: "verified", color: "text-green-400" },
                { key: "aadhaar", label: "Aadhaar Verification", icon: <Shield className="w-5 h-5" />, status: "pending", color: "text-yellow-500" },
                { key: "face", label: "Face/Liveness", icon: <User className="w-5 h-5" />, status: "pending", color: "text-yellow-500" },
                { key: "employment", label: "Employment", icon: <Briefcase className="w-5 h-5" />, status: "pending", color: "text-yellow-500" },
              ].map((item) => (
                <div key={item.key} className="bg-card border border-border rounded-lg p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-zinc-800 border border-zinc-800 flex items-center justify-center rounded">
                      {item.icon}
                    </div>
                    <div>
                      <p className="font-medium text-white">{item.label}</p>
                      <p className="font-mono text-xs text-zinc-400">Customer KYC</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <StatusBadge status={item.status === "verified" ? "active_tenant" : item.status === "pending" ? "pending_tenant" : "suspended"} />
                    <span className={cn("font-mono text-xs", item.color)}>{item.status}</span>
                  </div>
                  <button className="mt-3 w-full px-3 py-1.5 border border-zinc-700 text-zinc-300 hover:bg-white/5 font-mono text-xs rounded transition-colors flex items-center justify-center gap-1">
                    <Eye className="w-3 h-3" /> View Details
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}