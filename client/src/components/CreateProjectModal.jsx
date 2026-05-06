import { X, Loader2 } from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createProjectApi } from "../api/projectApi";

export default function CreateProjectModal({ isOpen, onClose }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ title: "", description: "" });

  const mutation = useMutation({
    mutationFn: createProjectApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project created!");
      setForm({ title: "", description: "" });
      onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to create project");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    mutation.mutate(form);
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
            Create New Project
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">Project Title *</label>
            <input
              className="input"
              placeholder="e.g. Website Redesign"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
              maxLength={100}
            />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              className="input resize-none"
              rows={3}
              placeholder="Brief description of the project..."
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              maxLength={500}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending || !form.title.trim()}
              className="btn-primary flex-1"
            >
              {mutation.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : null}
              {mutation.isPending ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
