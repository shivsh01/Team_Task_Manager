import { LogOut, Search, Menu } from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import useAuthStore from "../store/authStore";
import { logoutApi } from "../api/authApi";

export default function Navbar({ onMenuClick }) {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState("");

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter" && search.trim()) {
      navigate(`/projects?q=${encodeURIComponent(search.trim())}`);
      setSearch("");
    }
  };

  const logoutMutation = useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      clearAuth();
      navigate("/login");
      toast.success("Logged out");
    },
    onError: () => {
      clearAuth();
      navigate("/login");
    },
  });

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <header
      className="flex items-center px-3 gap-2 shrink-0"
      style={{
        height: 56,
        background: "#1a1a1a",
        borderBottom: "1px solid #2a2a2a",
      }}
    >
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 rounded-lg transition-colors shrink-0"
        style={{ color: "#9d9d9d" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#2a2a2a")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <Menu size={20} />
      </button>

      <span className="md:hidden text-sm font-semibold" style={{ color: "#e0e0e0" }}>
        TeamFlow
      </span>

      <div className="hidden sm:flex flex-1 justify-center">
        <div className="relative w-full max-w-sm">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "#6d6d6d", pointerEvents: "none" }}
          />
          <input
            type="text"
            placeholder="Search projects… (Enter)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="w-full pl-8 pr-20 py-1.5 text-sm rounded-lg outline-none transition-all"
            style={{
              background: "#2a2a2a",
              border: "1px solid #3a3a3a",
              color: "#e0e0e0",
            }}
            onFocus={(e) => {
              e.target.style.border = "1px solid #555";
              e.target.style.background = "#333";
            }}
            onBlur={(e) => {
              e.target.style.border = "1px solid #3a3a3a";
              e.target.style.background = "#2a2a2a";
            }}
          />
          <span
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs px-1.5 py-0.5 rounded"
            style={{ background: "#3a3a3a", color: "#6d6d6d", fontFamily: "monospace" }}
          >
            ⌘K
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 ml-auto sm:ml-0">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold mx-1 cursor-pointer"
          title={user?.name}
        >
          {initials}
        </div>

        <button
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
          className="p-2 rounded-lg transition-colors"
          style={{ color: "#9d9d9d" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#2a2a2a";
            e.currentTarget.style.color = "#ef4444";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#9d9d9d";
          }}
          title="Logout"
        >
          <LogOut size={17} />
        </button>
      </div>
    </header>
  );
}
