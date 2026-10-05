import Badge from '../ui/Badge';
import { formatDate, formatMoney, currencySymbol, paymentMethodLabel } from '../../utils/formatters';

const statusTone = (s) => (s === 'Completed' ? 'green' : 'amber');
const currencyTone = (c) => (c === 'USD' ? 'green' : 'blue');

/* -------------------- Desktop row -------------------- */
export function TransactionTableRow({
  transaction: t,
  selected,
  onToggle,
  onEdit,
  onDelete,
  onView
}) {
  return (
    <tr className={`hover:bg-slate-50/70 transition ${selected ? 'bg-primary-50/60' : ''}`}>
      <td className="table-td w-10">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggle(t._id)}
          className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
          aria-label="Select transaction"
        />
      </td>

      <td className="table-td whitespace-nowrap">
        <span className="font-medium text-slate-700">{formatDate(t.date)}</span>
      </td>

      <td className="table-td max-w-xs">
        <p className="truncate text-slate-800 font-medium" title={t.description}>
          {t.description}
        </p>
      </td>

      <td className="table-td whitespace-nowrap">
        {t.category ? (
          <span className="inline-flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: t.category.color }}
            />
            <span className="text-slate-700">{t.category.name}</span>
          </span>
        ) : (
          <span className="text-slate-400">—</span>
        )}
      </td>

      <td className="table-td text-right whitespace-nowrap">
        <span
          className={`font-bold ${
            t.currency === 'USD' ? 'text-emerald-600' : 'text-blue-700'
          }`}
        >
          {currencySymbol(t.currency)} {formatMoney(t.amount)}
        </span>
      </td>

      <td className="table-td whitespace-nowrap">
        <Badge color={statusTone(t.status)}>{t.status}</Badge>
      </td>

      <td className="table-td whitespace-nowrap">
        <span className="text-slate-600 text-sm">
          {paymentMethodLabel(t.paymentMethod)}
        </span>
      </td>

      <td className="table-td text-right whitespace-nowrap">
        <div className="inline-flex items-center gap-1">
          <button
            type="button"
            onClick={() => onView(t)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            aria-label="View"
            title="View"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => onEdit(t)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition"
            aria-label="Edit"
            title="Edit"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => onDelete(t)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
            aria-label="Delete"
            title="Delete"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
}

/* -------------------- Mobile card -------------------- */
export function TransactionMobileCard({
  transaction: t,
  selected,
  onToggle,
  onEdit,
  onDelete,
  onView
}) {
  return (
    <div className={`card p-4 ${selected ? 'ring-2 ring-primary-400' : ''}`}>
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggle(t._id)}
          className="mt-1 w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
          aria-label="Select transaction"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold text-slate-800 truncate">
              {t.description}
            </p>
            <span
              className={`font-bold whitespace-nowrap ${
                t.currency === 'USD' ? 'text-emerald-600' : 'text-blue-700'
              }`}
            >
              {currencySymbol(t.currency)} {formatMoney(t.amount)}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge color={statusTone(t.status)} size="xs">
              {t.status}
            </Badge>
            <Badge color={currencyTone(t.currency)} size="xs">
              {t.currency}
            </Badge>
            {t.category && (
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: t.category.color }}
                />
                {t.category.name}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
            <span>{formatDate(t.date)}</span>
            <span>{paymentMethodLabel(t.paymentMethod)}</span>
          </div>

          <div className="flex items-center gap-1 mt-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => onView(t)}
              className="flex-1 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              View
            </button>
            <button
              type="button"
              onClick={() => onEdit(t)}
              className="flex-1 py-2 text-xs font-semibold text-primary-600 hover:bg-primary-50 rounded-lg transition"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => onDelete(t)}
              className="flex-1 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}