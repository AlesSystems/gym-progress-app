"use client";

import { signOut } from "next-auth/react";

interface LogoutButtonProps {
  className?: string;
}

export default function LogoutButton({ className }: LogoutButtonProps) {
  return (
    <button
      onClick={async () => {
        try {
          await signOut({ callbackUrl: "/login" });
        } catch {
          window.location.href = "/login";
        }
      }}
      className={
        className ??
        "w-full rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors"
      }
    >
      Sign out
    </button>
  );
}
