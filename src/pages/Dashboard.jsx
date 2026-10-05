import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { ENDPOINTS } from '../utils/api-endpoints';
import { useAuth } from '../hooks/useAuth';
import { formatMoney } from '../utils/formatters';
import PageHeader from '../components/ui/PageHeader';
import RangePicker from '../components/dashboard/RangePicker';
import { computeRange } from '../utils/dateRanges';
import KpiCard from '../components/dashboard/KpiCard';
import SpendingByCategory from '../components/dashboard/SpendingByCategory';
import PaymentMethodsList from '../components/dashboard/PaymentMethodsList';
import RecentTransactions from '../components/dashboard/RecentTransactions';

export default function Dashboard() {
  const { admin } = useAuth();

  const [range, setRange] = useState('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const { startDate, endDate } = (() => {
    if (range === 'custom') return { startDate: customStart, endDate: customEnd };
    return computeRange(range);
  })();

  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({ PKR: 0, USD: 0 });
  const [totalCount, setTotalCount] = useState(0);
  const [recent, setRecent] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [methodData, setMethodData] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const rangeParams = {};
    if (startDate) rangeParams.startDate = startDate;
    if (endDate) rangeParams.endDate = endDate;

    const fetchAll = async () => {
      setLoading(true);
      try {
        const [overviewRes, recentRes, categoryRes, methodRes] = await Promise.all([
          api.get(ENDPOINTS.TRANSACTIONS.BASE, {
            params: { ...rangeParams, page: 1, limit: 1 }
          }),
          api.get(ENDPOINTS.TRANSACTIONS.BASE, {
            params: { ...rangeParams, page: 1, limit: 5, sortBy: 'date', order: 'desc' }
          }),
          api.get(ENDPOINTS.TRANSACTIONS.CATEGORY_BREAKDOWN, { params: rangeParams }),
          api.get(ENDPOINTS.TRANSACTIONS.METHOD_BREAKDOWN, { params: rangeParams })
        ]);

        if (cancelled) return;

        setTotals(overviewRes.data.totals || { PKR: 0, USD: 0 });
        setTotalCount(overviewRes.data.pagination?.totalCount ?? 0);
        setRecent(recentRes.data.data || []);
        setCategoryData(categoryRes.data.data || []);
        setMethodData(methodRes.data.data || []);
      } catch (error) {
        if (!cancelled) {
          toast.error(error.response?.data?.message || 'Failed to load dashboard');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAll();
    return () => {
      cancelled = true;
    };
  }, [startDate, endDate]);

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${admin?.username || 'admin'} 👋`}
        subtitle="Here's what's happening with your money."
      />

      <RangePicker
        value={range}
        onChange={(v) => {
          setRange(v);
          if (v !== 'custom') {
            setCustomStart('');
            setCustomEnd('');
          }
        }}
        customStart={customStart}
        customEnd={customEnd}
        onCustomChange={({ startDate: s, endDate: e }) => {
          setCustomStart(s);
          setCustomEnd(e);
        }}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-5">
        <KpiCard
          label="Total PKR"
          value={`Rs ${formatMoney(totals.PKR)}`}
          sub={`${totalCount} transaction${totalCount === 1 ? '' : 's'}`}
          tone="blue"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 4h12M6 8h12M6 4c4 0 6 2 6 6s-2 6-6 6h-1l8 8" />
            </svg>
          }
        />
        <KpiCard
          label="Total USD"
          value={`$ ${formatMoney(totals.USD)}`}
          sub="Multi-currency"
          tone="emerald"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="2" x2="12" y2="22" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          }
        />
        <KpiCard
          label="Transactions"
          value={String(totalCount)}
          sub="In selected range"
          tone="violet"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 7h16M4 12h10M4 17h16" />
            </svg>
          }
        />
      </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 flex">
          <SpendingByCategory data={categoryData} loading={loading} />
        </div>
        <div className="flex">
          <PaymentMethodsList data={methodData} loading={loading} />
        </div>
      </div>

      <div className="mt-5">
        <RecentTransactions transactions={recent} loading={loading} />
      </div>
    </div>
  );
}