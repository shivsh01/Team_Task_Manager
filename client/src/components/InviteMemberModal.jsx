import { X, Loader2, UserMinus } from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { addMemberApi, removeMemberApi } from "../api/projectApi";

export default function InviteMemberModal({
  isOpen,
  onClose,
  projectId,
  members,
  adminId,
}) {
  const qc = useQueryClient();
  const [email, setEmail] = useState("");

  const addMutation = useMutation({
    mutationFn: (data) => addMemberApi(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["project", projectId] });
      toast.success("Member added!");
      setEmail("");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to add member");
    },
  });

  const removeMutation = useMutation({
    mutationFn: (userId) => removeMemberApi(projectId, { userId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["project", projectId] });
      toast.success("Member removed");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to remove member");
    },
  });

  const handleInvite = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    addMutation.mutate({ email: email.trim() });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative rounded-2xl shadow-2xl w-full max-w-md" style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}>
        <div className="flex items-center justify-between p-6" style={{ borderBottom: "1px solid #2a2a2a" }}>
          <h2 className="text-lg font-semibold" style={{ color: "#e0e0e0" }}>
            Manage Members
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: "#666666" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#2a2a2a"; e.currentTarget.style.color = "#e0e0e0"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#666666"; }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <form onSubmit={handleInvite} className="flex gap-2">
            <input
              type="email"
              className="input flex-1"
              placeholder="member@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={addMutation.isPending}
              className="btn-primary shrink-0"
            >
              {addMutation.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                "Invite"
              )}
            </button>
          </form>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#555555" }}>
              Current Members ({members?.length || 0})
            </h3>
            <ul className="space-y-2">
              {members?.map((m) => (
                <li
                  key={m._id}
                  className="flex items-center justify-between gap-3 py-2 px-3 rounded-lg transition-colors"
                  style={{ borderBottom: "1px solid #222222" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#222222")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold" style={{ background: "linear-gradient(135deg,#3b82f6,#1d4ed8)" }}>
                      {m.name[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: "#e0e0e0" }}>
                        {m.name}
                        {m._id === adminId && (
                          <span className="ml-2 text-xs font-normal" style={{ color: "#f59e0b" }}>
                            Admin
                          </span>
                        )}
                      </p>
                      <p className="text-xs" style={{ color: "#666666" }}>{m.email}</p>
                    </div>
                  </div>

                  {m._id !== adminId && (
                    <button
                      onClick={() => removeMutation.mutate(m._id)}
                      disabled={removeMutation.isPending}
                      className="p-1 rounded transition-colors"
                      style={{ color: "#555555" }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = "#ef4444"; e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = "#555555"; e.currentTarget.style.background = "transparent"; }}
                      title="Remove member"
                    >
                      <UserMinus size={14} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
