import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Loader2 } from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from "recharts";
import { getDashboardApi } from "../api/dashboardApi";

const PIE_COLORS = { "To Do": "#9ca3af", "In Progress": "#3b82f6", Done: "#22c55e" };

const TOOLTIP_STYLE = {
  borderRadius: 8,
  border: "1px solid #2a2a2a",
  background: "#1e1e1e",
  fontSize: 12,
  color: "#e0e0e0",
};

export default function Dashboard() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard", id],
    queryFn: () => getDashboardApi(id).then((r) => r.data),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={28} className="animate-spin" style={{ color: "#3b82f6" }} />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="text-center py-20">
        <p className="text-sm" style={{ color: "#6d7175" }}>Failed to load dashboard.</p>
        <button onClick={() => navigate(`/projects/${id}`)} className="btn-secondary mt-4">
          Back to Project
        </button>
      </div>
    );
  }

  const { totalTasks, tasksByStatus, overdueTasks, tasksByUser, project } = data;

  const pieData = Object.entries(tasksByStatus)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  const barData = tasksByUser.map((u) => ({
    name: u.name?.split(" ")[0] || "?",
    "To Do": u.todo,
    "In Progress": u.inProgress,
    Done: u.done,
  }));

  const stats = [
    { label: "Total tasks",  value: totalTasks,                   color: "#e0e0e0" },
    { label: "To Do",        value: tasksByStatus["To Do"],        color: "#9d9d9d" },
    { label: "In Progress",  value: tasksByStatus["In Progress"],  color: "#3b82f6" },
    { label: "Done",         value: tasksByStatus["Done"],         color: "#16a34a" },
    { label: "Overdue",      value: overdueTasks,                  color: overdueTasks > 0 ? "#ef4444" : "#666666" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-1.5 text-sm" style={{ color: "#888888" }}>
        <button
          onClick={() => navigate("/projects")}
          className="hover:underline"
          style={{ color: "#888888" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#e0e0e0")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#888888")}
        >
          Projects
        </button>
        <ChevronRight size={14} />
        <button
          onClick={() => navigate(`/projects/${id}`)}
          className="hover:underline"
          style={{ color: "#888888" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#e0e0e0")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#888888")}
        >
          {project?.title}
        </button>
        <ChevronRight size={14} />
        <span style={{ color: "#e0e0e0", fontWeight: 500 }}>Dashboard</span>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold" style={{ color: "#e0e0e0" }}>
          Analytics — {project?.title}
        </h1>
        <button onClick={() => navigate(`/projects/${id}`)} className="btn-secondary">
          View tasks
        </button>
      </div>

      <div className="overflow-x-auto">
        <div
          className="flex items-stretch rounded-xl overflow-hidden"
          style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", minWidth: 480 }}
        >
          {stats.map((s, i) => (
            <div
              key={s.label}
              className="flex-1 px-5 py-4"
              style={{ borderLeft: i > 0 ? "1px solid #2a2a2a" : "none" }}
            >
              <p className="text-xs" style={{ color: "#888888" }}>{s.label}</p>
              <p className="text-2xl font-semibold mt-0.5" style={{ color: s.color }}>
                {s.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-xl p-5" style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}>
          <p className="text-sm font-semibold mb-4" style={{ color: "#e0e0e0" }}>
            Tasks by status
          </p>
          {pieData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-sm" style={{ color: "#666666" }}>
              No tasks yet
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={PIE_COLORS[entry.name] || "#94a3b8"} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-center gap-5 mt-1">
                {Object.entries(PIE_COLORS).map(([label, color]) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                    <span className="text-xs" style={{ color: "#888888" }}>{label}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="rounded-xl p-5" style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}>
          <p className="text-sm font-semibold mb-4" style={{ color: "#e0e0e0" }}>
            Tasks per member
          </p>
          {barData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-sm" style={{ color: "#666666" }}>
              No data
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={barData} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#888888" }} />
                <YAxis tick={{ fontSize: 12, fill: "#888888" }} allowDecimals={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="To Do"      fill="#9ca3af" radius={[3,3,0,0]} />
                <Bar dataKey="In Progress" fill="#3b82f6" radius={[3,3,0,0]} />
                <Bar dataKey="Done"        fill="#22c55e" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}>
        <div className="px-5 py-4" style={{ borderBottom: "1px solid #2a2a2a" }}>
          <p className="text-sm font-semibold" style={{ color: "#e0e0e0" }}>Member summary</p>
        </div>
        {tasksByUser.length === 0 ? (
          <p className="p-5 text-sm" style={{ color: "#666666" }}>No member data.</p>
        ) : (
          <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>To Do</th>
                <th>In Progress</th>
                <th>Done</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {tasksByUser.map((u) => (
                <tr key={u.userId}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0"
                        style={{ background: "linear-gradient(135deg,#60a5fa,#3b82f6)" }}
                      >
                        {u.name?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: "#e0e0e0" }}>
                          {u.name || "Unknown"}
                        </p>
                        <p className="text-xs" style={{ color: "#666666" }}>{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge" style={{ background: "#2a2a2a", color: "#9d9d9d" }}>
                      {u.todo}
                    </span>
                  </td>
                  <td>
                    <span className="badge" style={{ background: "#1e3a5f", color: "#60a5fa" }}>
                      {u.inProgress}
                    </span>
                  </td>
                  <td>
                    <span className="badge" style={{ background: "#14532d", color: "#4ade80" }}>
                      {u.done}
                    </span>
                  </td>
                  <td>
                    <span className="text-sm font-semibold" style={{ color: "#e0e0e0" }}>
                      {u.total}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
}
