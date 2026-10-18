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
  Sparkles,
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
    <div className="p-5 sm:p-6 bg-slate-50/70 hover:bg-slate-50 border border-gray-200/80 rounded-2xl transition-all group flex flex-col justify-between">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            {title}
          </p>
          <p className="text-2xl sm:text-3xl font-display font-black text-gray-900 mt-1 tracking-tight">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
          )}
        </div>
        <div className={`w-11 h-11 ${color} rounded-2xl flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform`}>
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
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : isExpired
      ? 'bg-rose-50 text-rose-700 border-rose-200'
      : 'bg-gray-100 text-gray-600 border-gray-200';

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
      const response = await subscriptionAPI.getPlans();
      const allPlans = response.data.data || [];
      const paidPlans = allPlans.filter(
        (plan) => Number(plan.price) > 0 && plan.planName?.toLowerCase() !== 'free'
      );
      setPlans(paidPlans);
    } catch (error) {
      console.error('Failed to load plans:', error);
      toast.error('Could not load subscription plans.');
    } finally {
      setLoadingPlans(false);
    }

    loadRequests();
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
      return format(parseISO(value), 'MMMM d, yyyy');
    } catch {
      return value;
    }
  };

  return (
    <>
      {/* ── Full-Width Integrated Subscription Banner ── */}
      <div className="w-full px-6 sm:px-10 lg:px-14 py-6 bg-gradient-to-r from-amber-500/10 via-indigo-500/5 to-purple-500/10 border-b border-amber-200/70">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs font-bold">
              <CreditCard size={22} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-full">
                  Subscription Tier
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase border ${statusClasses}`}>
                  {subscription?.status || 'UNKNOWN'}
                </span>
              </div>

              <h2 className="text-xl font-display font-extrabold text-gray-900 mt-1">
                {subscription?.planName || 'Free'} Plan
              </h2>

              <p className="text-xs text-gray-500 mt-0.5">
                {isActive
                  ? isFree
                    ? `${subscription.daysRemaining} days remaining in your trial period`
                    : 'Your tenant license is fully active with all enterprise perks'
                  : isExpired
                    ? 'Your subscription cycle has expired'
                    : 'Your subscription has not started'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={openPlans}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-extrabold shadow-sm shadow-indigo-600/20 transition-all"
            >
              <CreditCard size={15} />
              <span>View Upgrade Plans</span>
            </button>
          </div>
        </div>

        {isActive && isFree && startDate && endDate && (
          <div className="mt-5 max-w-xl">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-gray-500 font-semibold">Trial Timeline</span>
              <span className="text-xs font-bold text-indigo-700">
                {Math.round(progress)}% elapsed
              </span>
            </div>

            <div className="w-full h-2 bg-indigo-100/70 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5 pt-4 border-t border-amber-200/50">
          <div className="flex items-center gap-2.5 text-xs">
            <CalendarDays size={16} className="text-amber-600" />
            <span className="text-gray-500">Trial Started:</span>
            <span className="font-bold text-gray-800">{formatDate(startDate)}</span>
          </div>

          <div className="flex items-center gap-2.5 text-xs">
            <CalendarDays size={16} className="text-amber-600" />
            <span className="text-gray-500">{isExpired ? 'Expired On:' : 'Renewal / Ends:'}</span>
            <span className="font-bold text-gray-800">{formatDate(endDate)}</span>
          </div>
        </div>

        {isExpired && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            Your trial has expired. Select a paid plan to keep enjoying full platform capabilities.
          </div>
        )}

        {paymentPendingApproval && (
          <div className="mt-4 p-3.5 rounded-xl border border-amber-300 bg-amber-50/90">
            <p className="text-xs font-bold text-amber-800">Payment Verified — Awaiting Admin Approval</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Plan: {currentPayment.subscription?.planName || plans.find((plan) => plan.subscriptionId === currentPayment.subscription?.subscriptionId)?.planName || 'Selected plan'}. Your tier will be activated as soon as an administrator verifies the request.
            </p>
          </div>
        )}

        {pendingRequest && !paymentPendingApproval && (
          <div className="mt-4 p-3.5 rounded-xl border border-amber-300 bg-amber-50/90">
            <p className="text-xs font-bold text-amber-800">
              Upgrade Request Pending
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              Requested plan:{' '}
              {pendingRequest.requestedSubscription?.planName || 'Selected plan'}.
              Waiting for administrator approval.
            </p>
          </div>
        )}
      </div>

      {/* ── Upgrade Plans Modal ── */}
      {showPlans && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/65 backdrop-blur-md backdrop-fade-in transition-opacity"
            onClick={() => setShowPlans(false)}
            aria-hidden="true"
          />

          {/* Modal Container */}
          <div
            className="relative w-full max-w-4xl my-auto bg-white rounded-3xl shadow-[0_25px_60px_-15px_rgba(15,23,42,0.35)] border border-slate-100 overflow-hidden modal-pop-in z-10"
            role="dialog"
            aria-modal="true"
          >
            {/* Top accent line */}
            <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-indigo-500 to-purple-600" />

            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-b from-gray-50/60 to-white">
              <div>
                <h2 className="text-xl font-display font-extrabold text-gray-900 tracking-tight">
                  Choose Your Subscription Plan
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Select a billing package to activate enterprise platform features
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowPlans(false)}
                aria-label="Close subscription plans"
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100/80 rounded-xl transition-all"
              >
                <X size={19} />
              </button>
            </div>

            <div className="p-6 sm:p-7 max-h-[calc(88vh-100px)] overflow-y-auto">
              {loadingPlans ? (
                <div className="py-16 text-center">
                  <RefreshCw size={28} className="animate-spin mx-auto text-indigo-600" />
                  <p className="text-xs text-gray-400 mt-3 font-medium">Loading subscription plans...</p>
                </div>
              ) : plans.length === 0 ? (
                <div className="py-16 text-center text-gray-400 text-xs font-medium">
                  No subscription packages currently available.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {plans.map((plan) => {
                    const isCurrentPlan =
                      plan.planName?.toLowerCase() ===
                      subscription?.planName?.toLowerCase();

                    return (
                      <div
                        key={plan.subscriptionId}
                        className="rounded-2xl border border-gray-200 p-6 hover:border-indigo-400 transition-all flex flex-col justify-between bg-slate-50/50 hover:bg-white"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-3">
                            <h3 className="text-lg font-bold text-gray-900">
                              {plan.planName}
                            </h3>
                            <CreditCard size={20} className="text-indigo-600" />
                          </div>

                          <p className="text-2xl font-black text-gray-900 mt-3 font-display">
                            Rs.{' '}
                            {Number(plan.price || 0).toLocaleString('en-LK', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </p>

                          <p className="text-xs text-gray-500 mt-1">
                            Duration: {plan.durationDays || 30} Calendar Days
                          </p>
                        </div>

                        <button
                          type="button"
                          disabled={
                            isCurrentPlan ||
                            submittingId !== null ||
                            processingPayment
                          }
                          onClick={() => submitRequest(plan)}
                          className="w-full mt-6 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-extrabold disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all shadow-xs"
                        >
                          {submittingId === plan.subscriptionId
                            ? 'Creating payment...'
                            : isCurrentPlan
                              ? 'Current Active Plan'
                              : currentPayment?.subscription?.subscriptionId === plan.subscriptionId && currentPayment?.paymentStatus === 'PENDING'
                                ? 'Payment Created'
                                : 'Select & Create Payment'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {currentPayment && (
                <div className="mt-6 p-5 rounded-2xl border border-indigo-200 bg-indigo-50/80">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-indigo-900 text-sm">Development Test Payment</h3>
                      <p className="text-xs text-indigo-800 mt-1">
                        Payment #{currentPayment.paymentId} · {currentPayment.subscription?.planName || plans.find((plan) => plan.subscriptionId === currentPayment.subscription?.subscriptionId)?.planName || 'Selected plan'}
                      </p>
                      <p className="text-xs text-indigo-800 mt-0.5">
                        Amount: {currentPayment.currency || 'LKR'} {Number(currentPayment.amount || 0).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs mt-2 font-bold text-indigo-900">
                        Status: {currentPayment.paymentStatus} · Approval: {currentPayment.approvalStatus}
                      </p>
                    </div>

                    {currentPayment.paymentStatus === 'PENDING' && currentPayment.approvalStatus === 'PENDING' && (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          type="button"
                          disabled={processingPayment}
                          onClick={() => simulatePayment(true)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold disabled:opacity-50"
                        >
                          {processingPayment ? 'Processing...' : 'Test Payment Success'}
                        </button>
                        <button
                          type="button"
                          disabled={processingPayment}
                          onClick={() => simulatePayment(false)}
                          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold disabled:opacity-50"
                        >
                          Test Payment Failed
                        </button>
                      </div>
                    )}
                  </div>

                  {paymentPendingApproval && (
                    <p className="mt-3 text-xs text-amber-800 font-semibold">
                      Payment verified in test environment. Waiting for administrator approval.
                    </p>
                  )}
                  {currentPayment.paymentStatus === 'FAILED' && (
                    <p className="mt-3 text-xs text-rose-700 font-semibold">
                      This test payment failed. You can create a new payment request to try again.
                    </p>
                  )}
                </div>
              )}

              {/* Upgrade Request History */}
              <div className="mt-8 border-t border-gray-100 pt-5">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <h3 className="font-bold text-gray-900 text-sm">
                    Upgrade Request History
                  </h3>
                  <button
                    type="button"
                    onClick={loadRequests}
                    disabled={loadingRequests}
                    className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-bold"
                  >
                    <RefreshCw
                      size={13}
                      className={loadingRequests ? 'animate-spin' : ''}
                    />
                    Refresh
                  </button>
                </div>

                {loadingRequests ? (
                  <p className="text-xs text-gray-400">Loading history...</p>
                ) : requests.length === 0 ? (
                  <p className="text-xs text-gray-400">
                    No upgrade requests submitted yet.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {requests.map((request) => (
                      <div
                        key={request.requestId}
                        className="p-3.5 rounded-xl border border-gray-100 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div>
                          <p className="text-xs font-bold text-gray-900">
                            {request.requestedSubscription?.planName || 'Plan'}
                          </p>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            Submitted on {formatDate(request.requestDate)}
                          </p>
                          {request.adminNote && (
                            <p className="text-[11px] text-gray-500 mt-0.5">
                              Admin note: {request.adminNote}
                            </p>
                          )}
                        </div>

                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg self-start ${
                            request.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-700'
                              : request.status === 'REJECTED'
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {request.status === 'APPROVED' && (
                            <CheckCircle size={12} />
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
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-gray-400 font-medium">Loading dashboard overview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-full flex flex-col bg-white pb-16">
      {/* ── Page Header Bar (Full Width) ── */}
      <div className="px-6 sm:px-10 lg:px-14 py-6 border-b border-gray-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-gray-900 tracking-tight">
            Good{' '}
            {new Date().getHours() < 12
              ? 'morning'
              : new Date().getHours() < 17
                ? 'afternoon'
                : 'evening'}
            , {user?.name} 👋
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            {format(new Date(), 'EEEE, MMMM d, yyyy')} — Here's your real-time business performance overview
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1.5 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Dashboard
          </span>
        </div>
      </div>

      {/* ── Subscription Status Section (Full Width) ── */}
      {subscriptionError ? (
        <div className="px-6 sm:px-10 lg:px-14 py-3 bg-amber-50 border-b border-amber-200 text-xs font-semibold text-amber-800">
          Subscription details could not be loaded. Please refresh the page or try again.
        </div>
      ) : (
        <SubscriptionCard subscription={subscription} />
      )}

      {/* ── Key Metrics Performance Grid (Full Width) ── */}
      <div className="px-6 sm:px-10 lg:px-14 py-8 border-b border-gray-200/80 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Financial & Operational Performance
          </h2>
          <span className="text-[11px] font-semibold text-gray-400 hidden sm:inline">
            Updated in real-time
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
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
            icon={Sparkles}
            color="bg-indigo-600"
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
            subtitle="Below 5 units"
          />
        </div>
      </div>

      {/* ── Analytics & Activity (Full Width 2-Column Split) ── */}
      <div className="px-6 sm:px-10 lg:px-14 py-8 bg-white flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Top Selling Products */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-display font-bold text-gray-900">
                  Top Selling Products
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Best-performing catalog items by unit volume
                </p>
              </div>
            </div>

            {data?.topSellingProducts?.length > 0 ? (
              <div className="pt-2">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={data.topSellingProducts}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(value) => [value, 'Qty Sold']}
                      contentStyle={{
                        borderRadius: 12,
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
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
              </div>
            ) : (
              <div className="py-16 text-center border border-dashed border-gray-200 rounded-2xl">
                <p className="text-xs text-gray-400 font-medium">No sales data recorded yet</p>
              </div>
            )}
          </div>

          {/* Recent Invoices */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-display font-bold text-gray-900">
                  Recent Invoices
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Latest transactions recorded across all customers
                </p>
              </div>
            </div>

            {data?.recentInvoices?.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {data.recentInvoices.map((invoice, index) => (
                  <div
                    key={invoice.invoiceId ?? index}
                    className="flex items-center justify-between py-3 hover:bg-slate-50/80 px-2 rounded-xl transition-colors"
                  >
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-gray-900">
                        #{invoice.invoiceId} — {invoice.customerName}
                      </p>
                      <p className="text-[11px] text-gray-400">{invoice.date}</p>
                    </div>

                    <span className="font-bold text-emerald-600 text-xs">
                      {formatCurrency(invoice.totalAmount)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center border border-dashed border-gray-200 rounded-2xl">
                <p className="text-xs text-gray-400 font-medium">No recent invoices recorded</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
