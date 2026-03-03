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
        "group relative flex flex-col justify-between overflow-hidden rounded-lg bg-card/40 p-6 border border-border/50 transition-all duration-300 hover:bg-card/60 hover:border-primary/30 backdrop-blur-sm shadow-sm hover:shadow-primary/5",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className={cn("rounded-md bg-secondary/50 p-2.5 border border-border/40 transition-all group-hover:bg-primary/10 group-hover:border-primary/20", accentColor)}>
          <Icon size={20} strokeWidth={2} />
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors tracking-tight uppercase">
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs font-medium text-muted-foreground mt-1 line-clamp-1 uppercase tracking-wider opacity-70">
            {subtitle}
          </p>
        )}
      </div>

      {/* Decorative gradient blob */}
      <div className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full bg-primary/5 blur-2xl transition-all group-hover:bg-primary/10" />
    </Link>
  );
}
