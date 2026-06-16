import { Link } from "react-router-dom";

export default function Dashboard({ user, logs }) {
  const totalLogs = logs.length;
  const avgRating =
    totalLogs === 0
      ? "N/A"
      : (
          logs.reduce((acc, log) => {
            const dailyAvg =
              (log.productivity + log.communication + log.problem_solving + log.wellbeing) / 4;
            return acc + dailyAvg;
          }, 0) / totalLogs
        ).toFixed(2);

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-sm text-slate-500">{user ? `Signed in as ${user.email}` : "Not signed in"}</p>
        <h2 className="mt-2 text-xl font-semibold text-slate-900">Welcome to your Placement Daily Log</h2>
        <p className="mt-1 text-sm text-slate-600">
          Capture daily progress, review monthly trends, and generate PDF evidence for performance reviews.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-blue-700 p-4 text-white">
          <p className="text-xs uppercase tracking-wide text-blue-100">Total entries</p>
          <p className="mt-2 text-2xl font-semibold">{totalLogs}</p>
        </div>
        <div className="rounded-xl bg-slate-900 p-4 text-white">
          <p className="text-xs uppercase tracking-wide text-slate-300">Avg self-rating</p>
          <p className="mt-2 text-2xl font-semibold">{avgRating}</p>
        </div>
      </div>

      <Link
        to="/new-log"
        className="block w-full rounded-lg bg-emerald-600 px-4 py-3 text-center text-sm font-semibold text-white"
      >
        Create or update today&apos;s log
      </Link>
    </section>
  );
}
