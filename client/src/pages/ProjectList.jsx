import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus, Search, FolderOpen, BarChart2, Trash2, Users, Crown, UserPlus } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { getProjectsApi, deleteProjectApi } from "../api/projectApi";
import CreateProjectModal from "../components/CreateProjectModal";
import InviteMemberModal from "../components/InviteMemberModal";
import useAuthStore from "../store/authStore";

const TABS = ["All", "Admin", "Member"];

const STATUS_COLORS = {
  admin: { bg: "#14532d", color: "#4ade80" },
  member: { bg: "#1e3a5f", color: "#60a5fa" },
};

export default function ProjectList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [tab, setTab] = useState("All");

  const handleSearch = (value) => {
    setSearch(value);
    if (value.trim()) {
      setSearchParams({ q: value }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  useEffect(() => {
    setSearch(searchParams.get("q") || "");
  }, [searchParams]);

  const [selected, setSelected] = useState(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [memberModal, setMemberModal] = useState(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["projects"],
    queryFn: () => getProjectsApi().then((r) => r.data.projects),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProjectApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      setSelected(new Set());
      toast.success("Project deleted");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Delete failed"),
  });

  const projects = data || [];
  const adminProjects = projects.filter((p) => p.admin?._id === user?._id);
  const memberProjects = projects.filter((p) => p.admin?._id !== user?._id);

  const tabFiltered =
    tab === "Admin" ? adminProjects : tab === "Member" ? memberProjects : projects;

  const filtered = tabFiltered.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (id) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const toggleAll = () => {
    setSelected(
      selected.size === filtered.length ? new Set() : new Set(filtered.map((p) => p._id))
    );
  };

  const handleDeleteSelected = () => {
    if (!window.confirm(`Delete ${selected.size} project(s)?`)) return;
    [...selected].forEach((id) => deleteMutation.mutate(id));
  };

  return (
    <>
      <div className="space-y-4">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold" style={{ color: "#e0e0e0" }}>
            Projects
          </h1>
          <div className="flex items-center gap-2">
            {selected.size > 0 && (
              <button onClick={handleDeleteSelected} className="btn-danger">
                <Trash2 size={14} />
                Delete ({selected.size})
              </button>
            )}
            <button onClick={() => setModalOpen(true)} className="btn-primary">
              <Plus size={15} />
              Add project
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="overflow-x-auto">
        <div
          className="flex items-stretch rounded-xl overflow-hidden"
          style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", minWidth: 400 }}
        >
          {[
            { label: "Total projects", value: projects.length },
            { label: "Where I'm admin", value: adminProjects.length },
            { label: "Shared with me", value: memberProjects.length },
            {
              label: "Total tasks",
              value: projects.reduce((s, p) => s + (p.tasks?.length || 0), 0),
            },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="flex-1 px-5 py-4"
              style={{
                borderLeft: i > 0 ? "1px solid #2a2a2a" : "none",
              }}
            >
              <p className="text-xs" style={{ color: "#888888" }}>
                {stat.label}
              </p>
              <p className="text-2xl font-semibold mt-0.5" style={{ color: "#e0e0e0" }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>
        </div>{/* end overflow-x-auto */}

        {/* Table card */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}
        >
          {/* Toolbar */}
          <div
            className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 px-4 py-3"
            style={{ borderBottom: "1px solid #2a2a2a" }}
          >
            {/* Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-lg self-start" style={{ background: "#161616" }}>
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`tab-pill${tab === t ? " active" : ""}`}
                >
                  {t}
                  {t === "All" && projects.length > 0 && (
                    <span className="ml-1.5 text-xs" style={{ color: "#555555" }}>
                      {projects.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative sm:ml-auto w-full sm:w-auto">
              <Search
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2"
                style={{ color: "#555555", pointerEvents: "none" }}
              />
              <input
                type="text"
                className="input pl-8 text-sm w-full sm:w-52"
                style={{ height: 34 }}
                placeholder="Search projects"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="p-8 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-4 animate-pulse">
                  <div className="w-4 h-4 bg-gray-200 rounded" />
                  <div className="flex-1 h-4 bg-gray-100 rounded" />
                  <div className="w-20 h-4 bg-gray-100 rounded" />
                  <div className="w-16 h-4 bg-gray-100 rounded" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="p-10 text-center text-sm" style={{ color: "#888888" }}>
              Failed to load projects.
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-3">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: "#222222" }}
              >
                <FolderOpen size={28} style={{ color: "#555555" }} />
              </div>
              <p className="text-sm font-medium" style={{ color: "#e0e0e0" }}>
                {search ? "No projects match your search" : "No projects yet"}
              </p>
              <p className="text-xs" style={{ color: "#888888" }}>
                {search ? "Try a different term" : "Create your first project to get started"}
              </p>
              {!search && (
                <button onClick={() => setModalOpen(true)} className="btn-primary mt-1">
                  <Plus size={14} />
                  Add project
                </button>
              )}
            </div>
          ) : (
            <>
            <div className="md:hidden">
              {filtered.map((p) => {
                const isAdmin = p.admin?._id === user?._id;
                const role = isAdmin ? "admin" : "member";
                const sc = STATUS_COLORS[role];
                return (
                  <div
                    key={p._id}
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors"
                    style={{ borderBottom: "1px solid #222222" }}
                    onClick={() => navigate(`/projects/${p._id}`)}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#1e1e1e")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ background: "linear-gradient(135deg,#60a5fa,#3b82f6)" }}
                    >
                      {p.title[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate" style={{ color: "#e0e0e0" }}>
                        {p.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="badge text-xs" style={{ background: sc.bg, color: sc.color }}>{role}</span>
                        <span className="text-xs" style={{ color: "#666666" }}>
                          {p.members?.length || 0} members · {p.tasks?.length || 0} tasks
                        </span>
                      </div>
                    </div>
                    <div
                      className="flex items-center gap-1 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {isAdmin && (
                        <button
                          onClick={() => setMemberModal(p)}
                          className="p-2 rounded-lg transition-colors"
                          style={{ color: "#666666" }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "#1e3a5f"; e.currentTarget.style.color = "#60a5fa"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#666666"; }}
                        >
                          <UserPlus size={15} />
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/projects/${p._id}/dashboard`)}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: "#666666" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "#2a2a2a"; e.currentTarget.style.color = "#e0e0e0"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#666666"; }}
                      >
                        <BarChart2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="hidden md:block overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 44 }}>
                    <input
                      type="checkbox"
                      checked={selected.size === filtered.length && filtered.length > 0}
                      onChange={toggleAll}
                      className="rounded"
                      style={{ accentColor: "#303030" }}
                    />
                  </th>
                  <th>Project</th>
                  <th>Role</th>
                  <th>Admin</th>
                  <th>Members</th>
                  <th>Tasks</th>
                  <th>Created</th>
                  <th style={{ width: 130 }} />
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const isAdmin = p.admin?._id === user?._id;
                  const role = isAdmin ? "admin" : "member";
                  return (
                    <tr
                      key={p._id}
                      className="cursor-pointer"
                      onClick={() => navigate(`/projects/${p._id}`)}
                    >
                      <td onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selected.has(p._id)}
                          onChange={() => toggleSelect(p._id)}
                          className="rounded"
                          style={{ accentColor: "#303030" }}
                        />
                      </td>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                          >
                            {p.title[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-sm" style={{ color: "#e0e0e0" }}>
                              {p.title}
                            </p>
                            {p.description && (
                              <p
                                className="text-xs truncate max-w-xs"
                                style={{ color: "#666666" }}
                              >
                                {p.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          className="badge"
                          style={STATUS_COLORS[role]}
                        >
                          {isAdmin ? (
                            <Crown size={10} className="mr-1" />
                          ) : (
                            <Users size={10} className="mr-1" />
                          )}
                          {isAdmin ? "Admin" : "Member"}
                        </span>
                      </td>
                      <td>
                        <span className="text-sm" style={{ color: "#c9c9c9" }}>
                          {p.admin?.name}
                        </span>
                      </td>
                      <td>
                        <span className="text-sm" style={{ color: "#c9c9c9" }}>
                          {p.members?.length || 0}
                        </span>
                      </td>
                      <td>
                        <span className="text-sm" style={{ color: "#c9c9c9" }}>
                          {p.tasks?.length || 0}
                        </span>
                      </td>
                      <td>
                        <span className="text-xs" style={{ color: "#8c9196" }}>
                          {p.createdAt
                            ? format(new Date(p.createdAt), "MMM d, yyyy")
                            : "—"}
                        </span>
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          {isAdmin && (
                            <button
                              onClick={() => setMemberModal(p)}
                              className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors"
                              style={{ color: "#888888" }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = "#1e3a5f";
                                e.currentTarget.style.color = "#60a5fa";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = "transparent";
                                e.currentTarget.style.color = "#888888";
                              }}
                            >
                              <UserPlus size={13} />
                              Members
                            </button>
                          )}
                          <button
                            onClick={() => navigate(`/projects/${p._id}/dashboard`)}
                            className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors"
                            style={{ color: "#888888" }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "#2a2a2a";
                              e.currentTarget.style.color = "#e0e0e0";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "transparent";
                              e.currentTarget.style.color = "#888888";
                            }}
                          >
                            <BarChart2 size={13} />
                            Stats
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
            </>
          )}
        </div>
      </div>

      <CreateProjectModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      {memberModal && (
        <InviteMemberModal
          isOpen={!!memberModal}
          onClose={() => setMemberModal(null)}
          projectId={memberModal._id}
          members={memberModal.members || []}
          adminId={memberModal.admin?._id}
        />
      )}
    </>
  );
}
