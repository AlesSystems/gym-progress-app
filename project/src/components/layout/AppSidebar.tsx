"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Dumbbell,
  History,
  Menu,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import MoreMenu from "./MoreMenu";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { href: "/sessions", icon: History, label: "History" },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  return (
    <>
      <aside className="hidden md:flex flex-col w-20 shrink-0 h-screen sticky top-0 bg-sidebar border-r border-border z-40">
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
                  "group relative flex h-12 w-12 items-center justify-center rounded-xl transition-colors",
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
              </Link>
            );
          })}

          <div className="w-8 border-t border-border/50" />

          <button
            onClick={() => setMoreOpen(true)}
            title="More"
            className="group flex h-12 w-12 items-center justify-center rounded-xl transition-colors text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Menu
              size={22}
              strokeWidth={1.5}
              className="transition-transform duration-300 group-hover:scale-110"
            />
          </button>
        </nav>

        {/* Settings */}
        <div className="flex flex-col items-center gap-4 py-6 border-t border-border/50">
          <Link
            href="/settings"
            title="Settings"
            className={cn(
              "group flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300",
              isActive("/settings")
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Settings size={22} strokeWidth={1.5} />
          </Link>
        </div>
      </aside>
      <MoreMenu open={moreOpen} onOpenChange={setMoreOpen} />
    </>
  );
}
