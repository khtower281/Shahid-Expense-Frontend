import { useMemo } from 'react';
import { computeRange } from '../../utils/dateRanges';
import Select from '../ui/Select';

/* Preset options shown in the left dropdown */
const PRESET_OPTIONS = [
  { value: '7d',     label: 'Last 7 Days' },
  { value: '30d',    label: 'Last 30 Days' },
  { value: 'month',  label: 'This Month' },
  { value: 'year',   label: 'This Year' },
  { value: 'all',    label: 'All Time' },
  { value: 'custom', label: 'Custom Range' }
];

export default function RangePicker({
  value,
  onChange,
  customStart,
  customEnd,
  onCustomChange
}) {
  const showCustom = value === 'custom';

  const preview = useMemo(() => {
    if (showCustom) {
      if (customStart && customEnd) return `${customStart} → ${customEnd}`;
      return 'Pick start and end dates';
    }
    if (value === 'all') return 'Every transaction';
    const r = computeRange(value);
    if (!r.startDate) return '';
    return `${r.startDate} → ${r.endDate}`;
  }, [value, showCustom, customStart, customEnd]);

  const effectiveStart = showCustom ? customStart : computeRange(value).startDate;
  const effectiveEnd = showCustom ? customEnd : computeRange(value).endDate;

  return (
    <div className="card p-3 sm:p-4 mb-5">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        {/* Left: preset dropdown */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap">
            Filters
          </span>
          <div className="w-44">
            <Select
              value={value}
              onChange={onChange}
              options={PRESET_OPTIONS}
              size="md"
            />
          </div>
        </div>

        {/* Right: always-visible date range */}
        <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2 lg:justify-end">
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={effectiveStart}
              onChange={(e) => {
                onCustomChange({
                  startDate: e.target.value,
                  endDate: effectiveEnd
                });
                if (!showCustom) onChange('custom');
              }}
              className="input py-2 text-sm w-full sm:w-40"
              max={effectiveEnd || undefined}
              aria-label="Start date"
            />
            <span className="text-slate-400 text-xs shrink-0">to</span>
            <input
              type="date"
              value={effectiveEnd}
              onChange={(e) => {
                onCustomChange({
                  startDate: effectiveStart,
                  endDate: e.target.value
                });
                if (!showCustom) onChange('custom');
              }}
              className="input py-2 text-sm w-full sm:w-40"
              min={effectiveStart || undefined}
              aria-label="End date"
            />
          </div>
        </div>
      </div>
    </div>
  );
}