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
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-card border border-border overflow-hidden">
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border/60 bg-muted/30">
        <Icon size={15} className="text-primary" />
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{title}</p>
      </div>
      <div className="p-4">{children}</div>
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
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        checked ? "bg-primary" : "bg-muted"
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition-transform duration-200",
          checked ? "translate-x-5" : "translate-x-0"
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
    <div className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0 border-b border-border/40 last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

// ── Profile Section ───────────────────────────────────────────────────────────

function ProfileSection({ user }: { user: SettingsClientProps["user"] }) {
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

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
    setServerMessage("Profile saved!");
  };

  return (
    <Section icon={User} title="Profile">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {serverMessage && (
          <div className="rounded-lg bg-green-500/10 border border-green-500/20 px-3 py-2 text-sm text-green-400">
            {serverMessage}
          </div>
        )}
        {serverError && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
            {serverError}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Full Name</label>
            <input
              {...register("name")}
              type="text"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Display Name</label>
            <input
              {...register("displayName")}
              type="text"
              placeholder="How others see you"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.displayName && (
              <p className="mt-1 text-xs text-destructive">{errors.displayName.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email</label>
          <input
            value={user.email}
            readOnly
            className="w-full rounded-lg border border-input bg-muted/40 px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">Member since</span>
            <span className="text-xs font-medium text-foreground">
              {new Date(user.createdAt).toLocaleDateString()}
            </span>
          </div>
          <button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? "Saving…" : "Save changes"}
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
    setUnitMsg(res.ok ? "Saved" : "Failed");
    setTimeout(() => setUnitMsg(null), 2000);
  };

  return (
    <Section icon={SlidersHorizontal} title="Preferences">
      <RowItem label="Weight Unit" description="Used across workouts and records">
        <div className="flex items-center gap-1">
          {unitMsg && (
            <span className="text-xs text-muted-foreground mr-2">{unitSaving ? "…" : unitMsg}</span>
          )}
          <div className="flex rounded-lg border border-border overflow-hidden">
            {(["kg", "lb"] as const).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => saveUnit(u)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium transition-colors",
                  unit === u
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:text-foreground"
                )}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
      </RowItem>

      <RowItem label="Default Rest Timer" description="Seconds between sets">
        <input
          type="number"
          min={10}
          max={600}
          value={defaultRestSeconds}
          onChange={(e) => setDefaultRestSeconds(Number(e.target.value))}
          className="w-20 rounded-lg border border-input bg-background px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </RowItem>

      <RowItem label="Auto-start Timer" description="Start rest timer automatically after logging a set">
        <Toggle checked={autoStartTimer} onChange={setAutoStartTimer} />
      </RowItem>

      <RowItem label="Theme" description="Choose your preferred appearance">
        <div className="flex rounded-lg border border-border overflow-hidden">
          <button
            type="button"
            onClick={() => setTheme("dark")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors",
              theme === "dark"
                ? "bg-primary text-primary-foreground"
                : "bg-background text-muted-foreground hover:text-foreground"
            )}
          >
            <Moon size={12} />
            Dark
          </button>
          <button
            type="button"
            onClick={() => setTheme("light")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors",
              theme === "light"
                ? "bg-primary text-primary-foreground"
                : "bg-background text-muted-foreground hover:text-foreground"
            )}
          >
            <Sun size={12} />
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
    <Section icon={Download} title="Data & Export">
      <div className="space-y-4">
        <div className="space-y-2">
          <ExportCard
            title="Export as CSV"
            description="Download your full session history as a spreadsheet."
            href={csvHref}
          />
          <DateRangeFilter
            from={fromDate}
            to={toDate}
            onFromChange={setFromDate}
            onToChange={setToDate}
          />
        </div>

        <div className="h-px bg-border/60" />

        <ExportCard
          title="Download Full Backup (JSON)"
          description="Complete backup of sessions, exercises, templates, and scheduled workouts."
          href="/api/export/json"
        />

        <div className="h-px bg-border/60" />

        <div>
          <button
            type="button"
            onClick={() => setShowImport((v) => !v)}
            className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            <ChevronDown
              size={14}
              className={cn("transition-transform duration-200", showImport && "rotate-180")}
            />
            Import / Restore
          </button>
          {showImport && (
            <div className="mt-3 space-y-3">
              <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-400">
                <strong>Merge mode:</strong> Existing data won&apos;t be deleted. Duplicates are skipped.
              </div>
              <ImportDropzone onComplete={setImportSummary} />
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
    <Section icon={UserPlus} title="Invite Friends">
      <InviteGenerator personalInviteCode={personalInviteCode} appUrl={appUrl} />
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
      setMsg({ type: "success", text: "Password updated successfully!" });
      setCurrent("");
      setNext("");
      setConfirm("");
      setTimeout(() => setOpen(false), 1500);
    }
  };

  return (
    <div className="py-3 border-b border-border/40">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full text-left"
      >
        <div className="flex items-center gap-2">
          <KeyRound size={15} className="text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Change Password</span>
        </div>
        <ChevronDown
          size={14}
          className={cn(
            "text-muted-foreground transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      {open && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          {msg && (
            <div
              className={cn(
                "rounded-lg px-3 py-2 text-xs border",
                msg.type === "success"
                  ? "bg-green-500/10 border-green-500/20 text-green-400"
                  : "bg-destructive/10 border-destructive/20 text-destructive"
              )}
            >
              {msg.text}
            </div>
          )}
          <input
            type="password"
            placeholder="Current password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            required
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            type="password"
            placeholder="New password (min 8 chars)"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            required
            minLength={8}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-3 py-1.5 text-xs rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-3 py-1.5 text-xs rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving…" : "Update Password"}
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
    <div className="pt-3">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-sm font-medium text-destructive hover:text-destructive/80 transition-colors"
      >
        <Trash2 size={15} />
        Delete Account
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl bg-card border border-border p-6 shadow-2xl">
            <h3 className="text-base font-semibold text-foreground mb-1">Delete Account</h3>
            <p className="text-sm text-muted-foreground mb-4">
              This will permanently delete your account and all your data. This cannot be undone.
            </p>
            <form onSubmit={handleDelete} className="space-y-3">
              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-xs text-destructive">
                  {error}
                </div>
              )}
              <input
                type="password"
                placeholder="Enter your password to confirm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setError(null);
                    setPassword("");
                  }}
                  className="px-3 py-1.5 text-xs rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleting}
                  className="px-3 py-1.5 text-xs rounded-lg bg-destructive text-destructive-foreground font-medium hover:bg-destructive/90 disabled:opacity-50 transition-colors"
                >
                  {deleting ? "Deleting…" : "Yes, delete my account"}
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
    <Section icon={KeyRound} title="Account">
      <ChangePasswordForm />
      <DeleteAccountDialog />
    </Section>
  );
}

// ── Sign Out ──────────────────────────────────────────────────────────────────

function SignOutSection() {
  return (
    <div className="rounded-xl bg-card border border-border p-4">
      <button
        type="button"
        onClick={async () => {
          try {
            await signOut({ callbackUrl: "/login" });
          } catch {
            window.location.href = "/login";
          }
        }}
        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <LogOut size={15} />
        Sign out
      </button>
    </div>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────

export default function SettingsClient({ user, appUrl }: SettingsClientProps) {
  return (
    <div className="flex flex-col gap-5 p-4 md:p-6 max-w-2xl w-full pb-28 md:pb-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">Settings</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          {user.displayName ?? user.name ?? user.email}
        </p>
      </div>

      <ProfileSection user={user} />
      <PreferencesSection unitPreference={user.unitPreference} />
      <DataSection />
      <InviteSection personalInviteCode={user.inviteCode} appUrl={appUrl} />
      <AccountSection />
      <SignOutSection />
    </div>
  );
}
