"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, History, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import MoreMenu from "./MoreMenu";

const TABS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { href: "/sessions", icon: History, label: "History" },
] as const;

export default function BottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  return (
    <>
      <nav className="md:hidden fixed bottom-4 left-4 right-4 z-50 rounded-2xl bg-card border border-border/50 shadow-2xl shadow-black/50">
        <div className="flex items-center justify-around h-16 px-2">
          {TABS.map(({ href, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "group relative flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-colors",
                  active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Icon
                  size={22}
                  strokeWidth={active ? 2 : 1.5}
                  className={cn("transition-transform duration-300", active && "scale-110")}
                />
                {active && (
                  <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
          <button
            onClick={() => setMoreOpen(true)}
            className="group relative flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-colors text-muted-foreground hover:text-foreground hover:bg-muted/50"
          >
            <Menu size={22} strokeWidth={1.5} />
          </button>
        </div>
      </nav>
      <MoreMenu open={moreOpen} onOpenChange={setMoreOpen} />
    </>
  );
}
