import Modal from './Modal';
import Loader from '../Loader';

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  loading = false,
  tone = 'danger'
}) {
  const toneClasses = {
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-amber-500 hover:bg-amber-600',
    primary: 'bg-primary-600 hover:bg-primary-700'
  };

  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-md">
      <p className="text-sm text-slate-600 leading-relaxed">{message}</p>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-6">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="btn-secondary w-full sm:w-auto"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className={`btn w-full sm:w-auto text-white ${toneClasses[tone]}`}
        >
          {loading ? (
            <>
              <Loader label="" size="sm" />
              Please wait…
            </>
          ) : (
            confirmLabel
          )}
        </button>
      </div>
    </Modal>
  );
}