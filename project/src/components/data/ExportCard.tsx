"use client";

import { useState } from "react";
import { Download } from "lucide-react";

interface ExportCardProps {
  title: string;
  description: string;
  href: string;
  filename?: string;
}

export default function ExportCard({ title, description, href, filename }: ExportCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(href);
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        setError(json?.error ?? `Error ${res.status}`);
        return;
      }
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="(.+?)"/);
      const name = match?.[1] ?? filename ?? "export";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Download failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-inherit">{title}</p>
        <p className="text-sm text-inherit mt-0.5">{description}</p>
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      </div>
      <button
        onClick={handleDownload}
        disabled={loading}
        className="flex items-center gap-2 shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors"
      >
        <Download size={15} />
        {loading ? "Downloading…" : "Download"}
      </button>
    </div>
  );
}
