import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useCreateCustomer, useListLoanProducts } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Loader2, AlertCircle, CheckCircle, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

const employmentTypes = [
  { value: "salaried", label: "Salaried" },
  { value: "self_employed", label: "Self Employed" },
  { value: "business", label: "Business" },
  { value: "student", label: "Student" },
  { value: "retired", label: "Retired" },
];

export default function NewCustomerPage() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    tenantId: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    panNumber: "",
    aadhaarNumber: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    employmentType: "",
    monthlyIncome: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMutation = useCreateCustomer({
    onSuccess: (data) => {
      setLocation(`/customers/${data.id}`);
    },
    onError: (err) => {
      setErrors({ submit: err.message || "Failed to create customer" });
    },
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email format";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\D/g, ""))) newErrors.phone = "Phone must be 10 digits";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      createMutation.mutate(formData);
    }
  };

  return (
    <DashboardLayout activeTab="customers">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/customers" className="p-2 hover:bg-white/5 rounded transition-colors text-zinc-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-white">New Customer</h1>
            <p className="font-mono text-sm text-zinc-400">Add a new borrower to the system</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-card border border-border rounded-lg p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">Tenant</label>
              <select
                value={formData.tenantId}
                onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })}
                className={cn("w-full bg-zinc-800 border-zinc-700 text-white rounded px-3 py-2 font-mono focus:ring-1 focus:ring-primary focus:border-primary", errors.tenantId && "border-red-500 focus:ring-red-500 focus:border-red-500")}
                required
              >
                <option value="">Select tenant...</option>
                <option value="bcd0c17cb63d29ff85b716ade964978c">CapitalFirst NBFC</option>
                <option value="tenant2">Swift Fintech</option>
                <option value="tenant3">Bharath LSP</option>
              </select>
              {errors.tenantId && <p className="mt-1 text-sm text-red-400">{errors.tenantId}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-mono text-zinc-400 mb-1">Full Name</label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className={cn("flex-1 bg-zinc-800 border-zinc-700 text-white rounded px-3 py-2 font-mono focus:ring-1 focus:ring-primary focus:border-primary", errors.firstName && "border-red-500 focus:ring-red-500 focus:border-red-500")}
                  placeholder="First Name"
                />
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className={cn("flex-1 bg-zinc-800 border-zinc-700 text-white rounded px-3 py-2 font-mono focus:ring-1 focus:ring-primary focus:border-primary", errors.lastName && "border-red-500 focus:ring-red-500 focus:border-red-500")}
                  placeholder="Last Name"
                />
              </div>
              {errors.firstName && <p className="mt-1 text-sm text-red-400">{errors.firstName}</p>}
              {errors.lastName && <p className="mt-1 text-sm text-red-400">{errors.lastName}</p>}
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={cn("w-full bg-zinc-800 border-zinc-700 text-white rounded px-3 py-2 font-mono focus:ring-1 focus:ring-primary focus:border-primary", errors.email && "border-red-500 focus:ring-red-500 focus:border-red-500")}
                placeholder="customer@example.com"
              />
              {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={cn("w-full bg-zinc-800 border-zinc-700 text-white rounded px-3 py-2 font-mono focus:ring-1 focus:ring-primary focus:border-primary", errors.phone && "border-red-500 focus:ring-red-500 focus:border-red-500")}
                placeholder="9876543210"
              />
              {errors.phone && <p className="mt-1 text-sm text-red-400">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">Date of Birth</label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full bg-zinc-800 border-zinc-700 text-white rounded px-3 py-2 font-mono focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full bg-zinc-800 border-zinc-700 text-white rounded px-3 py-2 font-mono focus:ring-1 focus:ring-primary focus:border-primary"
              >
                <option value="">Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-mono text-zinc-400 mb-1">PAN Number</label>
              <input
                type="text"
                value={formData.panNumber}
                onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
                className="w-full bg-zinc-800 border-zinc-700 text-white rounded px-3 py-2 font-mono focus:ring-1 focus:ring-primary focus:border-primary"
                placeholder="ABCDE1234F"
                maxLength={10}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-mono text-zinc-400 mb-1">Aadhaar Number</label>
              <input
                type="text"
                value={formData.aadhaarNumber}
                onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                className="w-full bg-zinc-800 border-zinc-700 text-white rounded px-3 py-2 font-mono focus:ring-1 focus:ring-primary focus:border-primary"
                placeholder="1234 5678 9012"
                maxLength={14}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-mono text-zinc-400 mb-1">Address</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={2}
                className="w-full bg-zinc-800 border-zinc-700 text-white rounded px-3 py-2 font-mono focus:ring-1 focus:ring-primary focus:border-primary resize-none"
                placeholder="Full address"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full bg-zinc-800 border-zinc-700 text-white rounded px-3 py-2 font-mono focus:ring-1 focus:ring-primary focus:border-primary"
                placeholder="Mumbai"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">State</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full bg-zinc-800 border-zinc-700 text-white rounded px-3 py-2 font-mono focus:ring-1 focus:ring-primary focus:border-primary"
                placeholder="Maharashtra"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">Pincode</label>
              <input
                type="text"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                className="w-full bg-zinc-800 border-zinc-700 text-white rounded px-3 py-2 font-mono focus:ring-1 focus:ring-primary focus:border-primary"
                placeholder="400001"
                maxLength={6}
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">Employment Type</label>
              <select
                value={formData.employmentType}
                onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                className="w-full bg-zinc-800 border-zinc-700 text-white rounded px-3 py-2 font-mono focus:ring-1 focus:ring-primary focus:border-primary"
              >
                <option value="">Select...</option>
                {employmentTypes.map((e) => (
                  <option key={e.value} value={e.value}>{e.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">Monthly Income (₹)</label>
              <input
                type="number"
                value={formData.monthlyIncome}
                onChange={(e) => setFormData({ ...formData, monthlyIncome: e.target.value })}
                className="w-full bg-zinc-800 border-zinc-700 text-white rounded px-3 py-2 font-mono focus:ring-1 focus:ring-primary focus:border-primary"
                placeholder="75000"
                min="0"
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
            <Link href="/customers" className="px-4 py-2 border border-zinc-700 text-zinc-300 hover:bg-white/5 font-mono text-sm rounded transition-colors">
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
                  Create Customer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}