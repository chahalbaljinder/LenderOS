import { useState } from "react";
import { useCreateInvitation, useListInvitations, useResendInvitation, useCancelInvitation, useRevokeInvitation, useGetInvitation } from "@workspace/api-client-react";
import { Plus, Mail, RefreshCw, X, ShieldX, Copy, Eye, Loader2 } from "lucide-react";
import { format } from "date-fns";

const roleOptions = [
  { value: "tenant_admin", label: "Tenant Admin" },
  { value: "risk_manager", label: "Risk Manager" },
  { value: "loan_manager", label: "Loan Manager" },
  { value: "collection_manager", label: "Collection Manager" },
  { value: "customer_support", label: "Customer Support" },
  { value: "sales_agent", label: "Sales Agent" },
  { value: "dsa", label: "DSA" },
  { value: "relationship_manager", label: "Relationship Manager" },
];

export default function InvitationsList() {
  const [showModal, setShowModal] = useState(false);
  const [editingInvitation, setEditingInvitation] = useState<any>(null);
  const [formData, setFormData] = useState({ email: "", role: "tenant_admin", metadata: {} });

  const { data: invitations, isLoading, error, refetch } = useListInvitations({
    query: { tenantId: undefined },
  });

  const createMutation = useCreateInvitation({
    onSuccess: () => {
      setShowModal(false);
      setFormData({ email: "", role: "tenant_admin", metadata: {} });
      refetch();
    },
    onError: (err) => alert(err.message),
  });

  const resendMutation = useResendInvitation({
    onSuccess: () => refetch(),
    onError: (err) => alert(err.message),
  });

  const cancelMutation = useCancelInvitation({
    onSuccess: () => refetch(),
    onError: (err) => alert(err.message),
  });

  const revokeMutation = useRevokeInvitation({
    onSuccess: () => refetch(),
    onError: (err) => alert(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingInvitation) {
      // Update not implemented in API yet
    } else {
      createMutation.mutate({ email: formData.email, role: formData.role, metadata: formData.metadata });
    }
  };

  const handleResend = (id: string) => resendMutation.mutate(id);
  const handleCancel = (id: string) => { if (confirm("Cancel this invitation?")) cancelMutation.mutate(id); };
  const handleRevoke = (id: string) => { if (confirm("Revoke this invitation and deactivate user?")) revokeMutation.mutate(id); };

  const copyUrl = (token: string) => {
    const url = `${window.location.origin}/accept-invitation/${token}`;
    navigator.clipboard.writeText(url);
    alert("Acceptance URL copied to clipboard");
  };

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    invited: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    accepted: "bg-green-500/20 text-green-400 border-green-500/30",
    provisioned: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    expired: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
    revoked: "bg-red-900/20 text-red-500 border-red-900/30",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-mono tracking-tight">Invitations</h1>
          <p className="text-sm text-zinc-400 mt-1">Manage user invitations for your tenant</p>
        </div>
        <button
          onClick={() => { setEditingInvitation(null); setShowModal(true); }}
          className="flex items-center gap-2 bg-[#00cc88] hover:bg-[#00ffaa] text-black font-semibold font-mono text-sm px-4 py-2 rounded transition-colors"
        >
          <Plus className="w-4 h-4" /> Invite User
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="p-4 bg-red-950/50 border border-red-500/30 rounded text-red-400 text-sm font-mono">
          Failed to load invitations: {error.message}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-900/50 border-b border-border">
                <tr className="text-left text-xs font-mono uppercase tracking-wider text-zinc-500">
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Invited By</th>
                  <th className="p-4">Expires</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {invitations?.data?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-zinc-500 font-mono">
                      No invitations yet. Click "Invite User" to send your first invitation.
                    </td>
                  </tr>
                ) : (
                  invitations?.data?.map((inv: any) => (
                    <tr key={inv.id} className="hover:bg-white/5">
                      <td className="p-4 font-mono text-sm">{inv.email}</td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs font-mono">
                          {inv.role.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-mono border ${statusColors[inv.status] || "bg-gray-500/20 text-gray-400 border-gray-500/30"}`}>
                          {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-sm text-zinc-400">{inv.invitedBy?.slice(0, 8)}...</td>
                      <td className="p-4 font-mono text-sm text-zinc-400">
                        {inv.expiresAt ? format(new Date(inv.expiresAt), "MMM d, yyyy") : "—"}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => copyUrl(inv.token)}
                            className="p-2 hover:bg-white/5 rounded transition-colors text-zinc-400 hover:text-white"
                            title="Copy acceptance URL"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => { setEditingInvitation(inv); setShowModal(true); }}
                            className="p-2 hover:bg-white/5 rounded transition-colors text-zinc-400 hover:text-white"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {["pending", "invited"].includes(inv.status) && (
                            <>
                              <button
                                onClick={() => handleResend(inv.id)}
                                disabled={resendMutation.isPending}
                                className="p-2 hover:bg-white/5 rounded transition-colors text-zinc-400 hover:text-white disabled:opacity-50"
                                title="Resend invitation"
                              >
                                <RefreshCw className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleCancel(inv.id)}
                                disabled={cancelMutation.isPending}
                                className="p-2 hover:bg-white/5 rounded transition-colors text-zinc-400 hover:text-red-400 disabled:opacity-50"
                                title="Cancel invitation"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {["active", "provisioned"].includes(inv.status) && (
                            <button
                              onClick={() => handleRevoke(inv.id)}
                              disabled={revokeMutation.isPending}
                              className="p-2 hover:bg-white/5 rounded transition-colors text-zinc-400 hover:text-red-400 disabled:opacity-50"
                              title="Revoke invitation"
                            >
                              <ShieldX className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#09090b] border border-[#1e1e24] rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold font-mono tracking-tight mb-6">
              {editingInvitation ? "Edit Invitation" : "Invite New User"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full bg-zinc-800 border-zinc-700 text-white rounded px-3 py-2 font-mono focus:ring-1 focus:ring-[#00cc88] focus:border-[#00cc88]"
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full bg-zinc-800 border-zinc-700 text-white rounded px-3 py-2 font-mono focus:ring-1 focus:ring-[#00cc88] focus:border-[#00cc88]"
                >
                  {roleOptions.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingInvitation(null); }}
                  className="px-4 py-2 border border-zinc-700 text-zinc-300 hover:bg-white/5 font-mono text-sm rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-4 py-2 bg-[#00cc88] hover:bg-[#00ffaa] text-black font-semibold font-mono text-sm rounded transition-colors disabled:opacity-50"
                >
                  {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingInvitation ? "Update" : "Send Invitation")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}