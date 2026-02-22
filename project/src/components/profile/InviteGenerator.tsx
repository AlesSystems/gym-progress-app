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
      <div className="rounded-lg bg-indigo-50 border border-indigo-100 p-4 space-y-3">
        <div>
          <p className="text-xs font-medium text-indigo-700 uppercase tracking-wide mb-1">
            Your Personal Invite Code
          </p>
          <p className="text-xs text-indigo-600 mb-2">
            Share this with friends — it never expires
          </p>
          <div className="flex gap-2">
            <code className="flex-1 font-mono text-sm bg-white border border-indigo-200 rounded px-3 py-1.5 text-indigo-900">
              {personalInviteCode}
            </code>
            <button
              onClick={() => copyToClipboard(personalInviteCode, "personal")}
              className="px-3 py-1.5 text-xs font-medium rounded border border-indigo-300 text-indigo-700 hover:bg-indigo-100 transition-colors"
            >
              {copied === "personal" ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
        <div>
          <p className="text-xs text-indigo-600 mb-1">Invite URL</p>
          <div className="flex gap-2">
            <input
              readOnly
              value={personalInviteUrl}
              className="flex-1 text-xs bg-white border border-indigo-200 rounded px-3 py-1.5 text-gray-700"
            />
            <button
              onClick={() => copyToClipboard(personalInviteUrl, "url")}
              className="px-3 py-1.5 text-xs font-medium rounded border border-indigo-300 text-indigo-700 hover:bg-indigo-100 transition-colors"
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
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          {isGenerating ? "Generating…" : "Generate one-time invite"}
        </button>
      </div>

      {generatedInvite && (
        <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 space-y-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            One-time invite
          </p>
          <div className="flex gap-2">
            <code className="flex-1 font-mono text-sm bg-white border border-gray-200 rounded px-3 py-1.5">
              {generatedInvite.code}
            </code>
            <button
              onClick={() => copyToClipboard(generatedInvite.code, "code")}
              className="px-3 py-1.5 text-xs font-medium rounded border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {copied === "code" ? "Copied!" : "Copy code"}
            </button>
          </div>
          <div className="flex gap-2">
            <input
              readOnly
              value={generatedInvite.inviteUrl}
              className="flex-1 text-xs bg-white border border-gray-200 rounded px-3 py-1.5 text-gray-700"
            />
            <button
              onClick={() => copyToClipboard(generatedInvite.inviteUrl, "url")}
              className="px-3 py-1.5 text-xs font-medium rounded border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {copied === "url" ? "Copied!" : "Copy link"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
