import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useCreateLoanProduct, useListTenants } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Loader2, AlertCircle, CheckCircle, Shield, Calculator, CreditCard, Calendar, FileText, AlertTriangle, DollarSign, Percent, Clock, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const productTypes = [
  { value: "personal", label: "Personal Loan" },
  { value: "business", label: "Business Loan" },
  { value: "msme", label: "MSME Loan" },
  { value: "education", label: "Education Loan" },
  { value: "medical", label: "Medical Loan" },
  { value: "home", label: "Home Loan" },
  { value: "gold", label: "Gold Loan" },
  { value: "vehicle", label: "Vehicle Loan" },
  { value: "salary_advance", label: "Salary Advance" },
  { value: "bnpl", label: "BNPL" },
  { value: "credit_line", label: "Credit Line" },
];

export default function NewProductPage() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    tenantId: "",
    name: "",
    description: "",
    type: "personal",
    minAmount: "",
    maxAmount: "",
    minTenureMonths: "",
    maxTenureMonths: "",
    interestRate: "",
    processingFeePercent: "",
    prepaymentPenaltyPercent: "",
    isActive: true,
    requiredDocuments: [] as string[],
    eligibilityCriteria: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: tenantsRes } = useListTenants();
  const createMutation = useCreateLoanProduct({
    onSuccess: (data) => {
      setLocation(`/products/${data.id}`);
    },
    onError: (err) => {
      setErrors({ submit: err.message || "Failed to create product" });
    },
  });

  const commonDocuments = [
    "PAN Card",
    "Aadhaar Card",
    "Bank Statements (6 months)",
    "Salary Slips (3 months)",
    "Income Tax Returns (2 years)",
    "Address Proof",
    "Identity Proof",
    "Photographs",
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.tenantId) newErrors.tenantId = "Tenant is required";
    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.type) newErrors.type = "Product type is required";
    if (!formData.minAmount) newErrors.minAmount = "Minimum amount is required";
    else if (parseFloat(formData.minAmount) <= 0) newErrors.minAmount = "Must be greater than 0";
    if (!formData.maxAmount) newErrors.maxAmount = "Maximum amount is required";
    else if (parseFloat(formData.maxAmount) < parseFloat(formData.minAmount || "0")) newErrors.maxAmount = "Must be greater than minimum amount";
    if (!formData.minTenureMonths) newErrors.minTenureMonths = "Minimum tenure is required";
    else if (parseInt(formData.minTenureMonths) <= 0) newErrors.minTenureMonths = "Must be greater than 0";
    if (!formData.maxTenureMonths) newErrors.maxTenureMonths = "Maximum tenure is required";
    else if (parseInt(formData.maxTenureMonths) < parseInt(formData.minTenureMonths || "0")) newErrors.maxTenureMonths = "Must be greater than minimum tenure";
    if (!formData.interestRate) newErrors.interestRate = "Interest rate is required";
    else if (parseFloat(formData.interestRate) <= 0) newErrors.interestRate = "Must be greater than 0";
    if (!formData.processingFeePercent) newErrors.processingFeePercent = "Processing fee is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      createMutation.mutate({
        tenantId: formData.tenantId,
        name: formData.name,
        description: formData.description || undefined,
        type: formData.type,
        minAmount: formData.minAmount,
        maxAmount: formData.maxAmount,
        minTenureMonths: parseInt(formData.minTenureMonths),
        maxTenureMonths: parseInt(formData.maxTenureMonths),
        interestRate: parseFloat(formData.interestRate),
        processingFeePercent: parseFloat(formData.processingFeePercent),
        prepaymentPenaltyPercent: formData.prepaymentPenaltyPercent ? parseFloat(formData.prepaymentPenaltyPercent) : undefined,
        isActive: formData.isActive,
        requiredDocuments: formData.requiredDocuments,
        eligibilityCriteria: formData.eligibilityCriteria || undefined,
      });
    }
  };

  const tenants = tenantsRes?.data || [];
  const handleDocToggle = (doc: string) => {
    setFormData({
      ...formData,
      requiredDocuments: formData.requiredDocuments.includes(doc)
        ? formData.requiredDocuments.filter((d) => d !== doc)
        : [...formData.requiredDocuments, doc],
    });
  };

  return (
    <DashboardLayout activeTab="products">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/products" className="p-2 hover:bg-white/5 rounded transition-colors text-zinc-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-white">Create Loan Product</h1>
            <p className="font-mono text-sm text-zinc-400">Define a new lending product with rates, terms, and eligibility</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-card border border-border rounded-lg p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="block text-xs font-mono text-zinc-400 mb-1">Tenant</label>
              <select
                value={formData.tenantId}
                onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })}
                className={cn("w-full bg-zinc-800 border-zinc-700 text-white rounded px-3 py-2 font-mono focus:ring-1 focus:ring-primary focus:border-primary", errors.tenantId && "border-red-500 focus:ring-red-500 focus:border-red-500")}
                required
              >
                <option value="">Select tenant...</option>
                {tenants.map((t: any) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              {errors.tenantId && <p className="mt-1 text-sm text-red-400">{errors.tenantId}</p>}
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">Product Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={cn("w-full bg-zinc-800 border-zinc-700 text-white rounded px-3 py-2 font-mono focus:ring-1 focus:ring-primary focus:border-primary", errors.name && "border-red-500 focus:ring-red-500 focus:border-red-500")}
                placeholder="Personal Loan Prime"
              />
              {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">Product Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className={cn("w-full bg-zinc-800 border-zinc-700 text-white rounded px-3 py-2 font-mono focus:ring-1 focus:ring-primary focus:border-primary", errors.type && "border-red-500 focus:ring-red-500 focus:border-red-500")}
              >
                {productTypes.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              {errors.type && <p className="mt-1 text-sm text-red-400">{errors.type}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-mono text-zinc-400 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full bg-zinc-800 border-zinc-700 text-white rounded px-3 py-2 font-mono focus:ring-1 focus:ring-primary focus:border-primary resize-none"
                placeholder="Brief description of the product..."
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">Min Amount (₹)</label>
              <input
                type="number"
                value={formData.minAmount}
                onChange={(e) => setFormData({ ...formData, minAmount: e.target.value })}
                className={cn("w-full bg-zinc-800 border-zinc-700 text-white rounded px-3 py-2 font-mono focus:ring-1 focus:ring-primary focus:border-primary", errors.minAmount && "border-red-500 focus:ring-red-500 focus:border-red-500")}
                placeholder="50000"
                min="1"
              />
              {errors.minAmount && <p className="mt-1 text-sm text-red-400">{errors.minAmount}</p>}
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">Max Amount (₹)</label>
              <input
                type="number"
                value={formData.maxAmount}
                onChange={(e) => setFormData({ ...formData, maxAmount: e.target.value })}
                className={cn("w-full bg-zinc-800 border-zinc-700 text-white rounded px-3 py-2 font-mono focus:ring-1 focus:ring-primary focus:border-primary", errors.maxAmount && "border-red-500 focus:ring-red-500 focus:border-red-500")}
                placeholder="1000000"
                min="1"
              />
              {errors.maxAmount && <p className="mt-1 text-sm text-red-400">{errors.maxAmount}</p>}
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">Min Tenure (months)</label>
              <input
                type="number"
                value={formData.minTenureMonths}
                onChange={(e) => setFormData({ ...formData, minTenureMonths: e.target.value })}
                className={cn("w-full bg-zinc-800 border-zinc-700 text-white rounded px-3 py-2 font-mono focus:ring-1 focus:ring-primary focus:border-primary", errors.minTenureMonths && "border-red-500 focus:ring-red-500 focus:border-red-500")}
                placeholder="12"
                min="1"
              />
              {errors.minTenureMonths && <p className="mt-1 text-sm text-red-400">{errors.minTenureMonths}</p>}
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">Max Tenure (months)</label>
              <input
                type="number"
                value={formData.maxTenureMonths}
                onChange={(e) => setFormData({ ...formData, maxTenureMonths: e.target.value })}
                className={cn("w-full bg-zinc-800 border-zinc-700 text-white rounded px-3 py-2 font-mono focus:ring-1 focus:ring-primary focus:border-primary", errors.maxTenureMonths && "border-red-500 focus:ring-red-500 focus:border-red-500")}
                placeholder="60"
                min="1"
              />
              {errors.maxTenureMonths && <p className="mt-1 text-sm text-red-400">{errors.maxTenureMonths}</p>}
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">Interest Rate (% p.a.)</label>
              <input
                type="number"
                step="0.1"
                value={formData.interestRate}
                onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                className={cn("w-full bg-zinc-800 border-zinc-700 text-white rounded px-3 py-2 font-mono focus:ring-1 focus:ring-primary focus:border-primary", errors.interestRate && "border-red-500 focus:ring-red-500 focus:border-red-500")}
                placeholder="13.5"
                min="0.1"
                max="36"
              />
              {errors.interestRate && <p className="mt-1 text-sm text-red-400">{errors.interestRate}</p>}
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">Processing Fee (%)</label>
              <input
                type="number"
                step="0.1"
                value={formData.processingFeePercent}
                onChange={(e) => setFormData({ ...formData, processingFeePercent: e.target.value })}
                className={cn("w-full bg-zinc-800 border-zinc-700 text-white rounded px-3 py-2 font-mono focus:ring-1 focus:ring-primary focus:border-primary", errors.processingFeePercent && "border-red-500 focus:ring-red-500 focus:border-red-500")}
                placeholder="1.0"
                min="0"
                max="10"
              />
              {errors.processingFeePercent && <p className="mt-1 text-sm text-red-400">{errors.processingFeePercent}</p>}
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">Prepayment Penalty (%)</label>
              <input
                type="number"
                step="0.1"
                value={formData.prepaymentPenaltyPercent}
                onChange={(e) => setFormData({ ...formData, prepaymentPenaltyPercent: e.target.value })}
                className="w-full bg-zinc-800 border-zinc-700 text-white rounded px-3 py-2 font-mono focus:ring-1 focus:ring-primary focus:border-primary"
                placeholder="2.0"
                min="0"
                max="10"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-mono text-zinc-400 mb-2">Required Documents</label>
              <div className="flex flex-wrap gap-2">
                {commonDocuments.map((doc) => (
                  <label key={doc} className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 border rounded text-sm font-mono cursor-pointer transition-colors",
                    formData.requiredDocuments.includes(doc)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-zinc-700 text-zinc-300 hover:border-zinc-600"
                  )}>
                    <input
                      type="checkbox"
                      checked={formData.requiredDocuments.includes(doc)}
                      onChange={() => handleDocToggle(doc)}
                      className="w-4 h-4 accent-primary" />
                    {doc}
                  </label>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-mono text-zinc-400 mb-1">Eligibility Criteria</label>
              <textarea
                value={formData.eligibilityCriteria}
                onChange={(e) => setFormData({ ...formData, eligibilityCriteria: e.target.value })}
                rows={3}
                className="w-full bg-zinc-800 border-zinc-700 text-white rounded px-3 py-2 font-mono focus:ring-1 focus:ring-primary focus:border-primary resize-none"
                placeholder="e.g., Minimum age 21, CIBIL score > 650, stable employment for 2+ years..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.value })}
                  className="w-4 h-4 accent-primary" />
                <span className="font-mono text-sm text-zinc-300">Active (visible to customers and agents)</span>
              </label>
            </div>
          </div>

          {errors.submit && (
            <div className="flex items-center gap-2 p-3 bg-red-950/50 border border-red-500/30 rounded text-red-400 text-sm font-mono">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {errors.submit}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Link href="/products" className="px-4 py-2 border border-zinc-700 text-zinc-300 hover:bg-white/5 font-mono text-sm rounded transition-colors">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-black font-semibold font-mono text-sm rounded transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Create Product
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}