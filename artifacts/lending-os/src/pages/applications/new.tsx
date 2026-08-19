import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useCreateLoanApplication, useListCustomers, useListLoanProducts } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, UserPlus, Loader2, AlertCircle, CheckCircle, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

export default function NewApplicationPage() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    customerId: "",
    productId: "",
    requestedAmount: "",
    requestedTenure: "",
    purpose: "",
    bankAccount: "",
    ifscCode: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: customersRes } = useListCustomers();
  const { data: productsRes } = useListLoanProducts();

  const createMutation = useCreateLoanApplication({
    onSuccess: (data) => {
      setLocation(`/applications/${data.id}`);
    },
    onError: (err) => {
      setErrors({ submit: err.message || "Failed to create application" });
    },
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.customerId) newErrors.customerId = "Customer is required";
    if (!formData.productId) newErrors.productId = "Product is required";
    if (!formData.requestedAmount) newErrors.requestedAmount = "Requested amount is required";
    else if (parseFloat(formData.requestedAmount) <= 0) newErrors.requestedAmount = "Amount must be greater than 0";
    if (!formData.requestedTenure) newErrors.requestedTenure = "Tenure is required";
    else if (parseInt(formData.requestedTenure) <= 0) newErrors.requestedTenure = "Tenure must be greater than 0";
    if (!formData.purpose.trim()) newErrors.purpose = "Purpose is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      createMutation.mutate({
        customerId: formData.customerId,
        productId: formData.productId,
        requestedAmount: formData.requestedAmount,
        requestedTenure: parseInt(formData.requestedTenure),
        purpose: formData.purpose,
        bankAccount: formData.bankAccount || undefined,
        ifscCode: formData.ifscCode || undefined,
      });
    }
  };

  const customers = customersRes?.data || [];
  const products = productsRes?.data || [];

  return (
    <DashboardLayout activeTab="applications">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/applications" className="p-2 hover:bg-white/5 rounded transition-colors text-zinc-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-white">New Loan Application</h1>
            <p className="font-mono text-sm text-zinc-400">Submit a new application for underwriting</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-card border border-border rounded-lg p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">Customer</label>
              <select
                value={formData.customerId}
                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                className={cn("w-full bg-zinc-800 border-zinc-700 text-white rounded px-3 py-2 font-mono focus:ring-1 focus:ring-primary focus:border-primary", errors.customerId && "border-red-500 focus:ring-red-500 focus:border-red-500")}
              >
                <option value="">Select customer...</option>
                {customers.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.firstName} {c.lastName} ({c.email})
                  </option>
                ))}
              </select>
              {errors.customerId && <p className="mt-1 text-sm text-red-400">{errors.customerId}</p>}
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">Loan Product</label>
              <select
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                className={cn("w-full bg-zinc-800 border-zinc-700 text-white rounded px-3 py-2 font-mono focus:ring-1 focus:ring-primary focus:border-primary", errors.productId && "border-red-500 focus:ring-red-500 focus:border-red-500")}
              >
                <option value="">Select product...</option>
                {products.map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.type}) - {p.interestRate}% - ₹{p.minAmount?.toLocaleString()}–₹{p.maxAmount?.toLocaleString()}
                  </option>
                ))}
              </select>
              {errors.productId && <p className="mt-1 text-sm text-red-400">{errors.productId}</p>}
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">Requested Amount (₹)</label>
              <input
                type="number"
                value={formData.requestedAmount}
                onChange={(e) => setFormData({ ...formData, requestedAmount: e.target.value })}
                className={cn("w-full bg-zinc-800 border-zinc-700 text-white rounded px-3 py-2 font-mono focus:ring-1 focus:ring-primary focus:border-primary", errors.requestedAmount && "border-red-500 focus:ring-red-500 focus:border-red-500")}
                placeholder="500000"
                min="1"
              />
              {errors.requestedAmount && <p className="mt-1 text-sm text-red-400">{errors.requestedAmount}</p>}
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">Tenure (months)</label>
              <input
                type="number"
                value={formData.requestedTenure}
                onChange={(e) => setFormData({ ...formData, requestedTenure: e.target.value })}
                className={cn("w-full bg-zinc-800 border-zinc-700 text-white rounded px-3 py-2 font-mono focus:ring-1 focus:ring-primary focus:border-primary", errors.requestedTenure && "border-red-500 focus:ring-red-500 focus:border-red-500")}
                placeholder="36"
                min="1"
              />
              {errors.requestedTenure && <p className="mt-1 text-sm text-red-400">{errors.requestedTenure}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-mono text-zinc-400 mb-1">Purpose</label>
              <textarea
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                rows={3}
                className={cn("w-full bg-zinc-800 border-zinc-700 text-white rounded px-3 py-2 font-mono focus:ring-1 focus:ring-primary focus:border-primary resize-none", errors.purpose && "border-red-500 focus:ring-red-500 focus:border-red-500")}
                placeholder="Home renovation, business expansion, medical emergency..."
              />
              {errors.purpose && <p className="mt-1 text-sm text-red-400">{errors.purpose}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-mono text-zinc-400 mb-1">Bank Account (for disbursement)</label>
              <input
                type="text"
                value={formData.bankAccount}
                onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                className="w-full bg-zinc-800 border-zinc-700 text-white rounded px-3 py-2 font-mono focus:ring-1 focus:ring-primary focus:border-primary"
                placeholder="1234567890 (optional)"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-mono text-zinc-400 mb-1">IFSC Code</label>
              <input
                type="text"
                value={formData.ifscCode}
                onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
                className="w-full bg-zinc-800 border-zinc-700 text-white rounded px-3 py-2 font-mono focus:ring-1 focus:ring-primary focus:border-primary"
                placeholder="HDFC0001234 (optional)"
              />
            </div>
          </div>

          {errors.submit && (
            <div className="flex items-center gap-2 p-3 bg-red-950/50 border border-red-500/30 rounded text-red-400 text-sm font-mono">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {errors.submit}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Link href="/applications" className="px-4 py-2 border border-zinc-700 text-zinc-300 hover:bg-white/5 font-mono text-sm rounded transition-colors">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-black font-semibold font-mono text-sm rounded transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Submit Application
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}