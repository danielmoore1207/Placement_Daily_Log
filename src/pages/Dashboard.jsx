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
      <div className="rounded-xl border border-white/20 bg-black/40 p-4">
        <p className="text-sm text-zinc-400">{user ? `Signed in as ${user.email}` : "Not signed in"}</p>
        <h2 className="font-display mt-2 text-2xl font-semibold text-white">Welcome to your Placement Daily Log</h2>
        <p className="mt-1 text-sm text-zinc-200">
          Capture daily progress, review monthly trends, and pull any specific day into a readable view.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/20 bg-zinc-900 p-4 text-zinc-100">
          <p className="text-xs uppercase tracking-wide text-zinc-400">Total entries</p>
          <p className="mt-2 text-2xl font-semibold">{totalLogs}</p>
        </div>
        <div className="rounded-xl border border-white/20 bg-white/10 p-4 text-zinc-100">
          <p className="text-xs uppercase tracking-wide text-zinc-400">Avg self-rating</p>
          <p className="mt-2 text-2xl font-semibold">{avgRating}</p>
        </div>
      </div>

      <Link
        to="/new-log"
        className="block w-full rounded-lg border border-white bg-white px-4 py-3 text-center text-sm font-semibold text-black transition hover:bg-zinc-200"
      >
        Create or update today&apos;s log
      </Link>
    </section>
  );
}
