'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

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

// Rentang selalu 1 tahun penuh.
const MONTHS_BACK = 12;

// Ukuran sel untuk versi mobile (yang bisa di-scroll horizontal).
const CELL = 10; // px
const GAP = 3; // px
const STEP = CELL + GAP;

export default function GitHubHeatmap({ username }: { username: string }) {
  const [days, setDays] = useState<Day[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  // Desktop = >= 640px. Di desktop grid diregangkan pas kartu; di mobile
  // grid berukuran tetap lalu di-scroll horizontal (auto ke bulan terakhir).
  const [isDesktop, setIsDesktop] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px)');
    const apply = () => setIsDesktop(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

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
        if (!all.length) {
          setDays([]);
          setStatus('ok');
          return;
        }
        // Tanggal terakhir yang tersedia (biasanya hari ini).
        const lastDate = new Date(all[all.length - 1].date + 'T00:00:00');
        // Awal = N bulan ke belakang, lalu mundur ke hari Minggu terdekat
        // supaya kolom pertama penuh (tidak terpotong).
        const start = new Date(lastDate.getFullYear(), lastDate.getMonth() - (MONTHS_BACK - 1), 1);
        start.setDate(start.getDate() - start.getDay()); // mundur ke Minggu
        const filtered = all.filter((x) => new Date(x.date + 'T00:00:00') >= start);
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
    let lastLabelCol = -99;
    wk.forEach((week, col) => {
      // Beri label pada kolom yang memuat tanggal 1 bulan itu (seperti GitHub).
      // Bulan parsial di awal (tanpa tgl 1 di rentang) tidak diberi label.
      const firstOfMonth = week.find((d) => d && new Date(d.date + 'T00:00:00').getDate() === 1);
      if (!firstOfMonth) return;
      const m = new Date(firstOfMonth.date + 'T00:00:00').getMonth();
      if (col - lastLabelCol >= 3) {
        labels.push({ label: MONTHS[m], col });
        lastLabelCol = col;
      }
    });
    return { weeks: wk, monthLabels: labels };
  }, [days]);

  const colCount = weeks.length || 53;

  // Di mobile: begitu data siap, geser scroll ke paling kanan (bulan terakhir).
  // Retry beberapa frame karena scrollWidth bisa belum final saat pertama jalan.
  useEffect(() => {
    if (isDesktop) return;
    let raf = 0;
    let tries = 0;
    const toRight = () => {
      const el = scrollRef.current;
      if (!el) return;
      el.scrollLeft = el.scrollWidth;
      if (++tries < 5) raf = requestAnimationFrame(toRight);
    };
    raf = requestAnimationFrame(toRight);
    return () => cancelAnimationFrame(raf);
  }, [weeks, isDesktop]);

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

  const gridWidth = colCount * CELL + (colCount - 1) * GAP;

  const cellsRow = (flex1: boolean) => (
    <div className={flex1 ? 'flex w-full gap-[3px]' : 'flex gap-[3px]'}>
      {status === 'loading'
        ? Array.from({ length: colCount }).map((_, c) => (
            <div key={c} className={flex1 ? 'flex flex-1 flex-col gap-[3px]' : 'flex w-[10px] shrink-0 flex-col gap-[3px]'}>
              {Array.from({ length: 7 }).map((_, r) => (
                <div key={r} className="aspect-square w-full rounded-[2px] bg-gray-100 dark:bg-white/[0.04]" />
              ))}
            </div>
          ))
        : weeks.map((week, c) => (
            <div key={c} className={flex1 ? 'flex flex-1 flex-col gap-[3px]' : 'flex w-[10px] shrink-0 flex-col gap-[3px]'}>
              {week.map((day, r) => (
                <div
                  key={r}
                  className={`aspect-square w-full rounded-[2px] ${
                    day ? CELL_CLASS[Math.max(0, Math.min(4, day.level))] : 'bg-transparent'
                  }`}
                  title={day ? `${day.count} contribution${day.count === 1 ? '' : 's'} on ${day.date}` : ''}
                />
              ))}
            </div>
          ))}
    </div>
  );

  return (
    <div className="border border-gray-100 dark:border-white/[0.08] rounded-xl p-4 sm:p-5 bg-white dark:bg-ink-card">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-mono text-gray-400 dark:text-gray-500">CONTRIBUTIONS — LAST 12 MONTHS</p>
        {total !== null && (
          <p className="text-[11px] font-mono text-gray-500 dark:text-gray-400">{total.toLocaleString()} total</p>
        )}
      </div>

      {isDesktop ? (
        /* DESKTOP — grid diregangkan pas lebar kartu (tanpa scroll) */
        <div className="w-full">
          <div className="relative h-4 mb-1">
            {monthLabels.map(({ label, col }) => (
              <span
                key={`${label}-${col}`}
                className="absolute text-[10px] text-gray-400 dark:text-gray-500"
                style={{ left: `${(col / colCount) * 100}%` }}
              >
                {label}
              </span>
            ))}
          </div>
          {cellsRow(true)}
        </div>
      ) : (
        /* MOBILE — grid ukuran tetap, scroll horizontal, auto ke bulan terakhir */
        <div ref={scrollRef} className="-mx-1 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]">
          <div className="inline-block align-top" style={{ width: `${gridWidth}px` }}>
            <div className="relative h-4 mb-1">
              {monthLabels.map(({ label, col }) => (
                <span
                  key={`${label}-${col}`}
                  className="absolute text-[10px] text-gray-400 dark:text-gray-500"
                  style={{ left: `${col * STEP}px` }}
                >
                  {label}
                </span>
              ))}
            </div>
            {cellsRow(false)}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-end gap-1.5 mt-3">
        <span className="text-[10px] text-gray-400 dark:text-gray-500">Less</span>
        {CELL_CLASS.map((c, i) => (
          <div key={i} className="w-[10px] h-[10px] rounded-[2px]" data-c={i}>
            <div className={`w-full h-full rounded-[2px] ${c}`} />
          </div>
        ))}
        <span className="text-[10px] text-gray-400 dark:text-gray-500">More</span>
      </div>
    </div>
  );
}
