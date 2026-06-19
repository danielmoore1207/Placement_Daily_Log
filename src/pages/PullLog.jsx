import { useMemo, useState } from "react";
import { formatDisplayDate, todayIsoDate } from "../utils/date";

const sections = [
  { key: "projects", title: "Projects" },
  { key: "tasks_completed", title: "Key tasks completed" },
  { key: "outcomes", title: "Outcomes and impact" },
  { key: "blockers", title: "Blockers or challenges" },
  { key: "learnings", title: "What you learned" },
  { key: "collaboration", title: "Collaboration notes" },
  { key: "next_steps", title: "Priorities for tomorrow" },
  { key: "reflection", title: "Overall reflection" }
];

function ratingSummary(log) {
  const average = (
    (log.productivity + log.communication + log.problem_solving + log.wellbeing) /
    4
  ).toFixed(2);
  return `Productivity ${log.productivity}/5 | Communication ${log.communication}/5 | Problem solving ${log.problem_solving}/5 | Wellbeing ${log.wellbeing}/5 | Avg ${average}`;
}

function renderSectionValue(log, key) {
  if (key === "projects") {
    return (log.projects || []).join(", ") || "No projects listed.";
  }
  const value = String(log[key] || "").trim();
  return value || "No details recorded.";
}

export default function PullLog({ logs }) {
  const [selectedDate, setSelectedDate] = useState(todayIsoDate());
  const selectedLog = useMemo(
    () => logs.find((log) => log.log_date === selectedDate) || null,
    [logs, selectedDate]
  );

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h2 className="font-display text-xl font-semibold text-white">Pull Log</h2>
        <p className="text-sm text-zinc-200">
          Choose any date to pull that day&apos;s saved log in a readable format.
        </p>
      </header>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-zinc-100">Select date</span>
        <input
          type="date"
          value={selectedDate}
          className="rounded-lg border border-white/25 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
          onChange={(event) => setSelectedDate(event.target.value)}
        />
      </label>

      {!selectedLog ? (
        <div className="rounded-xl border border-white/20 bg-black/40 p-4 text-sm text-zinc-300">
          No log found for {selectedDate}. Try another date.
        </div>
      ) : (
        <article className="space-y-3 rounded-xl border border-white/20 bg-black/40 p-4">
          <div className="border-b border-white/15 pb-3">
            <h3 className="font-display text-base font-semibold text-zinc-100">
              {formatDisplayDate(selectedLog.log_date)}
            </h3>
            <p className="mt-1 text-xs text-zinc-400">{ratingSummary(selectedLog)}</p>
          </div>

          {sections.map((section) => (
            <div key={section.key} className="space-y-1">
              <h4 className="text-sm font-semibold text-zinc-100">{section.title}</h4>
              <p className="whitespace-pre-wrap text-sm text-zinc-200">
                {renderSectionValue(selectedLog, section.key)}
              </p>
            </div>
          ))}
        </article>
      )}
    </section>
  );
}
