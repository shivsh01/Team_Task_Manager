import { NavLink } from "react-router-dom";
import { Home, FolderOpen, Plus, BarChart2, Settings } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProjectsApi } from "../api/projectApi";
import CreateProjectModal from "./CreateProjectModal";
import useAuthStore from "../store/authStore";

const NavItem = ({ to, icon: Icon, label, badge, end }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors group ${
        isActive
          ? "bg-[#2a2a2a] text-[#e0e0e0] font-medium"
          : "text-[#9d9d9d] hover:bg-[#222222] hover:text-[#e0e0e0]"
      }`
    }
  >
    {Icon && <Icon size={16} style={{ color: "#6d7175" }} className="shrink-0" />}
    <span className="flex-1 truncate">{label}</span>
    {badge != null && badge > 0 && (
      <span
        className="text-xs font-semibold px-1.5 py-0.5 rounded-md"
        style={{ background: "#2a2a2a", color: "#c9c9c9" }}
      >
        {badge}
      </span>
    )}
  </NavLink>
);

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const user = useAuthStore((s) => s.user);

  const { data } = useQuery({
    queryKey: ["projects"],
    queryFn: () => getProjectsApi().then((r) => r.data.projects),
  });

  const projects = data || [];

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <>
      <aside
        className="flex flex-col h-full shrink-0"
        style={{
          width: 240,
          background: "#161616",
          borderRight: "1px solid #222222",
        }}
      >
        {/* Store / brand header */}
        <div
          className="flex items-center gap-2.5 px-4 py-3"
          style={{ borderBottom: "1px solid #222222" }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{ background: "linear-gradient(135deg,#3b82f6,#1d4ed8)" }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: "#e0e0e0" }}>
              {user?.name || "TeamFlow"}
            </p>
            <p className="text-xs truncate" style={{ color: "#8c9196" }}>
              {user?.email}
            </p>
          </div>
        </div>

        {/* Primary navigation */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          <NavItem to="/projects" end icon={Home} label="Home" />
          <NavItem
            to="/projects"
            icon={FolderOpen}
            label="Projects"
            badge={projects.length}
          />

          {/* My Projects section */}
          <div className="pt-3">
            <div
              className="flex items-center justify-between px-3 mb-1.5"
            >
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: "#8c9196" }}
              >
                My Projects
              </span>
              <button
                onClick={() => setOpen(true)}
                title="New project"
                className="p-0.5 rounded transition-colors hover:bg-[#2a2a2a]"
                style={{ color: "#8c9196" }}
              >
                <Plus size={13} />
              </button>
            </div>

            <div className="space-y-0.5">
              {projects.length === 0 && (
                <p className="px-3 py-2 text-xs italic" style={{ color: "#8c9196" }}>
                  No projects yet
                </p>
              )}
              {projects.map((p) => (
                <NavLink
                  key={p._id}
                  to={`/projects/${p._id}`}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive
                        ? "bg-[#2a2a2a] text-[#e0e0e0] font-medium"
                        : "text-[#9d9d9d] hover:bg-[#222222] hover:text-[#e0e0e0]"
                    }`
                  }
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: "#3b82f6" }}
                  />
                  <span className="flex-1 truncate">{p.title}</span>
                  <span className="text-xs shrink-0" style={{ color: "#8c9196" }}>
                    {p.tasks?.length || 0}
                  </span>
                </NavLink>
              ))}
            </div>
          </div>
        </nav>

        {/* Bottom actions */}
        <div className="p-2 space-y-0.5" style={{ borderTop: "1px solid #222222" }}>
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm transition-colors hover:bg-[#222222]"
            style={{ color: "#6d7175" }}
          >
            <Plus size={16} />
            <span>New project</span>
          </button>
          {/* <NavLink
            to="/projects"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-[#222222]"
            style={{ color: "#6d7175" }}
          >
            <Settings size={16} />
            <span>Settings</span>
          </NavLink> */}
        </div>
      </aside>

      <CreateProjectModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
