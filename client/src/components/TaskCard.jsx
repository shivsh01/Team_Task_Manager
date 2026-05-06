import { Calendar, User, Trash2, AlertCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { format, isPast } from "date-fns";
import { updateTaskApi, deleteTaskApi } from "../api/taskApi";
import useAuthStore from "../store/authStore";

const PRIORITY_META = {
  Low:    { bg: "#14532d", color: "#4ade80" },
  Medium: { bg: "#422006", color: "#fbbf24" },
  High:   { bg: "#450a0a", color: "#f87171" },
};

const STATUS_OPTIONS = ["To Do", "In Progress", "Done"];

export default function TaskCard({ task, projectId, isAdmin }) {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const isAssignee = task.assignedTo?._id === user?._id;
  const canEdit = isAdmin || isAssignee;
  const isOverdue = task.status !== "Done" && task.dueDate && isPast(new Date(task.dueDate));

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateTaskApi(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks", projectId] });
      toast.success("Status updated");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Update failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteTaskApi(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks", projectId] });
      toast.success("Task deleted");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Delete failed"),
  });

  const pm = PRIORITY_META[task.priority] || PRIORITY_META.Medium;

  return (
    <div
      className="rounded-xl p-3.5 transition-shadow hover:shadow-md"
      style={{
        background: "#1a1a1a",
        border: isOverdue ? "1px solid #7f1d1d" : "1px solid #2a2a2a",
        boxShadow: "0 1px 2px rgba(0,0,0,.3)",
      }}
    >
      {/* Title row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-snug" style={{ color: "#e0e0e0" }}>
            {task.title}
          </p>
          {task.description && (
            <p className="text-xs mt-0.5 line-clamp-2" style={{ color: "#666666" }}>
              {task.description}
            </p>
          )}
        </div>
        {isAdmin && (
          <button
            onClick={() => window.confirm(`Delete "${task.title}"?`) && deleteMutation.mutate(task._id)}
            disabled={deleteMutation.isPending}
            className="p-1 rounded transition-colors shrink-0"
            style={{ color: "#c9cccf" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#ef4444";
              e.currentTarget.style.background = "#fef2f2";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#c9cccf";
              e.currentTarget.style.background = "transparent";
            }}
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>

      {/* Badges row */}
      <div className="flex items-center gap-1.5 flex-wrap mb-2.5">
        {/* Priority */}
        <span className="badge" style={pm}>
          {task.priority}
        </span>

        {/* Status */}
        {canEdit ? (
          <select
            value={task.status}
            onChange={(e) =>
              updateMutation.mutate({ id: task._id, data: { status: e.target.value } })
            }
            disabled={updateMutation.isPending}
            className="badge cursor-pointer border-0 outline-none"
            style={{
              background: "#2a2a2a",
              color: "#c9c9c9",
              paddingRight: 4,
              appearance: "auto",
            }}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        ) : (
          <span className="badge" style={{ background: "#2a2a2a", color: "#c9c9c9" }}>
            {task.status}
          </span>
        )}

        {isOverdue && (
          <span className="flex items-center gap-0.5 text-xs font-medium" style={{ color: "#dc2626" }}>
            <AlertCircle size={10} />
            Overdue
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1 text-xs" style={{ color: "#666666" }}>
          <User size={10} />
          {task.assignedTo?.name || "Unassigned"}
        </span>
        {task.dueDate && (
          <span
            className="flex items-center gap-1 text-xs"
            style={{ color: isOverdue ? "#ef4444" : "#666666" }}
          >
            <Calendar size={10} />
            {format(new Date(task.dueDate), "MMM d")}
          </span>
        )}
      </div>
    </div>
  );
}
