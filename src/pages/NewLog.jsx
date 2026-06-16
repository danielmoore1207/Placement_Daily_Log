import { useState } from "react";
import DailyLogForm from "../components/DailyLogForm";
import { requestPdfGeneration } from "../services/pdfClient";

export default function NewLog({ onUpsertLog }) {
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState("");
  const [lastSaved, setLastSaved] = useState(null);

  async function handleSubmit(payload) {
    setSubmitting(true);
    setStatus("");
    try {
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
        One entry is stored per date. Saving again for the same date updates that day.
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
