import { formatMoney, paymentMethodLabel } from '../../utils/formatters';

const ICONS = {
  Cash: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  ),
  Card: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
      <line x1="6" y1="15" x2="10" y2="15" />
    </svg>
  ),
  Check: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16v16H4z" />
      <path d="M8 12l3 3 5-6" />
    </svg>
  )
};

const COLORS = {
  Cash: '#10b981',
  Card: '#3b82f6',
  Check: '#f59e0b'
};

export default function PaymentMethodsList({ data = [], loading }) {
  const rows = ['Cash', 'Card', 'Check'].map((method) => {
    const found = data.find((d) => d.method === method) || { total: 0, count: 0 };
    return { method, total: found.total, count: found.count };
  });

  const grandTotal = rows.reduce((s, r) => s + r.total, 0) || 1;
  const withPercent = rows.map((r) => ({
    ...r,
    percent: (r.total / grandTotal) * 100
  }));

  const hasData = withPercent.some((r) => r.count > 0);

  if (loading) {
    return (
      <div className="card p-5 w-full flex flex-col">
        <div className="h-4 w-36 bg-slate-200/70 rounded animate-pulse" />
        <div className="h-3 w-28 bg-slate-200/60 rounded animate-pulse mt-2" />
        <div className="mt-5 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 bg-slate-200/50 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card p-5 w-full flex flex-col">
      <div className="mb-5">
        <h3 className="text-base font-bold text-slate-800">Payment Methods</h3>
        <p className="text-xs text-slate-400 mt-0.5">How you paid</p>
      </div>

      <div className="flex-1">
        {!hasData ? (
          <p className="text-sm text-slate-400 py-6 text-center">No data yet.</p>
        ) : (
          <div className="space-y-5">
            {withPercent.map((r) => (
              <div key={r.method}>
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center gap-2.5">
                    <span
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{
                        backgroundColor: `${COLORS[r.method]}1A`,
                        color: COLORS[r.method]
                      }}
                    >
                      {ICONS[r.method]}
                    </span>
                    <span className="text-sm font-semibold text-slate-700">
                      {paymentMethodLabel(r.method)}
                    </span>
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    {r.percent.toFixed(0)}%
                  </span>
                </div>

                <p className="text-lg font-extrabold text-slate-800 mb-2">
                  Rs {formatMoney(r.total)}
                </p>

                <div className="h-2 rounded-full bg-slate-100 overflow-hidden mb-1.5">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${r.percent}%`,
                      backgroundColor: COLORS[r.method]
                    }}
                  />
                </div>

                <p className="text-[11px] text-slate-400">
                  {r.count} transaction{r.count === 1 ? '' : 's'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}