import { useMemo } from 'react';
import { formatMoney } from '../../utils/formatters';

const TrendUp = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15" />
  </svg>
);
const TrendDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const Dash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export default function MonthComparison({ transactions = [], loading }) {
  const { thisMonth, lastMonth } = useMemo(() => {
    const now = new Date();
    const thisStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const lastStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const thisM = { PKR: 0, USD: 0 };
    const lastM = { PKR: 0, USD: 0 };

    transactions.forEach((t) => {
      const d = new Date(t.date);
      if (d >= thisStart && d < nextStart) thisM[t.currency] += t.amount;
      else if (d >= lastStart && d < thisStart) lastM[t.currency] += t.amount;
    });

    return { thisMonth: thisM, lastMonth: lastM };
  }, [transactions]);

  const pctChange = (now, prev) => {
    if (prev === 0 && now === 0) return null;
    if (prev === 0) return 100;
    return ((now - prev) / prev) * 100;
  };

  const rows = [
    {
      key: 'PKR',
      label: 'PKR',
      current: thisMonth.PKR,
      previous: lastMonth.PKR,
      color: 'text-blue-700',
      barColor: 'bg-blue-500'
    },
    {
      key: 'USD',
      label: 'USD',
      current: thisMonth.USD,
      previous: lastMonth.USD,
      color: 'text-emerald-600',
      barColor: 'bg-emerald-500'
    }
  ];

  if (loading) {
    return (
      <div className="card p-5">
        <div className="h-4 w-40 bg-slate-200/70 rounded animate-pulse" />
        <div className="mt-5 space-y-4">
          <div className="h-16 bg-slate-200/60 rounded-xl animate-pulse" />
          <div className="h-16 bg-slate-200/60 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="card p-5">
      <h3 className="text-sm font-bold text-slate-700">This month vs last</h3>
      <p className="text-xs text-slate-400 mt-0.5">Percentage change</p>

      <div className="mt-5 space-y-4">
        {rows.map((r) => {
          const pct = pctChange(r.current, r.previous);
          const isUp = pct !== null && pct > 0;
          const isDown = pct !== null && pct < 0;
          const isFlat = pct !== null && pct === 0;

          const barMax = Math.max(1, r.current, r.previous);
          const curPct = (r.current / barMax) * 100;
          const prevPct = (r.previous / barMax) * 100;

          return (
            <div key={r.key}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {r.label}
                </span>
                {pct === null ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                    <Dash /> —
                  </span>
                ) : isFlat ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                    <Dash /> 0%
                  </span>
                ) : (
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                      isUp ? 'text-red-600' : 'text-emerald-600'
                    }`}
                  >
                    {isUp ? <TrendUp /> : <TrendDown />}
                    {isUp ? '+' : ''}
                    {pct.toFixed(1)}%
                  </span>
                )}
              </div>

              {/* Bars */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 w-12 shrink-0">This</span>
                  <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className={`h-full ${r.barColor}`} style={{ width: `${curPct}%` }} />
                  </div>
                  <span className={`text-xs font-bold ${r.color} w-24 text-right`}>
                    {r.key === 'USD' ? '$' : 'Rs'} {formatMoney(r.current)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 w-12 shrink-0">Last</span>
                  <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-slate-300" style={{ width: `${prevPct}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-slate-500 w-24 text-right">
                    {r.key === 'USD' ? '$' : 'Rs'} {formatMoney(r.previous)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}