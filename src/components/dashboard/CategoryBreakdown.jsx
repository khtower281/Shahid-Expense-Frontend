import { useMemo } from 'react';
import { formatMoney, currencySymbol } from '../../utils/formatters';

export default function CategoryBreakdown({ transactions = [], loading }) {
  const rows = useMemo(() => {
    /* Group by category + currency */
    const map = new Map(); // key: `${catId}|${currency}`

    transactions.forEach((t) => {
      const key = `${t.category?._id || 'none'}|${t.currency}`;
      const prev = map.get(key) || {
        id: t.category?._id || 'none',
        name: t.category?.name || 'Uncategorized',
        color: t.category?.color || '#94a3b8',
        currency: t.currency,
        amount: 0
      };
      prev.amount += t.amount;
      map.set(key, prev);
    });

    /* Combine PKR and USD per category, keep currency separated */
    const groupedByCategory = new Map();
    map.forEach((v) => {
      const existing = groupedByCategory.get(v.id) || {
        id: v.id,
        name: v.name,
        color: v.color,
        PKR: 0,
        USD: 0
      };
      existing[v.currency] = v.amount;
      groupedByCategory.set(v.id, existing);
    });

    return Array.from(groupedByCategory.values())
      .map((r) => ({ ...r, total: (r.PKR || 0) + (r.USD || 0) }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
  }, [transactions]);

  const maxAmount = Math.max(1, ...rows.map((r) => r.total));

  if (loading) {
    return (
      <div className="card p-5">
        <div className="h-4 w-40 bg-slate-200/70 rounded animate-pulse" />
        <div className="mt-5 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i}>
              <div className="h-3 w-24 bg-slate-200/70 rounded animate-pulse" />
              <div className="h-2 mt-2 bg-slate-200/60 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card p-5">
      <h3 className="text-sm font-bold text-slate-700">Top categories</h3>
      <p className="text-xs text-slate-400 mt-0.5">Based on most recent 100 transactions</p>

      {rows.length === 0 ? (
        <p className="text-sm text-slate-400 mt-4">No data yet.</p>
      ) : (
        <div className="mt-5 space-y-4">
          {rows.map((r) => {
            const pct = (r.total / maxAmount) * 100;
            const pkrPct = r.total ? (r.PKR / r.total) * 100 : 0;
            const usdPct = 100 - pkrPct;
            return (
              <div key={r.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: r.color }}
                    />
                    <span className="truncate">{r.name}</span>
                  </span>
                  <span className="text-xs text-slate-500 shrink-0 ml-2">
                    {r.PKR > 0 && <>Rs {formatMoney(r.PKR)}</>}
                    {r.PKR > 0 && r.USD > 0 && ' · '}
                    {r.USD > 0 && <>$ {formatMoney(r.USD)}</>}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden flex">
                  {r.PKR > 0 && (
                    <div
                      className="bg-blue-500"
                      style={{ width: `${(pct * pkrPct) / 100}%` }}
                    />
                  )}
                  {r.USD > 0 && (
                    <div
                      className="bg-emerald-500"
                      style={{ width: `${(pct * usdPct) / 100}%` }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}