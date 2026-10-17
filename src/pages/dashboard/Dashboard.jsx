
import { useEffect, useState } from 'react';
import { dashboardAPI, subscriptionAPI, paymentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
  TrendingUp,
  TrendingDown,
  Receipt,
  Users,
  AlertTriangle,
  Clock,
  CalendarDays,
  X,
  CreditCard,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
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
  const [showPlans, setShowPlans] = useState(false);
  const [plans, setPlans] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [submittingId, setSubmittingId] = useState(null);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [currentPayment, setCurrentPayment] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  const isActive = subscription?.status === 'ACTIVE';
  const isExpired = subscription?.status === 'EXPIRED';
  const isFree = subscription?.planName?.toLowerCase() === 'free';

  const startDate = subscription?.trialStartDate;
  const endDate = subscription?.trialEndDate;

  let progress = 0;

  if (startDate && endDate) {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    const totalDays = Math.max(1, differenceInCalendarDays(end, start));
    const elapsedDays = differenceInCalendarDays(new Date(), start);
    progress = Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));
  }

  const statusClasses = isActive
    ? 'bg-emerald-50 text-emerald-700'
    : isExpired
      ? 'bg-rose-50 text-rose-700'
      : 'bg-gray-100 text-gray-600';

  const loadRequests = async () => {
    setLoadingRequests(true);
    try {
      const response = await subscriptionAPI.getMyUpgradeRequests();
      setRequests(response.data.data || []);
    } catch (error) {
      console.error('Failed to load upgrade requests:', error);
      toast.error('Could not load upgrade request history.');
    } finally {
      setLoadingRequests(false);
    }
  };

  const openPlans = async () => {
    setShowPlans(true);
    setLoadingPlans(true);

    try {
      const [plansResponse, requestsResponse] = await Promise.all([
        subscriptionAPI.getPlans(),
        subscriptionAPI.getMyUpgradeRequests(),
      ]);

      setPlans(
        (plansResponse.data.data || []).filter(
          (plan) => Number(plan.price) > 0
        )
      );
      setRequests(requestsResponse.data.data || []);
    } catch (error) {
      console.error('Failed to load subscription options:', error);
      toast.error(
        error.response?.data?.message || 'Failed to load subscription plans.'
      );
    } finally {
      setLoadingPlans(false);
    }
  };

  const submitRequest = async (plan) => {
    setSubmittingId(plan.subscriptionId);

    try {
      const response = await paymentAPI.createPayment(plan.subscriptionId);
      const payment = response.data?.data ?? response.data;
      setCurrentPayment(payment);
      toast.success('Payment request created. Choose a test payment result.');
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to create payment request.'
      );
    } finally {
      setSubmittingId(null);
    }
  };

  const simulatePayment = async (success) => {
    if (!currentPayment?.paymentId) {
      toast.error('Create a payment request first.');
      return;
    }

    setProcessingPayment(true);
    try {
      const response = success
        ? await paymentAPI.simulatePaymentSuccess(currentPayment.paymentId)
        : await paymentAPI.simulatePaymentFailure(currentPayment.paymentId);
      const payment = response.data?.data ?? response.data;
      setCurrentPayment(payment);

      if (success) {
        toast.success('Test payment successful. Waiting for admin approval.');
      } else {
        toast.error('Test payment failed. You can create another payment request.');
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Could not process test payment. Check your login role and backend configuration.'
      );
    } finally {
      setProcessingPayment(false);
    }
  };

  const pendingRequest = requests.find(
    (request) => request.status === 'PENDING'
  );

  const paymentPendingApproval =
    currentPayment?.paymentStatus === 'VERIFIED' &&
    currentPayment?.approvalStatus === 'PENDING';

  const formatDate = (value) => {
    if (!value) return 'Not available';

    try {
      return format(parseISO(value), 'MMM d, yyyy');
    } catch {
      return value;
    }
  };

  return (
    <>
      <div className="card mb-8 fade-in">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0">
              <Clock size={23} className="text-indigo-600" />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Current Subscription
              </p>

              <h2 className="text-xl font-display font-bold text-indigo-900 mt-1">
                {subscription?.planName || 'No Plan'} Plan
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                {isActive
                  ? isFree
                    ? `${subscription.daysRemaining} days remaining in your free trial`
                    : 'Your subscription is active'
                  : isExpired
                    ? 'Your trial or subscription has expired'
                    : 'Your subscription has not started'}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-3">
            <span className={`px-3 py-2 rounded-xl text-xs font-bold uppercase ${statusClasses}`}>
              {subscription?.status || 'UNKNOWN'}
            </span>

            <button
              type="button"
              onClick={openPlans}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors"
            >
              <CreditCard size={16} />
              View Upgrade Plans
            </button>
          </div>
        </div>

        {isActive && isFree && startDate && endDate && (
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
                {formatDate(startDate)}
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
                {formatDate(endDate)}
              </p>
            </div>
          </div>
        </div>

        {isExpired && (
          <div className="mt-5 p-4 rounded-xl bg-rose-50 text-rose-700 text-sm">
            Your trial has ended. Choose a paid plan to request an upgrade.
          </div>
        )}

        {paymentPendingApproval && (
          <div className="mt-5 p-4 rounded-xl border border-amber-200 bg-amber-50">
            <p className="text-sm font-semibold text-amber-800">Payment successful — pending admin approval</p>
            <p className="text-sm text-amber-700 mt-1">
              Plan: {currentPayment.subscription?.planName || plans.find((plan) => plan.subscriptionId === currentPayment.subscription?.subscriptionId)?.planName || 'Selected plan'}. Your subscription will be activated after an administrator approves the payment.
            </p>
          </div>
        )}

        {pendingRequest && !paymentPendingApproval && (
          <div className="mt-5 p-4 rounded-xl border border-amber-200 bg-amber-50">
            <p className="text-sm font-semibold text-amber-800">
              Upgrade request pending
            </p>
            <p className="text-sm text-amber-700 mt-1">
              Requested plan:{' '}
              {pendingRequest.requestedSubscription?.planName || 'Selected plan'}.
              Waiting for administrator approval.
            </p>
          </div>
        )}
      </div>

      {showPlans && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setShowPlans(false);
            }
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 p-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-indigo-900">
                  Choose Your Plan
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Select a paid plan and submit a request for admin approval.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowPlans(false)}
                aria-label="Close subscription plans"
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5">
              {loadingPlans ? (
                <div className="py-12 text-center">
                  <RefreshCw size={28} className="animate-spin mx-auto text-indigo-600" />
                  <p className="text-sm text-gray-500 mt-3">Loading plans...</p>
                </div>
              ) : plans.length === 0 ? (
                <div className="py-12 text-center text-gray-500">
                  No paid subscription plans are available.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {plans.map((plan) => {
                    const isCurrentPlan =
                      plan.planName?.toLowerCase() ===
                      subscription?.planName?.toLowerCase();

                    return (
                      <div
                        key={plan.subscriptionId}
                        className="rounded-2xl border border-gray-200 p-5 hover:border-indigo-300 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="text-lg font-bold text-indigo-900">
                            {plan.planName}
                          </h3>
                          <CreditCard size={20} className="text-indigo-500" />
                        </div>

                        <p className="text-2xl font-extrabold text-gray-900 mt-4">
                          Rs.{' '}
                          {Number(plan.price || 0).toLocaleString('en-LK', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>

                        <p className="text-sm text-gray-500 mt-1">
                          Per {plan.durationDays || 30} days
                        </p>

                        <button
                          type="button"
                          disabled={
                            isCurrentPlan ||
                            submittingId !== null ||
                            processingPayment
                          }
                          onClick={() => submitRequest(plan)}
                          className="w-full mt-5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
                        >
                          {submittingId === plan.subscriptionId
                            ? 'Creating payment...'
                            : isCurrentPlan
                              ? 'Current Plan'
                              : currentPayment?.subscription?.subscriptionId === plan.subscriptionId && currentPayment?.paymentStatus === 'PENDING'
                                ? 'Payment Created'
                                : 'Create Payment'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {currentPayment && (
                <div className="mt-6 p-5 rounded-2xl border border-indigo-200 bg-indigo-50">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-indigo-900">Development Test Payment</h3>
                      <p className="text-sm text-indigo-800 mt-1">
                        Payment #{currentPayment.paymentId} · {currentPayment.subscription?.planName || plans.find((plan) => plan.subscriptionId === currentPayment.subscription?.subscriptionId)?.planName || 'Selected plan'}
                      </p>
                      <p className="text-sm text-indigo-800 mt-1">
                        Amount: {currentPayment.currency || 'LKR'} {Number(currentPayment.amount || 0).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-sm mt-2 font-semibold">
                        Payment status: {currentPayment.paymentStatus} · Approval: {currentPayment.approvalStatus}
                      </p>
                    </div>
                    {currentPayment.paymentStatus === 'PENDING' && currentPayment.approvalStatus === 'PENDING' && (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          type="button"
                          disabled={processingPayment}
                          onClick={() => simulatePayment(true)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold disabled:opacity-50"
                        >
                          {processingPayment ? 'Processing...' : 'Test Payment Success'}
                        </button>
                        <button
                          type="button"
                          disabled={processingPayment}
                          onClick={() => simulatePayment(false)}
                          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold disabled:opacity-50"
                        >
                          Test Payment Failed
                        </button>
                      </div>
                    )}
                  </div>
                  {paymentPendingApproval && (
                    <p className="mt-3 text-sm text-amber-800 font-medium">
                      Payment verified in test mode. Waiting for administrator approval.
                    </p>
                  )}
                  {currentPayment.paymentStatus === 'FAILED' && (
                    <p className="mt-3 text-sm text-rose-700">
                      This test payment failed. Create a new payment request to try again.
                    </p>
                  )}
                  <p className="mt-3 text-xs text-indigo-700">
                    Mock payment is for development testing only; it does not process real money.
                  </p>
                </div>
              )}

              <div className="mt-8 border-t border-gray-100 pt-5">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <h3 className="font-bold text-indigo-900">
                    Upgrade Request History
                  </h3>
                  <button
                    type="button"
                    onClick={loadRequests}
                    disabled={loadingRequests}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
                  >
                    <RefreshCw
                      size={13}
                      className={loadingRequests ? 'animate-spin' : ''}
                    />
                    Refresh
                  </button>
                </div>

                {loadingRequests ? (
                  <p className="text-sm text-gray-500">Loading request history...</p>
                ) : requests.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    You have not submitted any upgrade requests.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {requests.map((request) => (
                      <div
                        key={request.requestId}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl bg-gray-50 p-4"
                      >
                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            {request.requestedSubscription?.planName || 'Subscription'}
                          </p>

                          <p className="text-xs text-gray-500 mt-1">
                            Requested:{' '}
                            {request.requestDate
                              ? format(
                                  parseISO(request.requestDate),
                                  'MMM d, yyyy h:mm a'
                                )
                              : 'Date unavailable'}
                          </p>

                          {request.adminNote && (
                            <p className="text-xs text-gray-500 mt-1">
                              Admin note: {request.adminNote}
                            </p>
                          )}
                        </div>

                        <span
                          className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg self-start ${
                            request.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-700'
                              : request.status === 'REJECTED'
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {request.status === 'APPROVED' && (
                            <CheckCircle size={13} />
                          )}
                          {request.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
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
        toast.error('Failed to load dashboard data.');
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

  const formatCurrency = (value) =>
    `Rs. ${Number(value || 0).toLocaleString('en-LK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
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

      {subscriptionError ? (
        <div className="card mb-8 text-sm text-gray-500">
          Subscription details could not be loaded. Please refresh the page or try again.
        </div>
      ) : (
        <SubscriptionCard subscription={subscription} />
      )}

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  formatter={(value) => [value, 'Qty Sold']}
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #e0e9ff',
                    fontSize: 12,
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

        <div className="card">
          <h3 className="font-display font-semibold text-indigo-900 mb-4">
            Recent Invoices
          </h3>

          {data?.recentInvoices?.length > 0 ? (
            <div className="space-y-3">
              {data.recentInvoices.map((invoice, index) => (
                <div
                  key={invoice.invoiceId ?? index}
                  className="flex items-center justify-between py-2 border-b border-indigo-50 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-indigo-900">
                      #{invoice.invoiceId} — {invoice.customerName}
                    </p>
                    <p className="text-xs text-gray-400">{invoice.date}</p>
                  </div>

                  <span className="font-semibold text-emerald-600 text-sm">
                    {formatCurrency(invoice.totalAmount)}
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
