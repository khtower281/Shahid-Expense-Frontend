import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { ENDPOINTS } from '../../utils/api-endpoints';
import ColorPicker from '../ui/ColorPicker';
import Loader from '../Loader';

const EMPTY = {
  name: '',
  description: '',
  color: '#3B82F6',
  isActive: true
};

export default function CategoryForm({ initial, onSaved, onCancel }) {
  const [form, setForm] = useState(initial ? { ...EMPTY, ...initial } : EMPTY);
  const [saving, setSaving] = useState(false);

  const isEdit = Boolean(initial?._id);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    const name = form.name.trim();
    if (name.length < 2) {
      toast.error('Name must be at least 2 characters');
      return;
    }
    if (!/^#([0-9A-Fa-f]{3}){1,2}$/.test(form.color)) {
      toast.error('Please pick a valid hex color');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name,
        description: form.description.trim(),
        color: form.color.toUpperCase(),
        isActive: Boolean(form.isActive)
      };

      if (isEdit) {
        await api.put(ENDPOINTS.CATEGORIES.BY_ID(initial._id), payload);
        toast.success('Category updated');
      } else {
        await api.post(ENDPOINTS.CATEGORIES.BASE, payload);
        toast.success('Category created');
      }
      onSaved?.();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
      <div>
        <label className="label" htmlFor="cat-name">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          id="cat-name"
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          placeholder="e.g. Food, Transport, Bills"
          className="input"
          maxLength={50}
          autoFocus
          disabled={saving}
        />
      </div>

      {/* Description */}
      <div>
        <label className="label" htmlFor="cat-desc">
          Description
        </label>
        <textarea
          id="cat-desc"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Optional note about this category"
          className="input min-h-[80px] resize-y"
          maxLength={200}
          disabled={saving}
        />
        <p className="text-[11px] text-slate-400 mt-1">
          {form.description.length}/200 characters
        </p>
      </div>

      {/* Color */}
      <div>
        <label className="label">Color</label>
        <ColorPicker
          value={form.color}
          onChange={(c) => setForm((prev) => ({ ...prev, color: c }))}
        />
      </div>

      {/* Active toggle */}
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-slate-800">Active</p>
          <p className="text-xs text-slate-500">
            Inactive categories won't appear in new transaction forms.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={form.isActive}
          onClick={() => setForm((prev) => ({ ...prev, isActive: !prev.isActive }))}
          className={`relative w-12 h-7 rounded-full transition ${
            form.isActive ? 'bg-primary-600' : 'bg-slate-300'
          }`}
        >
          <span
            className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-all ${
              form.isActive ? 'left-[22px]' : 'left-0.5'
            }`}
          />
        </button>
      </div>

      {/* Actions */}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
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
            'Update category'
          ) : (
            'Create category'
          )}
        </button>
      </div>
    </form>
  );
}