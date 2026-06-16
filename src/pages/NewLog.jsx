import { useState } from "react";
import DailyLogForm from "../components/DailyLogForm";
import { requestPdfGeneration } from "../services/pdfClient";

export default function NewLog({ onUpsertLog, logs }) {
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState("");
  const [lastSaved, setLastSaved] = useState(null);

  async function handleSubmit(payload) {
    setSubmitting(true);
    setStatus("");
    try {
      const existing = logs.find((log) => log.log_date === payload.log_date);
      if (existing) {
        setStatus(
          `An entry already exists for ${payload.log_date}. Use History if you want to review it.`
        );
        return;
      }

      const saved = await onUpsertLog(payload);
      setLastSaved(saved);
      setStatus("Log saved. You can now generate the server PDF.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGeneratePdf() {
    if (!lastSaved?.id) {
      setStatus("Save a log first before generating a PDF.");
      return;
    }
    setStatus("Generating PDF...");
    const result = await requestPdfGeneration(lastSaved.id);
    setStatus(`PDF generated at ${result.pdfPath}`);
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900">New Daily Log</h2>
      <p className="text-sm text-slate-600">
        One entry is allowed per date. If a date already has an entry, this form blocks another save.
      </p>
      <DailyLogForm onSubmit={handleSubmit} submitting={submitting} />
      <button
        type="button"
        onClick={handleGeneratePdf}
        className="w-full rounded-lg bg-slate-800 px-4 py-3 text-sm font-semibold text-white"
      >
        Generate PDF
      </button>
      {status ? <p className="text-sm text-slate-700">{status}</p> : null}
    </section>
  );
}
