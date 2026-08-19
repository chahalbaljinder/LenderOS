import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useCreateTenant, useListLoanProducts } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { Plus, ArrowLeft, Building2, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function NewTenantPage() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    type: "nbfc",
    contactEmail: "",
    contactPhone: "",
    domain: "",
    logo: "",
    primaryColor: "#00c896",
    licenseNumber: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMutation = useCreateTenant({
    onSuccess: (data) => {
      setLocation(`/tenants/${data.id}`);
    },
    onError: (err) => {
      setErrors({ submit: err.message || "Failed to create tenant" });
    },
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Tenant name is required";
    if (!formData.contactEmail.trim()) newErrors.contactEmail = "Contact email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) newErrors.contactEmail = "Invalid email format";
    if (!formData.type) newErrors.type = "Tenant type is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      createMutation.mutate(formData);
    }
  };

  const tenantTypes = [
    { value: "nbfc", label: "NBFC" },
    { value: "bank", label: "Bank" },
    { value: "fintech", label: "FinTech" },
    { value: "lsp", label: "LSP" },
  ];

  return (
    <DashboardLayout activeTab="tenants">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/tenants" className="p-2 hover:bg-white/5 rounded transition-colors text-zinc-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-white">New Tenant Environment</h1>
            <p className="font-mono text-sm text-zinc-400">Deploy a new lender instance on LenderOS</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-card border border-border rounded-lg p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="block text-xs font-mono text-zinc-400 mb-1">Tenant Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={cn("w-full bg-zinc-800 border-zinc-700 text-white rounded px-3 py-2 font-mono focus:ring-1 focus:ring-primary focus:border-primary", errors.name && "border-red-500 focus:ring-red-500 focus:border-red-500")}
                placeholder="CapitalFirst NBFC"
              />
              {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-zinc-800 border-zinc-700 text-white rounded px-3 py-2 font-mono focus:ring-1 focus:ring-primary focus:border-primary"
              >
                {tenantTypes.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              {errors.type && <p className="mt-1 text-sm text-red-400">{errors.type}</p>}
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">Contact Email</label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className={cn("w-full bg-zinc-800 border-zinc-700 text-white rounded px-3 py-2 font-mono focus:ring-1 focus:ring-primary focus:border-primary", errors.contactEmail && "border-red-500 focus:ring-red-500 focus:border-red-500")}
                placeholder="ops@tenant.in"
              />
              {errors.contactEmail && <p className="mt-1 text-sm text-red-400">{errors.contactEmail}</p>}
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">Contact Phone</label>
              <input
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full bg-zinc-800 border-zinc-700 text-white rounded px-3 py-2 font-mono focus:ring-1 focus:ring-primary focus:border-primary"
                placeholder="+91 98765 43210"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">Custom Domain</label>
              <input
                type="text"
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                className="w-full bg-zinc-800 border-zinc-700 text-white rounded px-3 py-2 font-mono focus:ring-1 focus:ring-primary focus:border-primary"
                placeholder="tenant.lendingos.dev (optional)"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">License Number</label>
              <input
                type="text"
                value={formData.licenseNumber}
                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                className="w-full bg-zinc-800 border-zinc-700 text-white rounded px-3 py-2 font-mono focus:ring-1 focus:ring-primary focus:border-primary"
                placeholder="RBI/NBFC/XXXX (optional)"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-mono text-zinc-400 mb-1">Logo URL</label>
              <input
                type="url"
                value={formData.logo}
                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                className="w-full bg-zinc-800 border-zinc-700 text-white rounded px-3 py-2 font-mono focus:ring-1 focus:ring-primary focus:border-primary"
                placeholder="https://example.com/logo.png (optional)"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-mono text-zinc-400 mb-1">Primary Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="w-10 h-10 rounded border border-zinc-700 cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="flex-1 bg-zinc-800 border-zinc-700 text-white rounded px-3 py-2 font-mono focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
          </div>

          {errors.submit && (
            <div className="flex items-center gap-2 p-3 bg-red-950/50 border border-red-500/30 rounded text-red-400 text-sm font-mono">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {errors.submit}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Link href="/tenants" className="px-4 py-2 border border-zinc-700 text-zinc-300 hover:bg-white/5 font-mono text-sm rounded transition-colors">
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
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Create Tenant
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}