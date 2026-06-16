import { useMemo } from "react";
import { formatDisplayDate, monthKeyFromIsoDate } from "../utils/date";
import MonthlySummaryCards from "../components/MonthlySummaryCards";

function calculateAverage(log) {
  return ((log.productivity + log.communication + log.problem_solving + log.wellbeing) / 4).toFixed(2);
}

export default function History({ logs, onGeneratePdf, onOpenPdf }) {
  const grouped = useMemo(() => {
    return logs.reduce((acc, log) => {
      const key = monthKeyFromIsoDate(log.log_date);
      if (!acc[key]) acc[key] = [];
      acc[key].push(log);
      return acc;
    }, {});
  }, [logs]);

  const monthKeys = Object.keys(grouped).sort((a, b) => (a < b ? 1 : -1));

  if (logs.length === 0) {
    return <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">No logs yet.</p>;
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900">History</h2>
      <MonthlySummaryCards logs={logs} />
      {monthKeys.map((monthKey) => {
        const monthLogs = grouped[monthKey].sort((a, b) => (a.log_date < b.log_date ? 1 : -1));
        const avgMonth =
          monthLogs.reduce((acc, log) => acc + Number(calculateAverage(log)), 0) / monthLogs.length;
        return (
          <article key={monthKey} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
            <header className="flex items-center justify-between">
              <h3 className="text-md font-semibold text-slate-900">{monthKey}</h3>
              <p className="text-xs text-slate-500">
                {monthLogs.length} entries • avg rating {avgMonth.toFixed(2)}
              </p>
            </header>
            <div className="space-y-2">
              {monthLogs.map((log) => (
                <div key={log.id} className="rounded-lg border border-slate-200 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-900">{formatDisplayDate(log.log_date)}</p>
                    <p className="text-xs text-slate-500">daily avg {calculateAverage(log)}</p>
                  </div>
                  <p className="mt-1 text-xs text-slate-600">{(log.projects || []).join(", ") || "No projects listed"}</p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      className="rounded bg-slate-800 px-3 py-1 text-xs font-semibold text-white"
                      onClick={() => onGeneratePdf(log.id)}
                    >
                      Generate PDF
                    </button>
                    <button
                      type="button"
                      disabled={!log.pdf_path}
                      className="rounded bg-blue-700 px-3 py-1 text-xs font-semibold text-white disabled:bg-blue-300"
                      onClick={() => onOpenPdf(log.pdf_path)}
                    >
                      Open PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </article>
        );
      })}
    </section>
  );
}
