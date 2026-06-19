export default function MonthlySummaryCards({ logs }) {
  if (logs.length === 0) return null;

  const total = logs.length;
  const ratings = logs.map(
    (log) => (log.productivity + log.communication + log.problem_solving + log.wellbeing) / 4
  );
  const avg = (ratings.reduce((acc, value) => acc + value, 0) / ratings.length).toFixed(2);

  const strongDays = ratings.filter((value) => value >= 4).length;
  const challengeDays = ratings.filter((value) => value < 3).length;

  return (
    <section className="grid grid-cols-2 gap-3">
      <article className="rounded-xl border border-white/20 bg-zinc-900 p-4 text-zinc-100">
        <p className="text-xs uppercase text-zinc-400">Entries</p>
        <p className="mt-2 text-2xl font-semibold">{total}</p>
      </article>
      <article className="rounded-xl border border-white/20 bg-white/10 p-4 text-zinc-100">
        <p className="text-xs uppercase text-zinc-400">Average score</p>
        <p className="mt-2 text-2xl font-semibold">{avg}</p>
      </article>
      <article className="rounded-xl border border-white/15 bg-black/40 p-4 text-zinc-100">
        <p className="text-xs uppercase text-zinc-400">Strong days (&gt;=4)</p>
        <p className="mt-2 text-2xl font-semibold">{strongDays}</p>
      </article>
      <article className="rounded-xl border border-white/15 bg-black/40 p-4 text-zinc-100">
        <p className="text-xs uppercase text-zinc-400">Challenge days (&lt;3)</p>
        <p className="mt-2 text-2xl font-semibold">{challengeDays}</p>
      </article>
    </section>
  );
}
