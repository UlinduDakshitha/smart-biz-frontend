
import { useEffect, useMemo, useState } from 'react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import Modal from '../../components/ui/Modal';
import ConfirmDeleteModal from '../../components/ui/ConfirmDeleteModal';
import ConfirmActionModal from '../../components/ui/ConfirmActionModal';
import {
  Plus,
  Pencil,
  Trash2,
  CreditCard,
  Check,
  RefreshCw,
  Users,
  DollarSign,
  Layers,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';

const emptyForm = {
  planName: '',
  price: '',
  durationDays: 30,
};

const STANDARD_PERKS = [
  'Full Invoicing & Sales Suite',
  'Customer & Supplier Management',
  'Real-Time Expense Tracking',
  'Automated Stock & Inventory',
  'OpenAI Assistant Invocations',
];

export default function AdminSubscriptions() {
  const [data, setData] = useState([]);
  const [businesses, setBusinesses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Create/edit plan modal
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  // Delete plan modal
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Action confirmation modal (for approve / reject)
  const [actionModal, setActionModal] = useState(null);

  // Upgrade requests
  const [upgradeRequests, setUpgradeRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [processingRequestId, setProcessingRequestId] = useState(null);
  const [adminNotes, setAdminNotes] = useState({});

  // Pending payments
  const [pendingPayments, setPendingPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [processingPaymentId, setProcessingPaymentId] = useState(null);
  const [paymentAdminNotes, setPaymentAdminNotes] = useState({});

  // Load subscription plans and businesses
  const loadData = async (isManual = false) => {
    if (isManual) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [subsRes, bizRes] = await Promise.all([
        adminAPI.getSubscriptions(),
        adminAPI.getBusinesses(),
      ]);

      setData(subsRes.data?.data ?? []);
      setBusinesses(bizRes.data?.data ?? []);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Failed to load subscription plans'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load pending upgrade requests
  const loadUpgradeRequests = async () => {
    setRequestsLoading(true);

    try {
      const response =
        await adminAPI.getPendingSubscriptionRequests();

      setUpgradeRequests(response.data?.data ?? []);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Failed to load upgrade requests'
      );
    } finally {
      setRequestsLoading(false);
    }
  };

  // Load pending payments awaiting admin review
  const loadPendingPayments = async () => {
    setPaymentsLoading(true);

    try {
      const response = await adminAPI.getPendingPayments();
      setPendingPayments(response.data?.data ?? []);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Failed to load pending payments'
      );
    } finally {
      setPaymentsLoading(false);
    }
  };

  // Approve or reject a payment with ConfirmActionModal
  const handlePaymentDecision = (payment, decision) => {
    const paymentId = payment.paymentId;
    const businessName =
      payment.business?.businessName ||
      payment.business?.name ||
      payment.business?.email ||
      `Business #${payment.business?.businessId ?? ''}`;

    if (
      decision === 'approve' &&
      payment.paymentStatus !== 'VERIFIED'
    ) {
      toast.error('Only verified payments can be approved.');
      return;
    }

    const adminNote = paymentAdminNotes[paymentId] ?? '';

    setActionModal({
      type: decision === 'approve' ? 'success' : 'danger',
      title:
        decision === 'approve'
          ? 'Approve Subscription Payment'
          : 'Reject Subscription Payment',
      itemName: businessName,
      description:
        decision === 'approve'
          ? `Approve this verified payment and activate the "${payment.subscription?.planName || 'Selected'}" plan for ${businessName}?`
          : `Reject this payment request for ${businessName}?`,
      details: [
        {
          label: 'Plan',
          value: payment.subscription?.planName || 'Unknown Plan',
        },
        {
          label: 'Amount',
          value: `${payment.currency || 'LKR'} ${formatPrice(payment.amount)}`,
        },
        {
          label: 'Status',
          value: payment.paymentStatus || 'PENDING',
        },
      ],
      confirmText:
        decision === 'approve' ? 'Approve & Activate' : 'Reject Payment',
      onConfirm: async () => {
        setProcessingPaymentId(paymentId);

        try {
          if (decision === 'approve') {
            await adminAPI.approvePayment(paymentId, adminNote);
            toast.success('Payment approved and subscription activated.');
          } else {
            await adminAPI.rejectPayment(paymentId, adminNote);
            toast.success('Payment rejected.');
          }

          setPaymentAdminNotes((previous) => {
            const updated = { ...previous };
            delete updated[paymentId];
            return updated;
          });

          setActionModal(null);

          await Promise.all([
            loadPendingPayments(),
            loadData(true),
          ]);
        } catch (error) {
          toast.error(
            error.response?.data?.message ||
              `Failed to ${decision} payment`
          );
        } finally {
          setProcessingPaymentId(null);
        }
      },
    });
  };

  useEffect(() => {
    loadData();
    loadUpgradeRequests();
    loadPendingPayments();
  }, []);

  // Subscription metrics
  const totalPlans = data.length;

  const paidPlans = data.filter(
    (plan) => Number(plan.price) > 0
  ).length;

  const freePlans = totalPlans - paidPlans;

  const maxPrice =
    data.length > 0
      ? Math.max(...data.map((plan) => Number(plan.price || 0)))
      : 0;

  // Count businesses subscribed to each plan
  const subscriberCounts = useMemo(() => {
    const counts = {};

    businesses.forEach((business) => {
      const id = business.subscription?.subscriptionId;

      if (id) {
        counts[id] = (counts[id] || 0) + 1;
      }
    });

    return counts;
  }, [businesses]);

  // Open create modal
  const openAdd = () => {
    setForm(emptyForm);
    setEditing(null);
    setModal(true);
  };

  // Open edit modal
  const openEdit = (plan) => {
    setForm({
      planName: plan.planName ?? '',
      price: plan.price ?? '',
      durationDays: plan.durationDays ?? 30,
    });

    setEditing(plan.subscriptionId);
    setModal(true);
  };

  // Create or update subscription plan
  const handleSave = async (event) => {
    event.preventDefault();

    if (!form.planName.trim()) {
      toast.error('Plan name is required');
      return;
    }

    const price = Number(form.price);
    const durationDays = Number(form.durationDays);

    if (!Number.isFinite(price) || price < 0) {
      toast.error('Enter a valid plan price');
      return;
    }

    if (
      !Number.isInteger(durationDays) ||
      durationDays < 1
    ) {
      toast.error('Duration must be at least one day');
      return;
    }

    const payload = {
      planName: form.planName.trim(),
      price,
      durationDays,
    };

    setSaving(true);

    try {
      if (editing) {
        await adminAPI.updateSubscription(editing, payload);

        toast.success(
          `Plan "${payload.planName}" updated successfully`
        );
      } else {
        await adminAPI.createSubscription(payload);

        toast.success(
          `Plan "${payload.planName}" created successfully`
        );
      }

      setModal(false);

      await loadData(true);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Failed to save subscription plan'
      );
    } finally {
      setSaving(false);
    }
  };

  // Delete subscription plan
  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);

    try {
      await adminAPI.deleteSubscription(
        deleteTarget.subscriptionId
      );

      toast.success(
        `Plan "${deleteTarget.planName}" deleted`
      );

      setDeleteTarget(null);

      await loadData(true);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Failed to delete plan. It might be assigned to businesses.'
      );
    } finally {
      setDeleting(false);
    }
  };

  // Approve or reject an upgrade request with ConfirmActionModal
  const handleUpgradeDecision = (request, decision) => {
    const requestId = request.requestId;
    const adminNote = adminNotes[requestId] ?? '';
    const business = request.business ?? {};
    const plan = request.requestedSubscription ?? {};
    const businessName =
      business.businessName ||
      business.name ||
      business.email ||
      `Business #${business.businessId ?? ''}`;

    setActionModal({
      type: decision === 'approve' ? 'success' : 'danger',
      title:
        decision === 'approve'
          ? 'Approve Upgrade Request'
          : 'Reject Upgrade Request',
      itemName: businessName,
      description:
        decision === 'approve'
          ? `Approve the upgrade request for ${businessName} and switch them to the "${plan.planName || 'requested'}" plan?`
          : `Reject the upgrade request for ${businessName}?`,
      details: [
        {
          label: 'Requested Plan',
          value: plan.planName || 'Unknown Plan',
        },
        {
          label: 'Plan Price',
          value: `Rs. ${formatPrice(plan.price)}`,
        },
        {
          label: 'Duration',
          value: `${plan.durationDays ?? '-'} Days`,
        },
      ],
      confirmText:
        decision === 'approve' ? 'Approve Upgrade' : 'Reject Request',
      onConfirm: async () => {
        setProcessingRequestId(requestId);

        try {
          if (decision === 'approve') {
            await adminAPI.approveSubscriptionRequest(
              requestId,
              adminNote
            );
            toast.success('Upgrade request approved successfully');
          } else {
            await adminAPI.rejectSubscriptionRequest(
              requestId,
              adminNote
            );
            toast.success('Upgrade request rejected');
          }

          setAdminNotes((previous) => {
            const updated = { ...previous };
            delete updated[requestId];
            return updated;
          });

          setActionModal(null);

          await Promise.all([
            loadUpgradeRequests(),
            loadData(true),
          ]);
        } catch (error) {
          toast.error(
            error.response?.data?.message ||
              `Failed to ${decision} upgrade request`
          );
        } finally {
          setProcessingRequestId(null);
        }
      },
    });
  };

  const formatPrice = (price) =>
    Number(price || 0).toLocaleString('en-LK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const formatDate = (date) => {
    if (!date) return 'Date unavailable';

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return 'Date unavailable';
    }

    return parsedDate.toLocaleString();
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold mb-2 border border-amber-100">
            <CreditCard size={14} />
            Monetization & Tiers
          </div>

          <h1 className="text-2xl font-extrabold text-gray-900">
            Subscription Plans
          </h1>

          <p className="text-gray-500 text-sm mt-1">
            Manage subscription pricing, durations and business upgrade requests.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() =>
              Promise.all([
                loadData(true),
                loadUpgradeRequests(),
              ])
            }
            disabled={refreshing || requestsLoading}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-xl border border-gray-200 disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={
                refreshing || requestsLoading
                  ? 'animate-spin'
                  : ''
              }
            />
            Refresh All
          </button>

          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-bold shadow-sm"
          >
            <Plus size={16} />
            Create New Plan
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase">
              Total Tiers
            </span>
            <Layers size={21} className="text-amber-500" />
          </div>

          <p className="text-2xl font-extrabold text-gray-900 mt-3">
            {totalPlans}
          </p>

          <p className="text-xs text-gray-400 mt-1">
            Subscription packages
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase">
              Paid Tiers
            </span>
            <DollarSign size={21} className="text-purple-600" />
          </div>

          <p className="text-2xl font-extrabold text-purple-600 mt-3">
            {paidPlans}
          </p>

          <p className="text-xs text-gray-400 mt-1">
            Paid subscription packages
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase">
              Free Tiers
            </span>
            <CreditCard size={21} className="text-blue-600" />
          </div>

          <p className="text-2xl font-extrabold text-blue-600 mt-3">
            {freePlans}
          </p>

          <p className="text-xs text-gray-400 mt-1">
            Free and trial packages
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase">
              Highest Plan Price
            </span>
            <DollarSign size={21} className="text-emerald-600" />
          </div>

          <p className="text-2xl font-extrabold text-emerald-600 mt-3">
            Rs. {formatPrice(maxPrice)}
          </p>

          <p className="text-xs text-gray-400 mt-1">
            Highest available price
          </p>
        </div>
      </div>

      {/* Upgrade requests */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        <div className="p-5 md:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Clock size={20} className="text-amber-600" />

              <h2 className="text-lg font-bold text-gray-900">
                Subscription Upgrade Requests
              </h2>

              {upgradeRequests.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                  {upgradeRequests.length}
                </span>
              )}
            </div>

            <p className="text-sm text-gray-500 mt-1">
              Review and manage pending requests from businesses.
            </p>
          </div>

          <button
            type="button"
            onClick={loadUpgradeRequests}
            disabled={requestsLoading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw
              size={14}
              className={
                requestsLoading ? 'animate-spin' : ''
              }
            />
            Refresh Requests
          </button>
        </div>

        <div className="p-5 md:p-6">
          {requestsLoading ? (
            <div className="py-10 text-center">
              <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />

              <p className="text-sm text-gray-500">
                Loading upgrade requests...
              </p>
            </div>
          ) : upgradeRequests.length === 0 ? (
            <div className="py-10 text-center border border-dashed border-gray-200 rounded-xl">
              <CheckCircle
                size={34}
                className="mx-auto mb-3 text-emerald-500"
              />

              <h3 className="font-bold text-gray-800">
                No pending upgrade requests
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                New business requests will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {upgradeRequests.map((request) => {
                const business = request.business ?? {};
                const plan = request.requestedSubscription ?? {};

                const businessName =
                  business.businessName ||
                  business.name ||
                  business.email ||
                  `Business #${business.businessId ?? ''}`;

                const isProcessing =
                  processingRequestId === request.requestId;

                return (
                  <div
                    key={request.requestId}
                    className="border border-gray-200 rounded-xl p-4 md:p-5"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">

                      <div className="flex-1 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-gray-900">
                            {businessName}
                          </h3>

                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold">
                            <Clock size={12} />
                            {request.status || 'PENDING'}
                          </span>
                        </div>

                        {business.email && (
                          <p className="text-sm text-gray-500">
                            Email: {business.email}
                          </p>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500 mb-1">
                              Requested Plan
                            </p>

                            <p className="font-bold text-indigo-700">
                              {plan.planName || 'Unknown plan'}
                            </p>
                          </div>

                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500 mb-1">
                              Plan Price
                            </p>

                            <p className="font-bold text-gray-900">
                              Rs. {formatPrice(plan.price)}
                            </p>

                            <p className="text-xs text-gray-500 mt-1">
                              {plan.durationDays ?? '-'} days
                            </p>
                          </div>
                        </div>

                        <p className="text-xs text-gray-500">
                          Request date: {formatDate(request.requestDate)}
                        </p>

                        <div>
                          <label
                            htmlFor={`admin-note-${request.requestId}`}
                            className="block text-xs font-semibold text-gray-600 mb-1.5"
                          >
                            Admin Note (optional)
                          </label>

                          <textarea
                            id={`admin-note-${request.requestId}`}
                            rows={2}
                            maxLength={500}
                            value={adminNotes[request.requestId] ?? ''}
                            onChange={(event) =>
                              setAdminNotes((previous) => ({
                                ...previous,
                                [request.requestId]: event.target.value,
                              }))
                            }
                            placeholder="Add a note for this decision..."
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                          />
                        </div>
                      </div>

                      <div className="flex flex-row lg:flex-col gap-2 lg:min-w-36">
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() =>
                            handleUpgradeDecision(request, 'approve')
                          }
                          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold disabled:opacity-50"
                        >
                          <Check size={16} />
                          {isProcessing ? 'Processing...' : 'Approve'}
                        </button>

                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() =>
                            handleUpgradeDecision(request, 'reject')
                          }
                          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-100 text-sm font-bold disabled:opacity-50"
                        >
                          <XCircle size={16} />
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Pending payments */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 md:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <CreditCard size={20} className="text-indigo-600" />
              <h2 className="text-lg font-bold text-gray-900">
                Pending Payments
              </h2>
              {pendingPayments.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                  {pendingPayments.length}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Review successful test payments and approve or reject subscription activation.
            </p>
            <p className="text-xs text-amber-600 mt-1">
              Development testing only — these are mock payments, not real gateway transactions.
            </p>
          </div>

          <button
            type="button"
            onClick={loadPendingPayments}
            disabled={paymentsLoading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw
              size={14}
              className={paymentsLoading ? 'animate-spin' : ''}
            />
            Refresh Payments
          </button>
        </div>

        <div className="p-5 md:p-6">
          {paymentsLoading ? (
            <div className="py-10 text-center">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-500">Loading payments...</p>
            </div>
          ) : pendingPayments.length === 0 ? (
            <div className="py-10 text-center border border-dashed border-gray-200 rounded-xl">
              <CheckCircle size={34} className="mx-auto mb-3 text-emerald-500" />
              <h3 className="font-bold text-gray-800">No pending payments</h3>
              <p className="text-sm text-gray-500 mt-1">
                Payments awaiting admin review will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingPayments.map((payment) => {
                const business = payment.business ?? {};
                const plan = payment.subscription ?? {};
                const paymentId = payment.paymentId;
                const businessName =
                  business.businessName ||
                  business.name ||
                  business.email ||
                  `Business #${business.businessId ?? ''}`;
                const isProcessing = processingPaymentId === paymentId;
                const isVerified = payment.paymentStatus === 'VERIFIED';

                return (
                  <div
                    key={paymentId}
                    className="border border-gray-200 rounded-xl p-4 md:p-5"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-gray-900">{businessName}</h3>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${isVerified ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                            {isVerified ? <CheckCircle size={12} /> : <Clock size={12} />}
                            {payment.paymentStatus || 'PENDING'}
                          </span>
                          <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold">
                            Approval: {payment.approvalStatus || 'PENDING'}
                          </span>
                        </div>

                        {business.email && (
                          <p className="text-sm text-gray-500">Email: {business.email}</p>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500 mb-1">Subscription Plan</p>
                            <p className="font-bold text-indigo-700">{plan.planName || 'Unknown plan'}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500 mb-1">Payment Amount</p>
                            <p className="font-bold text-gray-900">
                              {payment.currency || 'LKR'} {formatPrice(payment.amount)}
                            </p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500 mb-1">Payment Reference</p>
                            <p className="font-semibold text-gray-800 break-all">
                              {payment.merchantReference || `Payment #${paymentId}`}
                            </p>
                          </div>
                        </div>

                        <p className="text-xs text-gray-500">
                          Created: {formatDate(payment.createdAt)}
                          {payment.paidAt ? ` · Paid: ${formatDate(payment.paidAt)}` : ''}
                        </p>

                        <div>
                          <label
                            htmlFor={`payment-admin-note-${paymentId}`}
                            className="block text-xs font-semibold text-gray-600 mb-1.5"
                          >
                            Admin Note (optional)
                          </label>
                          <textarea
                            id={`payment-admin-note-${paymentId}`}
                            rows={2}
                            maxLength={500}
                            value={paymentAdminNotes[paymentId] ?? ''}
                            onChange={(event) =>
                              setPaymentAdminNotes((previous) => ({
                                ...previous,
                                [paymentId]: event.target.value,
                              }))
                            }
                            placeholder="Add a note for this payment decision..."
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                          />
                        </div>
                      </div>

                      <div className="flex flex-row lg:flex-col gap-2 lg:min-w-36">
                        <button
                          type="button"
                          disabled={isProcessing || !isVerified}
                          onClick={() => handlePaymentDecision(payment, 'approve')}
                          title={!isVerified ? 'Only verified payments can be approved' : 'Approve payment'}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Check size={16} />
                          {isProcessing ? 'Processing...' : 'Approve'}
                        </button>

                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handlePaymentDecision(payment, 'reject')}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-100 text-sm font-bold disabled:opacity-50"
                        >
                          <XCircle size={16} />
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Subscription plan cards */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900">
            Available Subscription Plans
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Create, update and manage platform subscription tiers.
          </p>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl p-16 text-center border border-gray-100">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />

            <p className="text-sm text-gray-500">
              Loading subscription packages...
            </p>
          </div>
        ) : data.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <CreditCard
              size={40}
              className="mx-auto mb-3 text-gray-300"
            />

            <h3 className="font-bold text-gray-900">
              No subscription plans found
            </h3>

            <p className="text-sm text-gray-500 mt-1 mb-5">
              Create your first billing package.
            </p>

            <button
              type="button"
              onClick={openAdd}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white rounded-lg text-sm font-bold"
            >
              <Plus size={16} />
              Create Plan
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {data.map((plan) => {
              const isFree = Number(plan.price) === 0;

              const subscribers =
                subscriberCounts[plan.subscriptionId] || 0;

              const price = Number(plan.price || 0);
              const days = Number(plan.durationDays || 30);

              const dailyRate =
                days > 0 ? (price / days).toFixed(2) : '0.00';

              return (
                <div
                  key={plan.subscriptionId}
                  className={`group bg-white rounded-2xl p-6 border shadow-sm hover:shadow-lg transition-all flex flex-col justify-between ${
                    isFree
                      ? 'border-gray-200'
                      : 'border-indigo-100 hover:border-amber-300'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-5">
                      <div>
                        <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
                          Subscription Tier
                        </span>

                        <h3 className="font-extrabold text-xl text-gray-900 mt-1">
                          {plan.planName}
                        </h3>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(plan)}
                          title="Edit plan"
                          className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteTarget(plan)}
                          title="Delete plan"
                          className="p-2 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 mb-5">
                      <div className="flex flex-wrap items-baseline gap-1.5">
                        <span className="font-black text-2xl text-gray-900">
                          Rs. {formatPrice(price)}
                        </span>

                        <span className="text-xs text-gray-500">
                          / {days} days
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-gray-200">
                        <span className="text-xs text-gray-500">
                          {isFree
                            ? 'Zero Cost Tier'
                            : `Approx. Rs. ${dailyRate} / day`}
                        </span>

                        <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600">
                          <Users size={13} />
                          {subscribers}{' '}
                          {subscribers === 1 ? 'business' : 'businesses'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                        Plan Inclusions
                      </p>

                      {STANDARD_PERKS.map((perk) => (
                        <div
                          key={perk}
                          className="flex items-center gap-2.5 text-sm text-gray-600"
                        >
                          <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                            <Check size={12} strokeWidth={3} />
                          </span>

                          <span>{perk}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold text-gray-400">
                      Cycle: {days} days
                    </span>

                    <button
                      type="button"
                      onClick={() => openEdit(plan)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700"
                    >
                      Modify Tier
                      <Pencil size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Create / edit plan modal */}
      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={
          editing
            ? 'Modify Subscription Tier'
            : 'Create New Subscription Package'
        }
        size="md"
      >
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Plan Name *
            </label>

            <input
              type="text"
              placeholder="e.g. Starter, Professional"
              className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none"
              value={form.planName}
              onChange={(event) =>
                setForm({
                  ...form,
                  planName: event.target.value,
                })
              }
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Price (LKR) *
              </label>

              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none"
                value={form.price}
                onChange={(event) =>
                  setForm({
                    ...form,
                    price: event.target.value,
                  })
                }
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Duration (Days) *
              </label>

              <input
                type="number"
                min="1"
                step="1"
                placeholder="30"
                className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none"
                value={form.durationDays}
                onChange={(event) =>
                  setForm({
                    ...form,
                    durationDays: event.target.value,
                  })
                }
                required
              />
            </div>
          </div>

          <div>
            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Quick Duration Presets
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { label: '30 Days', days: 30 },
                { label: '90 Days', days: 90 },
                { label: '365 Days', days: 365 },
              ].map((preset) => (
                <button
                  key={preset.days}
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      durationDays: preset.days,
                    })
                  }
                  className={`py-2 px-2 rounded-lg text-xs font-semibold border ${
                    Number(form.durationDays) === preset.days
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-bold hover:bg-gray-50"
              onClick={() => setModal(false)}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold disabled:opacity-50"
            >
              {saving
                ? 'Saving...'
                : editing
                  ? 'Update Plan'
                  : 'Save New Plan'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation modal */}
      <ConfirmDeleteModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Subscription Tier"
        itemName={deleteTarget?.planName}
        description={`Are you sure you want to delete the "${deleteTarget?.planName}" plan?`}
        loading={deleting}
      />

      {/* Action decision confirmation modal (Approve / Reject) */}
      <ConfirmActionModal
        open={Boolean(actionModal)}
        onClose={() => setActionModal(null)}
        onConfirm={actionModal?.onConfirm}
        type={actionModal?.type}
        title={actionModal?.title}
        itemName={actionModal?.itemName}
        description={actionModal?.description}
        details={actionModal?.details}
        confirmText={actionModal?.confirmText}
        loading={Boolean(processingPaymentId || processingRequestId)}
      />
    </div>
  );
}
