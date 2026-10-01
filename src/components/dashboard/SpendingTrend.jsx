import { useMemo, useState } from 'react';
import { formatMoney } from '../../utils/formatters';

/**
 * 30-day spending trend. Two smooth area lines (PKR + USD).
 * Points are daily totals. Pure SVG — no chart library.
 */
export default function SpendingTrend({ transactions = [], loading }) {
  const [hoverIdx, setHoverIdx] = useState(null);

  const days = useMemo(() => {
    const totalDays = 30;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    /* Build buckets for the last 30 days */
    const buckets = Array.from({ length: totalDays }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (totalDays - 1 - i));
      return {
        date: d,
        label: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
        PKR: 0,
        USD: 0
      };
    });

    transactions.forEach((t) => {
      const d = new Date(t.date);
      d.setHours(0, 0, 0, 0);
      const diff = Math.round((today - d) / (1000 * 60 * 60 * 24));
      if (diff < 0 || diff >= totalDays) return;
      const idx = totalDays - 1 - diff;
      buckets[idx][t.currency] += t.amount;
    });

    return buckets;
  }, [transactions]);

  const maxPKR = Math.max(1, ...days.map((d) => d.PKR));
  const maxUSD = Math.max(1, ...days.map((d) => d.USD));
  const grandMax = Math.max(maxPKR, maxUSD);

  const totalPKR = days.reduce((s, d) => s + d.PKR, 0);
  const totalUSD = days.reduce((s, d) => s + d.USD, 0);

  /* SVG geometry */
  const W = 800;
  const H = 220;
  const PAD_X = 16;
  const PAD_TOP = 20;
  const PAD_BOTTOM = 30;
  const innerW = W - PAD_X * 2;
  const innerH = H - PAD_TOP - PAD_BOTTOM;

  const x = (i) => PAD_X + (i / (days.length - 1)) * innerW;
  const y = (v) => PAD_TOP + innerH - (v / grandMax) * innerH;

  /* Build a smooth path (linear is fine — area fills look good) */
  const buildArea = (key) => {
    const top = days.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(d[key])}`).join(' ');
    const close = ` L ${x(days.length - 1)} ${PAD_TOP + innerH} L ${x(0)} ${PAD_TOP + innerH} Z`;
    return top + close;
  };
  const buildLine = (key) =>
    days.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(d[key])}`).join(' ');

  const hovered = hoverIdx !== null ? days[hoverIdx] : null;

  if (loading) {
    return (
      <div className="card p-5">
        <div className="h-4 w-40 bg-slate-200/70 rounded animate-pulse" />
        <div className="mt-6 h-52 bg-slate-200/40 rounded-xl animate-pulse" />
      </div>
    );
  }

  /* Empty state — no transactions in the last 30 days */
  if (totalPKR === 0 && totalUSD === 0) {
    return (
      <div className="card p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-700">Spending trend</h3>
            <p className="text-xs text-slate-400 mt-0.5">Last 30 days</p>
          </div>
        </div>
        <div className="mt-5 h-52 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v18h18" />
              <path d="M7 15l4-4 3 3 5-7" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-slate-700 mt-3">No activity yet</p>
          <p className="text-xs text-slate-400 mt-1">Transactions from the last 30 days appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-5">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3 mb-2">
        <div>
          <h3 className="text-sm font-bold text-slate-700">Spending trend</h3>
          <p className="text-xs text-slate-400 mt-0.5">Last 30 days</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="inline-flex items-center gap-1.5 text-slate-500">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" /> PKR
          </span>
          <span className="inline-flex items-center gap-1.5 text-slate-500">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> USD
          </span>
        </div>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            30-day PKR
          </p>
          <p className="text-lg font-extrabold text-blue-700 mt-0.5">
            Rs {formatMoney(totalPKR)}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            30-day USD
          </p>
          <p className="text-lg font-extrabold text-emerald-600 mt-0.5">
            $ {formatMoney(totalUSD)}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="relative -mx-1">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-52"
          preserveAspectRatio="none"
          onMouseLeave={() => setHoverIdx(null)}
        >
          <defs>
            <linearGradient id="pkrArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="usdArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid */}
          {[0, 0.25, 0.5, 0.75, 1].map((p) => (
            <line
              key={p}
              x1={PAD_X}
              x2={W - PAD_X}
              y1={PAD_TOP + innerH * p}
              y2={PAD_TOP + innerH * p}
              stroke="#e2e8f0"
              strokeWidth="1"
              strokeDasharray="3 5"
            />
          ))}

          {/* Areas */}
          <path d={buildArea('PKR')} fill="url(#pkrArea)" />
          <path d={buildArea('USD')} fill="url(#usdArea)" />

          {/* Lines */}
          <path d={buildLine('PKR')} fill="none" stroke="#3b82f6" strokeWidth="2.2" strokeLinejoin="round" />
          <path d={buildLine('USD')} fill="none" stroke="#10b981" strokeWidth="2.2" strokeLinejoin="round" />

          {/* Hover indicator */}
          {hovered && (
            <>
              <line
                x1={x(hoverIdx)}
                x2={x(hoverIdx)}
                y1={PAD_TOP}
                y2={PAD_TOP + innerH}
                stroke="#94a3b8"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <circle cx={x(hoverIdx)} cy={y(hovered.PKR)} r="4" fill="#3b82f6" stroke="#fff" strokeWidth="2" />
              <circle cx={x(hoverIdx)} cy={y(hovered.USD)} r="4" fill="#10b981" stroke="#fff" strokeWidth="2" />
            </>
          )}

          {/* Hover columns (invisible) */}
          {days.map((_, i) => (
            <rect
              key={i}
              x={x(i) - innerW / days.length / 2}
              y={0}
              width={innerW / days.length}
              height={H}
              fill="transparent"
              onMouseEnter={() => setHoverIdx(i)}
              style={{ cursor: 'pointer' }}
            />
          ))}
        </svg>

        {/* Tooltip */}
        {hovered && (
          <div
            className="absolute top-2 bg-slate-900 text-white text-[11px] rounded-lg px-2.5 py-1.5 shadow-lg whitespace-nowrap z-10 pointer-events-none"
            style={{
              left: `${(x(hoverIdx) / W) * 100}%`,
              transform: 'translateX(-50%)'
            }}
          >
            <p className="font-semibold">{hovered.label}</p>
            <p className="text-blue-300">Rs {formatMoney(hovered.PKR)}</p>
            <p className="text-emerald-300">$ {formatMoney(hovered.USD)}</p>
          </div>
        )}

        {/* X labels (start, mid, end) */}
        <div className="flex justify-between px-4 -mt-5 text-[10px] text-slate-400 font-medium">
          <span>{days[0].label}</span>
          <span>{days[Math.floor(days.length / 2)].label}</span>
          <span>{days[days.length - 1].label}</span>
        </div>
      </div>
    </div>
  );
}