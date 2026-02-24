"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signOut } from "next-auth/react";
import {
  User,
  SlidersHorizontal,
  Download,
  UserPlus,
  KeyRound,
  Trash2,
  Sun,
  Moon,
  Timer,
  Zap,
  LogOut,
  ChevronDown,
  Camera,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/shared/ThemeProvider";
import { useSettingsStore } from "@/store/settings";
import { updateProfileSchema, type UpdateProfileInput } from "@/lib/validations/profile";
import InviteGenerator from "@/components/profile/InviteGenerator";
import ExportCard from "@/components/data/ExportCard";
import DateRangeFilter from "@/components/data/DateRangeFilter";
import ImportDropzone from "@/components/data/ImportDropzone";
import ImportSummaryModal from "@/components/data/ImportSummaryModal";

interface ImportSummary {
  imported: { sessions: number; exercises: number; templates: number; scheduled: number };
  skipped: number;
  errors: string[];
}

interface SettingsClientProps {
  user: {
    id: string;
    name?: string | null;
    displayName?: string | null;
    email: string;
    emailVerified?: Date | null;
    image?: string | null;
    unitPreference: string;
    inviteCode: string;
    createdAt: Date;
    lastLoginAt?: Date | null;
  };
  appUrl: string;
}

// ── Reusable primitives ───────────────────────────────────────────────────────

function Section({
  icon: Icon,
  title,
  titleClassName,
  children,
}: {
  icon: React.ElementType;
  title: string;
  titleClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="group relative overflow-hidden rounded-[1.5rem] md:rounded-[2.5rem] border border-border bg-card/40 backdrop-blur-md shadow-xl transition-all duration-300 hover:border-primary/30">
      {/* Decorative background gradient */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
      
      <div className="flex items-center gap-2 md:gap-3 px-5 md:px-8 py-4 md:py-5 border-b border-border/50 bg-secondary/10">
        <div className="h-7 w-7 md:h-8 md:w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          <Icon className="h-4 w-4 md:h-[18px] md:w-[18px]" strokeWidth={2.5} />
        </div>
        <p className={cn("text-[10px] md:text-xs font-black uppercase tracking-[0.2em]", titleClassName ?? "text-muted-foreground")}>{title}</p>
      </div>
      <div className="px-5 md:px-8 py-5 md:py-6">{children}</div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-12 md:h-7 md:w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background shadow-inner",
        checked ? "bg-primary" : "bg-secondary/50"
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-5 w-5 md:h-6 md:w-6 transform rounded-full bg-white shadow-xl ring-0 transition-transform duration-300 ease-in-out",
          checked ? "translate-x-6 md:translate-x-7" : "translate-x-0"
        )}
      />
    </button>
  );
}

function RowItem({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 md:gap-6 py-4 md:py-5 first:pt-0 last:pb-0 border-b border-border/30 last:border-0 group/row">
      <div className="min-w-0">
        <p className="text-sm md:text-base font-bold text-foreground group-hover/row:text-primary transition-colors">{label}</p>
        {description && <p className="text-[10px] md:text-xs font-medium text-muted-foreground mt-0.5 md:mt-1 opacity-70 italic">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

// ── Profile Section ───────────────────────────────────────────────────────────

function ProfileSection({ user }: { user: SettingsClientProps["user"] }) {
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user.image ?? null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user.name ?? "",
      displayName: user.displayName ?? "",
      unitPreference: (user.unitPreference as "kg" | "lb") ?? "kg",
    },
  });

  const onSubmit = async (data: UpdateProfileInput) => {
    setServerMessage(null);
    setServerError(null);
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      setServerError(json.error?.message ?? "Failed to update profile.");
      return;
    }
    setServerMessage("Profile updated successfully! ✨");
    setTimeout(() => setServerMessage(null), 3000);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarError(null);
    // Local preview
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    // Upload
    setAvatarUploading(true);
    const form = new FormData();
    form.append("avatar", file);
    const res = await fetch("/api/profile/avatar", { method: "POST", body: form });
    const json = await res.json();
    setAvatarUploading(false);
    if (!res.ok || !json.success) {
      setAvatarError(json.error?.message ?? "Failed to upload image.");
      setAvatarPreview(null);
      return;
    }
    setAvatarUrl(json.data.image);
  };

  return (
    <Section icon={User} title="Profile Details">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {serverMessage && (
          <div className="rounded-2xl bg-green-500/10 border border-green-500/20 px-4 py-3 text-sm font-bold text-green-500 animate-in fade-in zoom-in duration-300">
            {serverMessage}
          </div>
        )}
        {serverError && (
          <div className="rounded-2xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm font-bold text-destructive animate-in fade-in zoom-in duration-300">
            {serverError}
          </div>
        )}

        {/* Avatar upload */}
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            {(avatarPreview ?? avatarUrl) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarPreview ?? avatarUrl ?? ""}
                alt="Profile picture"
                className="h-20 w-20 rounded-full object-cover border-2 border-border shadow-md"
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-primary/10 border-2 border-border flex items-center justify-center text-2xl font-black text-primary select-none shadow-md">
                {(user.displayName ?? user.name ?? user.email).charAt(0).toUpperCase()}
              </div>
            )}
            {avatarUploading && (
              <div className="absolute inset-0 rounded-full bg-background/60 flex items-center justify-center">
                <div className="h-5 w-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Profile Picture</label>
            <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-secondary/50 border border-border px-4 py-2 text-xs font-bold text-foreground hover:bg-secondary hover:border-primary/40 transition-all">
              <Camera size={14} />
              {avatarUploading ? "Uploading…" : "Change Photo"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                onChange={handleAvatarChange}
                disabled={avatarUploading}
              />
            </label>
            {avatarError && <p className="text-xs font-bold text-destructive px-1">{avatarError}</p>}
            <p className="text-[10px] text-muted-foreground px-1">JPEG, PNG, WebP or GIF · Max 10 MB</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-2">Full Name</label>
            <input
              {...register("name")}
              type="text"
              className="w-full h-12 rounded-2xl border border-border bg-background/50 backdrop-blur-md px-4 py-2 text-base font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
            />
            {errors.name && <p className="mt-1 text-xs font-bold text-destructive px-2">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-2">Display Name</label>
            <input
              {...register("displayName")}
              type="text"
              placeholder="Username"
              className="w-full h-12 rounded-2xl border border-border bg-background/50 backdrop-blur-md px-4 py-2 text-base font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
            />
            {errors.displayName && (
              <p className="mt-1 text-xs font-bold text-destructive px-2">{errors.displayName.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-2">Registered Email</label>
          <div className="relative group">
            <input
              value={user.email}
              readOnly
              className="w-full h-12 rounded-2xl border border-border bg-secondary/30 px-4 py-2 text-base font-medium text-muted-foreground cursor-not-allowed"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-secondary/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Zap size={12} className="text-muted-foreground/30" />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 border-t border-border/30">
          <div className="flex items-center gap-3 px-1 md:px-2 w-full md:w-auto">
            <div className="h-7 w-7 md:h-8 md:w-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
              <Timer size={14} className="text-muted-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Member Since</span>
              <span className="text-xs md:text-sm font-bold text-foreground tracking-tight">
                {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </span>
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className="w-full md:w-auto h-12 rounded-2xl bg-primary px-8 py-2 text-xs md:text-sm font-black uppercase tracking-widest text-primary-foreground hover:bg-primary/90 hover:scale-[1.05] active:scale-[0.95] disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed transition-all shadow-xl shadow-primary/20"
          >
            {isSubmitting ? "Syncing..." : "Update Profile"}
          </button>
        </div>
      </form>
    </Section>
  );
}

// ── Preferences Section ───────────────────────────────────────────────────────

function PreferencesSection({ unitPreference }: { unitPreference: string }) {
  const { theme, setTheme } = useTheme();
  const { defaultRestSeconds, autoStartTimer, setDefaultRestSeconds, setAutoStartTimer } =
    useSettingsStore();
  const [unit, setUnit] = useState<"kg" | "lb">(
    unitPreference === "lb" ? "lb" : "kg"
  );
  const [unitSaving, setUnitSaving] = useState(false);
  const [unitMsg, setUnitMsg] = useState<string | null>(null);

  const saveUnit = async (u: "kg" | "lb") => {
    setUnit(u);
    setUnitSaving(true);
    setUnitMsg(null);
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ unitPreference: u }),
    });
    setUnitSaving(false);
    setUnitMsg(res.ok ? "Unit Saved" : "Error");
    setTimeout(() => setUnitMsg(null), 2000);
  };

  return (
    <Section icon={SlidersHorizontal} title="App Preferences">
      <RowItem label="Weight System" description="Primary unit for all your lifts">
        <div className="flex items-center gap-4">
          {unitMsg && (
            <span className="text-[10px] font-black uppercase text-primary animate-in fade-in slide-in-from-right-2 duration-300">
              {unitSaving ? "Saving..." : unitMsg}
            </span>
          )}
          <div className="flex p-1 rounded-2xl bg-secondary/30 backdrop-blur-md border border-border/50">
            {(["kg", "lb"] as const).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => saveUnit(u)}
                className={cn(
                  "px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300",
                  unit === u
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
      </RowItem>

      <RowItem label="Auto Rest Timer" description="Seconds between your workout sets">
        <div className="relative group">
          <input
            type="number"
            min={10}
            max={600}
            value={defaultRestSeconds}
            onChange={(e) => setDefaultRestSeconds(Number(e.target.value))}
            className="w-24 h-12 rounded-2xl border border-border bg-background/50 px-4 py-2 text-center text-lg font-black tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
          />
          <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase text-muted-foreground/40">Secs</span>
        </div>
      </RowItem>

      <RowItem label="Quick Log" description="Start rest timer automatically after a set">
        <Toggle checked={autoStartTimer} onChange={setAutoStartTimer} />
      </RowItem>

      <RowItem label="Visual Appearance" description="Select your preferred UI style">
        <div className="flex p-1 rounded-2xl bg-secondary/30 backdrop-blur-md border border-border/50">
          <button
            type="button"
            onClick={() => setTheme("dark")}
            className={cn(
              "flex items-center gap-2 px-5 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300",
              theme === "dark"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Moon size={14} strokeWidth={3} />
            Dark
          </button>
          <button
            type="button"
            onClick={() => setTheme("light")}
            className={cn(
              "flex items-center gap-2 px-5 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300",
              theme === "light"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Sun size={14} strokeWidth={3} />
            Light
          </button>
        </div>
      </RowItem>
    </Section>
  );
}

// ── Data Section ──────────────────────────────────────────────────────────────

function DataSection() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);
  const [showImport, setShowImport] = useState(false);

  const csvHref =
    `/api/export/csv` +
    (fromDate || toDate
      ? `?${new URLSearchParams({
          ...(fromDate && { from: fromDate }),
          ...(toDate && { to: toDate }),
        }).toString()}`
      : "");

  return (
    <Section icon={Download} title="Data Management" titleClassName="text-foreground">
      <div className="space-y-8">
        <div className="space-y-4">
          <ExportCard
            title="Export Spreadsheet (CSV)"
            description="Download your full training history for custom analysis."
            href={csvHref}
          />
          <div className="px-4">
            <DateRangeFilter
              from={fromDate}
              to={toDate}
              onFromChange={setFromDate}
              onToChange={setToDate}
            />
          </div>
        </div>

        <div className="h-px bg-border/30 mx-4" />

        <ExportCard
          title="Secure JSON Backup"
          description="Complete system-compatible backup of all your records."
          href="/api/export/json"
        />

        <div className="h-px bg-border/30 mx-4" />

        <div className="px-4">
          <button
            type="button"
            onClick={() => setShowImport((v) => !v)}
            className="flex items-center justify-between w-full group/btn"
          >
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground group-hover/btn:text-primary transition-all">
                <Download size={18} className={cn("transition-transform duration-300", showImport && "rotate-180")} />
              </div>
              <div className="text-left">
                <p className="text-base font-bold text-foreground">Import & Restore</p>
                <p className="text-xs font-medium text-muted-foreground opacity-70 italic">Upload a previous JSON backup</p>
              </div>
            </div>
            <ChevronDown
              size={18}
              className={cn("text-muted-foreground transition-transform duration-300", showImport && "rotate-180")}
            />
          </button>
          
          {showImport && (
            <div className="mt-6 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="rounded-[1.5rem] bg-amber-500/10 border border-amber-500/20 p-5 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-2">
                  <Zap size={16} className="text-amber-500" />
                  <p className="text-xs font-black uppercase tracking-widest text-amber-500">Safe Merge Mode</p>
                </div>
                <p className="text-sm font-medium text-amber-500/80 italic leading-relaxed">
                  Existing records will not be deleted. Any duplicate entries in the backup file will be automatically skipped.
                </p>
              </div>
              <div className="rounded-[2rem] border-2 border-dashed border-border bg-secondary/10 p-2 overflow-hidden">
                <ImportDropzone onComplete={setImportSummary} />
              </div>
            </div>
          )}
        </div>
      </div>

      {importSummary && (
        <ImportSummaryModal summary={importSummary} onClose={() => setImportSummary(null)} />
      )}
    </Section>
  );
}

// ── Invite Friends Section ────────────────────────────────────────────────────

function InviteSection({
  personalInviteCode,
  appUrl,
}: {
  personalInviteCode: string;
  appUrl: string;
}) {
  return (
    <Section icon={UserPlus} title="Growth & Friends">
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground px-2 mb-4 italic">
          Invite your training partners to share routines and stay motivated together.
        </p>
        <div className="rounded-[2rem] bg-primary/5 border border-primary/10 p-2 overflow-hidden">
          <InviteGenerator personalInviteCode={personalInviteCode} appUrl={appUrl} />
        </div>
      </div>
    </Section>
  );
}

// ── Account Section ───────────────────────────────────────────────────────────

function ChangePasswordForm() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (next !== confirm) {
      setMsg({ type: "error", text: "New passwords do not match." });
      return;
    }
    setSaving(true);
    setMsg(null);
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: current, newPassword: next }),
    });
    const json = await res.json();
    setSaving(false);
    if (!res.ok || !json.success) {
      setMsg({ type: "error", text: json.error?.message ?? "Failed to update password." });
    } else {
      setMsg({ type: "success", text: "Security update successful! ✨" });
      setCurrent("");
      setNext("");
      setConfirm("");
      setTimeout(() => setOpen(false), 2000);
    }
  };

  return (
    <div className="py-2 border-b border-border/30">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full p-4 rounded-2xl hover:bg-secondary/20 transition-all group/acc"
      >
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground group-hover/acc:text-primary transition-all">
            <KeyRound size={18} />
          </div>
          <div className="text-left">
            <p className="text-base font-bold text-foreground">Change Security Code</p>
            <p className="text-xs font-medium text-muted-foreground opacity-70 italic">Update your account password</p>
          </div>
        </div>
        <ChevronDown
          size={18}
          className={cn(
            "text-muted-foreground transition-transform duration-300",
            open && "rotate-180"
          )}
        />
      </button>
      {open && (
        <form onSubmit={handleSubmit} className="mt-4 px-4 pb-4 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
          {msg && (
            <div
              className={cn(
                "rounded-2xl px-5 py-3 text-sm font-bold border",
                msg.type === "success"
                  ? "bg-green-500/10 border-green-500/20 text-green-500"
                  : "bg-destructive/10 border-destructive/20 text-destructive"
              )}
            >
              {msg.text}
            </div>
          )}
          <div className="space-y-3">
            <input
              type="password"
              placeholder="Current security code"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              required
              className="w-full h-12 rounded-2xl border border-border bg-background/50 backdrop-blur-md px-6 py-2 text-base font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="password"
                placeholder="New code"
                value={next}
                onChange={(e) => setNext(e.target.value)}
                required
                minLength={8}
                className="w-full h-12 rounded-2xl border border-border bg-background/50 backdrop-blur-md px-6 py-2 text-base font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
              />
              <input
                type="password"
                placeholder="Confirm code"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                className="w-full h-12 rounded-2xl border border-border bg-background/50 backdrop-blur-md px-6 py-2 text-base font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
              />
            </div>
          </div>
          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-6 h-10 text-xs font-bold uppercase tracking-widest rounded-xl border border-border text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-8 h-10 text-xs font-black uppercase tracking-widest rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.05] active:scale-[0.95] shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
            >
              {saving ? "Updating..." : "Update Security"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function DeleteAccountDialog() {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleting(true);
    setError(null);
    const res = await fetch("/api/account/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      setDeleting(false);
      setError(json.error?.message ?? "Failed to delete account.");
      return;
    }
    // Sign out after deletion
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <div className="p-4">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-3 text-sm font-black uppercase tracking-widest text-destructive hover:text-destructive/80 transition-all active:scale-[0.98]"
      >
        <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center">
          <Trash2 size={18} />
        </div>
        Permanently Delete Account
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-md rounded-[2.5rem] bg-card border border-border shadow-[0_0_50px_rgba(0,0,0,0.3)] p-10 animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center space-y-4 mb-8">
              <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-2">
                <Trash2 size={40} />
              </div>
              <h3 className="text-3xl font-black text-foreground tracking-tight">Danger Zone</h3>
              <p className="text-base font-medium text-muted-foreground italic leading-relaxed">
                This will permanently remove your entire training history, custom exercises, and account settings. This action is irreversible.
              </p>
            </div>
            
            <form onSubmit={handleDelete} className="space-y-6">
              {error && (
                <div className="rounded-2xl bg-destructive/10 border border-destructive/20 px-5 py-3 text-sm font-bold text-destructive">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-4">Confirm Security Code</label>
                <input
                  type="password"
                  placeholder="Enter password to confirm deletion"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full h-14 rounded-2xl border border-border bg-background/50 px-6 py-2 text-base font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-destructive/40 transition-all"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setError(null);
                    setPassword("");
                  }}
                  className="flex-1 h-12 rounded-xl border border-border bg-background px-6 text-sm font-bold text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
                >
                  Keep Account
                </button>
                <button
                  type="submit"
                  disabled={deleting}
                  className="flex-1 h-12 rounded-xl bg-destructive text-destructive-foreground text-sm font-black uppercase tracking-widest hover:bg-destructive/90 hover:scale-[1.05] active:scale-[0.95] transition-all shadow-xl shadow-destructive/20 disabled:opacity-50"
                >
                  {deleting ? "Purging..." : "Delete All"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function AccountSection() {
  return (
    <Section icon={KeyRound} title="Security & Account">
      <div className="space-y-2">
        <ChangePasswordForm />
        <DeleteAccountDialog />
      </div>
    </Section>
  );
}

// ── Sign Out ──────────────────────────────────────────────────────────────────

function SignOutSection() {
  return (
    <div className="flex justify-center pt-2 md:pt-4">
      <button
        type="button"
        onClick={async () => {
          try {
            await signOut({ callbackUrl: "/login" });
          } catch {
            window.location.href = "/login";
          }
        }}
        className="group flex items-center justify-center gap-3 w-full md:w-auto px-6 md:px-8 py-3 md:py-4 rounded-2xl md:rounded-[2rem] bg-secondary/30 border border-border hover:bg-destructive/10 hover:border-destructive/20 hover:text-destructive transition-all duration-300"
      >
        <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-secondary flex items-center justify-center group-hover:bg-destructive/20 transition-colors">
          <LogOut className="h-3.5 w-3.5 md:h-4 md:w-4" />
        </div>
        <span className="text-xs md:text-base font-black uppercase tracking-widest">Sign out of session</span>
      </button>
    </div>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────

export default function SettingsClient({ user, appUrl }: SettingsClientProps) {
  return (
    <div className="flex flex-col gap-6 md:gap-10 p-4 md:p-12 max-w-4xl w-full pb-32 md:pb-12 mx-auto animate-in fade-in duration-700">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1 md:px-2">
        <div className="space-y-2">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="h-12 w-12 md:h-16 md:w-16 rounded-2xl md:rounded-[2rem] bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-2xl shadow-primary/30">
              <User className="h-6 w-6 md:h-8 md:w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-foreground">App Settings</h1>
              <p className="text-sm md:text-lg font-medium opacity-70">
                {user.displayName ?? user.name ?? user.email}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-8">
        <ProfileSection user={user} />
        <PreferencesSection unitPreference={user.unitPreference} />
        <DataSection />
        <InviteSection personalInviteCode={user.inviteCode} appUrl={appUrl} />
        <AccountSection />
        <SignOutSection />
      </div>
    </div>
  );
}
