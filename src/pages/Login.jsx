import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import Logo from '../components/Logo';
import Loader from '../components/Loader';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || '/';

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      toast.error('Please enter both username and password');
      return;
    }
    setSubmitting(true);
    try {
      await login(form.username.trim(), form.password);
      toast.success('Welcome back!');
      navigate(redirectTo, { replace: true });
    } catch (error) {
      const msg =
        error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 grid-bg">
      <div className="min-h-screen flex flex-col lg:grid lg:grid-cols-[1.1fr_1fr]">
        {/* ============================= LEFT — BRAND ============================= */}
        <aside className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 text-white px-8 sm:px-14 py-12 lg:py-16 flex flex-col justify-between">
          {/* Decorative glow blobs */}
          <div className="pointer-events-none absolute -top-32 -right-32 w-[28rem] h-[28rem] bg-white/10 rounded-full blur-3xl" />
          <div className="pointer-events-none absolute -bottom-40 -left-24 w-[26rem] h-[26rem] bg-primary-400/30 rounded-full blur-3xl" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.07]"
               style={{
                 backgroundImage:
                   'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                 backgroundSize: '22px 22px'
               }}
          />

          {/* Top: brand */}
          <div className="relative z-10 flex items-center gap-4">
            <div className="animate-floaty">
              <Logo size={54} />
            </div>
            <div>
              <p className="text-xl font-extrabold tracking-tight leading-none">
                Shahid Expense
              </p>
              <p className="text-xs text-primary-200 mt-1 tracking-widest uppercase">
                Personal Finance
              </p>
            </div>
          </div>

          {/* Center: hero copy */}
          <div className="relative z-10 max-w-lg mt-12 lg:mt-0">
            <span className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-widest uppercase bg-white/10 border border-white/20 rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
              Private Dashboard
            </span>

            <h2 className="mt-6 text-4xl sm:text-5xl xl:text-6xl font-extrabold leading-[1.05] tracking-tight">
              Every rupee.
              <br />
              <span className="bg-gradient-to-r from-white via-primary-100 to-primary-200 bg-clip-text text-transparent">
                Perfectly tracked.
              </span>
            </h2>

            <p className="mt-6 text-primary-100/90 text-base sm:text-lg leading-relaxed max-w-md">
              A private finance cockpit for PKR &amp; USD. Categorize spends,
              attach receipts, filter like a pro, and export print-ready PDFs.
            </p>

            {/* Feature chips */}
            <ul className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md">
              {[
                'Multi-currency',
                'Cloud receipts',
                'Smart filters',
                'PDF reports'
              ].map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-3 text-sm text-primary-50 bg-white/[0.07] border border-white/10 rounded-xl px-4 py-3 backdrop-blur-sm"
                >
                  <span className="w-6 h-6 rounded-lg bg-white/15 flex items-center justify-center text-[11px] font-bold">
                    ✓
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Bottom: copyright */}
          <div className="relative z-10 mt-12 text-xs text-primary-200/80">
            © {new Date().getFullYear()} Shahid Expense — Built for personal use.
          </div>
        </aside>

        {/* ============================= RIGHT — FORM ============================= */}
        <main className="relative flex items-center justify-center px-6 py-14 sm:px-10 lg:py-20">
          {/* Mobile brand */}
          <div className="lg:hidden absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-3">
            <Logo size={40} />
            <span className="text-lg font-extrabold text-slate-800 tracking-tight">
              Shahid Expense
            </span>
          </div>

          <div className="w-full max-w-md mt-16 lg:mt-0 animate-fade-up">
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Sign in
              </h1>
              <p className="text-slate-500 mt-2 text-sm">
                Enter your admin credentials to access the dashboard.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="glass-card rounded-2xl p-6 sm:p-8 space-y-5"
            >
              {/* Username */}
              <div>
                <label htmlFor="username" className="label">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </span>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    autoFocus
                    value={form.username}
                    onChange={handleChange}
                    placeholder="admin"
                    className="input-modern"
                    disabled={submitting}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="label">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="input-modern pr-12"
                    disabled={submitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="btn-premium mt-2"
              >
                {submitting ? (
                  <>
                    <Loader label="" size="sm" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign in
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </>
                )}
              </button>

              {/* Footnote */}
              <p className="text-center text-xs text-slate-500 pt-2">
                🔒 Private access · Admin only
              </p>
            </form>

            <p className="text-center text-[11px] text-slate-400 mt-6">
              Forgot credentials? They're defined in the server&apos;s{' '}
              <code className="px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-600">
                .env
              </code>{' '}
              file.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}