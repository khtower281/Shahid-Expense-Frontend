import { Link } from 'react-router-dom';
import { formatDate, formatMoney, paymentMethodLabel } from '../../utils/formatters';

const statusTone = (s) =>
  s === 'Completed'
    ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
    : 'bg-amber-50 text-amber-700 ring-amber-200';

export default function RecentTransactions({ transactions = [], loading }) {
  if (loading) {
    return (
      <div className="card p-5">
        <div className="h-4 w-40 bg-slate-200/70 rounded animate-pulse" />
        <div className="h-3 w-32 bg-slate-200/60 rounded animate-pulse mt-2" />
        <div className="mt-5 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <div className="w-10 h-10 rounded-xl bg-slate-200/70 animate-pulse" />
              <div className="flex-1">
                <div className="h-3 w-40 bg-slate-200/70 rounded animate-pulse" />
                <div className="h-3 w-52 bg-slate-200/60 rounded animate-pulse mt-2" />
              </div>
              <div className="h-4 w-20 bg-slate-200/70 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <h3 className="text-base font-bold text-slate-800">Recent Transactions</h3>
          <p className="text-xs text-slate-400 mt-0.5">Latest 5 in the selected period</p>
        </div>
        <Link
          to="/transactions"
          className="text-xs font-semibold text-primary-600 hover:text-primary-700 whitespace-nowrap"
        >
          View all →
        </Link>
      </div>

      {transactions.length === 0 ? (
        <p className="text-sm text-slate-400 py-6 text-center">No transactions yet.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {transactions.map((t) => {
            const color = t.category?.color || '#64748b';
            const txnNumber = t._id ? `#${t._id.slice(-4)}` : '';

            return (
              <li key={t._id} className="flex items-center gap-3 sm:gap-4 py-3.5">
                <span
                  className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center"
                  style={{ backgroundColor: `${color}1A` }}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                </span>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {t.description}
                  </p>

                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs text-slate-500">
                      {t.category?.name || 'Uncategorized'}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs text-slate-500">
                      {formatDate(t.date)}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs text-slate-500">
                      {paymentMethodLabel(t.paymentMethod)}
                    </span>

                    <span
                      className={`ml-1 text-[10px] font-semibold uppercase tracking-wide rounded-full px-2 py-0.5 ring-1 ${statusTone(t.status)}`}
                    >
                      {t.status}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p
                    className={`text-sm font-bold ${
                      t.currency === 'USD' ? 'text-emerald-600' : 'text-slate-800'
                    }`}
                  >
                    {t.currency === 'USD' ? '$' : 'Rs'} {formatMoney(t.amount)}
                  </p>
                  {txnNumber && (
                    <p className="text-[11px] text-slate-400 mt-0.5">{txnNumber}</p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}