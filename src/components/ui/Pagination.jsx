import Select from './Select';

const PER_PAGE_OPTIONS = [5, 10, 20, 50, 100].map((n) => ({
  value: n,
  label: `${n} / page`
}));

export default function Pagination({
  currentPage,
  totalPages,
  totalCount,
  limit,
  onPageChange,
  onLimitChange
}) {
  if (totalCount === 0) return null;

  const start = (currentPage - 1) * limit + 1;
  const end = Math.min(currentPage * limit, totalCount);

  const pages = [];
  const push = (n) => { if (!pages.includes(n) && n >= 1 && n <= totalPages) pages.push(n); };
  push(1);
  for (let p = currentPage - 1; p <= currentPage + 1; p++) push(p);
  push(totalPages);
  pages.sort((a, b) => a - b);

  const rendered = [];
  let prev = 0;
  pages.forEach((p) => {
    if (p - prev > 1) rendered.push('…');
    rendered.push(p);
    prev = p;
  });

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
      <p className="text-xs text-slate-500 order-2 sm:order-1">
        Showing <span className="font-semibold text-slate-700">{start}</span>
        –<span className="font-semibold text-slate-700">{end}</span> of{' '}
        <span className="font-semibold text-slate-700">{totalCount}</span>
      </p>

      <div className="flex items-center gap-2 order-1 sm:order-2">
        <div className="w-32">
          <Select
            value={limit}
            onChange={onLimitChange}
            options={PER_PAGE_OPTIONS}
            size="sm"
          />
        </div>

        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Previous page"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div className="hidden sm:flex items-center gap-1">
          {rendered.map((p, i) =>
            p === '…' ? (
              <span key={`e${i}`} className="px-2 text-slate-400 text-sm">…</span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                className={`min-w-[34px] h-8 rounded-lg text-sm font-medium transition ${
                  p === currentPage
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {p}
              </button>
            )
          )}
        </div>

        <span className="sm:hidden text-xs text-slate-500 px-1">
          {currentPage} / {totalPages}
        </span>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Next page"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}