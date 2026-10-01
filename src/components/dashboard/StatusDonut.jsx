import { useMemo } from 'react';

export default function StatusDonut({ pending = 0, completed = 0, loading }) {
  const total = pending + completed;

  const { segments, size } = useMemo(() => {
    const s = 160;
    const stroke = 18;
    const radius = (s - stroke) / 2;
    const circumference = 2 * Math.PI * radius;

    if (total === 0) {
      return {
        size: s,
        segments: {
          radius,
          stroke,
          circumference,
          completedLen: 0,
          pendingLen: 0
        }
      };
    }

    const completedLen = (completed / total) * circumference;
    const pendingLen = circumference - completedLen;

    return {
      size: s,
      segments: { radius, stroke, circumference, completedLen, pendingLen }
    };
  }, [pending, completed, total]);

  const { radius, stroke, circumference, completedLen, pendingLen } = segments;

  if (loading) {
    return (
      <div className="card p-5">
        <div className="h-4 w-32 bg-slate-200/70 rounded animate-pulse" />
        <div className="mt-4 flex items-center justify-center">
          <div className="w-40 h-40 rounded-full bg-slate-200/60 animate-pulse" />
        </div>
      </div>
    );
  }

  const completedPct = total ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="card p-5">
      <h3 className="text-sm font-bold text-slate-700">Status overview</h3>
      <p className="text-xs text-slate-400 mt-0.5">All-time</p>

      <div className="mt-4 flex items-center justify-center">
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="-rotate-90">
            {/* Base ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth={stroke}
            />
            {/* Completed (green) */}
            {total > 0 && (
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="#10b981"
                strokeWidth={stroke}
                strokeDasharray={`${completedLen} ${circumference}`}
                strokeLinecap="butt"
              />
            )}
            {/* Pending (amber) */}
            {total > 0 && (
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="#f59e0b"
                strokeWidth={stroke}
                strokeDasharray={`${pendingLen} ${circumference}`}
                strokeDashoffset={-completedLen}
                strokeLinecap="butt"
              />
            )}
          </svg>

          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-extrabold text-slate-800">
              {completedPct}%
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              completed
            </span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-5 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="inline-flex items-center gap-2 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            Completed
          </span>
          <span className="font-semibold text-slate-800">{completed}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="inline-flex items-center gap-2 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            Pending
          </span>
          <span className="font-semibold text-slate-800">{pending}</span>
        </div>
      </div>
    </div>
  );
}