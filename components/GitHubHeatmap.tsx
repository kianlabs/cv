'use client';

import { useEffect, useMemo, useState } from 'react';

interface Day {
  date: string;
  count: number;
  level: number;
}

// Warna kontribusi resmi GitHub (level 0–4), versi light & dark.
const CELL_CLASS = [
  'bg-[#ebedf0] dark:bg-[#161b22]',
  'bg-[#9be9a8] dark:bg-[#0e4429]',
  'bg-[#40c463] dark:bg-[#006d32]',
  'bg-[#30a14e] dark:bg-[#26a641]',
  'bg-[#216e39] dark:bg-[#39d353]',
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Tampilkan hanya dari 1 Mei tahun berjalan.
const START_MONTH = 4; // 0-indexed: Mei

export default function GitHubHeatmap({ username }: { username: string }) {
  const [days, setDays] = useState<Day[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');

  useEffect(() => {
    let alive = true;
    fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((d) => {
        if (!alive) return;
        const all: Day[] = Array.isArray(d.contributions) ? d.contributions : [];
        // Ambil hanya dari 1 Mei tahun berjalan (atau tahun terakhir yang tersedia).
        const latestYear = all.length ? new Date(all[all.length - 1].date + 'T00:00:00').getFullYear() : new Date().getFullYear();
        const filtered = all.filter((x) => {
          const dt = new Date(x.date + 'T00:00:00');
          return dt.getFullYear() === latestYear && dt.getMonth() >= START_MONTH;
        });
        setDays(filtered);
        setTotal(filtered.reduce((s, x) => s + (x.count || 0), 0));
        setStatus('ok');
      })
      .catch(() => {
        if (alive) setStatus('error');
      });
    return () => {
      alive = false;
    };
  }, [username]);

  // Susun grid: kolom = minggu (mulai Minggu), baris = hari (0=Minggu..6=Sabtu).
  const { weeks, monthLabels } = useMemo(() => {
    if (!days.length) return { weeks: [] as (Day | null)[][], monthLabels: [] as { label: string; col: number }[] };
    const first = new Date(days[0].date + 'T00:00:00');
    const padStart = first.getDay(); // 0 = Minggu
    const cells: (Day | null)[] = [...Array(padStart).fill(null), ...days];
    const wk: (Day | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) wk.push(cells.slice(i, i + 7));

    const labels: { label: string; col: number }[] = [];
    let lastMonth = -1;
    wk.forEach((week, col) => {
      const firstDay = week.find((d) => d);
      if (!firstDay) return;
      const m = new Date(firstDay.date + 'T00:00:00').getMonth();
      if (m !== lastMonth) {
        labels.push({ label: MONTHS[m], col });
        lastMonth = m;
      }
    });
    return { weeks: wk, monthLabels: labels };
  }, [days]);

  if (status === 'error') {
    return (
      <div className="border border-gray-100 dark:border-white/[0.08] rounded-xl p-6 bg-white dark:bg-ink-card text-center">
        <p className="text-[12px] text-gray-500 dark:text-gray-400">
          Couldn&apos;t load contribution data.{' '}
          <a href={`https://github.com/${username}`} className="underline" target="_blank" rel="noopener noreferrer">
            View on GitHub ↗
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className="border border-gray-100 dark:border-white/[0.08] rounded-xl p-4 sm:p-5 bg-white dark:bg-ink-card">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-mono text-gray-400 dark:text-gray-500">
          CONTRIBUTIONS — LAST YEAR
        </p>
        {total !== null && (
          <p className="text-[11px] font-mono text-gray-500 dark:text-gray-400">
            {total.toLocaleString()} total
          </p>
        )}
      </div>

      <div className="w-full overflow-x-auto pb-1">
        <div className="inline-block min-w-max">
          {/* Month labels */}
          <div className="relative h-4 mb-1" style={{ width: weeks.length * 13 }}>
            {monthLabels.map(({ label, col }) => (
              <span
                key={`${label}-${col}`}
                className="absolute text-[10px] text-gray-400 dark:text-gray-500"
                style={{ left: col * 13 }}
              >
                {label}
              </span>
            ))}
          </div>

          {/* Grid */}
          <div className="flex gap-[3px]">
            {status === 'loading'
              ? Array.from({ length: 53 }).map((_, c) => (
                  <div key={c} className="flex flex-col gap-[3px]">
                    {Array.from({ length: 7 }).map((_, r) => (
                      <div key={r} className="w-[10px] h-[10px] rounded-[2px] bg-gray-100 dark:bg-white/[0.04]" />
                    ))}
                  </div>
                ))
              : weeks.map((week, c) => (
                  <div key={c} className="flex flex-col gap-[3px]">
                    {week.map((day, r) => (
                      <div
                        key={r}
                        className={`w-[10px] h-[10px] rounded-[2px] ${
                          day ? CELL_CLASS[Math.max(0, Math.min(4, day.level))] : 'bg-transparent'
                        }`}
                        title={day ? `${day.count} contribution${day.count === 1 ? '' : 's'} on ${day.date}` : ''}
                      />
                    ))}
                  </div>
                ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-1.5 mt-3">
        <span className="text-[10px] text-gray-400 dark:text-gray-500">Less</span>
        {CELL_CLASS.map((c, i) => (
          <div key={i} className={`w-[10px] h-[10px] rounded-[2px] ${c}`} />
        ))}
        <span className="text-[10px] text-gray-400 dark:text-gray-500">More</span>
      </div>
    </div>
  );
}
