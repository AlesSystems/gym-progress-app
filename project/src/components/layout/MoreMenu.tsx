"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  Dumbbell,
  CalendarDays,
  LineChart,
  Trophy,
  Users,
  Settings,
  X,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const MENU_ITEMS = [
  { href: "/templates", icon: ClipboardList, label: "Templates" },
  { href: "/exercises", icon: Dumbbell, label: "Exercises" },
  { href: "/calendar", icon: CalendarDays, label: "Calendar" },
  { href: "/analytics", icon: LineChart, label: "Analytics" },
  { href: "/leaderboard", icon: Trophy, label: "Leaderboard" },
  { href: "/friends", icon: Users, label: "Friends" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

interface MoreMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MoreMenu({ open, onOpenChange }: MoreMenuProps) {
  const pathname = usePathname();

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl pb-8">
        <SheetHeader className="pb-2">
          <SheetTitle className="text-base font-medium">More</SheetTitle>
        </SheetHeader>

        <nav className="grid grid-cols-3 gap-3 pt-2">
          {MENU_ITEMS.map(({ href, icon: Icon, label }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => onOpenChange(false)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl p-4 transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon size={22} strokeWidth={1.5} />
                <span className="text-xs font-medium">{label}</span>
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
