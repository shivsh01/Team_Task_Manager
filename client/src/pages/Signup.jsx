import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Loader2, FolderKanban, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { signupApi } from "../api/authApi";
import useAuthStore from "../store/authStore";

export default function Signup() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPw, setShowPw] = useState(false);

  const mutation = useMutation({
    mutationFn: signupApi,
    onSuccess: ({ data }) => {
      setAuth(data.user, data.token);
      toast.success(`Welcome to TeamFlow, ${data.user.name}!`);
      navigate("/projects");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Signup failed");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "#111111" }}
    >
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
            style={{ background: "linear-gradient(135deg,#3b82f6,#1d4ed8)" }}
          >
            <FolderKanban size={24} className="text-white" />
          </div>
          <h1 className="text-xl font-semibold" style={{ color: "#e0e0e0" }}>
            Create your account
          </h1>
        </div>

        {/* Card */}
        <div
          className="rounded-xl p-7"
          style={{
            background: "#1a1a1a",
            border: "1px solid #2a2a2a",
            boxShadow: "0 2px 8px rgba(0,0,0,.4)",
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full name</label>
              <input
                type="text"
                className="input"
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
                minLength={2}
                maxLength={50}
                autoComplete="name"
              />
            </div>

            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  className="input pr-10"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "#8c9196" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#303030")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#8c9196")}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="btn-primary w-full py-2.5 mt-1"
            >
              {mutation.isPending && <Loader2 size={15} className="animate-spin" />}
              {mutation.isPending ? "Creating…" : "Create account"}
            </button>
          </form>

          <p className="text-center text-sm mt-5" style={{ color: "#888888" }}>
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium"
              style={{ color: "#3b82f6" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#1d4ed8")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#3b82f6")}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
