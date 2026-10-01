import Modal from '../ui/Modal';
import { downloadTextFile } from '../../utils/csvTemplate';

export default function ImportResultModal({ open, onClose, result, onRefresh }) {
  if (!result) return null;

  const { imported = 0, failed = 0, errors = [], total = 0 } = result;
  const allGood = failed === 0;

  const handleDownloadFailed = () => {
    if (errors.length === 0) return;

    const escapeCell = (v) => {
      const s = v === undefined || v === null ? '' : String(v);
      return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };

    const header = 'Row,Error';
    const rows = errors.map((e) => `${escapeCell(e.row)},${escapeCell(e.message)}`);
    const csv = [header, ...rows].join('\r\n') + '\r\n';

    downloadTextFile(csv, `shahid-expense-import-errors-${Date.now()}.csv`);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Import result"
      maxWidth="max-w-lg"
    >
      {/* ---------- Summary ---------- */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Total
          </p>
          <p className="text-xl font-extrabold text-slate-800 mt-0.5">{total}</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600">
            Imported
          </p>
          <p className="text-xl font-extrabold text-emerald-700 mt-0.5">{imported}</p>
        </div>
        <div
          className={`rounded-xl border p-3 text-center ${
            failed > 0
              ? 'border-amber-200 bg-amber-50'
              : 'border-slate-200 bg-slate-50'
          }`}
        >
          <p
            className={`text-[11px] font-semibold uppercase tracking-wider ${
              failed > 0 ? 'text-amber-700' : 'text-slate-400'
            }`}
          >
            Failed
          </p>
          <p
            className={`text-xl font-extrabold mt-0.5 ${
              failed > 0 ? 'text-amber-800' : 'text-slate-500'
            }`}
          >
            {failed}
          </p>
        </div>
      </div>

      {/* ---------- All good ---------- */}
      {allGood && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-emerald-800">
              All rows imported successfully.
            </p>
            <p className="text-xs text-emerald-700 mt-0.5">
              New transactions are now visible in the list.
            </p>
          </div>
        </div>
      )}

      {/* ---------- Error table ---------- */}
      {!allGood && (
        <>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-800">
                {failed} row{failed === 1 ? '' : 's'} could not be imported.
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                Fix the issues below and re-import the failed rows.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 overflow-hidden max-h-64 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-slate-50">
                <tr>
                  <th className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 px-3 py-2 w-16">
                    Row
                  </th>
                  <th className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 px-3 py-2">
                    Reason
                  </th>
                </tr>
              </thead>
              <tbody>
                {errors.map((e, i) => (
                  <tr key={i} className="border-t border-slate-100">
                    <td className="px-3 py-2 font-mono text-xs text-slate-500 align-top">
                      {e.row}
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-700 align-top">
                      {e.message}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ---------- Actions ---------- */}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-6 pt-5 border-t border-slate-100">
        {!allGood && errors.length > 0 && (
          <button
            type="button"
            onClick={handleDownloadFailed}
            className="btn-secondary w-full sm:w-auto"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download failed rows
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            onClose?.();
            onRefresh?.();
          }}
          className="btn-primary w-full sm:w-auto"
        >
          Close
        </button>
      </div>
    </Modal>
  );
}