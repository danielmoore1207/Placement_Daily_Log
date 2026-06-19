import { useState } from "react";
import DailyLogForm from "../components/DailyLogForm";

export default function NewLog({ onUpsertLog, logs }) {
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState("");

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

      await onUpsertLog(payload);
      setStatus("Log saved.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="space-y-4">
      <h2 className="font-display text-xl font-semibold text-white">New Daily Log</h2>
      <p className="text-sm text-zinc-200">
        One entry is allowed per date. If a date already has an entry, this form blocks another save.
      </p>
      <DailyLogForm onSubmit={handleSubmit} submitting={submitting} />
      {status ? <p className="text-sm text-zinc-100">{status}</p> : null}
    </section>
  );
}
