import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Unified custom dropdown rendered in a portal so it can never be
 * clipped by a parent's `overflow-hidden`.
 */
export default function Select({
  value,
  onChange,
  options = [],
  placeholder = 'Select…',
  disabled = false,
  size = 'md',
  className = '',
  id
}) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const [menuRect, setMenuRect] = useState(null);
  const [placement, setPlacement] = useState('bottom'); // bottom | top

  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const selected = options.find((o) => o.value === value) || null;

  /* ---------- Position calculation ---------- */
  const updatePosition = () => {
    const trigger = triggerRef.current;
    const menu = menuRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const viewportH = window.innerHeight;
    const viewportW = window.innerWidth;
    const menuH = menu?.offsetHeight || 260; // fallback
    const gap = 4;

    /* Prefer bottom; flip to top if not enough space */
    const spaceBelow = viewportH - rect.bottom;
    const spaceAbove = rect.top;
    const shouldFlip = spaceBelow < menuH + gap && spaceAbove > spaceBelow;

    const maxHeight = shouldFlip
      ? Math.max(120, spaceAbove - gap - 8)
      : Math.max(120, spaceBelow - gap - 8);

    /* Keep within horizontal viewport */
    const left = Math.min(
      Math.max(8, rect.left),
      viewportW - rect.width - 8
    );

    setPlacement(shouldFlip ? 'top' : 'bottom');
    setMenuRect({
      top: shouldFlip ? rect.top - gap - Math.min(menuH, maxHeight) : rect.bottom + gap,
      left,
      width: rect.width,
      maxHeight
    });
  };

  /* Recompute on open + on scroll/resize */
  useLayoutEffect(() => {
    if (!open) return;

    updatePosition();
    /* Trigger again after menu renders to measure real height */
    const raf = requestAnimationFrame(updatePosition);

    const onScrollOrResize = () => updatePosition();
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, options.length]);

  /* ---------- Close on outside click ---------- */
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      const inTrigger = triggerRef.current?.contains(e.target);
      const inMenu = menuRef.current?.contains(e.target);
      if (!inTrigger && !inMenu) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  /* ---------- Keyboard nav ---------- */
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlight((h) => Math.min(h + 1, options.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlight((h) => Math.max(h - 1, 0));
      } else if (e.key === 'Enter' && highlight >= 0) {
        e.preventDefault();
        const opt = options[highlight];
        if (opt && !opt.disabled) {
          onChange(opt.value);
          setOpen(false);
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, highlight, options, onChange]);

  /* ---------- Reset highlight on open ---------- */
  useEffect(() => {
    if (open) {
      const idx = options.findIndex((o) => o.value === value);
      setHighlight(idx >= 0 ? idx : 0);
    }
  }, [open, options, value]);

  const sizeClasses = {
    sm: 'py-1.5 text-xs',
    md: 'py-2 text-sm'
  };

  return (
    <>
      {/* ---------- Trigger ---------- */}
      <button
        id={id}
        type="button"
        ref={triggerRef}
        disabled={disabled}
        onClick={() => !disabled && setOpen((s) => !s)}
        className={`w-full rounded-lg border bg-white text-left flex items-center justify-between gap-2 outline-none transition
          ${sizeClasses[size]} px-3
          ${
            open
              ? 'border-primary-500 ring-2 ring-primary-200'
              : 'border-slate-300 hover:border-slate-400'
          }
          ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
          ${className}
        `}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 min-w-0 flex-1">
          {selected ? (
            <>
              {selected.color && (
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: selected.color }}
                />
              )}
              <span className="truncate text-slate-800">{selected.label}</span>
            </>
          ) : (
            <span className="truncate text-slate-400">{placeholder}</span>
          )}
        </span>

        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`shrink-0 text-slate-400 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* ---------- Menu (portal) ---------- */}
      {open &&
        menuRect &&
        createPortal(
          <ul
            role="listbox"
            ref={menuRef}
            style={{
              position: 'fixed',
              top: menuRect.top,
              left: menuRect.left,
              width: menuRect.width,
              maxHeight: menuRect.maxHeight,
              zIndex: 9999
            }}
            className="overflow-y-auto rounded-xl bg-white border border-slate-200 shadow-xl ring-1 ring-slate-200/50 py-1 animate-fade-up"
          >
            {options.length === 0 && (
              <li className="px-4 py-3 text-sm text-slate-400 text-center">
                No options
              </li>
            )}

            {options.map((opt, i) => {
              const isSelected = opt.value === value;
              const isHighlighted = i === highlight;
              return (
                <li key={opt.value ?? i}>
                  <button
                    type="button"
                    disabled={opt.disabled}
                    onMouseEnter={() => setHighlight(i)}
                    onClick={() => {
                      if (opt.disabled) return;
                      onChange(opt.value);
                      setOpen(false);
                    }}
                    role="option"
                    aria-selected={isSelected}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-left transition
                      ${
                        isSelected
                          ? 'bg-primary-50 text-primary-700 font-semibold'
                          : isHighlighted
                          ? 'bg-slate-50 text-slate-800'
                          : 'text-slate-700'
                      }
                      ${opt.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    {opt.color && (
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: opt.color }}
                      />
                    )}
                    <span className="flex-1 truncate">{opt.label}</span>
                    {opt.hint && (
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        {opt.hint}
                      </span>
                    )}
                    {isSelected && !opt.hint && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>,
          document.body
        )}
    </>
  );
}