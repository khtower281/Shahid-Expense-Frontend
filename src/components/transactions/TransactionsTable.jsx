import { TransactionTableRow, TransactionMobileCard } from './TransactionRow';

const COLUMNS = [
  { key: 'date', label: 'Date', sortable: true },
  { key: 'description', label: 'Description', sortable: false },
  { key: 'category', label: 'Category', sortable: false },
  { key: 'amount', label: 'Amount', sortable: true, align: 'right' },
  { key: 'status', label: 'Status', sortable: false },
  { key: 'paymentMethod', label: 'Payment', sortable: false },
  { key: 'actions', label: '', sortable: false, align: 'right' }
];

export default function TransactionsTable({
  transactions,
  selected,
  onToggle,
  onToggleAll,
  onEdit,
  onDelete,
  onView,
  sortBy,
  order,
  onSort
}) {
  const allSelected =
    transactions.length > 0 && transactions.every((t) => selected.includes(t._id));
  const someSelected = selected.length > 0 && !allSelected;

  return (
    <>
      {/* -------------------- Desktop table -------------------- */}
      <div className="hidden md:block card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="table-th w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onChange={(e) =>
                      onToggleAll(e.target.checked ? transactions.map((t) => t._id) : [])
                    }
                    className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    aria-label="Select all"
                  />
                </th>
                {COLUMNS.map((col) => {
                  const isActive = sortBy === col.key;
                  return (
                    <th
                      key={col.key}
                      className={`table-th ${col.align === 'right' ? 'text-right' : ''}`}
                    >
                      {col.sortable ? (
                        <button
                          type="button"
                          onClick={() =>
                            onSort(col.key, isActive && order === 'desc' ? 'asc' : 'desc')
                          }
                          className="inline-flex items-center gap-1 hover:text-slate-700 transition"
                        >
                          {col.label}
                          <span className="text-[10px] leading-none">
                            {isActive ? (order === 'asc' ? '▲' : '▼') : '⇅'}
                          </span>
                        </button>
                      ) : (
                        col.label
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <TransactionTableRow
                  key={t._id}
                  transaction={t}
                  selected={selected.includes(t._id)}
                  onToggle={onToggle}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onView={onView}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* -------------------- Mobile cards -------------------- */}
      <div className="md:hidden space-y-3">
        <div className="flex items-center justify-between px-1">
          <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
            <input
              type="checkbox"
              checked={allSelected}
              ref={(el) => {
                if (el) el.indeterminate = someSelected;
              }}
              onChange={(e) =>
                onToggleAll(e.target.checked ? transactions.map((t) => t._id) : [])
              }
              className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
            />
            Select all on this page
          </label>
          {selected.length > 0 && (
            <span className="text-xs text-primary-600 font-semibold">
              {selected.length} selected
            </span>
          )}
        </div>

        {transactions.map((t) => (
          <TransactionMobileCard
            key={t._id}
            transaction={t}
            selected={selected.includes(t._id)}
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
            onView={onView}
          />
        ))}
      </div>
    </>
  );
}