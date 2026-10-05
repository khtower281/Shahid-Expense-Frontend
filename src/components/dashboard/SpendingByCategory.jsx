import { Link } from 'react-router-dom';
import { formatMoney } from '../../utils/formatters';

export default function SpendingByCategory({ data = [], loading }) {
  const grandTotal = data.reduce((s, r) => s + r.total, 0) || 1;
  const maxAmount = Math.max(1, ...data.map((r) => r.total));

  const rows = data.map((r) => ({
    ...r,
    percent: (r.total / grandTotal) * 100
  }));

  if (loading) {
    return (
      <div className="card p-5 w-full flex flex-col">
        <div className="h-4 w-40 bg-slate-200/70 rounded animate-pulse" />
        <div className="h-3 w-32 bg-slate-200/60 rounded animate-pulse mt-2" />
        <div className="mt-5 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i}>
              <div className="h-3 w-32 bg-slate-200/70 rounded animate-pulse" />
              <div className="h-2 mt-2 bg-slate-200/60 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card p-5 w-full flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h3 className="text-base font-bold text-slate-800">Spending by Category</h3>
          <p className="text-xs text-slate-400 mt-0.5">Where your money is going</p>
        </div>
        <Link
          to="/categories"
          className="text-xs font-semibold text-primary-600 hover:text-primary-700 whitespace-nowrap"
        >
          Manage →
        </Link>
      </div>

      {/* Rows — fills remaining height */}
      <div className="flex-1">
        {rows.length === 0 ? (
          <p className="text-sm text-slate-400 py-6 text-center">No data yet.</p>
        ) : (
          <div className="space-y-4">
            {rows.map((r) => {
              const barWidth = (r.total / maxAmount) * 100;
              return (
                <div key={r.categoryId || 'none'}>
                  <div className="flex items-center justify-between gap-3 mb-1.5">
                    <span className="inline-flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: r.color }}
                      />
                      <span className="text-sm font-medium text-slate-800 truncate">
                        {r.name}
                      </span>
                      <span className="text-xs text-slate-400 shrink-0">
                        {r.count} txn
                      </span>
                    </span>
                    <span className="text-sm font-bold text-slate-800 whitespace-nowrap">
                      Rs {formatMoney(r.total)}
                      <span className="text-xs font-medium text-slate-400 ml-2">
                        {r.percent.toFixed(0)}%
                      </span>
                    </span>
                  </div>

                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${barWidth}%`,
                        backgroundColor: r.color
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}