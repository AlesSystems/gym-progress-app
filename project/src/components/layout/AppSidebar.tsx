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
        <div className="flex items-center justify-center h-20 border-b border-border/40">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20 shadow-sm">
            <Dumbbell size={22} strokeWidth={2} />
          </div>
        </div>

        {/* Primary nav */}
        <nav className="flex-1 flex flex-col items-center gap-5 py-8 overflow-y-auto">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                title={label}
                className={cn(
                  "group relative flex h-11 w-11 items-center justify-center rounded-lg transition-all duration-300",
                  active
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <Icon
                  size={20}
                  strokeWidth={2}
                  className="transition-transform duration-300 group-hover:scale-105"
                />
              </Link>
            );
          })}

          <div className="w-8 border-t border-border/30 my-2" />

          <button
            onClick={() => setMoreOpen(true)}
            title="More"
            className="group flex h-11 w-11 items-center justify-center rounded-lg transition-all duration-300 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <Menu
              size={20}
              strokeWidth={2}
              className="transition-transform duration-300 group-hover:scale-105"
            />
          </button>
        </nav>

        {/* Settings */}
        <div className="flex flex-col items-center gap-4 py-8 border-t border-border/40">
          <Link
            href="/settings"
            title="Settings"
            className={cn(
              "group flex h-11 w-11 items-center justify-center rounded-lg transition-all duration-300",
              isActive("/settings")
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <Settings size={20} strokeWidth={2} />
          </Link>
        </div>
      </aside>
      <MoreMenu open={moreOpen} onOpenChange={setMoreOpen} />
    </>
  );
}
