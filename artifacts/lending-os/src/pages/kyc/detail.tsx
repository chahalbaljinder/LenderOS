import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useGetKycStatus, useSubmitPanVerification, useSubmitAadhaarVerification, useSubmitFaceVerification, useSubmitEmploymentVerification } from "@workspace/api-client-react";
import { useParams, Link, useLocation } from "wouter";
import { ArrowLeft, Loader2, Shield, CheckCircle, AlertCircle, AlertTriangle, FileText, CreditCard, User, Briefcase, Eye, RotateCw, Upload, RefreshCw } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const kycSteps = [
  { key: "pan", label: "PAN Verification", icon: <FileText className="w-5 h-5" />, desc: "Verify PAN card details with NSDL" },
  { key: "aadhaar", label: "Aadhaar Verification", icon: <Shield className="w-5 h-5" />, desc: "Verify Aadhaar with UIDAI OTP" },
  { key: "face", label: "Face/Liveness Check", icon: <User className="w-5 h-5" />, desc: "Liveness detection and face match" },
  { key: "employment", label: "Employment Verification", icon: <Briefcase className="w-5 h-5" />, desc: "Verify employment and income details" },
];

export default function KycDetailPage() {
  const params = useParams<{ applicationId: string }>();
  const [, setLocation] = useLocation();
  const applicationId = params.applicationId;

  const [activeTab, setActiveTab] = useState("pan");
  const [panForm, setPanForm] = useState({ panNumber: "", dateOfBirth: "", name: "" });
  const [aadhaarForm, setAadhaarForm] = useState({ aadhaarNumber: "", otp: "" });
  const [faceForm, setFaceForm] = useState({ imageBase64: "" });
  const [employmentForm, setEmploymentForm] = useState({ employmentType: "", employerName: "", monthlyIncome: "", designation: "", employmentStartDate: "" });

  const { data: kyc, isLoading: loading, refetch } = useGetKycStatus({ path: { applicationId: applicationId || "" } });

  const panMutation = useSubmitPanVerification({
    onSuccess: () => { refetch(); alert("PAN verification submitted"); },
    onError: (err) => alert(err.message),
  });

  const aadhaarMutation = useSubmitAadhaarVerification({
    onSuccess: () => { refetch(); alert("Aadhaar verification submitted"); },
    onError: (err) => alert(err.message),
  });

  const faceMutation = useSubmitFaceVerification({
    onSuccess: () => { refetch(); alert("Face verification submitted"); },
    onError: (err) => alert(err.message),
  });

  const employmentMutation = useSubmitEmploymentVerification({
    onSuccess: () => { refetch(); alert("Employment verification submitted"); },
    onError: (err) => alert(err.message),
  });

  if (loading) {
    return (
      <DashboardLayout activeTab="applications">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!kyc) {
    return (
      <DashboardLayout activeTab="applications">
        <div className="flex items-center justify-center h-64 text-zinc-400 font-mono">
          KYC not found for this application
        </div>
      </DashboardLayout>
    );
  }

  const statusConfig: Record<string, { label: string; color: string }> = {
    pending: { label: "Pending", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
    verified: { label: "Verified", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
    failed: { label: "Failed", color: "bg-red-500/20 text-red-400 border-red-500/30" },
  };

  const handlePanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    panMutation.mutate({ applicationId: applicationId || "", ...panForm });
  };

  const handleAadhaarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    aadhaarMutation.mutate({ applicationId: applicationId || "", ...aadhaarForm });
  };

  const handleFaceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    faceMutation.mutate({ applicationId: applicationId || "", ...faceForm });
  };

  const handleEmploymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    employmentMutation.mutate({ applicationId: applicationId || "", ...employmentForm });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setFaceForm({ ...faceForm, imageBase64: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  return (
    <DashboardLayout activeTab="applications">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href={`/applications/${applicationId}`} className="p-2 hover:bg-white/5 rounded transition-colors text-zinc-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-white mb-1">KYC Verification</h1>
            <p className="font-mono text-sm text-zinc-400">Application: {applicationId?.slice(0, 8)}...</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {kycSteps.map((step, index) => (
              <div key={step.key} className="flex flex-col items-center relative">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                  activeTab === step.key ? "border-primary bg-primary text-black" :
                  kyc[`${step.key}Status`] === "verified" ? "border-emerald-500 bg-emerald-500/10 text-emerald-500" :
                  kyc[`${step.key}Status`] === "pending" ? "border-yellow-500 bg-yellow-500/10 text-yellow-500" :
                  "border-zinc-700 bg-zinc-800 text-zinc-500"
                )}>
                  {kyc[`${step.key}Status`] === "verified" ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    step.icon
                  )}
                </div>
                <p className="mt-2 text-xs font-mono text-center text-zinc-400 max-w-[80px]">{step.label}</p>
                {index < kycSteps.length - 1 && (
                  <div className="absolute top-5 left-[calc(50%+5px)] w-full h-1 bg-zinc-700" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {/* Tab Headers */}
          <div className="flex border-b border-border bg-zinc-900/50">
            {kycSteps.map((step) => (
              <button
                key={step.key}
                onClick={() => setActiveTab(step.key)}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 text-sm font-mono transition-colors border-b-2 -mb-px",
                  activeTab === step.key
                    ? "text-primary border-primary bg-primary/5"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                )}
              >
                {step.icon}
                <span>{step.label}</span>
                <StatusBadge status={kyc[`${step.key}Status`] === "verified" ? "active_tenant" : kyc[`${step.key}Status`] === "pending" ? "pending_tenant" : "suspended"} />
              </button>
            ))}
          </div>

          {/* Tab Panels */}
          <div className="p-6">
            {/* PAN Tab */}
            {activeTab === "pan" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-white">PAN Verification</h2>
                    <p className="text-sm text-zinc-400">Verify PAN card details with NSDL</p>
                  </div>
                  <StatusBadge status={kyc.panStatus === "verified" ? "active_tenant" : kyc.panStatus === "pending" ? "pending_tenant" : "suspended"} />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block text-xs font-mono text-zinc-400 mb-1">PAN Number</label>
                    <input
                      type="text"
                      value={panForm.panNumber}
                      onChange={(e) => setPanForm({ ...panForm, panNumber: e.target.value })}
                      className="w-full bg-zinc-800 border-zinc-700 text-white rounded px-3 py-2 font-mono focus:ring-1 focus:ring-primary focus:border-primary"
                      placeholder="ABCDE1234F"
                      maxLength={10}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-mono text-zinc-400 mb-1">Name as per PAN</label>
                    <input
                      type="text"
                      value={panForm.name}
                      onChange={(e) => setPanForm({ ...panForm, name: e.target.value })}
                      className="w-full bg-zinc-800 border-zinc-700 text-white rounded px-3 py-2 font-mono focus:ring-1 focus:ring-primary focus:border-primary"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-mono text-zinc-400 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={panForm.dateOfBirth}
                      onChange={(e) => setPanForm({ ...panForm, dateOfBirth: e.target.value })}
                      className="w-full bg-zinc-800 border-zinc-700 text-white rounded px-3 py-2 font-mono focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <button
                    onClick={() => refetch()}
                    className="px-4 py-2 border border-zinc-700 text-zinc-300 hover:bg-white/5 font-mono text-sm rounded transition-colors"
                  >
                    <RotateCw className="w-4 h-4 mr-2" /> Refresh Status
                  </button>
                  <button
                    onClick={(e) => { e.preventDefault(); panMutation.mutate({ applicationId: applicationId || "", ...panForm }); }}
                    disabled={panMutation.isPending}
                    className="px-4 py-2 bg-primary hover:bg-primary/90 text-black font-semibold font-mono text-sm rounded transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {panMutation.isPending ? (<> <Loader2 className="w-4 h-4 animate-spin" /> <CheckCircle className="w-4 h-4" /> </>) : <CheckCircle className="w-4 h-4" />} Submit for Verification
                  </button>
                </div>
              </div>
            )}

            {/* Aadhaar Tab */}
            {activeTab === "aadhaar" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Aadhaar Verification</h2>
                    <p className="text-sm text-zinc-400">Verify Aadhaar with UIDAI OTP</p>
                  </div>
                  <StatusBadge status={kyc.aadhaarStatus === "verified" ? "active_tenant" : kyc.aadhaarStatus === "pending" ? "pending_tenant" : "suspended"} />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block text-xs font-mono text-zinc-400 mb-1">Aadhaar Number</label>
                    <input
                      type="text"
                      value={aadhaarForm.aadhaarNumber}
                      onChange={(e) => setAadhaarForm({ ...aadhaarForm, aadhaarNumber: e.target.value })}
                      className="w-full bg-zinc-800 border-zinc-700 text-white rounded px-3 py-2 font-mono focus:ring-1 focus:ring-primary focus:border-primary"
                      placeholder="1234 5678 9012"
                      maxLength={14}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-mono text-zinc-400 mb-1">OTP</label>
                    <input
                      type="text"
                      value={aadhaarForm.otp}
                      onChange={(e) => setAadhaarForm({ ...aadhaarForm, otp: e.target.value })}
                      className="w-full bg-zinc-800 border-zinc-700 text-white rounded px-3 py-2 font-mono focus:ring-1 focus:ring-primary focus:border-primary"
                      placeholder="123456"
                      maxLength={6}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <button
                    onClick={() => refetch()}
                    className="px-4 py-2 border border-zinc-700 text-zinc-300 hover:bg-white/5 font-mono text-sm rounded transition-colors"
                  >
                    <RotateCw className="w-4 h-4 mr-2" /> Refresh Status
                  </button>
                  <button
                    onClick={(e) => { e.preventDefault(); aadhaarMutation.mutate({ applicationId: applicationId || "", ...aadhaarForm }); }}
                    disabled={aadhaarMutation.isPending}
                    className="px-4 py-2 bg-primary hover:bg-primary/90 text-black font-semibold font-mono text-sm rounded transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {aadhaarMutation.isPending ? (<> <Loader2 className="w-4 h-4 animate-spin" /> <CheckCircle className="w-4 h-4" /> </>) : <CheckCircle className="w-4 h-4" />} Submit for Verification
                  </button>
                </div>
              </div>
            )}

            {/* Face/Liveness Tab */}
            {activeTab === "face" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Face / Liveness Check</h2>
                    <p className="text-sm text-zinc-400">Upload a live selfie for face match and liveness detection</p>
                  </div>
                  <StatusBadge status={kyc.faceStatus === "verified" ? "active_tenant" : kyc.faceStatus === "pending" ? "pending_tenant" : "suspended"} />
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-mono text-zinc-400 mb-1">Selfie Image</label>
                    <div className="flex items-center gap-4">
                      <div className="w-32 h-32 bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden flex items-center justify-center">
                        {faceForm.imageBase64 ? (
                          <img src={faceForm.imageBase64} alt="Selfie" className="w-full h-full object-cover" />
                        ) : (
                          <Upload className="w-8 h-8 text-zinc-500" />
                        )}
                      </div>
                      <div className="space-y-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="bg-zinc-800 border-zinc-700 text-white rounded px-3 py-2 font-mono focus:ring-1 focus:ring-primary focus:border-primary w-full"
                        />
                        <p className="font-mono text-xs text-zinc-500">Upload a clear selfie (JPG/PNG, max 5MB)</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <button
                      onClick={() => refetch()}
                      className="px-4 py-2 border border-zinc-700 text-zinc-300 hover:bg-white/5 font-mono text-sm rounded transition-colors"
                    >
                      <RotateCw className="w-4 h-4 mr-2" /> Refresh Status
                    </button>
                    <button
                      onClick={(e) => { e.preventDefault(); faceMutation.mutate({ applicationId: applicationId || "", ...faceForm }); }}
                      disabled={faceMutation.isPending || !faceForm.imageBase64}
                      className="px-4 py-2 bg-primary hover:bg-primary/90 text-black font-semibold font-mono text-sm rounded transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {faceMutation.isPending ? (<> <Loader2 className="w-4 h-4 animate-spin" /> <CheckCircle className="w-4 h-4" /> </>) : <CheckCircle className="w-4 h-4" />} Submit for Verification
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Employment Tab */}
            {activeTab === "employment" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Employment Verification</h2>
                    <p className="text-sm text-zinc-400">Verify employment and income details</p>
                  </div>
                  <StatusBadge status={kyc.employmentStatus === "verified" ? "active_tenant" : kyc.employmentStatus === "pending" ? "pending_tenant" : "suspended"} />
                </div>

                <form onSubmit={handleEmploymentSubmit} className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="block text-xs font-mono text-zinc-400 mb-1">Employment Type</label>
                      <select
                        value={employmentForm.employmentType}
                        onChange={(e) => setEmploymentForm({ ...employmentForm, employmentType: e.target.value })}
                        className="w-full bg-zinc-800 border-zinc-700 text-white rounded px-3 py-2 font-mono focus:ring-1 focus:ring-primary focus:border-primary"
                      >
                        <option value="">Select...</option>
                        <option value="salaried">Salaried</option>
                        <option value="self_employed">Self Employed</option>
                        <option value="business">Business</option>
                        <option value="student">Student</option>
                        <option value="retired">Retired</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-mono text-zinc-400 mb-1">Employer Name</label>
                      <input
                        type="text"
                        value={employmentForm.employerName}
                        onChange={(e) => setEmploymentForm({ ...employmentForm, employerName: e.target.value })}
                        className="w-full bg-zinc-800 border-zinc-700 text-white rounded px-3 py-2 font-mono focus:ring-1 focus:ring-primary focus:border-primary"
                        placeholder="ABC Corp Ltd"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-mono text-zinc-400 mb-1">Monthly Income (₹)</label>
                      <input
                        type="number"
                        value={employmentForm.monthlyIncome}
                        onChange={(e) => setEmploymentForm({ ...employmentForm, monthlyIncome: e.target.value })}
                        className="w-full bg-zinc-800 border-zinc-700 text-white rounded px-3 py-2 font-mono focus:ring-1 focus:ring-primary focus:border-primary"
                        placeholder="75000"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-mono text-zinc-400 mb-1">Designation</label>
                      <input
                        type="text"
                        value={employmentForm.designation}
                        onChange={(e) => setEmploymentForm({ ...employmentForm, designation: e.target.value })}
                        className="w-full bg-zinc-800 border-zinc-700 text-white rounded px-3 py-2 font-mono focus:ring-1 focus:ring-primary focus:border-primary"
                        placeholder="Software Engineer"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-mono text-zinc-400 mb-1">Employment Start Date</label>
                      <input
                        type="date"
                        value={employmentForm.employmentStartDate}
                        onChange={(e) => setEmploymentForm({ ...employmentForm, employmentStartDate: e.target.value })}
                        className="w-full bg-zinc-800 border-zinc-700 text-white rounded px-3 py-2 font-mono focus:ring-1 focus:ring-primary focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <button
                      onClick={() => refetch()}
                      className="px-4 py-2 border border-zinc-700 text-zinc-300 hover:bg-white/5 font-mono text-sm rounded transition-colors"
                    >
                      <RotateCw className="w-4 h-4 mr-2" /> Refresh Status
                    </button>
                    <button
                      type="submit"
                      disabled={employmentMutation.isPending}
                      className="px-4 py-2 bg-primary hover:bg-primary/90 text-black font-semibold font-mono text-sm rounded transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {employmentMutation.isPending ? (<> <Loader2 className="w-4 h-4 animate-spin" /> <CheckCircle className="w-4 h-4" /> </>) : <CheckCircle className="w-4 h-4" />} Submit for Verification
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}