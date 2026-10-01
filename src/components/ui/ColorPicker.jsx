const PRESETS = [
  '#EF4444', // red
  '#F97316', // orange
  '#F59E0B', // amber
  '#EAB308', // yellow
  '#84CC16', // lime
  '#22C55E', // green
  '#10B981', // emerald
  '#14B8A6', // teal
  '#06B6D4', // cyan
  '#0EA5E9', // sky
  '#3B82F6', // blue
  '#6366F1', // indigo
  '#8B5CF6', // violet
  '#A855F7', // purple
  '#D946EF', // fuchsia
  '#EC4899', // pink
  '#64748B', // slate
  '#1E3A8A'  // navy
];

export default function ColorPicker({ value, onChange }) {
  const safeValue = value || '#3B82F6';

  return (
    <div>
      {/* Swatches */}
      <div className="grid grid-cols-9 gap-2">
        {PRESETS.map((c) => {
          const active = c.toLowerCase() === safeValue.toLowerCase();
          return (
            <button
              key={c}
              type="button"
              onClick={() => onChange(c)}
              className={`relative w-full aspect-square rounded-lg transition ${
                active ? 'ring-2 ring-offset-2 ring-slate-800 scale-105' : 'hover:scale-105'
              }`}
              style={{ backgroundColor: c }}
              aria-label={`Select color ${c}`}
            >
              {active && (
                <span className="absolute inset-0 flex items-center justify-center text-white text-sm font-bold">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Custom hex + preview */}
      <div className="mt-3 flex items-center gap-3">
        <span
          className="w-9 h-9 rounded-lg border border-slate-200 shadow-inner"
          style={{ backgroundColor: safeValue }}
        />
        <input
          type="text"
          value={safeValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#3B82F6"
          className="input flex-1 font-mono text-xs"
          maxLength={7}
        />
        <label className="relative cursor-pointer">
          <input
            type="color"
            value={safeValue}
            onChange={(e) => onChange(e.target.value)}
            className="sr-only"
          />
          <span className="btn-secondary px-3 py-2 text-xs">Pick</span>
        </label>
      </div>
    </div>
  );
}