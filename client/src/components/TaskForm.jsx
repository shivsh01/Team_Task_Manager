import { X, Loader2 } from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createTaskApi } from "../api/taskApi";
import { format } from "date-fns";

export default function TaskForm({ isOpen, onClose, projectId, members }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "Medium",
    status: "To Do",
    assignedTo: "",
    project: projectId,
  });

  const mutation = useMutation({
    mutationFn: createTaskApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks", projectId] });
      toast.success("Task created!");
      setForm({
        title: "",
        description: "",
        dueDate: "",
        priority: "Medium",
        status: "To Do",
        assignedTo: "",
        project: projectId,
      });
      onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to create task");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.assignedTo || !form.dueDate) return;
    mutation.mutate(form);
  };

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative rounded-2xl shadow-2xl w-full max-w-lg" style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}>
        <div className="flex items-center justify-between p-6" style={{ borderBottom: "1px solid #2a2a2a" }}>
          <h2 className="text-lg font-semibold" style={{ color: "#e0e0e0" }}>Create Task</h2>
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
            <label className="label">Title *</label>
            <input
              name="title"
              className="input"
              placeholder="Task title"
              value={form.title}
              onChange={handleChange}
              required
              maxLength={100}
            />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              name="description"
              className="input resize-none"
              rows={2}
              placeholder="Describe the task..."
              value={form.description}
              onChange={handleChange}
              maxLength={1000}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Due Date *</label>
              <input
                name="dueDate"
                type="date"
                className="input"
                value={form.dueDate}
                onChange={handleChange}
                min={format(new Date(), "yyyy-MM-dd")}
                required
              />
            </div>

            <div>
              <label className="label">Priority</label>
              <select
                name="priority"
                className="input"
                value={form.priority}
                onChange={handleChange}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Status</label>
              <select
                name="status"
                className="input"
                value={form.status}
                onChange={handleChange}
              >
                <option>To Do</option>
                <option>In Progress</option>
                <option>Done</option>
              </select>
            </div>

            <div>
              <label className="label">Assign To *</label>
              <select
                name="assignedTo"
                className="input"
                value={form.assignedTo}
                onChange={handleChange}
                required
              >
                <option value="">Select member...</option>
                {members?.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                mutation.isPending ||
                !form.title.trim() ||
                !form.assignedTo ||
                !form.dueDate
              }
              className="btn-primary flex-1"
            >
              {mutation.isPending && (
                <Loader2 size={16} className="animate-spin" />
              )}
              {mutation.isPending ? "Creating..." : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
