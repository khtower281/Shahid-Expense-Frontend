import { useMemo, useState } from 'react';
import { formatMoney } from '../../utils/formatters';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function MonthlyChart({ data = [], year, loading }) {
  const [hover, setHover] = useState(null);

  const { maxValue, bars } = useMemo(() => {
    const max = Math.max(
      1,
      ...data.flatMap((m) => [m.PKR || 0, m.USD || 0])
    );
    return { maxValue: max, bars: data };
  }, [data]);

  const totalPKR = data.reduce((s, m) => s + (m.PKR || 0), 0);
  const totalUSD = data.reduce((s, m) => s + (m.USD || 0), 0);

  if (loading) {
    return (
      <div className="card p-5">
        <div className="h-4 w-40 bg-slate-200/70 rounded animate-pulse" />
        <div className="h-4 w-24 bg-slate-200/70 rounded animate-pulse mt-2" />
        <div className="mt-6 h-56 flex items-end gap-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 bg-slate-200/60 rounded animate-pulse"
              style={{ height: `${20 + Math.random() * 60}%` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-700">Monthly spending</h3>
          <p className="text-xs text-slate-400 mt-0.5">{year}</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="inline-flex items-center gap-1.5 text-slate-500">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-600" /> PKR
          </span>
          <span className="inline-flex items-center gap-1.5 text-slate-500">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> USD
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="mt-5 select-none">
        <div className="grid grid-cols-12 gap-1 sm:gap-2 h-56">
          {bars.map((m, i) => {
            const pkrH = (m.PKR / maxValue) * 100;
            const usdH = (m.USD / maxValue) * 100;
            const isHover = hover === i;
            return (
              <div
                key={m.month}
                className="relative flex items-end justify-center group"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              >
                {/* Tooltip */}
                {isHover && (
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full bg-slate-900 text-white text-[11px] rounded-lg px-2.5 py-1.5 whitespace-nowrap shadow-lg z-10">
                    <p className="font-semibold">{MONTHS[m.month - 1]}</p>
                    <p className="text-blue-300">Rs {formatMoney(m.PKR)}</p>
                    <p className="text-emerald-300">$ {formatMoney(m.USD)}</p>
                  </div>
                )}

                <div className="w-full flex items-end justify-center gap-0.5 sm:gap-1">
                  <div
                    className={`w-2 sm:w-3 rounded-t-md transition-all ${
                      isHover ? 'bg-blue-700' : 'bg-blue-500'
                    }`}
                    style={{ height: `${Math.max(2, pkrH)}%` }}
                  />
                  <div
                    className={`w-2 sm:w-3 rounded-t-md transition-all ${
                      isHover ? 'bg-emerald-600' : 'bg-emerald-400'
                    }`}
                    style={{ height: `${Math.max(2, usdH)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* X labels */}
        <div className="grid grid-cols-12 gap-1 sm:gap-2 mt-2">
          {bars.map((m) => (
            <div key={m.month} className="text-center text-[10px] text-slate-400 font-medium">
              {MONTHS[m.month - 1]}
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Total PKR
          </p>
          <p className="text-base sm:text-lg font-extrabold text-blue-700 mt-0.5">
            Rs {formatMoney(totalPKR)}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Total USD
          </p>
          <p className="text-base sm:text-lg font-extrabold text-emerald-600 mt-0.5">
            $ {formatMoney(totalUSD)}
          </p>
        </div>
      </div>
    </div>
  );
}