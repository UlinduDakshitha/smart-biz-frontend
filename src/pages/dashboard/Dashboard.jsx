
import { useEffect, useState } from 'react';
import { dashboardAPI, subscriptionAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  TrendingUp,
  TrendingDown,
  Receipt,
  Users,
  AlertTriangle,
  Clock,
  CalendarDays
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { format, parseISO, differenceInCalendarDays } from 'date-fns';

function StatCard({ title, value, icon: Icon, color, subtitle }) {
  return (
    <div className="card fade-in">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
            {title}
          </p>
          <p className="text-2xl font-display font-bold text-indigo-900 mt-1">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>

        <div className={`w-11 h-11 ${color} rounded-2xl flex items-center justify-center`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
    </div>
  );
}

function SubscriptionCard({ subscription }) {
  if (!subscription) return null;

  const isActive = subscription.status === 'ACTIVE';
  const isExpired = subscription.status === 'EXPIRED';
  const isFree = subscription.planName?.toLowerCase() === 'free';

  const startDate = subscription.trialStartDate;
  const endDate = subscription.trialEndDate;

  // Visual progress is based on the original 30-day trial.
  let progress = 0;

  if (startDate && endDate) {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    const today = new Date();

    const totalDays = Math.max(
      1,
      differenceInCalendarDays(end, start)
    );

    const elapsedDays = differenceInCalendarDays(today, start);

    progress = Math.min(
      100,
      Math.max(0, (elapsedDays / totalDays) * 100)
    );
  }

  const statusClasses = isActive
    ? 'bg-emerald-50 text-emerald-700'
    : isExpired
      ? 'bg-rose-50 text-rose-700'
      : 'bg-gray-100 text-gray-600';

  return (
    <div className="card mb-8 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
            <Clock size={23} className="text-indigo-600" />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Current Subscription
            </p>

            <h2 className="text-xl font-display font-bold text-indigo-900 mt-1">
              {subscription.planName || 'No Plan'} Plan
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              {isActive
                ? isFree
                  ? `${subscription.daysRemaining} days remaining in your free trial`
                  : `${subscription.daysRemaining} days remaining`
                : isExpired
                  ? 'Your trial or subscription has expired'
                  : 'Your trial has not started'}
            </p>
          </div>
        </div>

        <span className={`px-3 py-2 rounded-xl text-xs font-bold uppercase self-start ${statusClasses}`}>
          {subscription.status || 'UNKNOWN'}
        </span>
      </div>

      {isActive && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">Trial progress</span>
            <span className="text-xs font-semibold text-indigo-700">
              {Math.round(progress)}%
            </span>
          </div>

          <div className="w-full h-2 bg-indigo-50 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5 pt-5 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <CalendarDays size={18} className="text-gray-400" />
          <div>
            <p className="text-xs text-gray-400">Trial Started</p>
            <p className="text-sm font-semibold text-indigo-900">
              {startDate
                ? format(parseISO(startDate), 'MMM d, yyyy')
                : 'Not available'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <CalendarDays size={18} className="text-gray-400" />
          <div>
            <p className="text-xs text-gray-400">
              {isExpired ? 'Expired On' : 'Trial Ends'}
            </p>
            <p className="text-sm font-semibold text-indigo-900">
              {endDate
                ? format(parseISO(endDate), 'MMM d, yyyy')
                : 'Not available'}
            </p>
          </div>
        </div>
      </div>

      {isExpired && (
        <div className="mt-5 p-4 rounded-xl bg-rose-50 text-rose-700 text-sm">
          Your trial has ended. Please contact the administrator to discuss your subscription options.
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionError, setSubscriptionError] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    let isMounted = true;

    dashboardAPI
      .get()
      .then((res) => {
        if (isMounted) {
          setData(res.data.data);
        }
      })
      .catch((error) => {
        console.error('Failed to load dashboard:', error);
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    subscriptionAPI
      .getStatus()
      .then((res) => {
        if (isMounted) {
          setSubscription(res.data.data);
          setSubscriptionError(false);
        }
      })
      .catch((error) => {
        console.error('Failed to load subscription status:', error);

        if (isMounted) {
          setSubscriptionError(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const formatCurrency = (val) =>
    `Rs. ${Number(val || 0).toLocaleString('en-LK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-10 h-10 border-4 border-primary-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-indigo-900">
          Good{' '}
          {new Date().getHours() < 12
            ? 'morning'
            : new Date().getHours() < 17
              ? 'afternoon'
              : 'evening'}
          , {user?.name} 👋
        </h1>

        <p className="text-gray-400 text-sm mt-1">
          {format(new Date(), 'EEEE, MMMM d yyyy')} — Here's your business overview
        </p>
      </div>

      {/* Subscription Card */}
      {subscriptionError ? (
        <div className="card mb-8 text-sm text-gray-500">
          Subscription details could not be loaded. Please refresh the page or try again.
        </div>
      ) : (
        <SubscriptionCard subscription={subscription} />
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        <StatCard
          title="Sales This Month"
          value={formatCurrency(data?.totalSalesThisMonth)}
          icon={TrendingUp}
          color="bg-emerald-500"
        />

        <StatCard
          title="Expenses This Month"
          value={formatCurrency(data?.totalExpensesThisMonth)}
          icon={TrendingDown}
          color="bg-rose-500"
        />

        <StatCard
          title="Net Profit"
          value={formatCurrency(data?.netProfitThisMonth)}
          icon={TrendingUp}
          color="bg-primary-600"
        />

        <StatCard
          title="Total Invoices"
          value={data?.totalInvoices || 0}
          icon={Receipt}
          color="bg-amber-500"
        />

        <StatCard
          title="Customers"
          value={data?.totalCustomers || 0}
          icon={Users}
          color="bg-blue-500"
        />

        <StatCard
          title="Low Stock"
          value={data?.lowStockCount || 0}
          icon={AlertTriangle}
          color="bg-orange-500"
          subtitle="Products below 5 units"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <div className="card">
          <h3 className="font-display font-semibold text-indigo-900 mb-4">
            Top Selling Products
          </h3>

          {data?.topSellingProducts?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={data.topSellingProducts}
                margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f4ff" />

                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                />

                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />

                <Tooltip
                  formatter={(val) => [val, 'Qty Sold']}
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #e0e9ff',
                    fontSize: 12
                  }}
                />

                <Bar
                  dataKey="totalQty"
                  fill="#6366f1"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm text-center py-8">
              No sales data yet
            </p>
          )}
        </div>

        {/* Recent Invoices */}
        <div className="card">
          <h3 className="font-display font-semibold text-indigo-900 mb-4">
            Recent Invoices
          </h3>

          {data?.recentInvoices?.length > 0 ? (
            <div className="space-y-3">
              {data.recentInvoices.map((inv, i) => (
                <div
                  key={inv.invoiceId ?? i}
                  className="flex items-center justify-between py-2 border-b border-indigo-50 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-indigo-900">
                      #{inv.invoiceId} — {inv.customerName}
                    </p>
                    <p className="text-xs text-gray-400">{inv.date}</p>
                  </div>

                  <span className="font-semibold text-emerald-600 text-sm">
                    {formatCurrency(inv.totalAmount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-8">
              No recent invoices
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
