import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Shield, LogOut, Download, RefreshCw, Mail, Phone, Building2, Cpu, Briefcase,
  BookOpen, Megaphone, Image, Plus, Trash2, Pencil, X, Check, Upload, FileText,
  Eye, EyeOff, GraduationCap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Submission {
  id: number; name: string; phone: string; email: string;
  college: string; projectType: string; serviceType: string;
  message?: string; createdAt: string;
}

interface Course {
  id: number; title: string; domain: string; duration: string; fee: string;
  description: string; highlights: string; imageUrl?: string | null;
  pdfUrl?: string | null; isActive: boolean; createdAt: string;
}

interface Announcement {
  id: number; title: string; body: string; imageUrl?: string | null;
  isActive: boolean; createdAt: string;
}

interface GalleryItem {
  id: number; title: string; category: string; imageUrl: string; createdAt: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const SERVICE_LABELS: Record<string, string> = {
  project_only: "Project Only",
  project_internship: "Project + Internship",
  internship_only: "Internship Only",
  industrial_course: "Industrial Course",
};

const SERVICE_COLORS: Record<string, string> = {
  project_only: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  project_internship: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  internship_only: "bg-green-500/20 text-green-300 border-green-500/30",
  industrial_course: "bg-purple-500/20 text-purple-300 border-purple-500/30",
};

const TABS = [
  { id: "enquiries", label: "Enquiries", icon: Mail },
  { id: "courses", label: "Courses", icon: GraduationCap },
  { id: "announcements", label: "Announcements", icon: Megaphone },
  { id: "gallery", label: "Gallery", icon: Image },
];

// ── File Upload Helper ─────────────────────────────────────────────────────────

async function uploadFile(file: File): Promise<string> {
  const metaRes = await fetch("/api/storage/uploads/request-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type }),
  });
  if (!metaRes.ok) throw new Error("Failed to get upload URL");
  const { uploadURL, objectPath } = await metaRes.json();
  const putRes = await fetch(uploadURL, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!putRes.ok) throw new Error("Failed to upload file");
  return `/api/storage${objectPath}`;
}

// ── FileUploadButton ──────────────────────────────────────────────────────────

function FileUploadButton({
  label, accept, currentUrl, onUploaded, uploading, setUploading
}: {
  label: string; accept: string; currentUrl?: string | null;
  onUploaded: (url: string) => void;
  uploading: boolean; setUploading: (v: boolean) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [err, setErr] = useState("");

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setErr("");
    try {
      const url = await uploadFile(file);
      onUploaded(url);
    } catch { setErr("Upload failed. Try again."); }
    setUploading(false);
    if (ref.current) ref.current.value = "";
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="sm"
          className="border-white/10 text-white/70 hover:bg-white/5 gap-2"
          onClick={() => ref.current?.click()} disabled={uploading}>
          <Upload className="w-4 h-4" />
          {uploading ? "Uploading…" : label}
        </Button>
        {currentUrl && (
          <a href={currentUrl} target="_blank" rel="noreferrer"
            className="text-xs text-primary hover:underline truncate max-w-[180px]">
            View current
          </a>
        )}
        <input ref={ref} type="file" accept={accept} className="hidden" onChange={handleChange} />
      </div>
      {err && <p className="text-red-400 text-xs">{err}</p>}
    </div>
  );
}

// ── Enquiries Tab ─────────────────────────────────────────────────────────────

function EnquiriesTab({ password }: { password: string }) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  const load = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(`/api/admin/submissions?password=${encodeURIComponent(password)}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSubmissions(data.submissions ?? []);
      setTotal(data.total ?? 0);
      setLoaded(true);
    } catch { setError("Failed to load enquiries."); }
    setLoading(false);
  };

  if (!loaded) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <Mail className="w-12 h-12 text-muted-foreground opacity-30" />
      <Button onClick={load} disabled={loading} className="bg-primary hover:bg-primary/90">
        {loading ? "Loading…" : "Load Enquiries"}
      </Button>
    </div>
  );

  const downloadCSV = () => {
    const header = ["ID","Name","Phone","Email","College","Domain","Service Type","Message","Date"];
    const rows = submissions.map(s => [
      s.id, s.name, s.phone, s.email, s.college, s.projectType,
      SERVICE_LABELS[s.serviceType] ?? s.serviceType, s.message ?? "",
      new Date(s.createdAt).toLocaleString("en-IN"),
    ]);
    const csv = [header, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `aeipl-enquiries-${new Date().toISOString().slice(0,10)}.csv` });
    a.click(); URL.revokeObjectURL(a.href);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-1">
          {[
            { label: "Total", value: total, color: "text-primary" },
            { label: "Project Only", value: submissions.filter(s => s.serviceType === "project_only").length, color: "text-blue-400" },
            { label: "Proj+Intern", value: submissions.filter(s => s.serviceType === "project_internship").length, color: "text-orange-400" },
            { label: "Internship", value: submissions.filter(s => s.serviceType === "internship_only").length, color: "text-green-400" },
          ].map((stat, i) => (
            <div key={i} className="bg-card border border-white/10 rounded-2xl p-4 flex flex-col">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Button onClick={load} disabled={loading} variant="outline" size="sm" className="border-white/10 text-white hover:bg-white/5 gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button onClick={downloadCSV} size="sm" className="bg-green-600 hover:bg-green-700 gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        </div>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">{error}</div>}

      {submissions.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Mail className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>No enquiries yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
              className="bg-card border border-white/10 rounded-2xl p-5">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <span className="text-white font-bold text-lg">{s.name}</span>
                    <span className={`px-3 py-0.5 rounded-full text-xs font-bold border ${SERVICE_COLORS[s.serviceType] ?? "bg-white/5 text-white/60"}`}>
                      {SERVICE_LABELS[s.serviceType] ?? s.serviceType}
                    </span>
                    <span className="text-xs text-muted-foreground">#{s.id}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4 text-primary/60" />
                      <a href={`tel:${s.phone}`} className="hover:text-white">{s.phone}</a>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4 text-primary/60" />
                      <a href={`mailto:${s.email}`} className="hover:text-white truncate">{s.email}</a>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Building2 className="w-4 h-4 text-primary/60" />
                      <span className="truncate">{s.college}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Cpu className="w-4 h-4 text-primary/60" />
                      <span>{s.projectType}</span>
                    </div>
                  </div>
                  {s.message && (
                    <div className="mt-3 text-sm text-muted-foreground bg-white/5 rounded-xl px-4 py-3 border border-white/5">
                      <span className="text-white/40 text-xs uppercase tracking-wider mr-2">Note:</span>{s.message}
                    </div>
                  )}
                </div>
                <div className="text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(s.createdAt).toLocaleString("en-IN", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" })}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Course Form ────────────────────────────────────────────────────────────────

interface CourseFormData {
  title: string; domain: string; duration: string; fee: string;
  description: string; highlights: string;
  imageUrl: string; pdfUrl: string; isActive: boolean;
}

const EMPTY_COURSE: CourseFormData = {
  title: "", domain: "", duration: "", fee: "", description: "",
  highlights: "", imageUrl: "", pdfUrl: "", isActive: true,
};

function CourseFormModal({
  initial, password, onSave, onClose,
}: {
  initial?: Course; password: string;
  onSave: (c: Course) => void; onClose: () => void;
}) {
  const [form, setForm] = useState<CourseFormData>(
    initial ? {
      title: initial.title, domain: initial.domain, duration: initial.duration,
      fee: initial.fee, description: initial.description, highlights: initial.highlights,
      imageUrl: initial.imageUrl ?? "", pdfUrl: initial.pdfUrl ?? "", isActive: initial.isActive,
    } : EMPTY_COURSE
  );
  const [saving, setSaving] = useState(false);
  const [imgUploading, setImgUploading] = useState(false);
  const [pdfUploading, setPdfUploading] = useState(false);
  const [err, setErr] = useState("");

  const set = (k: keyof CourseFormData, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setErr("");
    try {
      const url = initial ? `/api/admin/courses/${initial.id}?password=${encodeURIComponent(password)}`
        : `/api/admin/courses?password=${encodeURIComponent(password)}`;
      const method = initial ? "PUT" : "POST";
      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, imageUrl: form.imageUrl || null, pdfUrl: form.pdfUrl || null }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      onSave(data.course);
    } catch { setErr("Failed to save course."); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-white/10 rounded-3xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-bold text-xl">{initial ? "Edit Course" : "Add New Course"}</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-muted-foreground hover:text-white">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Course Title *</label>
              <Input value={form.title} onChange={e => set("title", e.target.value)} required
                className="bg-background border-white/10 text-white" placeholder="e.g. IoT with Arduino" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Domain *</label>
              <Input value={form.domain} onChange={e => set("domain", e.target.value)} required
                className="bg-background border-white/10 text-white" placeholder="e.g. Embedded Systems" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Duration *</label>
              <Input value={form.duration} onChange={e => set("duration", e.target.value)} required
                className="bg-background border-white/10 text-white" placeholder="e.g. 30 Days" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Fee *</label>
              <Input value={form.fee} onChange={e => set("fee", e.target.value)} required
                className="bg-background border-white/10 text-white" placeholder="e.g. ₹8,000" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Description *</label>
            <Textarea value={form.description} onChange={e => set("description", e.target.value)} required
              className="bg-background border-white/10 text-white min-h-[80px]"
              placeholder="What will students learn? What projects are covered?" />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Highlights (one per line)</label>
            <Textarea value={form.highlights} onChange={e => set("highlights", e.target.value)}
              className="bg-background border-white/10 text-white min-h-[70px]"
              placeholder={"Hands-on labs\nCertificate included\nExpert trainer"} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Course Image</label>
              <FileUploadButton label="Upload Image" accept="image/*"
                currentUrl={form.imageUrl} onUploaded={url => set("imageUrl", url)}
                uploading={imgUploading} setUploading={setImgUploading} />
              {form.imageUrl && <img src={form.imageUrl} alt="" className="mt-2 h-20 rounded-lg object-cover border border-white/10" />}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Course Brochure (PDF)</label>
              <FileUploadButton label="Upload PDF" accept="application/pdf"
                currentUrl={form.pdfUrl} onUploaded={url => set("pdfUrl", url)}
                uploading={pdfUploading} setUploading={setPdfUploading} />
              {form.pdfUrl && (
                <a href={form.pdfUrl} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1 text-xs text-primary hover:underline mt-1">
                  <FileText className="w-3 h-3" /> View PDF
                </a>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button type="button" onClick={() => set("isActive", !form.isActive)}
              className={`w-10 h-6 rounded-full transition-colors ${form.isActive ? "bg-green-500" : "bg-white/20"} flex items-center`}>
              <span className={`w-4 h-4 rounded-full bg-white shadow transition-transform mx-1 ${form.isActive ? "translate-x-4" : ""}`} />
            </button>
            <span className="text-sm text-white/70">{form.isActive ? "Active (visible on site)" : "Draft (hidden from site)"}</span>
          </div>

          {err && <p className="text-red-400 text-sm">{err}</p>}

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={saving || imgUploading || pdfUploading}
              className="bg-primary hover:bg-primary/90 text-white flex-1">
              {saving ? "Saving…" : initial ? "Save Changes" : "Add Course"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}
              className="border-white/10 text-white hover:bg-white/5">Cancel</Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ── Courses Tab ────────────────────────────────────────────────────────────────

function CoursesTab({ password }: { password: string }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Course | undefined>();
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(`/api/admin/courses?password=${encodeURIComponent(password)}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCourses(data.courses ?? []);
      setLoaded(true);
    } catch { setError("Failed to load courses."); }
    setLoading(false);
  };

  const deleteCourse = async (id: number) => {
    if (!confirm("Delete this course?")) return;
    try {
      await fetch(`/api/admin/courses/${id}?password=${encodeURIComponent(password)}`, { method: "DELETE" });
      setCourses(c => c.filter(x => x.id !== id));
    } catch { setError("Failed to delete."); }
  };

  const toggleActive = async (course: Course) => {
    try {
      const res = await fetch(`/api/admin/courses/${course.id}?password=${encodeURIComponent(password)}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !course.isActive }),
      });
      const data = await res.json();
      setCourses(c => c.map(x => x.id === course.id ? data.course : x));
    } catch { setError("Failed to toggle."); }
  };

  const handleSaved = (course: Course) => {
    setCourses(c => editing ? c.map(x => x.id === course.id ? course : x) : [course, ...c]);
    setShowForm(false); setEditing(undefined);
  };

  if (!loaded) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <GraduationCap className="w-12 h-12 text-muted-foreground opacity-30" />
      <Button onClick={load} disabled={loading} className="bg-primary hover:bg-primary/90">
        {loading ? "Loading…" : "Load Courses"}
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      {(showForm || editing) && (
        <CourseFormModal password={password} initial={editing}
          onSave={handleSaved} onClose={() => { setShowForm(false); setEditing(undefined); }} />
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="text-white/60 text-sm">{courses.length} course{courses.length !== 1 ? "s" : ""}</div>
        <div className="flex gap-2">
          <Button onClick={load} disabled={loading} variant="outline" size="sm" className="border-white/10 text-white hover:bg-white/5 gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button onClick={() => { setEditing(undefined); setShowForm(true); }} size="sm" className="bg-primary hover:bg-primary/90 gap-2">
            <Plus className="w-4 h-4" /> Add Course
          </Button>
        </div>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">{error}</div>}

      {courses.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>No courses yet. Add your first course.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map(course => (
            <div key={course.id} className="bg-card border border-white/10 rounded-2xl overflow-hidden">
              {course.imageUrl && (
                <img src={course.imageUrl} alt={course.title} className="w-full h-40 object-cover" />
              )}
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="text-white font-bold">{course.title}</h3>
                    <p className="text-primary text-xs font-medium">{course.domain}</p>
                  </div>
                  <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold border ${course.isActive ? "border-green-500/40 text-green-400 bg-green-500/10" : "border-white/10 text-white/40 bg-white/5"}`}>
                    {course.isActive ? "Active" : "Draft"}
                  </span>
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground mb-3">
                  <span>⏱ {course.duration}</span>
                  <span>💰 {course.fee}</span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{course.description}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button size="sm" variant="outline" onClick={() => { setEditing(course); setShowForm(true); }}
                    className="border-white/10 text-white hover:bg-white/5 gap-1 text-xs">
                    <Pencil className="w-3 h-3" /> Edit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toggleActive(course)}
                    className="border-white/10 text-white/60 hover:bg-white/5 gap-1 text-xs">
                    {course.isActive ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    {course.isActive ? "Hide" : "Show"}
                  </Button>
                  {course.pdfUrl && (
                    <a href={course.pdfUrl} target="_blank" rel="noreferrer">
                      <Button size="sm" variant="outline" className="border-white/10 text-white/60 hover:bg-white/5 gap-1 text-xs">
                        <FileText className="w-3 h-3" /> PDF
                      </Button>
                    </a>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => deleteCourse(course.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-1 text-xs ml-auto">
                    <Trash2 className="w-3 h-3" /> Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Announcements Tab ─────────────────────────────────────────────────────────

function AnnouncementsTab({ password }: { password: string }) {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", imageUrl: "", isActive: true });
  const [saving, setSaving] = useState(false);
  const [imgUploading, setImgUploading] = useState(false);

  const load = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(`/api/admin/announcements?password=${encodeURIComponent(password)}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setItems(data.announcements ?? []);
      setLoaded(true);
    } catch { setError("Failed to load announcements."); }
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      const res = await fetch(`/api/admin/announcements?password=${encodeURIComponent(password)}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, imageUrl: form.imageUrl || null }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setItems(a => [data.announcement, ...a]);
      setForm({ title: "", body: "", imageUrl: "", isActive: true });
      setShowAdd(false);
    } catch { setError("Failed to add announcement."); }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this announcement?")) return;
    try {
      await fetch(`/api/admin/announcements/${id}?password=${encodeURIComponent(password)}`, { method: "DELETE" });
      setItems(a => a.filter(x => x.id !== id));
    } catch { setError("Failed to delete."); }
  };

  const handleToggle = async (item: Announcement) => {
    try {
      const res = await fetch(`/api/admin/announcements/${item.id}/toggle?password=${encodeURIComponent(password)}`, { method: "PATCH" });
      const data = await res.json();
      setItems(a => a.map(x => x.id === item.id ? data.announcement : x));
    } catch { setError("Failed to toggle."); }
  };

  if (!loaded) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <Megaphone className="w-12 h-12 text-muted-foreground opacity-30" />
      <Button onClick={load} disabled={loading} className="bg-primary hover:bg-primary/90">
        {loading ? "Loading…" : "Load Announcements"}
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="text-white/60 text-sm">{items.length} announcement{items.length !== 1 ? "s" : ""}</div>
        <div className="flex gap-2">
          <Button onClick={load} disabled={loading} variant="outline" size="sm" className="border-white/10 text-white hover:bg-white/5 gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button onClick={() => setShowAdd(v => !v)} size="sm" className="bg-primary hover:bg-primary/90 gap-2">
            {showAdd ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showAdd ? "Cancel" : "New Announcement"}
          </Button>
        </div>
      </div>

      {showAdd && (
        <motion.form onSubmit={handleAdd} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-primary/20 rounded-2xl p-5 space-y-4">
          <h3 className="text-white font-bold">New Announcement</h3>
          <div className="space-y-1">
            <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Title *</label>
            <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required
              className="bg-background border-white/10 text-white" placeholder="e.g. New IoT Batch Starting!" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Message *</label>
            <Textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} required
              className="bg-background border-white/10 text-white min-h-[80px]"
              placeholder="Full announcement text..." />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Image (optional)</label>
            <FileUploadButton label="Upload Image" accept="image/*"
              currentUrl={form.imageUrl} onUploaded={url => setForm(f => ({ ...f, imageUrl: url }))}
              uploading={imgUploading} setUploading={setImgUploading} />
            {form.imageUrl && <img src={form.imageUrl} alt="" className="mt-2 h-24 rounded-lg object-cover border border-white/10" />}
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
              className={`w-10 h-6 rounded-full transition-colors ${form.isActive ? "bg-green-500" : "bg-white/20"} flex items-center`}>
              <span className={`w-4 h-4 rounded-full bg-white shadow transition-transform mx-1 ${form.isActive ? "translate-x-4" : ""}`} />
            </button>
            <span className="text-sm text-white/70">{form.isActive ? "Publish immediately" : "Save as draft"}</span>
          </div>
          <Button type="submit" disabled={saving || imgUploading} className="bg-primary hover:bg-primary/90">
            {saving ? "Posting…" : "Post Announcement"}
          </Button>
        </motion.form>
      )}

      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">{error}</div>}

      {items.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Megaphone className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>No announcements yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="bg-card border border-white/10 rounded-2xl overflow-hidden">
              {item.imageUrl && <img src={item.imageUrl} alt={item.title} className="w-full h-36 object-cover" />}
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-white font-bold">{item.title}</h3>
                  <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold border ${item.isActive ? "border-green-500/40 text-green-400 bg-green-500/10" : "border-white/10 text-white/40 bg-white/5"}`}>
                    {item.isActive ? "Live" : "Draft"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{item.body}</p>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleToggle(item)}
                    className="border-white/10 text-white/60 hover:bg-white/5 gap-1 text-xs">
                    {item.isActive ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    {item.isActive ? "Unpublish" : "Publish"}
                  </Button>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {new Date(item.createdAt).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })}
                  </span>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(item.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-1 text-xs">
                    <Trash2 className="w-3 h-3" /> Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Gallery Tab ────────────────────────────────────────────────────────────────

function GalleryTab({ password }: { password: string }) {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "projects" | "events">("all");
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: "", category: "projects", imageUrl: "" });
  const [imgUploading, setImgUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const load = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(`/api/admin/gallery?password=${encodeURIComponent(password)}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setItems(data.gallery ?? []);
      setLoaded(true);
    } catch { setError("Failed to load gallery."); }
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.imageUrl) { setError("Please upload an image first."); return; }
    setSaving(true); setError("");
    try {
      const res = await fetch(`/api/admin/gallery?password=${encodeURIComponent(password)}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setItems(a => [data.item, ...a]);
      setForm({ title: "", category: "projects", imageUrl: "" });
      setShowAdd(false);
    } catch { setError("Failed to add photo."); }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this photo?")) return;
    try {
      await fetch(`/api/admin/gallery/${id}?password=${encodeURIComponent(password)}`, { method: "DELETE" });
      setItems(a => a.filter(x => x.id !== id));
    } catch { setError("Failed to delete."); }
  };

  const filtered = filter === "all" ? items : items.filter(x => x.category === filter);

  if (!loaded) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <Image className="w-12 h-12 text-muted-foreground opacity-30" />
      <Button onClick={load} disabled={loading} className="bg-primary hover:bg-primary/90">
        {loading ? "Loading…" : "Load Gallery"}
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2">
          {(["all","projects","events"] as const).map(cat => (
            <button key={cat} onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filter === cat ? "bg-primary text-white" : "bg-white/5 text-white/60 hover:bg-white/10"}`}>
              {cat === "all" ? "All" : cat === "projects" ? "🔧 Projects" : "🎉 Events"}
            </button>
          ))}
          <span className="text-white/40 text-xs self-center ml-2">{filtered.length} photo{filtered.length !== 1 ? "s" : ""}</span>
        </div>
        <div className="flex gap-2">
          <Button onClick={load} disabled={loading} variant="outline" size="sm" className="border-white/10 text-white hover:bg-white/5 gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button onClick={() => setShowAdd(v => !v)} size="sm" className="bg-primary hover:bg-primary/90 gap-2">
            {showAdd ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showAdd ? "Cancel" : "Add Photo"}
          </Button>
        </div>
      </div>

      {showAdd && (
        <motion.form onSubmit={handleAdd} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-primary/20 rounded-2xl p-5 space-y-4">
          <h3 className="text-white font-bold">Add Photo</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Title *</label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required
                className="bg-background border-white/10 text-white" placeholder="e.g. IoT Workshop 2024" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Category *</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full h-10 rounded-md bg-background border border-white/10 text-white px-3 text-sm">
                <option value="projects">🔧 Projects</option>
                <option value="events">🎉 Events</option>
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Photo *</label>
            <FileUploadButton label="Upload Photo" accept="image/*"
              currentUrl={form.imageUrl} onUploaded={url => setForm(f => ({ ...f, imageUrl: url }))}
              uploading={imgUploading} setUploading={setImgUploading} />
            {form.imageUrl && <img src={form.imageUrl} alt="" className="mt-2 h-32 rounded-lg object-cover border border-white/10" />}
          </div>
          <Button type="submit" disabled={saving || imgUploading || !form.imageUrl}
            className="bg-primary hover:bg-primary/90">
            {saving ? "Adding…" : "Add to Gallery"}
          </Button>
        </motion.form>
      )}

      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">{error}</div>}

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Image className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>No photos {filter !== "all" ? `in "${filter}"` : "yet"}. Upload the first one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map(item => (
            <div key={item.id} className="group relative bg-card border border-white/10 rounded-2xl overflow-hidden">
              <img src={item.imageUrl} alt={item.title} className="w-full aspect-square object-cover" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                <p className="text-white text-xs font-medium mb-1 truncate">{item.title}</p>
                <div className="flex items-center gap-1">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${item.category === "projects" ? "bg-blue-500/60 text-blue-200" : "bg-orange-500/60 text-orange-200"}`}>
                    {item.category}
                  </span>
                  <button onClick={() => handleDelete(item.id)}
                    className="ml-auto w-6 h-6 rounded bg-red-500/80 hover:bg-red-500 flex items-center justify-center">
                    <Trash2 className="w-3 h-3 text-white" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Admin Component ───────────────────────────────────────────────────────

export default function Admin() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [activeTab, setActiveTab] = useState("enquiries");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true); setAuthError("");
    try {
      const res = await fetch(`/api/admin/submissions?password=${encodeURIComponent(password)}`);
      if (res.status === 401) { setAuthError("Wrong password. Please try again."); }
      else if (res.ok) { setAuthed(true); }
      else { setAuthError("Server error. Try again."); }
    } catch { setAuthError("Could not reach server."); }
    setVerifying(false);
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-card border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
            <p className="text-muted-foreground text-sm mt-1">AEIPL — Full Control Dashboard</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Admin Password</label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="bg-background border-white/10 focus-visible:ring-primary h-12 rounded-xl text-white" required />
            </div>
            {authError && <p className="text-red-400 text-sm">{authError}</p>}
            <Button type="submit" disabled={verifying} className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl">
              {verifying ? "Verifying…" : "Login"}
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
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-white font-bold text-sm hidden sm:block">AEIPL Admin Panel</span>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1">
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${activeTab === tab.id ? "bg-primary/20 text-primary border border-primary/30" : "text-muted-foreground hover:text-white hover:bg-white/5"}`}>
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          <Button onClick={() => { setAuthed(false); setPassword(""); }} variant="ghost" size="sm"
            className="text-muted-foreground hover:text-white gap-2">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "enquiries" && <EnquiriesTab password={password} />}
        {activeTab === "courses" && <CoursesTab password={password} />}
        {activeTab === "announcements" && <AnnouncementsTab password={password} />}
        {activeTab === "gallery" && <GalleryTab password={password} />}
      </div>
    </div>
  );
}
