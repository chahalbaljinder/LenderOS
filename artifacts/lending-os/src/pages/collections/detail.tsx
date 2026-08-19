import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useGetCollection, useUpdateCollection, useListCollections } from "@workspace/api-client-react";
import { useParams, Link, useLocation } from "wouter";
import { ArrowLeft, Phone, Mail, Calendar, Clock, Loader2, AlertCircle, CheckCircle, AlertTriangle, DollarSign, MessageSquare, TrendingUp, User, Shield } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function CollectionDetailPage() {
  const params = useParams<{ collectionId: string }>();
  const [, setLocation] = useLocation();
  const collectionId = params.collectionId;

  const [showActionModal, setShowActionModal] = useState<{ type: string; title: string; fields: any } | null>(null);
  const [actionForm, setActionForm] = useState<Record<string, string>>({});

  const { data: collection, isLoading: loading } = useGetCollection({ path: { collectionId: collectionId || "" } });
  const updateMutation = useUpdateCollection();

  if (loading) {
    return (
      <DashboardLayout activeTab="collections">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!collection) {
    return (
      <DashboardLayout activeTab="collections">
        <div className="flex items-center justify-center h-64 text-zinc-400 font-mono">
          Collection case not found
        </div>
      </DashboardLayout>
    );
  }

  const statusColors: Record<string, string> = {
    new: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    in_progress: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    resolved: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    escalated: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  const priorityColors: Record<string, string> = {
    low: "bg-green-500/20 text-green-400 border-green-500/30",
    medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    critical: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  const openActionModal = (type: string) => {
    const modals: Record<string, { title: string; fields: any[] }> = {
      contact: {
        title: "Record Contact",
        fields: [
          { key: "contactType", label: "Contact Type", type: "select", options: ["call", "sms", "email", "visit", "whatsapp"], required: true },
          { key: "outcome", label: "Outcome", type: "select", options: ["connected", "no_answer", "busy", "wrong_number", "voicemail", "promised_payment", "dispute", "refused"], required: true },
          { key: "notes", label: "Notes", type: "textarea", required: true },
        ],
      },
      ptp: {
        title: "Record Promise-to-Pay",
        fields: [
          { key: "promisedAmount", label: "Promised Amount (₹)", type: "number", required: true },
          { key: "promisedDate", label: "Promised Date", type: "date", required: true },
          { key: "notes", label: "Notes", type: "textarea" },
        ],
      },
      followup: {
        title: "Schedule Follow-up",
        fields: [
          { key: "nextFollowUpAt", label: "Follow-up Date & Time", type: "datetime-local", required: true },
          { key: "notes", label: "Notes", type: "textarea" },
        ],
      },
      escalate: {
        title: "Escalate Case",
        fields: [
          { key: "escalationReason", label: "Escalation Reason", type: "select", options: ["legal", "recovery_agency", "management_review", "skip_trace", "collateral_action"], required: true },
          { key: "notes", label: "Notes", type: "textarea", required: true },
        ],
      },
      resolve: {
        title: "Resolve Case",
        fields: [
          { key: "resolutionType", label: "Resolution Type", type: "select", options: ["full_payment", "partial_payment", "restructured", "write_off", "settlement"], required: true },
          { key: "resolutionAmount", label: "Resolution Amount (₹)", type: "number", required: true },
          { key: "notes", label: "Notes", type: "textarea" },
        ],
      },
    };

    const modal = modals[type];
    if (modal) {
      setShowActionModal({ type, title: modal.title, fields: modal.fields });
      setActionForm({});
    }
  };

  const handleActionSubmit = (type: string) => {
    const updates: any = { updatedAt: new Date().toISOString() };

    switch (type) {
      case "contact":
        updates.status = "in_progress";
        updates.lastContactAt = new Date().toISOString();
        updates.notes = `${collection.notes || ""}\n\n[${format(new Date(), "MMM d, yyyy HH:mm")}] Contact: ${actionForm.contactType} - ${actionForm.outcome}\n${actionForm.notes}`;
        break;
      case "ptp":
        updates.status = "in_progress";
        updates.lastContactAt = new Date().toISOString();
        updates.nextFollowUpAt = actionForm.promisedDate;
        updates.notes = `${collection.notes || ""}\n\n[${format(new Date(), "MMM d, yyyy HH:mm")}] PTP: ₹${actionForm.promisedAmount} by ${format(new Date(actionForm.promisedDate), "MMM d, yyyy")}\n${actionForm.notes || ""}`;
        break;
      case "followup":
        updates.nextFollowUpAt = actionForm.nextFollowUpAt;
        updates.notes = `${collection.notes || ""}\n\n[${format(new Date(), "MMM d, yyyy HH:mm")}] Follow-up scheduled: ${format(new Date(actionForm.nextFollowUpAt), "MMM d, yyyy HH:mm")}\n${actionForm.notes || ""}`;
        break;
      case "escalate":
        updates.status = "escalated";
        updates.priority = "critical";
        updates.notes = `${collection.notes || ""}\n\n[${format(new Date(), "MMM d, yyyy HH:mm")}] ESCALATED: ${actionForm.escalationReason}\n${actionForm.notes}`;
        break;
      case "resolve":
        updates.status = "resolved";
        updates.lastContactAt = new Date().toISOString();
        updates.notes = `${collection.notes || ""}\n\n[${format(new Date(), "MMM d, yyyy HH:mm")}] RESOLVED: ${actionForm.resolutionType} - ₹${actionForm.resolutionAmount}\n${actionForm.notes || ""}`;
        break;
    }

    updateMutation.mutate(
      { path: { collectionId: collectionId || "" }, ...updates },
      {
        onSuccess: () => setShowActionModal(null),
        onError: (err) => alert(err.message),
      }
    );
  };

  if (loading) {
    return (
      <DashboardLayout activeTab="collections">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!collection) {
    return (
      <DashboardLayout activeTab="collections">
        <div className="flex items-center justify-center h-64 text-zinc-400 font-mono">
          Collection case not found
        </div>
      </DashboardLayout>
    );
  }

  const handleUpdate = (updates: any) => {
    updateMutation.mutate({ path: { collectionId: collectionId || "" }, ...updates });
  };

  return (
    <DashboardLayout activeTab="collections">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link href="/collections" className="p-2 hover:bg-white/5 rounded transition-colors text-zinc-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-semibold text-white">
                  {collection.loanNumber || `LN-${collection.loanId?.slice(0, 8).toUpperCase()}`}
                </h1>
                <span className={cn("px-2 py-1 rounded text-xs font-mono border", statusColors[collection.status] || "bg-gray-500/20 text-gray-400 border-gray-500/30")}>
                  {collection.status.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                </span>
                <span className={cn("px-2 py-1 rounded text-xs font-mono border", priorityColors[collection.priority] || "bg-gray-500/20 text-gray-400 border-gray-500/30")}>
                  {collection.priority.toUpperCase()}
                </span>
                {(collection.aiPriorityScore || 0) > 80 && (
                  <span className="px-2 py-1 rounded text-xs font-mono bg-red-500/20 text-red-400 border-red-500/30 animate-pulse">
                    AI Score: {collection.aiPriorityScore}
                  </span>
                )}
              </div>
              <p className="font-mono text-sm text-zinc-400">
                {collection.customerName} • Overdue: ₹{collection.overdueAmount?.toLocaleString()} • DPD: {collection.dpd || 0}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/collections" className="px-3 py-1.5 border border-zinc-700 text-zinc-300 hover:bg-white/5 font-mono text-xs rounded transition-colors">
              Back to Queue
            </Link>
          </div>
        </div>

        {/* Action Modal */}
        {showActionModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-[#09090b] border border-[#1e1e24] rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold font-mono tracking-tight">{showActionModal.title}</h3>
                <button onClick={() => setShowActionModal(null)} className="text-zinc-400 hover:text-white">×</button>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); handleActionSubmit(showActionModal.type); setShowActionModal(null); }} className="space-y-4">
                {showActionModal.fields.map((field: any) => (
                  <div key={field.key} className="space-y-1">
                    <label className="block text-xs font-mono text-zinc-400 mb-1">{field.label}</label>
                    {field.type === "select" ? (
                      <select
                        value={actionForm[field.key] || ""}
                        onChange={(e) => setActionForm({ ...actionForm, [field.key]: e.target.value })}
                        required={field.required}
                        className="w-full bg-zinc-800 border-zinc-700 text-white rounded px-3 py-2 font-mono focus:ring-1 focus:ring-primary focus:border-primary"
                      >
                        <option value="">Select...</option>
                        {field.options.map((opt: string) => (
                          <option key={opt} value={opt}>{opt.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</option>
                        ))}
                      </select>
                    ) : field.type === "textarea" ? (
                      <textarea
                        value={actionForm[field.key] || ""}
                        onChange={(e) => setActionForm({ ...actionForm, [field.key]: e.target.value })}
                        required={field.required}
                        rows={3}
                        className="w-full bg-zinc-800 border-zinc-700 text-white rounded px-3 py-2 font-mono focus:ring-1 focus:ring-primary focus:border-primary resize-none"
                      />
                    ) : (
                      <input
                        type={field.type}
                        value={actionForm[field.key] || ""}
                        onChange={(e) => setActionForm({ ...actionForm, [field.key]: e.target.value })}
                        required={field.required}
                        className="w-full bg-zinc-800 border-zinc-700 text-white rounded px-3 py-2 font-mono focus:ring-1 focus:ring-primary focus:border-primary"
                      />
                    )}
                  </div>
                ))}
                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setShowActionModal(null)}
                    className="px-4 py-2 border border-zinc-700 text-zinc-300 hover:bg-white/5 font-mono text-sm rounded transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="px-4 py-2 bg-primary hover:bg-primary/90 text-black font-semibold font-mono text-sm rounded transition-colors disabled:opacity-50"
                  >
                    {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}