import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { ENDPOINTS } from '../utils/api-endpoints';
import { refreshCategories } from '../hooks/useCategories';
import PageHeader from '../components/ui/PageHeader';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import Skeleton from '../components/ui/Skeleton';
import CategoryForm from '../components/categories/CategoryForm';
import CategoryCard from '../components/categories/CategoryCard';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  /* Modal state */
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  /* Delete state */
  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteBlocked, setDeleteBlocked] = useState(null); // { category, linkedCount, message }

  /* -------------------- Fetch -------------------- */
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(ENDPOINTS.CATEGORIES.BASE);
      setCategories(data.categories || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  /* -------------------- Filtered list -------------------- */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return categories.filter((c) => {
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        (c.description || '').toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && c.isActive) ||
        (statusFilter === 'inactive' && !c.isActive);
      return matchesSearch && matchesStatus;
    });
  }, [categories, search, statusFilter]);

  /* -------------------- Handlers -------------------- */
  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (category) => {
    setEditing(category);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
  };

  const handleSaved = async () => {
    closeForm();
    await fetchCategories();       // refresh this page's list
    await refreshCategories();     // update the global cache for other pages
  };

  const handleDeleteConfirm = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await api.delete(ENDPOINTS.CATEGORIES.BY_ID(deleting._id));
      toast.success('Category deleted');
      setDeleting(null);
      await fetchCategories();
      await refreshCategories();
    } catch (error) {
      const data = error.response?.data;
      if (error.response?.status === 409 && data?.code === 'CATEGORY_IN_USE') {
        /* Show blocked dialog instead of a toast */
        setDeleteBlocked({
          category: deleting,
          linkedCount: data.linkedCount,
          message: data.message
        });
        setDeleting(null);
      } else {
        toast.error(data?.message || 'Failed to delete category');
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  /* Deactivate the blocked category (fallback path) */
  const handleDeactivateInstead = async () => {
    if (!deleteBlocked) return;
    setDeleteLoading(true);
    try {
      await api.put(ENDPOINTS.CATEGORIES.BY_ID(deleteBlocked.category._id), {
        isActive: false
      });
      toast.success('Category deactivated');
      setDeleteBlocked(null);
      await fetchCategories();
      await refreshCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to deactivate');
    } finally {
      setDeleteLoading(false);
    }
  };

  /* -------------------- Render -------------------- */
  return (
    <div>
      <PageHeader
        title="Categories"
        subtitle="Group your expenses. Colors make them instantly recognizable."
        actions={
          <button type="button" onClick={openCreate} className="btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Category
          </button>
        }
      />

      {/* Toolbar */}
      <div className="card p-3 sm:p-4 mb-5 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories…"
            className="input pl-10"
          />
        </div>

        <div className="flex gap-1 p-1 rounded-lg bg-slate-100">
          {[
            { key: 'all', label: 'All' },
            { key: 'active', label: 'Active' },
            { key: 'inactive', label: 'Inactive' }
          ].map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setStatusFilter(opt.key)}
              className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition ${
                statusFilter === opt.key
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-5">
              <div className="flex items-start justify-between">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <Skeleton className="w-16 h-6 rounded-full" />
              </div>
              <Skeleton className="h-5 w-2/3 mt-4" />
              <Skeleton className="h-4 w-full mt-2" />
              <Skeleton className="h-4 w-5/6 mt-1.5" />
              <div className="flex gap-2 mt-5">
                <Skeleton className="h-9 flex-1 rounded-lg" />
                <Skeleton className="h-9 flex-1 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={categories.length === 0 ? 'No categories yet' : 'No matches'}
          message={
            categories.length === 0
              ? 'Start by creating your first category — like Food, Transport, or Bills.'
              : 'Try changing your search or status filter.'
          }
          icon={
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
            </svg>
          }
          action={
            categories.length === 0 ? (
              <button type="button" onClick={openCreate} className="btn-primary">
                Create your first category
              </button>
            ) : null
          }
        />
      ) : (
        <>
          <p className="text-xs text-slate-400 mb-3">
            {filtered.length} of {categories.length} categor
            {categories.length === 1 ? 'y' : 'ies'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((c) => (
              <CategoryCard
                key={c._id}
                category={c}
                onEdit={openEdit}
                onDelete={setDeleting}
              />
            ))}
          </div>
        </>
      )}

      {/* Create/Edit modal */}
      <Modal
        open={formOpen}
        onClose={closeForm}
        title={editing ? 'Edit category' : 'New category'}
      >
        <CategoryForm
          initial={editing}
          onSaved={handleSaved}
          onCancel={closeForm}
        />
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => !deleteLoading && setDeleting(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
        title="Delete category?"
        message={
          deleting
            ? `Are you sure you want to delete "${deleting.name}"? This cannot be undone.`
            : ''
        }
        confirmLabel="Delete category"
      />

      {/* Delete blocked modal — friendly & actionable */}
      <Modal
        open={Boolean(deleteBlocked)}
        onClose={() => !deleteLoading && setDeleteBlocked(null)}
        title="Category is in use"
        maxWidth="max-w-md"
      >
        {deleteBlocked && (
          <>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm text-slate-700 leading-relaxed">
                  <span className="font-semibold text-slate-900">
                    "{deleteBlocked.category.name}"
                  </span>{' '}
                  is used by{' '}
                  <span className="font-semibold text-slate-900">
                    {deleteBlocked.linkedCount}
                  </span>{' '}
                  transaction{deleteBlocked.linkedCount === 1 ? '' : 's'}.
                </p>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                  Deleting it would orphan those transactions. Instead, you can
                  <span className="font-semibold text-slate-700"> deactivate </span>
                  it — the label stays on old transactions, but it won't be
                  available for new ones.
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-6 pt-5 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteBlocked(null)}
                disabled={deleteLoading}
                className="btn-secondary w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeactivateInstead}
                disabled={deleteLoading}
                className="btn-primary w-full sm:w-auto"
              >
                {deleteLoading ? 'Deactivating…' : 'Deactivate instead'}
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}