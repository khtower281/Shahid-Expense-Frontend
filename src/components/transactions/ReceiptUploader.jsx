import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { validateReceiptFile, uploadToCloudinary } from '../../utils/cloudinary';

export default function ReceiptUploader({ value, onChange, disabled }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [localFile, setLocalFile] = useState(null);

  const isPdf = (url) => url && url.toLowerCase().includes('.pdf');

  const handlePick = () => !disabled && inputRef.current?.click();

  const handleFile = async (file) => {
    const error = validateReceiptFile(file);
    if (error) {
      toast.error(error);
      return;
    }

    setLocalFile(file);
    setUploading(true);
    setProgress(0);

    try {
      const { url } = await uploadToCloudinary(file, setProgress);
      onChange(url);
      toast.success('Receipt uploaded');
    } catch (err) {
      const message =
        err?.response?.data?.error?.message ||
        err?.message ||
        'Upload failed';
      toast.error(message);
      setLocalFile(null);
    } finally {
      setUploading(false);
      setProgress(0);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled || uploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled && !uploading) setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleRemove = () => {
    onChange('');
    setLocalFile(null);
  };

  /* Preview source: uploaded URL takes priority over local file */
  const previewSrc = value || (localFile ? URL.createObjectURL(localFile) : null);
  const previewIsPdf = isPdf(value || localFile?.name || '');

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled || uploading}
      />

      {/* ---------- No file yet: drop zone ---------- */}
      {!previewSrc && !uploading && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handlePick}
          className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition ${
            dragOver
              ? 'border-primary-500 bg-primary-50'
              : 'border-slate-300 bg-slate-50 hover:border-primary-400 hover:bg-primary-50/50'
          } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          <div className="w-12 h-12 mx-auto rounded-xl bg-white shadow-sm flex items-center justify-center text-primary-600">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-slate-700 mt-3">
            Drop receipt here or click to browse
          </p>
          <p className="text-xs text-slate-500 mt-1">
            JPG, PNG, WEBP, GIF or PDF · up to 5 MB
          </p>
        </div>
      )}

      {/* ---------- Uploading ---------- */}
      {uploading && (
        <div className="rounded-xl border-2 border-primary-200 bg-primary-50/40 p-6 text-center">
          <div className="w-12 h-12 mx-auto rounded-xl bg-white shadow-sm flex items-center justify-center text-primary-600 mb-3">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-slate-700 mb-2">
            Uploading… {progress}%
          </p>
          <div className="w-full h-1.5 bg-primary-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-600 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* ---------- Preview ---------- */}
      {previewSrc && !uploading && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
          {previewIsPdf ? (
            <div className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">
                  {localFile?.name || 'Receipt.pdf'}
                </p>
                <p className="text-xs text-slate-500">PDF document</p>
              </div>
            </div>
          ) : (
            <div className="bg-white">
              <img
                src={previewSrc}
                alt="Receipt preview"
                className="w-full h-auto max-h-64 object-contain mx-auto"
              />
            </div>
          )}

          <div className="flex items-center justify-between px-4 py-2 border-t border-slate-200 bg-white">
            <a
              href={previewSrc}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-primary-600 hover:text-primary-700"
            >
              Open in new tab ↗
            </a>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePick}
                disabled={disabled}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Replace
              </button>
              <span className="w-px h-3 bg-slate-200" />
              <button
                type="button"
                onClick={handleRemove}
                disabled={disabled}
                className="text-xs font-semibold text-red-600 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}