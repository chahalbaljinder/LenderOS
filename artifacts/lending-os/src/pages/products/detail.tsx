import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useGetLoanProduct, useUpdateLoanProduct, useListTenants } from "@workspace/api-client-react";
import { useParams, Link, useLocation } from "wouter";
import { ArrowLeft, Loader2, AlertCircle, CheckCircle, Shield, Calculator, CreditCard, Calendar, FileText, AlertTriangle, DollarSign, Percent, Clock, Edit, Trash2, Eye, Shield as ShieldIcon, Building2, Database, FileText as FileTextIcon, Percent as PercentIcon, Calendar as CalendarIcon, DollarSign as DollarSignIcon, Clock as ClockIcon, Shield as ShieldIcon2 } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function ProductDetailPage() {
  const params = useParams<{ productId: string }>();
  const [, setLocation] = useLocation();
  const productId = params.productId;

  const { data: product, isLoading: loading, isError } = useGetLoanProduct({ path: { productId: productId || "" } });
  const updateMutation = useUpdateLoanProduct();

  if (loading) {
    return (
      <DashboardLayout activeTab="products">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (isError || !product) {
    return (
      <DashboardLayout activeTab="products">
        <div className="flex items-center justify-center h-64 text-zinc-400 font-mono">
          Product not found
        </div>
      </DashboardLayout>
    );
  }

  const typeLabels: Record<string, string> = {
    personal: "Personal Loan",
    business: "Business Loan",
    msme: "MSME Loan",
    education: "Education Loan",
    medical: "Medical Loan",
    home: "Home Loan",
    gold: "Gold Loan",
    vehicle: "Vehicle Loan",
    salary_advance: "Salary Advance",
    bnpl: "BNPL",
    credit_line: "Credit Line",
  };

  return (
    <DashboardLayout activeTab="products">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link href="/products" className="p-2 hover:bg-white/5 rounded transition-colors text-zinc-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-semibold text-white">{product.name}</h1>
                <span className={cn("px-2 py-1 rounded text-xs font-mono border", product.isActive ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-gray-500/20 text-gray-400 border-gray-500/30")}>
                  {product.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="font-mono text-sm text-zinc-400">
                {typeLabels[product.type] || product.type} • Created {format(new Date(product.createdAt), "MMM d, yyyy")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/products" className="px-3 py-1.5 border border-zinc-700 text-zinc-300 hover:bg-white/5 font-mono text-xs rounded transition-colors">
              Back to List
            </Link>
            <Link href={`/products/${productId}/edit`} className="px-3 py-1.5 border border-zinc-700 text-zinc-300 hover:bg-white/5 font-mono text-xs rounded transition-colors flex items-center gap-1">
              <Edit className="w-3 h-3" /> Edit
            </Link>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Core Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Financial Parameters */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <DollarSignIcon className="w-5 h-5" /> Financial Parameters
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="font-mono text-xs text-zinc-400">Interest Rate</p>
                  <p className="text-xl font-semibold text-white">{product.interestRate}% p.a.</p>
                </div>
                <div className="space-y-1">
                  <p className="font-mono text-xs text-zinc-400">Processing Fee</p>
                  <p className="text-xl font-semibold text-white">{product.processingFeePercent}%</p>
                </div>
                <div className="space-y-1">
                  <p className="font-mono text-xs text-zinc-400">Prepayment Penalty</p>
                  <p className="text-xl font-semibold text-white">{product.prepaymentPenaltyPercent ? `${product.prepaymentPenaltyPercent}%` : "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="font-mono text-xs text-zinc-400">Amount Range</p>
                  <p className="text-xl font-semibold text-white">₹{product.minAmount?.toLocaleString()} – ₹{product.maxAmount?.toLocaleString()}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="font-mono text-xs text-zinc-400">Tenure Range</p>
                  <p className="text-xl font-semibold text-white">{product.minTenureMonths} – {product.maxTenureMonths} months</p>
                </div>
                <div className="space-y-1">
                  <p className="font-mono text-xs text-zinc-400">Prepayment Penalty</p>
                  <p className="text-xl font-semibold text-white">{product.prepaymentPenaltyPercent ? `${product.prepaymentPenaltyPercent}%` : "—"}</p>
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <ShieldIcon2 className="w-5 h-5" /> Product Info
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-mono text-xs text-zinc-400">Type</span>
                    <span className="font-medium text-white">{typeLabels[product.type] || product.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-mono text-xs text-zinc-400">Status</span>
                    <span className={cn("font-bold px-2 py-0.5 rounded text-xs", product.isActive ? "text-emerald-400" : "text-gray-400")}>
                      {product.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-mono text-xs text-zinc-400">Created</span>
                    <span className="font-mono text-sm text-white">{format(new Date(product.createdAt), "MMM d, yyyy")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-mono text-xs text-zinc-400">Updated</span>
                    <span className="font-mono text-sm text-white">{format(new Date(product.updatedAt), "MMM d, yyyy")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-mono text-xs text-zinc-400">Product ID</span>
                    <span className="font-mono text-sm text-zinc-300">{product.id}</span>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <FileTextIcon className="w-5 h-5" /> Eligibility Criteria
                </h2>
                <div className="prose text-zinc-300 whitespace-pre-wrap">
                  {product.eligibilityCriteria || "No eligibility criteria defined"}
                </div>
              </div>
            </div>

            {/* Required Documents */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FileTextIcon className="w-5 h-5" /> Required Documents
              </h2>
              {product.requiredDocuments && product.requiredDocuments.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {product.requiredDocuments.map((doc: string, idx: number) => (
                    <span key={idx} className="px-3 py-1 bg-zinc-800 border border-zinc-700 rounded text-sm font-mono text-zinc-300">
                      {doc}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-zinc-500 font-mono">No documents configured</p>
              )}
            </div>
          </div>

          {/* Right Column - Actions & Quick Info */}
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-lg p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-white mb-4">Actions</h2>
              <div className="space-y-3">
                <Link href={`/products/${productId}/edit`} className="w-full px-4 py-2 bg-primary hover:bg-primary/90 text-black font-semibold font-mono text-sm rounded transition-colors flex items-center justify-center gap-2">
                  <Edit className="w-4 h-4" /> Edit Product
                </Link>
                <button className="w-full px-4 py-2 border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20 font-semibold font-mono text-sm rounded transition-colors flex items-center justify-center gap-2">
                  <Trash2 className="w-4 h-4" /> Archive Product
                </button>
                <button className="w-full px-4 py-2 border border-zinc-700 text-zinc-300 hover:bg-white/5 font-semibold font-mono text-sm rounded transition-colors flex items-center justify-center gap-2">
                  <Eye className="w-4 h-4" /> View Applications
                </button>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-white mb-4">Quick Info</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-400 font-mono">Status</span>
                  <span className={cn("font-bold px-2 py-0.5 rounded text-xs", product.isActive ? "text-emerald-400" : "text-gray-400")}>
                    {product.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400 font-mono">Type</span>
                  <span className="font-medium text-white">{typeLabels[product.type] || product.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400 font-mono">Interest Rate</span>
                  <span className="font-mono text-white">{product.interestRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400 font-mono">Processing Fee</span>
                  <span className="font-mono text-white">{product.processingFeePercent}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400 font-mono">Amount Range</span>
                  <span className="font-mono text-white">₹{product.minAmount?.toLocaleString()} – ₹{product.maxAmount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400 font-mono">Tenure</span>
                  <span className="font-mono text-white">{product.minTenureMonths} – {product.maxTenureMonths} months</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400 font-mono">Created</span>
                  <span className="font-mono text-white">{format(new Date(product.createdAt), "MMM d, yyyy")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}