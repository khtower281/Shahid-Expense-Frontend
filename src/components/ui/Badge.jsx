export default function Badge({ children, color = 'slate', size = 'sm' }) {
  const palette = {
    slate:   'bg-slate-100 text-slate-700 ring-slate-200',
    blue:    'bg-blue-50 text-blue-700 ring-blue-200',
    green:   'bg-emerald-50 text-emerald-700 ring-emerald-200',
    amber:   'bg-amber-50 text-amber-700 ring-amber-200',
    red:     'bg-red-50 text-red-700 ring-red-200',
    violet:  'bg-violet-50 text-violet-700 ring-violet-200',
    sky:     'bg-sky-50 text-sky-700 ring-sky-200'
  };

  const sizeClass = size === 'xs' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold ring-1 ${palette[color]} ${sizeClass}`}
    >
      {children}
    </span>
  );
}