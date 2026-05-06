import { useNavigate } from "react-router-dom";
import { Users, CheckSquare, BarChart2, Crown, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { deleteProjectApi } from "../api/projectApi";
import useAuthStore from "../store/authStore";

export default function ProjectCard({ project }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const isAdmin = project.admin?._id === user?._id;

  const deleteMutation = useMutation({
    mutationFn: () => deleteProjectApi(project._id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project deleted");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete");
    },
  });

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm(`Delete "${project.title}"? This cannot be undone.`)) {
      deleteMutation.mutate();
    }
  };

  return (
    <div
      onClick={() => navigate(`/projects/${project._id}`)}
      className="card cursor-pointer hover:shadow-md hover:border-primary-200 transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
            {project.title}
          </h3>
          {project.description && (
            <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
              {project.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 ml-2 shrink-0">
          {isAdmin && (
            <span className="badge bg-amber-50 text-amber-700 gap-1">
              <Crown size={10} />
              Admin
            </span>
          )}
          {isAdmin && (
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
        <span className="flex items-center gap-1.5">
          <Users size={14} />
          {project.members?.length || 0} members
        </span>
        <span className="flex items-center gap-1.5">
          <CheckSquare size={14} />
          {project.tasks?.length || 0} tasks
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/projects/${project._id}/dashboard`);
          }}
          className="ml-auto flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium text-xs"
        >
          <BarChart2 size={13} />
          Dashboard
        </button>
      </div>
    </div>
  );
}
