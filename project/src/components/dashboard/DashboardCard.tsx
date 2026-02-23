import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  href: string;
  accentColor?: string; // Optional custom accent color class
  className?: string;
}

export function DashboardCard({
  title,
  subtitle,
  icon: Icon,
  href,
  accentColor = "text-primary",
  className,
}: DashboardCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-card p-6 transition-all hover:bg-accent/5 hover:ring-1 hover:ring-primary/20",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className={cn("rounded-xl bg-background/50 p-3 ring-1 ring-border/50 transition-colors group-hover:bg-background group-hover:ring-primary/20", accentColor)}>
          <Icon size={24} strokeWidth={1.5} />
        </div>
        {/* Optional: Add a subtle arrow or indicator here */}
      </div>

      <div className="mt-4">
        <h3 className="text-lg font-medium text-foreground group-hover:text-primary transition-colors">
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
            {subtitle}
          </p>
        )}
      </div>

      {/* Decorative gradient blob */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/5 blur-2xl transition-all group-hover:bg-primary/10" />
    </Link>
  );
}
