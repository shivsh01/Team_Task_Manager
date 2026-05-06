import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Plus, Users, BarChart2, ChevronRight,
  Crown, ClipboardList, Loader2,
} from "lucide-react";
import { getProjectByIdApi } from "../api/projectApi";
import { getTasksByProjectApi } from "../api/taskApi";
import useAuthStore from "../store/authStore";
import TaskCard from "../components/TaskCard";
import TaskForm from "../components/TaskForm";
import InviteMemberModal from "../components/InviteMemberModal";

const COLUMNS = ["To Do", "In Progress", "Done"];

const COL_META = {
  "To Do":      { dot: "#6b7280" },
  "In Progress":{ dot: "#3b82f6" },
  Done:         { dot: "#22c55e" },
};

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [memberModalOpen, setMemberModalOpen] = useState(false);

  const { data: projectData, isLoading: projectLoading, isError: projectError } =
    useQuery({
      queryKey: ["project", id],
      queryFn: () => getProjectByIdApi(id).then((r) => r.data),
      enabled: !!id,
    });

  const { data: taskData, isLoading: tasksLoading } = useQuery({
    queryKey: ["tasks", id],
    queryFn: () => getTasksByProjectApi(id).then((r) => r.data.tasks),
    enabled: !!id,
  });

  const project = projectData?.project;
  const isAdmin = projectData?.isAdmin;
  const tasks = taskData || [];
  const now = new Date();

  const tasksByStatus = COLUMNS.reduce((acc, col) => {
    acc[col] = tasks.filter((t) => t.status === col);
    return acc;
  }, {});

  const overdueCount = tasks.filter(
    (t) => t.status !== "Done" && t.dueDate && new Date(t.dueDate) < now
  ).length;

  if (projectLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={28} className="animate-spin" style={{ color: "#3b82f6" }} />
      </div>
    );
  }

  if (projectError || !project) {
    return (
      <div className="text-center py-20">
        <p className="text-sm font-medium" style={{ color: "#303030" }}>Project not found</p>
        <button onClick={() => navigate("/projects")} className="btn-secondary mt-4">
          Back to Projects
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-5">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-sm" style={{ color: "#888888" }}>
          <button
            onClick={() => navigate("/projects")}
            className="hover:underline transition-colors"
            style={{ color: "#888888" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#e0e0e0")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#888888")}
          >
            Projects
          </button>
          <ChevronRight size={14} />
          <span style={{ color: "#e0e0e0", fontWeight: 500 }}>{project.title}</span>
        </div>

        {/* Page header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold" style={{ color: "#e0e0e0" }}>
              {project.title}
            </h1>
            {project.description && (
              <p className="text-sm mt-0.5" style={{ color: "#888888" }}>
                {project.description}
              </p>
            )}
            <div className="flex items-center gap-3 mt-2">
              <span className="flex items-center gap-1 text-xs" style={{ color: "#777777" }}>
                <Crown size={11} style={{ color: "#f59e0b" }} />
                {project.admin?.name}
              </span>
              <span className="flex items-center gap-1 text-xs" style={{ color: "#777777" }}>
                <Users size={11} />
                {project.members?.length} member{project.members?.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigate(`/projects/${id}/dashboard`)}
              className="btn-secondary"
            >
              <BarChart2 size={14} />
              Dashboard
            </button>
            {isAdmin && (
              <>
                <button onClick={() => setMemberModalOpen(true)} className="btn-secondary">
                  <Users size={14} />
                  Members
                </button>
                <button onClick={() => setTaskFormOpen(true)} className="btn-primary">
                  <Plus size={14} />
                  Add task
                </button>
              </>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
        <div
          className="flex items-stretch rounded-xl overflow-hidden"
          style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", minWidth: 480 }}
        >
          {[
            { label: "Total tasks", value: tasks.length, color: "#e0e0e0" },
            { label: "To Do",       value: tasksByStatus["To Do"].length,       color: "#9d9d9d" },
            { label: "In Progress", value: tasksByStatus["In Progress"].length,  color: "#3b82f6" },
            { label: "Done",        value: tasksByStatus["Done"].length,         color: "#16a34a" },
            { label: "Overdue",     value: overdueCount,                         color: overdueCount > 0 ? "#ef4444" : "#666666" },
          ].map((s, i) => (
            <div
              key={s.label}
              className="flex-1 px-4 py-3"
              style={{ borderLeft: i > 0 ? "1px solid #2a2a2a" : "none" }}
            >
              <p className="text-xs" style={{ color: "#888888" }}>{s.label}</p>
              <p className="text-xl font-semibold mt-0.5" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>
        </div>
        {tasksLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 size={22} className="animate-spin" style={{ color: "#3b82f6" }} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {COLUMNS.map((col) => {
              const meta = COL_META[col];
              const colTasks = tasksByStatus[col];
              return (
                <div
                  key={col}
                  className="flex flex-col rounded-xl"
                  style={{ border: "1px solid #2a2a2a", background: "#1a1a1a" }}
                >
                  <div
                    className="flex items-center justify-between px-4 py-3 rounded-t-xl"
                    style={{ borderBottom: "1px solid #2a2a2a" }}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ background: meta.dot }}
                      />
                      <span className="text-sm font-semibold" style={{ color: "#e0e0e0" }}>
                        {col}
                      </span>
                    </div>
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(255,255,255,0.08)", color: "#888888" }}
                    >
                      {colTasks.length}
                    </span>
                  </div>

                  <div className="p-3 space-y-2.5 flex-1 min-h-[100px]">
                    {colTasks.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-10"
                        style={{ color: "#444444" }}>
                        <ClipboardList size={22} />
                        <p className="text-xs mt-2">No tasks</p>
                      </div>
                    )}
                    {colTasks.map((task) => (
                      <TaskCard key={task._id} task={task} projectId={id} isAdmin={isAdmin} />
                    ))}
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => setTaskFormOpen(true)}
                      className="m-3 mt-0 flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg transition-colors"
                      style={{
                        color: "#555555",
                        border: "1px dashed #333333",
                        background: "transparent",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = "#e0e0e0";
                        e.currentTarget.style.borderColor = "#555555";
                        e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = "#555555";
                        e.currentTarget.style.borderColor = "#333333";
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <Plus size={13} />
                      Add task
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <TaskForm
        isOpen={taskFormOpen}
        onClose={() => setTaskFormOpen(false)}
        projectId={id}
        members={project?.members}
      />
      <InviteMemberModal
        isOpen={memberModalOpen}
        onClose={() => setMemberModalOpen(false)}
        projectId={id}
        members={project?.members}
        adminId={project?.admin?._id}
      />
    </>
  );
}
