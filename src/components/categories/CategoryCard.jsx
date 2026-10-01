export default function CategoryCard({ category, onEdit, onDelete }) {
  const { name, description, color, isActive } = category;

  return (
    <div className="card p-5 flex flex-col gap-4 group hover:shadow-md transition-shadow">
      {/* Top row: color chip + status pill */}
      <div className="flex items-start justify-between">
        <span
          className="w-10 h-10 rounded-xl shadow-inner"
          style={{ backgroundColor: color }}
          aria-label={`Color ${color}`}
        />
        <span
          className={`text-[11px] font-semibold uppercase tracking-wider rounded-full px-2.5 py-1 ${
            isActive
              ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
              : 'bg-slate-100 text-slate-500 ring-1 ring-slate-200'
          }`}
        >
          {isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      {/* Name + description */}
      <div className="flex-1">
        <h3 className="text-base font-bold text-slate-800 tracking-tight truncate">
          {name}
        </h3>
        <p className="text-sm text-slate-500 mt-1 line-clamp-2 min-h-[2.5rem]">
          {description || 'No description'}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={() => onEdit(category)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition py-2"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(category)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition py-2"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
          </svg>
          Delete
        </button>
      </div>
    </div>
  );
}