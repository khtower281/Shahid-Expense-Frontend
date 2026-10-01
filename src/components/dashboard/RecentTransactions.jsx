import { Link } from 'react-router-dom';
import { formatDate, formatMoney, currencySymbol } from '../../utils/formatters';
import Badge from '../ui/Badge';

export default function RecentTransactions({ transactions = [], loading }) {
  if (loading) {
    return (
      <div className="card p-5">
        <div className="h-4 w-40 bg-slate-200/70 rounded animate-pulse" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-200/70 animate-pulse" />
              <div className="flex-1">
                <div className="h-3 w-32 bg-slate-200/70 rounded animate-pulse" />
                <div className="h-3 w-20 bg-slate-200/60 rounded animate-pulse mt-1.5" />
              </div>
              <div className="h-4 w-16 bg-slate-200/70 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-700">Recent transactions</h3>
        <Link
          to="/transactions"
          className="text-xs font-semibold text-primary-600 hover:text-primary-700"
        >
          View all →
        </Link>
      </div>

      {transactions.length === 0 ? (
        <p className="text-sm text-slate-400 mt-4">No transactions yet.</p>
      ) : (
        <ul className="mt-4 divide-y divide-slate-100">
          {transactions.map((t) => (
            <li key={t._id} className="flex items-center gap-3 py-3">
              <span
                className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center text-white text-[11px] font-bold"
                style={{ backgroundColor: t.category?.color || '#94a3b8' }}
              >
                {(t.category?.name || '?').charAt(0).toUpperCase()}
              </span>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">
                  {t.description}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {formatDate(t.date)} · {t.category?.name || 'Uncategorized'}
                </p>
              </div>

              <div className="text-right shrink-0">
                <p
                  className={`text-sm font-bold ${
                    t.currency === 'USD' ? 'text-emerald-600' : 'text-blue-700'
                  }`}
                >
                  {currencySymbol(t.currency)} {formatMoney(t.amount)}
                </p>
                <div className="mt-1">
                  <Badge
                    color={t.status === 'Completed' ? 'green' : 'amber'}
                    size="xs"
                  >
                    {t.status}
                  </Badge>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}