"use client";

import { useState } from "react";

interface InviteGeneratorProps {
  personalInviteCode: string;
  appUrl: string;
}

export default function InviteGenerator({ personalInviteCode, appUrl }: InviteGeneratorProps) {
  const [generatedInvite, setGeneratedInvite] = useState<{
    code: string;
    inviteUrl: string;
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState<"code" | "url" | "personal" | null>(null);

  const generateInvite = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/invites/generate", { method: "POST" });
      const json = await res.json();
      if (json.success) {
        setGeneratedInvite({
          code: json.data.invite.code,
          inviteUrl: json.data.inviteUrl,
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string, type: "code" | "url" | "personal") => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const personalInviteUrl = `${appUrl}/join/${personalInviteCode}`;

  return (
    <div className="space-y-4">
      {/* Personal invite code */}
      <div className="rounded-lg bg-primary/10 border border-primary/20 p-4 space-y-3">
        <div>
          <p className="text-xs font-medium text-primary uppercase tracking-wide mb-1">
            Your Personal Invite Code
          </p>
          <p className="text-xs text-primary/80 mb-2">
            Share this with friends — it never expires
          </p>
          <div className="flex gap-2">
            <code className="flex-1 font-mono text-sm bg-background border border-border rounded px-3 py-1.5 text-foreground">
              {personalInviteCode}
            </code>
            <button
              onClick={() => copyToClipboard(personalInviteCode, "personal")}
              className="px-3 py-1.5 text-xs font-medium rounded border border-border text-foreground hover:bg-accent transition-colors"
            >
              {copied === "personal" ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
        <div>
          <p className="text-xs text-primary/80 mb-1">Invite URL</p>
          <div className="flex gap-2">
            <input
              readOnly
              value={personalInviteUrl}
              className="flex-1 text-xs bg-background border border-border rounded px-3 py-1.5 text-foreground"
            />
            <button
              onClick={() => copyToClipboard(personalInviteUrl, "url")}
              className="px-3 py-1.5 text-xs font-medium rounded border border-border text-foreground hover:bg-accent transition-colors"
            >
              {copied === "url" ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      </div>

      {/* Generate a one-time invite */}
      <div>
        <button
          onClick={generateInvite}
          disabled={isGenerating}
          className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent disabled:opacity-50 transition-colors"
        >
          {isGenerating ? "Generating…" : "Generate one-time invite"}
        </button>
      </div>

      {generatedInvite && (
        <div className="rounded-lg bg-card border border-border p-4 space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            One-time invite
          </p>
          <div className="flex gap-2">
            <code className="flex-1 font-mono text-sm bg-background border border-border rounded px-3 py-1.5 text-foreground">
              {generatedInvite.code}
            </code>
            <button
              onClick={() => copyToClipboard(generatedInvite.code, "code")}
              className="px-3 py-1.5 text-xs font-medium rounded border border-border text-foreground hover:bg-accent transition-colors"
            >
              {copied === "code" ? "Copied!" : "Copy code"}
            </button>
          </div>
          <div className="flex gap-2">
            <input
              readOnly
              value={generatedInvite.inviteUrl}
              className="flex-1 text-xs bg-background border border-border rounded px-3 py-1.5 text-foreground"
            />
            <button
              onClick={() => copyToClipboard(generatedInvite.inviteUrl, "url")}
              className="px-3 py-1.5 text-xs font-medium rounded border border-border text-foreground hover:bg-accent transition-colors"
            >
              {copied === "url" ? "Copied!" : "Copy link"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
