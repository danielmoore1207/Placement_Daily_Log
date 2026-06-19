import { useEffect, useMemo, useState } from "react";
import { clearDraft, getDraft, saveDraft } from "../utils/storage";
import { todayIsoDate } from "../utils/date";

const emptyState = {
  log_date: todayIsoDate(),
  projects: "",
  tasks_completed: "",
  outcomes: "",
  blockers: "",
  learnings: "",
  collaboration: "",
  next_steps: "",
  reflection: "",
  productivity: 3,
  communication: 3,
  problem_solving: 3,
  wellbeing: 3
};

const requiredFields = ["projects", "tasks_completed", "outcomes", "learnings", "next_steps", "reflection"];

export default function DailyLogForm({ initialValue, onSubmit, submitting }) {
  const [form, setForm] = useState(initialValue || getDraft() || emptyState);
  const [error, setError] = useState("");

  useEffect(() => {
    saveDraft(form);
  }, [form]);

  const isValid = useMemo(
    () => requiredFields.every((field) => String(form[field] || "").trim().length > 0),
    [form]
  );

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!isValid) {
      setError("Please complete all required fields.");
      return;
    }

    const payload = {
      ...form,
      projects: form.projects
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    };

    try {
      await onSubmit(payload);
      clearDraft();
      setForm((prev) => ({ ...emptyState, log_date: prev.log_date }));
    } catch (submitError) {
      setError(submitError.message || "Could not save log.");
    }
  }

  function renderTextArea(name, label, required = false) {
    return (
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-zinc-100">
          {label} {required ? "*" : ""}
        </span>
        <textarea
          name={name}
          value={form[name]}
          required={required}
          rows={4}
          className="rounded-lg border border-white/25 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
          onChange={(event) => updateField(name, event.target.value)}
        />
      </label>
    );
  }

  function renderRating(name, label) {
    return (
      <label className="flex items-center justify-between rounded-lg border border-white/20 bg-black/30 px-3 py-2">
        <span className="text-sm font-medium text-zinc-100">{label}</span>
        <input
          type="number"
          min={1}
          max={5}
          value={form[name]}
          className="w-16 rounded border border-white/25 bg-zinc-900 px-2 py-1 text-center text-sm text-zinc-100"
          onChange={(event) => updateField(name, Number(event.target.value))}
        />
      </label>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-zinc-100">Date *</span>
        <input
          type="date"
          name="log_date"
          value={form.log_date}
          required
          className="rounded-lg border border-white/25 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
          onChange={(event) => updateField("log_date", event.target.value)}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-zinc-100">Project(s) worked on (comma-separated) *</span>
        <input
          type="text"
          value={form.projects}
          required
          className="rounded-lg border border-white/25 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
          onChange={(event) => updateField("projects", event.target.value)}
        />
      </label>

      {renderTextArea("tasks_completed", "Key tasks completed", true)}
      {renderTextArea("outcomes", "Outcomes and impact", true)}
      {renderTextArea("blockers", "Blockers or challenges")}
      {renderTextArea("learnings", "What you learned", true)}
      {renderTextArea("collaboration", "Collaboration notes")}
      {renderTextArea("next_steps", "Priorities for tomorrow", true)}
      {renderTextArea("reflection", "Overall reflection", true)}

      <section className="space-y-2 rounded-xl border border-white/20 bg-black/40 p-3">
        <h2 className="text-sm font-semibold text-zinc-100">Daily self-evaluation (1-5)</h2>
        {renderRating("productivity", "Productivity")}
        {renderRating("communication", "Communication")}
        {renderRating("problem_solving", "Problem solving")}
        {renderRating("wellbeing", "Wellbeing")}
      </section>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg border border-white bg-white px-4 py-3 text-sm font-semibold text-black disabled:opacity-60"
      >
        {submitting ? "Saving..." : "Save Daily Log"}
      </button>
    </form>
  );
}
