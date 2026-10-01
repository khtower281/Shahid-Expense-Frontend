import { useEffect, useRef, useState } from 'react';

/**
 * Font sizes to try from largest to smallest (in rem).
 * The first one that fits the container wins.
 */
const FONT_SIZES = [
  '1.5rem',   // 24px — text-2xl
  '1.375rem', // 22px
  '1.25rem',  // 20px — text-xl
  '1.125rem', // 18px
  '1rem',     // 16px — text-base
  '0.9375rem',// 15px
  '0.875rem'  // 14px — text-sm
];

export default function KpiCard({
  label,
  value,
  sub,
  icon,
  tone = 'blue'
}) {
  const toneMap = {
    blue:    { grad: 'from-blue-500 to-blue-700',       ring: 'ring-blue-200',    text: 'text-blue-700' },
    emerald: { grad: 'from-emerald-500 to-emerald-700', ring: 'ring-emerald-200', text: 'text-emerald-700' },
    violet:  { grad: 'from-violet-500 to-violet-700',   ring: 'ring-violet-200',  text: 'text-violet-700' },
    amber:   { grad: 'from-amber-500 to-amber-600',     ring: 'ring-amber-200',   text: 'text-amber-700' }
  };
  const t = toneMap[tone];

  const valueRef = useRef(null);
  const [fontSize, setFontSize] = useState(FONT_SIZES[0]);

  /* Pick the biggest font size that fits the container width */
  useEffect(() => {
    const el = valueRef.current;
    if (!el) return;

    const fit = () => {
      const container = el.parentElement;
      if (!container) return;

      const availableWidth = container.clientWidth;

      /* Measure with a hidden span to avoid layout thrash on the visible node */
      const measurer = document.createElement('span');
      measurer.style.position = 'absolute';
      measurer.style.visibility = 'hidden';
      measurer.style.whiteSpace = 'nowrap';
      measurer.style.fontWeight = '800';
      measurer.style.fontFamily = getComputedStyle(el).fontFamily;
      measurer.style.letterSpacing = getComputedStyle(el).letterSpacing;
      measurer.textContent = String(value);
      document.body.appendChild(measurer);

      let chosen = FONT_SIZES[FONT_SIZES.length - 1];
      for (const size of FONT_SIZES) {
        measurer.style.fontSize = size;
        if (measurer.offsetWidth <= availableWidth) {
          chosen = size;
          break;
        }
      }

      document.body.removeChild(measurer);
      setFontSize(chosen);
    };

    fit();

    /* Re-fit if the container resizes */
    const container = el.parentElement;
    let observer;
    if (container && typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(fit);
      observer.observe(container);
    }

    return () => {
      if (observer) observer.disconnect();
    };
  }, [value]);

  return (
    <div className="card p-4 sm:p-5 relative overflow-hidden group hover:shadow-md transition-shadow">
      {/* Glow */}
      <div
        className={`absolute -top-10 -right-10 w-28 h-28 rounded-full bg-gradient-to-br ${t.grad} opacity-10 group-hover:opacity-20 transition-opacity`}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            {label}
          </p>

          <p
            ref={valueRef}
            className={`mt-2 font-extrabold ${t.text} leading-tight whitespace-nowrap`}
            style={{ fontSize }}
            title={String(value)}
          >
            {value}
          </p>

          {sub && (
            <p className="text-[11px] text-slate-400 mt-1 truncate">{sub}</p>
          )}
        </div>

        {icon && (
          <span
            className={`w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br ${t.grad} text-white flex items-center justify-center shadow-sm ring-1 ${t.ring}`}
          >
            {icon}
          </span>
        )}
      </div>
    </div>
  );
}