import Modal from '../ui/Modal';
import Badge from '../ui/Badge';
import { formatDate, formatMoney, currencySymbol, paymentMethodLabel } from '../../utils/formatters';

export default function TransactionDetailModal({ open, onClose, transaction, onEdit }) {
  if (!transaction) return null;

  const t = transaction;
  const isPdf =
    t.receiptUrl && t.receiptUrl.toLowerCase().endsWith('.pdf');
  const isImage = t.receiptUrl && !isPdf;

  return (
    <Modal open={open} onClose={onClose} title="Transaction details" maxWidth="max-w-2xl">
      {/* Header summary */}
      <div className="rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 text-white p-5 sm:p-6 mb-6 shadow-lg">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-widest text-primary-100 font-semibold">
              {currencySymbol(t.currency)} {t.currency}
            </p>
            <p className="text-3xl sm:text-4xl font-extrabold mt-1 leading-none break-all">
              {currencySymbol(t.currency)} {formatMoney(t.amount)}
            </p>
          </div>
          <Badge color={t.status === 'Completed' ? 'green' : 'amber'}>
            {t.status}
          </Badge>
        </div>

        <p className="mt-4 text-sm text-primary-50 leading-relaxed break-words">
          {t.description}
        </p>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <DetailRow label="Date" value={formatDate(t.date)} />
        <DetailRow
          label="Category"
          value={
            t.category ? (
              <span className="inline-flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: t.category.color }}
                />
                {t.category.name}
              </span>
            ) : (
              '—'
            )
          }
        />
        <DetailRow label="Payment method" value={paymentMethodLabel(t.paymentMethod)} />
        {t.paymentMethod === 'Check' && (
          <DetailRow label="Cheque number" value={t.checkNumber || '—'} />
        )}
        <DetailRow label="Currency" value={t.currency} />
        <DetailRow
          label="Created"
          value={new Date(t.createdAt).toLocaleString('en-GB')}
        />
        <DetailRow
          label="Last updated"
          value={new Date(t.updatedAt).toLocaleString('en-GB')}
        />
        <DetailRow
          label="Transaction ID"
          value={
            <code className="text-[11px] bg-slate-100 px-2 py-1 rounded break-all">
              {t._id}
            </code>
          }
        />
      </div>

      {/* Receipt */}
      <div className="border-t border-slate-100 pt-5">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-slate-700">Receipt</h4>
          {t.receiptUrl && (
            <a
              href={t.receiptUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-primary-600 hover:text-primary-700"
            >
              Open in new tab ↗
            </a>
          )}
        </div>

        {!t.receiptUrl ? (
          <div className="rounded-xl border-2 border-dashed border-slate-200 p-6 text-center">
            <p className="text-sm text-slate-400">No receipt attached.</p>
          </div>
        ) : isPdf ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-700">PDF document</p>
            <a
              href={t.receiptUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-primary"
            >
              Open PDF
            </a>
          </div>
        ) : isImage ? (
          <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
            <img
              src={t.receiptUrl}
              alt="Receipt"
              className="w-full h-auto max-h-96 object-contain"
              loading="lazy"
            />
          </div>
        ) : (
          <a
            href={t.receiptUrl}
            target="_blank"
            rel="noreferrer"
            className="text-primary-600 underline text-sm"
          >
            {t.receiptUrl}
          </a>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-6 pt-5 border-t border-slate-100">
        <button
          type="button"
          onClick={onClose}
          className="btn-secondary w-full sm:w-auto"
        >
          Close
        </button>
        {onEdit && (
          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit(t);
            }}
            className="btn-primary w-full sm:w-auto"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            Edit transaction
          </button>
        )}
      </div>
    </Modal>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="text-sm font-medium text-slate-800 mt-1 break-words">{value}</p>
    </div>
  );
}