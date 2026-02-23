import { LucideIcon } from "lucide-react";

interface StatTileProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  iconColor?: string;
}

export default function StatTile({ icon: Icon, value, label, iconColor = "text-primary" }: StatTileProps) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-card border border-border p-4">
      <div className="mt-0.5 rounded-lg bg-secondary p-2">
        <Icon size={16} className={iconColor} />
      </div>
      <div>
        <p className="text-2xl font-semibold tabular-nums text-foreground leading-none">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
