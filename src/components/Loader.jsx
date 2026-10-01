export default function Loader({ fullScreen = false, label = 'Loading…', size = 'md' }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-4'
  };

  const spinner = (
    <div className="flex items-center gap-3">
      <div
        className={`${sizes[size]} border-primary-200 border-t-primary-600 rounded-full animate-spin`}
      />
      {label && <span className="text-sm text-slate-500">{label}</span>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        {spinner}
      </div>
    );
  }

  return spinner;
}