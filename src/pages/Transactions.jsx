import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { ENDPOINTS } from '../utils/api-endpoints';
import { useDebounce } from '../hooks/useDebounce';
import { useCategories } from '../hooks/useCategories';
import { formatMoney } from '../utils/formatters';
import PageHeader from '../components/ui/PageHeader';
import Pagination from '../components/ui/Pagination';
import EmptyState from '../components/ui/EmptyState';
import Skeleton from '../components/ui/Skeleton';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Modal from '../components/ui/Modal';
import FiltersBar from '../components/transactions/FiltersBar';
import TransactionsTable from '../components/transactions/TransactionsTable';
import TransactionDetailModal from '../components/transactions/TransactionDetailModal';
import TransactionForm from '../components/transactions/TransactionForm';
import ImportCSVModal from '../components/transactions/ImportCSVModal';

const EMPTY_FILTERS = {
  search: '',
  category: '',
  status: '',
  paymentMethod: '',
  currency: '',
  startDate: '',
  endDate: '',
  minAmount: '',
  maxAmount: ''
};

export default function Transactions() {
  /* -------------------- Filters -------------------- */
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const debouncedFilters = useDebounce(filters, 400);

  /* -------------------- Pagination + sort -------------------- */
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState('date');
  const [order, setOrder] = useState('desc');

  /* -------------------- Data -------------------- */
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [totals, setTotals] = useState({ PKR: 0, USD: 0 });
  const [loading, setLoading] = useState(true);

  /* -------------------- Selection -------------------- */
  const [selected, setSelected] = useState([]);

  /* -------------------- Delete -------------------- */
  const [deleting, setDeleting] = useState(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  /* -------------------- Detail modal -------------------- */
  const [viewing, setViewing] = useState(null);

  /* -------------------- Form modal -------------------- */
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  /* -------------------- Import CSV modal -------------------- */
  const [importOpen, setImportOpen] = useState(false);

  /* -------------------- Categories -------------------- */
  const { categories } = useCategories();

  /* -------------------- Reset page on filter change -------------------- */
  useEffect(() => {
    setPage(1);
  }, [debouncedFilters, limit, sortBy, order]);

  /* -------------------- Fetch -------------------- */
  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      try {
        const params = {
          page,
          limit,
          sortBy,
          order
        };
        /* Attach only non-empty filters */
        Object.entries(debouncedFilters).forEach(([k, v]) => {
          if (v !== '' && v !== null && v !== undefined) params[k] = v;
        });

        const { data } = await api.get(ENDPOINTS.TRANSACTIONS.BASE, { params });
        if (cancelled) return;

        setTransactions(data.data || []);
        setPagination(data.pagination);
        setTotals(data.totals || { PKR: 0, USD: 0 });

        /* Prune selection to visible IDs only */
        setSelected((prev) =>
          prev.filter((id) => (data.data || []).some((t) => t._id === id))
        );
      } catch (error) {
        if (!cancelled) {
          toast.error(error.response?.data?.message || 'Failed to load transactions');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [debouncedFilters, page, limit, sortBy, order]);

  /* -------------------- Handlers -------------------- */
  const handleSort = (key, newOrder) => {
    setSortBy(key);
    setOrder(newOrder);
  };

  const handleToggle = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleToggleAll = (ids) => setSelected(ids);

  const openNewTransaction = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEditTransaction = (t) => {
    setEditing(t);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
  };

  const handleFormSaved = () => {
    closeForm();
    /* Re-fetch list by nudging filters ref */
    setFilters((f) => ({ ...f }));
  };

  const handleViewTransaction = (t) => setViewing(t);

  const handleDeleteConfirm = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await api.delete(ENDPOINTS.TRANSACTIONS.BY_ID(deleting._id));
      toast.success('Transaction deleted');
      setDeleting(null);
      setFilters((f) => ({ ...f }));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selected.length === 0) return;
    setDeleteLoading(true);
    try {
      await api.delete(ENDPOINTS.TRANSACTIONS.BULK, { data: { ids: selected } });
      toast.success(`Deleted ${selected.length} transaction(s)`);
      setSelected([]);
      setBulkDeleteOpen(false);
      setFilters((f) => ({ ...f }));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Bulk delete failed');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleExportPDF = () => {
    const params = new URLSearchParams();
    Object.entries(debouncedFilters).forEach(([k, v]) => {
      if (v !== '' && v !== null && v !== undefined) params.append(k, v);
    });
    params.append('sortBy', sortBy);
    params.append('order', order);

    api
      .get(ENDPOINTS.TRANSACTIONS.EXPORT_PDF, {
        params: Object.fromEntries(params),
        responseType: 'blob'
      })
      .then((res) => {
        const blob = new Blob([res.data], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `shahid-expense-${Date.now()}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(link.href);
        toast.success('PDF downloaded');
      })
      .catch(() => toast.error('Failed to export PDF'));
  };

  const handleExportCSV = () => {
    const params = new URLSearchParams();
    Object.entries(debouncedFilters).forEach(([k, v]) => {
      if (v !== '' && v !== null && v !== undefined) params.append(k, v);
    });
    params.append('sortBy', sortBy);
    params.append('order', order);

    api
      .get(ENDPOINTS.TRANSACTIONS.EXPORT_CSV, {
        params: Object.fromEntries(params),
        responseType: 'blob'
      })
      .then((res) => {
        const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `shahid-expense-${Date.now()}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(link.href);
        toast.success('CSV downloaded');
      })
      .catch(() => toast.error('Failed to export CSV'));
  };

  /* -------------------- Derived -------------------- */
  const hasAnyFilter = useMemo(
    () => Object.values(filters).some((v) => v !== ''),
    [filters]
  );

  const resetFilters = () => setFilters(EMPTY_FILTERS);

  /* -------------------- Render -------------------- */
  return (
    <div>
      <PageHeader
        title="Transactions"
        subtitle="Track every expense — filter, sort, and export with ease."
        actions={
          <>
            {selected.length > 0 && (
              <button
                type="button"
                onClick={() => setBulkDeleteOpen(true)}
                className="btn-danger"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                </svg>
                Delete {selected.length}
              </button>
            )}

            <button
              type="button"
              onClick={handleExportPDF}
              className="btn-secondary"
              title="Export as PDF"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span className="hidden sm:inline">PDF</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="btn-secondary"
              title="Export as CSV"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span className="hidden sm:inline">CSV</span>
            </button>

            <button
              type="button"
              onClick={() => setImportOpen(true)}
              className="btn-secondary"
              title="Import from CSV"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span className="hidden sm:inline">Import</span>
            </button>

            <button
              type="button"
              onClick={openNewTransaction}
              className="btn-primary"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span className="hidden sm:inline">New Transaction</span>
              <span className="sm:hidden">New</span>
            </button>
          </>
        }
      />

      {/* Totals cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
        <div className="card p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Filtered PKR
          </p>
          <p className="text-lg sm:text-xl font-extrabold text-blue-700 mt-1">
            Rs {formatMoney(totals.PKR)}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Filtered USD
          </p>
          <p className="text-lg sm:text-xl font-extrabold text-emerald-600 mt-1">
            $ {formatMoney(totals.USD)}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Matching
          </p>
          <p className="text-lg sm:text-xl font-extrabold text-slate-800 mt-1">
            {pagination?.totalCount ?? 0}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Page
          </p>
          <p className="text-lg sm:text-xl font-extrabold text-slate-800 mt-1">
            {pagination?.currentPage ?? 1}
            <span className="text-slate-400 font-medium text-sm">
              {' '}/ {pagination?.totalPages ?? 1}
            </span>
          </p>
        </div>
      </div>

      {/* Filters (collapsible) */}
      <FiltersBar
        filters={filters}
        onChange={setFilters}
        categories={categories}
        onReset={resetFilters}
      />

      {/* Body */}
      {loading ? (
        <div className="card p-4 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <EmptyState
          title={hasAnyFilter ? 'No matching transactions' : 'No transactions yet'}
          message={
            hasAnyFilter
              ? 'Try relaxing your filters or resetting them.'
              : 'Start by adding your first transaction.'
          }
          icon={
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 7h16M4 12h10M4 17h16" />
            </svg>
          }
          action={
            hasAnyFilter ? (
              <button type="button" onClick={resetFilters} className="btn-secondary">
                Reset filters
              </button>
            ) : (
              <button type="button" onClick={openNewTransaction} className="btn-primary">
                Add first transaction
              </button>
            )
          }
        />
      ) : (
        <>
          <TransactionsTable
            transactions={transactions}
            selected={selected}
            onToggle={handleToggle}
            onToggleAll={handleToggleAll}
            onEdit={openEditTransaction}
            onDelete={setDeleting}
            onView={handleViewTransaction}
            sortBy={sortBy}
            order={order}
            onSort={handleSort}
          />

          <Pagination
            currentPage={pagination?.currentPage ?? 1}
            totalPages={pagination?.totalPages ?? 1}
            totalCount={pagination?.totalCount ?? 0}
            limit={limit}
            onPageChange={setPage}
            onLimitChange={setLimit}
          />
        </>
      )}

      {/* Single delete confirm */}
      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => !deleteLoading && setDeleting(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
        title="Delete transaction?"
        message={
          deleting
            ? `Delete "${deleting.description}" (${deleting.currency} ${deleting.amount})? This cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
      />

      {/* Bulk delete confirm */}
      <ConfirmDialog
        open={bulkDeleteOpen}
        onClose={() => !deleteLoading && setBulkDeleteOpen(false)}
        onConfirm={handleBulkDelete}
        loading={deleteLoading}
        title={`Delete ${selected.length} transaction(s)?`}
        message="These transactions will be permanently removed. This cannot be undone."
        confirmLabel={`Delete ${selected.length}`}
      />

      {/* Transaction detail modal */}
      <TransactionDetailModal
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        transaction={viewing}
        onEdit={openEditTransaction}
      />

      {/* Create / Edit modal */}
      <Modal
        open={formOpen}
        onClose={closeForm}
        title={editing ? 'Edit transaction' : 'New transaction'}
        maxWidth="max-w-2xl"
      >
        <TransactionForm
          initial={editing}
          categories={categories}
          onSaved={handleFormSaved}
          onCancel={closeForm}
        />
      </Modal>

      {/* Import CSV modal */}
      <ImportCSVModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={() => {
          /* Re-fetch list by nudging filters ref */
          setFilters((f) => ({ ...f }));
        }}
      />
    </div>
  );
}