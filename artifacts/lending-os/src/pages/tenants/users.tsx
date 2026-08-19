import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useListUsers, useCreateUser, useUpdateUser } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Loader2, AlertCircle, CheckCircle, Plus, Search, Shield, UserPlus, UserCheck, Edit, Trash2, Mail, Shield as ShieldIcon, Key, UserCog, Eye, MoreHorizontal } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
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

export default function TenantUsersPage() {
  const [, setLocation] = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({ email: "", firstName: "", lastName: "", phone: "", role: "tenant_admin" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: usersRes, isLoading, refetch } = useListUsers();

  const createMutation = useCreateUser({
    onSuccess: () => {
      setShowModal(false);
      setFormData({ email: "", firstName: "", lastName: "", phone: "", role: "tenant_admin" });
      refetch();
    },
    onError: (err) => setErrors({ submit: err.message }),
  });

  const updateMutation = useUpdateUser({
    onSuccess: () => {
      setShowModal(false);
      setEditingUser(null);
      refetch();
    },
    onError: (err) => setErrors({ submit: err.message }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateMutation.mutate({ userId: editingUser.id, ...formData });
    } else {
      createMutation.mutate({ ...formData, tenantId: undefined }); // Will use current user's tenant
    }
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      phone: user.phone || "",
      role: user.role,
    });
    setShowModal(true);
  };

  const handleNew = () => {
    setEditingUser(null);
    setFormData({ email: "", firstName: "", lastName: "", phone: "", role: "tenant_admin" });
    setShowModal(true);
  };

  const handleDelete = (userId: string) => {
    if (confirm("Delete this user? This action cannot be undone.")) {
      // No delete mutation available yet
      alert("Delete not implemented yet");
    }
  };

  const users = usersRes?.data || [];

  const roleColors: Record<string, string> = {
    tenant_admin: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    tenant_owner: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    risk_manager: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    loan_manager: "bg-green-500/20 text-green-400 border-green-500/30",
    collection_manager: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    customer_support: "bg-teal-500/20 text-teal-400 border-teal-500/30",
    sales_agent: "bg-pink-500/20 text-pink-400 border-pink-500/30",
    dsa: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
    relationship_manager: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    super_admin: "bg-red-500/20 text-red-400 border-red-500/30",
    platform_admin: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  return (
    <DashboardLayout activeTab="users">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 hover:bg-white/5 rounded transition-colors text-zinc-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-white">User Management</h1>
              <p className="font-mono text-sm text-zinc-400">Manage tenant users and roles</p>
            </div>
          </div>
          <button
            onClick={handleNew}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-black font-semibold font-mono text-sm px-4 py-2 rounded transition-colors"
          >
            <Plus className="w-4 h-4" /> Add User
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-900/50 border-b border-border">
                  <tr className="text-left text-xs font-mono uppercase tracking-wider text-zinc-500">
                    <th className="p-4">User</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Last Login</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-zinc-500 font-mono">
                        No users found. Click "Add User" to create your first user.
                      </td>
                    </tr>
                  ) : (
                    users.map((user: any) => (
                      <tr key={user.id} className="hover:bg-white/5">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400">
                              <UserCheck className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-white">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-xs font-mono text-zinc-500">{user.id.slice(0, 8)}...</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-mono text-sm text-white">{user.email}</td>
                        <td className="p-4">
                          <span className={cn("px-2 py-1 rounded text-xs font-mono border", roleColors[user.role] || "bg-gray-500/20 text-gray-400 border-gray-500/30")}>
                            {user.role.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                          </span>
                        </td>
                        <td className="p-4">
                          <StatusBadge status={user.isActive ? "active_tenant" : "suspended"} />
                        </td>
                        <td className="p-4 font-mono text-sm text-zinc-400">
                          {user.lastLoginAt ? format(new Date(user.lastLoginAt), "MMM d, yyyy HH:mm") : "Never"}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(user)}
                              className="p-2 hover:bg-white/5 rounded transition-colors text-zinc-400 hover:text-white"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="p-2 hover:bg-white/5 rounded transition-colors text-zinc-400 hover:text-red-400"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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
      </div>
    </DashboardLayout>
  );
}