import { useMemo } from 'react';

export default function PaymentMethods({ transactions = [], loading }) {
  const { segments, total } = useMemo(() => {
    const counts = { Cash: 0, Card: 0, Check: 0 };
    transactions.forEach((t) => {
      if (counts[t.paymentMethod] !== undefined) counts[t.paymentMethod] += 1;
    });
    const totalCount = Object.values(counts).reduce((s, v) => s + v, 0);

    const colors = { Cash: '#3b82f6', Card: '#a855f7', Check: '#f59e0b' };
    let acc = 0;
    const segs = Object.entries(counts).map(([k, v]) => {
      const start = totalCount ? acc / totalCount : 0;
      acc += v;
      const end = totalCount ? acc / totalCount : 0;
      return {
        key: k,
        value: v,
        color: colors[k],
        start,
        end,
        pct: totalCount ? Math.round((v / totalCount) * 100) : 0
      };
    });
    return { segments: segs, total: totalCount };
  }, [transactions]);

  const size = 140;
  const stroke = 22;
  const radius = (size - stroke) / 2;
  const C = 2 * Math.PI * radius;

  if (loading) {
    return (
      <div className="card p-5">
        <div className="h-4 w-32 bg-slate-200/70 rounded animate-pulse" />
        <div className="mt-4 flex items-center justify-center">
          <div className="w-32 h-32 rounded-full bg-slate-200/60 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="card p-5">
      <h3 className="text-sm font-bold text-slate-700">Payment methods</h3>
      <p className="text-xs text-slate-400 mt-0.5">In selected range</p>

      <div className="mt-4 flex items-center justify-center">
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="-rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth={stroke}
            />
            {total > 0 &&
              segments.map((s) =>
                s.value > 0 ? (
                  <circle
                    key={s.key}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={s.color}
                    strokeWidth={stroke}
                    strokeDasharray={`${(s.end - s.start) * C} ${C}`}
                    strokeDashoffset={-s.start * C}
                    strokeLinecap="butt"
                  />
                ) : null
              )}
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-extrabold text-slate-800">{total}</span>
            <span className="text-[11px] text-slate-400 font-medium">payments</span>
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-2">
        {segments.map((s) => (
          <div key={s.key} className="flex items-center justify-between text-sm">
            <span className="inline-flex items-center gap-2 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
              {s.key}
            </span>
            <span className="font-semibold text-slate-800">
              {s.value}
              <span className="text-slate-400 font-normal ml-1">({s.pct}%)</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}