import { useMemo, useState } from 'react';
import Select from '../ui/Select';
import { paymentMethodLabel } from '../../utils/formatters';

export default function FiltersBar({ filters, onChange, categories, onReset }) {
  const [open, setOpen] = useState(false);

  const update = (key, value) => onChange({ ...filters, [key]: value });

  const categoryOptions = useMemo(
    () => [
      { value: '', label: 'All categories' },
      ...categories.map((c) => ({
        value: c._id,
        label: c.name,
        color: c.color
      }))
    ],
    [categories]
  );

  const statusOptions = [
    { value: '', label: 'All statuses' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Completed', label: 'Completed' }
  ];

  const paymentOptions = [
    { value: '', label: 'All methods' },
    { value: 'Cash', label: paymentMethodLabel('Cash') },
    { value: 'Card', label: paymentMethodLabel('Card') },
    { value: 'Check', label: paymentMethodLabel('Check') }
  ];

  const currencyOptions = [
    { value: '', label: 'All currencies' },
    { value: 'PKR', label: 'PKR' },
    { value: 'USD', label: 'USD' }
  ];

  const advancedActiveCount = useMemo(() => {
    let n = 0;
    if (filters.startDate) n++;
    if (filters.endDate) n++;
    if (filters.category) n++;
    if (filters.status) n++;
    if (filters.paymentMethod) n++;
    if (filters.currency) n++;
    if (filters.minAmount) n++;
    if (filters.maxAmount) n++;
    return n;
  }, [filters]);

  const totalActive = advancedActiveCount + (filters.search ? 1 : 0);

  return (
    <div className="card mb-5 overflow-hidden">
      {/* Top row: search + toggles */}
      <div className="p-3 sm:p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => update('search', e.target.value)}
            placeholder="Search description…"
            className="input pl-10"
          />
        </div>

        <button
          type="button"
          onClick={() => setOpen((s) => !s)}
          className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold border transition whitespace-nowrap ${
            open
              ? 'bg-primary-50 border-primary-200 text-primary-700'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
          aria-expanded={open}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          Filters
          {advancedActiveCount > 0 && (
            <span className="text-[10px] font-bold rounded-full bg-primary-600 text-white px-1.5 py-0.5 min-w-[18px] text-center">
              {advancedActiveCount}
            </span>
          )}
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform ${open ? 'rotate-180' : ''}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {totalActive > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition whitespace-nowrap"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            Clear
          </button>
        )}
      </div>

      {/* Collapsible advanced panel */}
      <div
        className={`grid transition-all duration-300 ease-out ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-slate-100 px-3 sm:px-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="label">Category</label>
                <Select
                  value={filters.category}
                  onChange={(v) => update('category', v)}
                  options={categoryOptions}
                />
              </div>

              <div>
                <label className="label">Status</label>
                <Select
                  value={filters.status}
                  onChange={(v) => update('status', v)}
                  options={statusOptions}
                />
              </div>

              <div>
                <label className="label">Payment</label>
                <Select
                  value={filters.paymentMethod}
                  onChange={(v) => update('paymentMethod', v)}
                  options={paymentOptions}
                />
              </div>

              <div>
                <label className="label">Currency</label>
                <Select
                  value={filters.currency}
                  onChange={(v) => update('currency', v)}
                  options={currencyOptions}
                />
              </div>

              <div>
                <label className="label">From date</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => update('startDate', e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label className="label">To date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => update('endDate', e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label className="label">Min amount</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={filters.minAmount}
                  onChange={(e) => update('minAmount', e.target.value)}
                  placeholder="0"
                  className="input"
                />
              </div>

              <div>
                <label className="label">Max amount</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={filters.maxAmount}
                  onChange={(e) => update('maxAmount', e.target.value)}
                  placeholder="Any"
                  className="input"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active filter chips */}
      {advancedActiveCount > 0 && (
        <div className="border-t border-slate-100 px-3 sm:px-4 py-3 flex flex-wrap gap-2">
          <Chip
            label={`Category: ${categories.find((c) => c._id === filters.category)?.name || '—'}`}
            onRemove={() => update('category', '')}
            show={Boolean(filters.category)}
          />
          <Chip
            label={`Status: ${filters.status}`}
            onRemove={() => update('status', '')}
            show={Boolean(filters.status)}
          />
          <Chip
            label={`Payment: ${paymentMethodLabel(filters.paymentMethod)}`}
            onRemove={() => update('paymentMethod', '')}
            show={Boolean(filters.paymentMethod)}
          />
          <Chip
            label={`Currency: ${filters.currency}`}
            onRemove={() => update('currency', '')}
            show={Boolean(filters.currency)}
          />
          <Chip
            label={`From: ${filters.startDate}`}
            onRemove={() => update('startDate', '')}
            show={Boolean(filters.startDate)}
          />
          <Chip
            label={`To: ${filters.endDate}`}
            onRemove={() => update('endDate', '')}
            show={Boolean(filters.endDate)}
          />
          <Chip
            label={`Min: ${filters.minAmount}`}
            onRemove={() => update('minAmount', '')}
            show={Boolean(filters.minAmount)}
          />
          <Chip
            label={`Max: ${filters.maxAmount}`}
            onRemove={() => update('maxAmount', '')}
            show={Boolean(filters.maxAmount)}
          />
        </div>
      )}
    </div>
  );
}

function Chip({ label, onRemove, show }) {
  if (!show) return null;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200 pl-3 pr-1 py-1 text-xs font-medium text-slate-700">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="p-0.5 rounded-full hover:bg-slate-200 text-slate-500"
        aria-label={`Remove ${label}`}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </span>
  );
}