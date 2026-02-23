"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Dumbbell,
  ClipboardList,
  Play,
  CalendarDays,
  Users,
  UserCircle,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { href: "/exercises", icon: Dumbbell, label: "Exercises" },
  { href: "/templates", icon: ClipboardList, label: "Templates" },
  { href: "/sessions", icon: Play, label: "History" },
  { href: "/calendar", icon: CalendarDays, label: "Calendar" },
];

const BOTTOM_ITEMS = [
  { href: "/profile", icon: UserCircle, label: "Profile" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export default function AppSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  return (
    <aside className="hidden md:flex flex-col w-20 shrink-0 h-screen sticky top-0 bg-sidebar/50 backdrop-blur-xl border-r border-border z-40">
      {/* Logo */}
      <div className="flex items-center justify-center h-20 border-b border-border/50">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
          <Dumbbell size={20} strokeWidth={2} />
        </div>
      </div>

      {/* Primary nav */}
      <nav className="flex-1 flex flex-col items-center gap-4 py-6 overflow-y-auto">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={cn(
                "group relative flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300",
                active
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon
                size={22}
                strokeWidth={1.5}
                className="transition-transform duration-300 group-hover:scale-110"
              />
              {/* Tooltip-ish label on hover could go here, but keeping it clean for now */}
            </Link>
          );
        })}
      </nav>

      {/* Bottom nav */}
      <div className="flex flex-col items-center gap-4 py-6 border-t border-border/50">
        {BOTTOM_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={cn(
                "group flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300",
                active
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon size={22} strokeWidth={1.5} />
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
