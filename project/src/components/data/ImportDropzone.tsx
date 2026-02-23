"use client";

import { useCallback, useRef, useState } from "react";
import { UploadCloud } from "lucide-react";

interface ImportSummary {
  imported: { sessions: number; exercises: number; templates: number; scheduled: number };
  skipped: number;
  errors: string[];
}

interface ImportDropzoneProps {
  onComplete: (summary: ImportSummary) => void;
}

export default function ImportDropzone({ onComplete }: ImportDropzoneProps) {
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState<"idle" | "uploading" | "polling">("idle");
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.name.endsWith(".json") && file.type !== "application/json") {
        setError("Please upload a .json file.");
        return;
      }
      setError(null);
      setStatus("uploading");

      const form = new FormData();
      form.append("file", file);

      try {
        const res = await fetch("/api/import", { method: "POST", body: form });
        const json = await res.json();

        if (!res.ok) {
          setError(json?.error ?? `Upload failed (${res.status})`);
          setStatus("idle");
          return;
        }

        // Async job
        if (json.jobId) {
          setStatus("polling");
          await pollJob(json.jobId, onComplete, setError, setStatus);
          return;
        }

        // Sync result
        setStatus("idle");
        onComplete(json.summary);
      } catch {
        setError("Upload failed. Please try again.");
        setStatus("idle");
      }
    },
    [onComplete]
  );

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  const busy = status !== "idle";

  return (
    <div>
      <button
        type="button"
        disabled={busy}
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`w-full flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 transition-colors
          ${dragging ? "border-indigo-400 bg-indigo-50" : "border-gray-300 bg-gray-50 hover:border-indigo-400 hover:bg-indigo-50"}
          ${busy ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <UploadCloud size={32} className="text-indigo-400" />
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700">
            {status === "uploading" ? "Uploading…" : status === "polling" ? "Importing, please wait…" : "Drag & drop your backup file here"}
          </p>
          {status === "idle" && (
            <p className="text-xs text-gray-500 mt-1">or click to browse · JSON only · max 10 MB</p>
          )}
        </div>
      </button>

      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={onInputChange}
      />

      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  );
}

async function pollJob(
  jobId: string,
  onComplete: (s: ImportSummary) => void,
  setError: (e: string | null) => void,
  setStatus: (s: "idle" | "uploading" | "polling") => void
) {
  const MAX_ATTEMPTS = 60;
  let attempts = 0;

  while (attempts < MAX_ATTEMPTS) {
    await new Promise((r) => setTimeout(r, 2000));
    attempts++;
    try {
      const res = await fetch(`/api/import/${jobId}`);
      const json = await res.json();
      if (json.status === "completed") {
        setStatus("idle");
        onComplete(json.summary);
        return;
      }
      if (json.status === "failed") {
        setStatus("idle");
        setError(json.error ?? "Import failed.");
        return;
      }
    } catch {
      // keep polling
    }
  }

  setStatus("idle");
  setError("Import is taking too long. Check back later.");
}
