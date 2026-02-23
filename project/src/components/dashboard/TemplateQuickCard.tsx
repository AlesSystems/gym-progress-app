import Link from "next/link";
import { ClipboardList, ChevronRight } from "lucide-react";

interface TemplateQuickCardProps {
  id: string;
  name: string;
  exerciseCount: number;
  updatedAt: string;
}

export default function TemplateQuickCard({ id, name, exerciseCount, updatedAt }: TemplateQuickCardProps) {
  const updated = new Date(updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  return (
    <Link
      href={`/sessions/start?templateId=${id}`}
      className="group flex flex-col justify-between w-44 shrink-0 rounded-xl bg-card border border-border p-4 hover:border-primary/50 transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="rounded-lg bg-secondary p-1.5">
          <ClipboardList size={14} className="text-muted-foreground" />
        </div>
        <ChevronRight size={14} className="text-muted-foreground/0 group-hover:text-muted-foreground transition-colors mt-0.5" />
      </div>
      <div className="mt-3">
        <p className="text-sm font-semibold text-foreground leading-snug line-clamp-2">{name}</p>
        <p className="mt-1 text-xs text-muted-foreground">{exerciseCount} exercise{exerciseCount !== 1 ? "s" : ""} · {updated}</p>
      </div>
    </Link>
  );
}
