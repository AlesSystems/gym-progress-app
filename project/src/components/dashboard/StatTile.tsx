import { LucideIcon } from "lucide-react";

interface StatTileProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  iconColor?: string;
}

export default function StatTile({ icon: Icon, value, label, iconColor = "text-primary" }: StatTileProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg bg-card/40 border border-border/50 p-4 backdrop-blur-sm transition-all hover:bg-card/60 hover:border-border">
      <div className="mt-0.5 rounded-md bg-secondary/50 p-2 border border-border/40">
        <Icon size={14} className={iconColor} />
      </div>
      <div>
        <p className="text-xl font-bold tabular-nums text-foreground tracking-tight leading-none">{value}</p>
        <p className="mt-1 text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
      </div>
    </div>
  );
}
