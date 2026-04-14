import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, LogOut, Download, RefreshCw, Mail, Phone, Building2, Cpu, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Submission {
  id: number;
  name: string;
  phone: string;
  email: string;
  college: string;
  projectType: string;
  serviceType: string;
  message?: string;
  createdAt: string;
}

const SERVICE_LABELS: Record<string, string> = {
  project_only: "Project Only",
  project_internship: "Project + Internship",
  internship_only: "Internship Only",
};

const SERVICE_COLORS: Record<string, string> = {
  project_only: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  project_internship: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  internship_only: "bg-green-500/20 text-green-300 border-green-500/30",
};

export default function Admin() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState("");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchSubmissions = async (pwd: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/submissions?password=${encodeURIComponent(pwd)}`);
      if (res.status === 401) {
        setAuthError("Wrong password. Please try again.");
        setAuthed(false);
        setLoading(false);
        return;
      }
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      setSubmissions(data.submissions ?? []);
      setTotal(data.total ?? 0);
      setAuthed(true);
      setAuthError("");
    } catch {
      setError("Failed to fetch submissions. Is the server running?");
    }
    setLoading(false);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSubmissions(password);
  };

  const handleRefresh = () => fetchSubmissions(password);

  const handleLogout = () => {
    setAuthed(false);
    setPassword("");
    setSubmissions([]);
  };

  const downloadCSV = () => {
    const header = ["ID", "Name", "Phone", "Email", "College", "Domain", "Service Type", "Message", "Date"];
    const rows = submissions.map(s => [
      s.id,
      s.name,
      s.phone,
      s.email,
      s.college,
      s.projectType,
      SERVICE_LABELS[s.serviceType] ?? s.serviceType,
      s.message ?? "",
      new Date(s.createdAt).toLocaleString("en-IN"),
    ]);
    const csv = [header, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aeipl-enquiries-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-card border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Access</h1>
            <p className="text-muted-foreground text-sm mt-1">AEIPL — Enquiries Dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Admin Password</label>
              <Input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="bg-background border-white/10 focus-visible:ring-primary h-12 rounded-xl text-white"
                required
              />
            </div>
            {authError && (
              <p className="text-red-400 text-sm">{authError}</p>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl"
            >
              {loading ? "Verifying..." : "Login"}
            </Button>
          </form>

        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-white/10 bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary" />
            <div>
              <h1 className="text-white font-bold text-sm">AEIPL Admin Panel</h1>
              <p className="text-muted-foreground text-xs">{total} enquiries total</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleRefresh}
              disabled={loading}
              variant="outline"
              size="sm"
              className="border-white/10 text-white hover:bg-white/5 gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              onClick={downloadCSV}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-white gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Enquiries", value: total, icon: <Mail className="w-5 h-5 text-primary" /> },
            { label: "Project Only", value: submissions.filter(s => s.serviceType === "project_only").length, icon: <Cpu className="w-5 h-5 text-blue-400" /> },
            { label: "Project + Internship", value: submissions.filter(s => s.serviceType === "project_internship").length, icon: <Briefcase className="w-5 h-5 text-orange-400" /> },
            { label: "Internship Only", value: submissions.filter(s => s.serviceType === "internship_only").length, icon: <Building2 className="w-5 h-5 text-green-400" /> },
          ].map((stat, i) => (
            <div key={i} className="bg-card border border-white/10 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                {stat.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        {submissions.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            <Mail className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg">No enquiries yet.</p>
            <p className="text-sm mt-1">Submissions will appear here once students fill the form.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-card border border-white/10 rounded-2xl p-5 md:p-6"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <span className="text-white font-bold text-lg">{s.name}</span>
                      <span className={`px-3 py-0.5 rounded-full text-xs font-bold border ${SERVICE_COLORS[s.serviceType] ?? "bg-white/5 text-white/60"}`}>
                        {SERVICE_LABELS[s.serviceType] ?? s.serviceType}
                      </span>
                      <span className="text-xs text-muted-foreground">#{s.id}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-4 h-4 shrink-0 text-primary/60" />
                        <a href={`tel:${s.phone}`} className="hover:text-white transition-colors">{s.phone}</a>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="w-4 h-4 shrink-0 text-primary/60" />
                        <a href={`mailto:${s.email}`} className="hover:text-white transition-colors truncate">{s.email}</a>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Building2 className="w-4 h-4 shrink-0 text-primary/60" />
                        <span className="truncate">{s.college}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Cpu className="w-4 h-4 shrink-0 text-primary/60" />
                        <span>{s.projectType}</span>
                      </div>
                    </div>

                    {s.message && (
                      <div className="mt-3 text-sm text-muted-foreground bg-white/5 rounded-xl px-4 py-3 border border-white/5">
                        <span className="text-white/40 text-xs uppercase tracking-wider mr-2">Note:</span>
                        {s.message}
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground md:text-right whitespace-nowrap">
                    {new Date(s.createdAt).toLocaleString("en-IN", {
                      day: "2-digit", month: "short", year: "numeric",
                      hour: "2-digit", minute: "2-digit"
                    })}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
