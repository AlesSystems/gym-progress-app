"use client";

import { useState } from "react";
import ExportCard from "@/components/data/ExportCard";
import DateRangeFilter from "@/components/data/DateRangeFilter";
import ImportDropzone from "@/components/data/ImportDropzone";
import ImportSummaryModal from "@/components/data/ImportSummaryModal";

interface ImportSummary {
  imported: { sessions: number; exercises: number; templates: number; scheduled: number };
  skipped: number;
  errors: string[];
}

export default function DataSettingsClient() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);

  const csvHref =
    `/api/export/csv` +
    (fromDate || toDate
      ? `?${new URLSearchParams({ ...(fromDate && { from: fromDate }), ...(toDate && { to: toDate }) }).toString()}`
      : "");

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Data &amp; Privacy</h1>
        <p className="text-sm text-gray-500 mt-1">Export your data or restore from a backup.</p>
      </div>

      {/* Export */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
        <h2 className="text-base font-semibold text-gray-900">Export Data</h2>

        {/* CSV */}
        <div className="space-y-1">
          <ExportCard
            title="Export as CSV"
            description="Download your full session history as a spreadsheet. Each row is one logged set."
            href={csvHref}
          />
          <DateRangeFilter
            from={fromDate}
            to={toDate}
            onFromChange={setFromDate}
            onToChange={setToDate}
          />
        </div>

        <hr className="border-gray-100" />

        {/* JSON */}
        <ExportCard
          title="Download Full Backup (JSON)"
          description="Complete backup of all your data: sessions, exercises, templates, and scheduled workouts."
          href="/api/export/json"
        />
      </div>

      {/* Import */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">Import / Restore</h2>
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
          <strong>Merge mode:</strong> Your existing data will not be deleted. Imported records will
          be added alongside your current data. Duplicates are automatically skipped.
        </div>
        <ImportDropzone onComplete={setImportSummary} />
      </div>

      {importSummary && (
        <ImportSummaryModal summary={importSummary} onClose={() => setImportSummary(null)} />
      )}
    </div>
  );
}
