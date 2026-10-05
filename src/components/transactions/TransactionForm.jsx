import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { ENDPOINTS } from '../../utils/api-endpoints';
import { toInputDate, paymentMethodLabel } from '../../utils/formatters';
import Select from '../ui/Select';
import CategorySelect from '../ui/CategorySelect';
import ReceiptUploader from './ReceiptUploader';
import Loader from '../Loader';

const EMPTY = {
  date: new Date().toISOString().split('T')[0],
  currency: 'PKR',
  amount: '',
  description: '',
  category: '',
  status: 'Pending',
  paymentMethod: 'Cash',
  checkNumber: '',
  receiptUrl: ''
};

const CURRENCY_OPTIONS = [
  { value: 'PKR', label: 'PKR' },
  { value: 'USD', label: 'USD' }
];

const STATUS_OPTIONS = [
  { value: 'Pending', label: 'Pending' },
  { value: 'Completed', label: 'Completed' }
];

export default function TransactionForm({ initial, categories, onSaved, onCancel }) {
  const [form, setForm] = useState(() => {
    if (!initial) return EMPTY;
    return {
      ...EMPTY,
      ...initial,
      date: toInputDate(initial.date),
      category:
        typeof initial.category === 'object' ? initial.category._id : initial.category || '',
      amount: String(initial.amount ?? '')
    };
  });

  const [saving, setSaving] = useState(false);

  const isEdit = Boolean(initial?._id);

  useEffect(() => {
    if (!initial) return;
    setForm({
      ...EMPTY,
      ...initial,
      date: toInputDate(initial.date),
      category:
        typeof initial.category === 'object' ? initial.category._id : initial.category || '',
      amount: String(initial.amount ?? '')
    });
  }, [initial]);

  const set = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const handleChange = (e) => set(e.target.name, e.target.value);

  useEffect(() => {
    if (form.paymentMethod !== 'Check' && form.checkNumber) {
      setForm((p) => ({ ...p, checkNumber: '' }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.paymentMethod]);

  const selectableCategories = useMemo(() => {
    return categories.filter((c) => c.isActive || c._id === form.category);
  }, [categories, form.category]);

  const validate = () => {
    if (!form.date) return 'Date is required';
    if (!form.description.trim()) return 'Description is required';
    if (!form.category) return 'Please select a category';

    const amount = Number(form.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return 'Amount must be a positive number';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        date: form.date,
        currency: form.currency,
        amount: Number(form.amount),
        description: form.description.trim(),
        category: form.category,
        status: form.status,
        paymentMethod: form.paymentMethod,
        checkNumber: form.paymentMethod === 'Check' ? form.checkNumber.trim() : '',
        receiptUrl: form.receiptUrl || ''
      };

      if (isEdit) {
        await api.put(ENDPOINTS.TRANSACTIONS.BY_ID(initial._id), payload);
        toast.success('Transaction updated');
      } else {
        await api.post(ENDPOINTS.TRANSACTIONS.BASE, payload);
        toast.success('Transaction created');
      }
      onSaved?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save transaction');
    } finally {
      setSaving(false);
    }
  };

  const amountSymbol = form.currency === 'USD' ? '$' : 'Rs';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-6 gap-3">
        <div className="col-span-6 sm:col-span-3">
          <label className="label" htmlFor="tx-date">Date *</label>
          <input
            id="tx-date"
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            className="input"
            disabled={saving}
          />
        </div>

        <div className="col-span-2 sm:col-span-1">
          <label className="label">Currency</label>
          <Select
            value={form.currency}
            onChange={(v) => set('currency', v)}
            options={CURRENCY_OPTIONS}
            disabled={saving}
          />
        </div>

        <div className="col-span-4 sm:col-span-2">
          <label className="label" htmlFor="tx-amount">Amount *</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
              {amountSymbol}
            </span>
            <input
              id="tx-amount"
              name="amount"
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={handleChange}
              placeholder="0.00"
              className="input pl-10"
              disabled={saving}
            />
          </div>
        </div>
      </div>

      <div>
        <label className="label" htmlFor="tx-desc">Description *</label>
        <textarea
          id="tx-desc"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="e.g. Groceries from Metro"
          className="input min-h-[72px] resize-y"
          maxLength={300}
          disabled={saving}
        />
        <p className="text-[11px] text-slate-400 mt-1 text-right">
          {form.description.length}/300
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="label">Category *</label>
          <CategorySelect
            value={form.category}
            onChange={(id) => set('category', id)}
            categories={selectableCategories}
            disabled={saving}
          />
        </div>

        <div>
          <label className="label">Status</label>
          <Select
            value={form.status}
            onChange={(v) => set('status', v)}
            options={STATUS_OPTIONS}
            disabled={saving}
          />
        </div>
      </div>

      <div>
        <label className="label">Payment method *</label>
        <div className="flex gap-2">
          {['Cash', 'Card', 'Check'].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => set('paymentMethod', m)}
              disabled={saving}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                form.paymentMethod === m
                  ? 'bg-primary-600 border-primary-600 text-white shadow-sm'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              {paymentMethodLabel(m)}
            </button>
          ))}
        </div>

        {form.paymentMethod === 'Check' && (
          <div className="mt-3 animate-fade-up">
            <label className="label" htmlFor="tx-check">Cheque number (optional)</label>
            <input
              id="tx-check"
              name="checkNumber"
              type="text"
              value={form.checkNumber}
              onChange={handleChange}
              placeholder="e.g. CHK-10023"
              className="input"
              maxLength={40}
              disabled={saving}
            />
          </div>
        )}
      </div>

      <div>
        <label className="label">Receipt (optional)</label>
        <ReceiptUploader
          value={form.receiptUrl}
          onChange={(url) => set('receiptUrl', url)}
          disabled={saving}
        />
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="btn-secondary w-full sm:w-auto"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="btn-primary w-full sm:w-auto"
        >
          {saving ? (
            <>
              <Loader label="" size="sm" />
              Saving…
            </>
          ) : isEdit ? (
            'Update transaction'
          ) : (
            'Create transaction'
          )}
        </button>
      </div>
    </form>
  );
}