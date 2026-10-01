import { useEffect, useState, useMemo } from 'react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import Modal from '../../components/ui/Modal';
import ConfirmDeleteModal from '../../components/ui/ConfirmDeleteModal';
import {
  Plus,
  Pencil,
  Trash2,
  CreditCard,
  Check,
  Sparkles,
  Zap,
  ShieldCheck,
  RefreshCw,
  Users,
  DollarSign,
  Calendar,
  Layers
} from 'lucide-react';

const emptyForm = { planName: '', price: '', durationDays: 30 };

// Standard plan perks preview
const STANDARD_PERKS = [
  'Full Invoicing & Sales Suite',
  'Customer & Supplier Management',
  'Real-Time Expense Tracking',
  'Automated Stock & Inventory',
  'OpenAI Assistant Invocations'
];

export default function AdminSubscriptions() {
  const [data, setData] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Form & modal state
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const [subsRes, bizRes] = await Promise.all([
        adminAPI.getSubscriptions().catch(() => ({ data: { data: [] } })),
        adminAPI.getBusinesses().catch(() => ({ data: { data: [] } })),
      ]);
      setData(subsRes.data.data || []);
      setBusinesses(bizRes.data.data || []);
    } catch {
      toast.error('Failed to load subscription plans');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute metrics
  const totalPlans = data.length;
  const paidPlans = data.filter(p => Number(p.price) > 0).length;
  const freePlans = totalPlans - paidPlans;
  const maxPrice = data.length > 0 ? Math.max(...data.map(p => Number(p.price || 0))) : 0;

  // Compute subscribers per plan
  const subscriberCounts = useMemo(() => {
    const counts = {};
    businesses.forEach(b => {
      const id = b.subscription?.subscriptionId;
      if (id) {
        counts[id] = (counts[id] || 0) + 1;
      }
    });
    return counts;
  }, [businesses]);

  const openAdd = () => {
    setForm(emptyForm);
    setEditing(null);
    setModal(true);
  };

  const openEdit = (row) => {
    setForm({
      planName: row.planName,
      price: row.price,
      durationDays: row.durationDays
    });
    setEditing(row.subscriptionId);
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.planName.trim()) {
      toast.error('Plan name is required');
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await adminAPI.updateSubscription(editing, form);
        toast.success(`Plan "${form.planName}" updated successfully`);
      } else {
        await adminAPI.createSubscription(form);
        toast.success(`Plan "${form.planName}" created successfully`);
      }
      setModal(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save subscription plan');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminAPI.deleteSubscription(deleteTarget.subscriptionId);
      toast.success(`Plan "${deleteTarget.planName}" deleted`);
      setDeleteTarget(null);
      loadData();
    } catch {
      toast.error('Failed to delete plan. It might be assigned to active businesses.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* ── Top Header & Action Controls ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold mb-1 border border-amber-100">
            <CreditCard size={13} />
            <span>Monetization & Tiers</span>
          </div>
          <h1 className="text-2xl font-display font-extrabold text-gray-900 tracking-tight">
            Subscription Plans
          </h1>
          <p className="text-gray-500 text-xs mt-0.5">
            Configure platform pricing, subscription duration cycles, and membership tiers
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-xl border border-gray-200 shadow-sm transition-all disabled:opacity-50"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin text-amber-600' : ''} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-amber-500/25 transition-all transform hover:-translate-y-0.5"
          >
            <Plus size={16} />
            <span>Create New Plan</span>
          </button>
        </div>
      </div>

      {/* ── Metric Highlights ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Tiers</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Layers size={20} />
            </div>
          </div>
          <p className="text-2xl font-display font-extrabold text-gray-900 mt-2">{totalPlans}</p>
          <p className="text-xs text-gray-400 mt-1">Active billing packages</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Paid Tiers</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <DollarSign size={20} />
            </div>
          </div>
          <p className="text-2xl font-display font-extrabold text-purple-600 mt-2">{paidPlans}</p>
          <p className="text-xs text-gray-400 mt-1">Revenue-generating plans</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Free Tiers</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Zap size={20} />
            </div>
          </div>
          <p className="text-2xl font-display font-extrabold text-blue-600 mt-2">{freePlans}</p>
          <p className="text-xs text-gray-400 mt-1">Trial / entry packages</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Top Plan Tier</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CreditCard size={20} />
            </div>
          </div>
          <p className="text-2xl font-display font-extrabold text-emerald-600 mt-2">
            Rs. {maxPrice.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-400 mt-1">Highest tier price</p>
        </div>
      </div>

      {/* ── Plans Grid ── */}
      {loading ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Loading subscription packages...</p>
        </div>
      ) : data.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm">
          <CreditCard size={44} className="mx-auto mb-3 text-gray-300 opacity-60" />
          <h3 className="font-display font-bold text-gray-900 text-lg">No subscription plans found</h3>
          <p className="text-gray-400 text-xs mt-1 mb-5">Create your first billing package to start onboarding businesses.</p>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white rounded-xl text-xs font-bold"
          >
            <Plus size={15} /> Create Plan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((plan) => {
            const isFree = Number(plan.price) === 0;
            const subscribers = subscriberCounts[plan.subscriptionId] || 0;
            const price = Number(plan.price || 0);
            const days = Number(plan.durationDays || 30);
            const dailyRate = days > 0 ? (price / days).toFixed(2) : '0.00';

            return (
              <div
                key={plan.subscriptionId}
                className={`relative group bg-white rounded-3xl p-6 border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between ${
                  !isFree
                    ? 'border-indigo-100 shadow-sm hover:border-amber-300'
                    : 'border-gray-100 shadow-sm'
                }`}
              >
                {/* Top Badge & Controls */}
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
                        Subscription Tier
                      </span>
                      <h3 className="font-display font-extrabold text-xl text-gray-900 mt-0.5">
                        {plan.planName}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100">
                      <button
                        onClick={() => openEdit(plan)}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                        title="Edit Plan"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(plan)}
                        className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                        title="Delete Plan"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Price Tag */}
                  <div className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-gray-50 to-indigo-50/30 border border-gray-100">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-display font-black text-2xl text-gray-900 tracking-tight">
                        Rs. {price.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-xs font-semibold text-gray-400">
                        / {days} days
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200/50 text-[11px] text-gray-500">
                      <span>{isFree ? 'Zero Cost Tier' : `Approx. Rs. ${dailyRate} / day`}</span>
                      <span className="inline-flex items-center gap-1 font-bold text-indigo-600">
                        <Users size={12} />
                        {subscribers} {subscribers === 1 ? 'business' : 'businesses'}
                      </span>
                    </div>
                  </div>

                  {/* Features Checklist */}
                  <div className="space-y-2.5 mb-6">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                      Plan Inclusions
                    </p>
                    {STANDARD_PERKS.map((perk, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-xs text-gray-600">
                        <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                          <Check size={11} strokeWidth={3} />
                        </div>
                        <span>{perk}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Quick Edit Trigger */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-gray-400">
                    Cycle: {days} Calendar Days
                  </span>
                  <button
                    onClick={() => openEdit(plan)}
                    className="text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors inline-flex items-center gap-1"
                  >
                    Modify Tier <Pencil size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Create / Edit Modal ── */}
      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={editing ? 'Modify Subscription Tier' : 'Create New Subscription Package'}
        size="md"
      >
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Plan Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Starter Business, Pro Enterprise"
              className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none transition-all font-medium text-gray-900"
              value={form.planName}
              onChange={e => setForm({ ...form, planName: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Pricing (Rs. LKR) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">Rs.</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none transition-all font-medium text-gray-900"
                  value={form.price}
                  onChange={e => setForm({ ...form, price: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Duration (Days) *
              </label>
              <input
                type="number"
                min="1"
                placeholder="30"
                className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none transition-all font-medium text-gray-900"
                value={form.durationDays}
                onChange={e => setForm({ ...form, durationDays: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Duration Quick Presets */}
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
              Quick Duration Presets
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: '30 Days (Monthly)', days: 30 },
                { label: '90 Days (Quarterly)', days: 90 },
                { label: '365 Days (Annual)', days: 365 },
              ].map(p => (
                <button
                  key={p.days}
                  type="button"
                  onClick={() => setForm({ ...form, durationDays: p.days })}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                    Number(form.durationDays) === p.days
                      ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              className="flex-1 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-xs font-bold hover:bg-gray-50 transition-all"
              onClick={() => setModal(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold transition-all shadow-md shadow-amber-500/25 disabled:opacity-50"
            >
              {saving ? 'Saving Package...' : editing ? 'Update Plan' : 'Save New Plan'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Confirm Delete Modal ── */}
      <ConfirmDeleteModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Subscription Tier"
        itemName={deleteTarget?.planName}
        description={`Are you sure you want to delete the "${deleteTarget?.planName}" plan? Any businesses currently subscribed to this tier will remain active until their renewal date.`}
        loading={deleting}
      />
    </div>
  );
}

