import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import Modal from '../ui/Modal';
import api from '../../utils/api';
import { ENDPOINTS } from '../../utils/api-endpoints';
import { downloadTemplateCSV } from '../../utils/csvTemplate';
import Loader from '../Loader';
import ImportResultModal from './ImportResultModal';

/* ---------- Parse just enough CSV to preview the first rows ---------- */
const splitCsvLine = (line) => {
  const cells = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      cells.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  cells.push(current);
  return cells.map((c) => c.trim());
};

const parsePreview = (text, limit = 5) => {
  const clean = String(text || '').replace(/^\uFEFF/, '');
  const lines = clean.split(/\r?\n/).filter((l) => l.trim() !== '');
  if (lines.length === 0) return { headers: [], rows: [] };

  const headers = splitCsvLine(lines[0]);
  const rows = lines.slice(1, limit + 1).map(splitCsvLine);
  return { headers, rows };
};

export default function ImportCSVModal({ open, onClose, onImported }) {
  const inputRef = useRef(null);

  const [csvText, setCsvText] = useState('');
  const [filename, setFilename] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [resultOpen, setResultOpen] = useState(false);

  const reset = () => {
    setCsvText('');
    setFilename('');
    setDragOver(false);
    setUploading(false);
    setResult(null);
    setResultOpen(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleClose = () => {
    if (uploading) return;
    reset();
    onClose?.();
  };

  const readFile = (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Please choose a .csv file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File must be smaller than 5 MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setCsvText(String(e.target.result || ''));
      setFilename(file.name);
    };
    reader.onerror = () => toast.error('Failed to read file');
    reader.readAsText(file);
  };

  const handlePick = () => !uploading && inputRef.current?.click();

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) readFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (uploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) readFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!uploading) setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleImport = async () => {
    if (!csvText.trim()) {
      toast.error('Please choose a CSV file first');
      return;
    }

    setUploading(true);
    try {
      const { data } = await api.post(ENDPOINTS.TRANSACTIONS.IMPORT_CSV, {
        csv: csvText
      });
      setResult(data);
      setResultOpen(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Import failed');
    } finally {
      setUploading(false);
    }
  };

  const { headers, rows } = csvText ? parsePreview(csvText, 5) : { headers: [], rows: [] };
  const previewHasData = headers.length > 0;

  return (
    <>
      <Modal
        open={open && !resultOpen}
        onClose={handleClose}
        title="Import transactions from CSV"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-5">
          {/* ---------- Step 1: template ---------- */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800">
                Not sure about the format?
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Download a starter CSV with the correct headers and one example row.
              </p>
            </div>
            <button
              type="button"
              onClick={downloadTemplateCSV}
              disabled={uploading}
              className="btn-secondary shrink-0"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Template
            </button>
          </div>

          {/* ---------- Step 2: drop zone / file picker ---------- */}
          <div>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleInputChange}
              className="hidden"
              disabled={uploading}
            />

            {!csvText ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={handlePick}
                className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition ${
                  dragOver
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-slate-300 bg-slate-50 hover:border-primary-400 hover:bg-primary-50/50'
                } ${uploading ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <div className="w-12 h-12 mx-auto rounded-xl bg-white shadow-sm flex items-center justify-center text-primary-600">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-slate-700 mt-3">
                  Drop your CSV here or click to browse
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  .csv only — up to 5 MB
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {filename}
                      </p>
                      <p className="text-xs text-slate-500">
                        {(csvText.length / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handlePick}
                    disabled={uploading}
                    className="text-xs font-semibold text-primary-600 hover:text-primary-700"
                  >
                    Replace
                  </button>
                </div>

                {/* Preview */}
                {previewHasData && (
                  <div className="p-3 bg-slate-50/60">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      Preview — first {rows.length} row{rows.length === 1 ? '' : 's'}
                    </p>
                    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                      <table className="w-full text-xs">
                        <thead className="bg-slate-100">
                          <tr>
                            {headers.map((h, i) => (
                              <th
                                key={i}
                                className="text-left font-bold text-slate-600 px-3 py-2 whitespace-nowrap"
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((row, ri) => (
                            <tr key={ri} className="border-t border-slate-100">
                              {row.map((cell, ci) => (
                                <td
                                  key={ci}
                                  className="px-3 py-2 text-slate-700 whitespace-nowrap"
                                >
                                  {cell || <span className="text-slate-300">—</span>}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ---------- Actions ---------- */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClose}
              disabled={uploading}
              className="btn-secondary w-full sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleImport}
              disabled={uploading || !csvText.trim()}
              className="btn-primary w-full sm:w-auto"
            >
              {uploading ? (
                <>
                  <Loader label="" size="sm" />
                  Importing…
                </>
              ) : (
                'Import'
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Result modal renders on top */}
      <ImportResultModal
        open={resultOpen}
        onClose={() => {
          setResultOpen(false);
          reset();
          onClose?.();
        }}
        result={result}
        onRefresh={() => {
          onImported?.();
        }}
      />
    </>
  );
}