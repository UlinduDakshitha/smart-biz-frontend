import { useEffect, useState, useMemo } from 'react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import {
  Building2,
  Trash2,
  Eye,
  Search,
  Filter,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  DollarSign,
  Calendar,
  CheckCircle2,
  Users,
  TrendingUp,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown
} from 'lucide-react';
import ConfirmDeleteModal from '../../components/ui/ConfirmDeleteModal';
import Modal from '../../components/ui/Modal';

// Color map for subscription plans
const PLAN_COLORS = {
  Free: { badge: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-400' },
  Starter: { badge: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  Pro: { badge: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-500' },
  Enterprise: { badge: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
};

function getPlanStyle(planName) {
  if (!planName) return PLAN_COLORS.Free;
  for (const key of Object.keys(PLAN_COLORS)) {
    if (planName.toLowerCase().includes(key.toLowerCase())) {
      return PLAN_COLORS[key];
    }
  }
  return { badge: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500' };
}

// Generate deterministic background color for initials
const AVATAR_GRADIENTS = [
  'from-blue-600 to-indigo-600',
  'from-purple-600 to-pink-600',
  'from-emerald-500 to-teal-700',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-red-600',
  'from-cyan-600 to-blue-700'
];

function getAvatarGradient(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

export default function AdminBusinesses() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('ALL');
  const [sortBy, setSortBy] = useState('id-desc');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Modals state
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await adminAPI.getBusinesses();
      setData(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load registered businesses');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Compute metrics
  const totalCount = data.length;
  const paidCount = data.filter(b => Number(b.subscription?.price || 0) > 0).length;
  const freeCount = totalCount - paidCount;
  const totalMRR = data.reduce((sum, b) => sum + Number(b.subscription?.price || 0), 0);

  // Available plan names for filter tabs
  const availablePlans = useMemo(() => {
    const plans = new Set();
    data.forEach(b => {
      if (b.subscription?.planName) plans.add(b.subscription.planName);
    });
    return Array.from(plans);
  }, [data]);

  // Filtering & Sorting
  const filteredData = useMemo(() => {
    return data.filter(b => {
      const q = search.toLowerCase();
      const matchesSearch =
        (b.name && b.name.toLowerCase().includes(q)) ||
        (b.email && b.email.toLowerCase().includes(q)) ||
        (b.phone && b.phone.toLowerCase().includes(q)) ||
        String(b.businessId).includes(q);

      const matchesPlan =
        selectedPlan === 'ALL' ||
        (b.subscription?.planName && b.subscription.planName.toLowerCase() === selectedPlan.toLowerCase()) ||
        (selectedPlan === 'FREE' && (!b.subscription?.price || Number(b.subscription.price) === 0));

      return matchesSearch && matchesPlan;
    }).sort((a, b) => {
      if (sortBy === 'id-desc') return b.businessId - a.businessId;
      if (sortBy === 'id-asc') return a.businessId - b.businessId;
      if (sortBy === 'name-asc') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'name-desc') return (b.name || '').localeCompare(a.name || '');
      return 0;
    });
  }, [data, search, selectedPlan, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page]);

  // Handle Delete
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminAPI.deleteBusiness(deleteTarget.businessId);
      toast.success(`Business "${deleteTarget.name}" deleted successfully`);
      setDeleteTarget(null);
      if (selectedBusiness?.businessId === deleteTarget.businessId) {
        setSelectedBusiness(null);
      }
      load();
    } catch {
      toast.error('Failed to delete business account');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* ── Header Title & Actions ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-1 border border-indigo-100">
            <Building2 size={13} />
            <span>Multi-Tenant Architecture</span>
          </div>
          <h1 className="text-2xl font-display font-extrabold text-gray-900 tracking-tight">
            Registered Businesses
          </h1>
          <p className="text-gray-500 text-xs mt-0.5">
            Manage tenant organizations, account profiles, and subscription assignments
          </p>
        </div>

        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-xl border border-gray-200 shadow-sm transition-all disabled:opacity-50"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin text-indigo-600' : ''} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh List'}</span>
        </button>
      </div>

      {/* ── Executive Metric Stats Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Tenants</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Building2 size={20} />
            </div>
          </div>
          <p className="text-2xl font-display font-extrabold text-gray-900 mt-2">{totalCount}</p>
          <p className="text-xs text-gray-400 mt-1">Registered businesses</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Paid Subscribers</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <CreditCard size={20} />
            </div>
          </div>
          <p className="text-2xl font-display font-extrabold text-gray-900 mt-2">{paidCount}</p>
          <p className="text-xs text-purple-600 font-medium mt-1">
            {totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 0}% conversion rate
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Free Tier</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Users size={20} />
            </div>
          </div>
          <p className="text-2xl font-display font-extrabold text-gray-900 mt-2">{freeCount}</p>
          <p className="text-xs text-gray-400 mt-1">Free or trial plans</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Monthly MRR</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <DollarSign size={20} />
            </div>
          </div>
          <p className="text-2xl font-display font-extrabold text-emerald-600 mt-2">
            Rs. {totalMRR.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-400 mt-1">Estimated recurring</p>
        </div>
      </div>

      {/* ── Search, Filter & Sort Controls ── */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by business name, email, phone, or ID..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"
          />
        </div>

        {/* Filter by Plan */}
        <div className="flex items-center gap-2 shrink-0">
          <Filter size={14} className="text-gray-400" />
          <select
            value={selectedPlan}
            onChange={e => { setSelectedPlan(e.target.value); setPage(1); }}
            className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Plans</option>
            <option value="FREE">Free Plans</option>
            {availablePlans.map(plan => (
              <option key={plan} value={plan}>{plan}</option>
            ))}
          </select>

          {/* Sort Selector */}
          <ArrowUpDown size={14} className="text-gray-400 ml-1" />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="id-desc">Newest First</option>
            <option value="id-asc">Oldest First</option>
            <option value="name-asc">Name (A - Z)</option>
            <option value="name-desc">Name (Z - A)</option>
          </select>
        </div>
      </div>

      {/* ── Businesses Table ── */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                <th className="py-3.5 px-6">Tenant</th>
                <th className="py-3.5 px-6">Contact Info</th>
                <th className="py-3.5 px-6">Subscription Plan</th>
                <th className="py-3.5 px-6">Currency</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-gray-400 text-sm">
                    <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading registered businesses...
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-gray-400 text-sm">
                    <Building2 size={36} className="mx-auto mb-2 text-gray-300 opacity-60" />
                    No businesses found matching your criteria.
                  </td>
                </tr>
              ) : (
                paginatedData.map(b => {
                  const planStyle = getPlanStyle(b.subscription?.planName);
                  const gradient = getAvatarGradient(b.name || '');

                  return (
                    <tr
                      key={b.businessId}
                      className="hover:bg-indigo-50/30 transition-colors group"
                    >
                      {/* Tenant Identity */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3.5">
                          <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-display font-extrabold text-sm shadow-md shrink-0`}>
                            {b.name?.charAt(0)?.toUpperCase() || 'B'}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-900 text-sm group-hover:text-indigo-600 transition-colors">
                                {b.name}
                              </span>
                              <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                                ID #{b.businessId}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 truncate max-w-xs mt-0.5">
                              {b.address || 'Address not configured'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <Mail size={12} className="text-gray-400 shrink-0" />
                            <span className="truncate max-w-[180px]">{b.email}</span>
                          </div>
                          {b.phone && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                              <Phone size={12} className="text-gray-400 shrink-0" />
                              <span>{b.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Subscription Plan */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${planStyle.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${planStyle.dot}`} />
                            {b.subscription?.planName || 'Free Plan'}
                          </span>
                          {b.subscription?.price > 0 && (
                            <span className="text-xs font-bold text-gray-700">
                              Rs. {Number(b.subscription.price).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Currency */}
                      <td className="py-4 px-6 text-xs font-semibold text-gray-600">
                        <span className="px-2 py-1 bg-gray-100 rounded-md text-gray-700 font-mono">
                          {b.currency || 'LKR'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View details */}
                          <button
                            onClick={() => setSelectedBusiness(b)}
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                            title="Inspect Tenant Details"
                          >
                            <Eye size={16} />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setDeleteTarget(b)}
                            className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                            title="Delete Business Account"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Table Footer & Pagination ── */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <div>
            Showing <span className="font-semibold text-gray-800">{filteredData.length > 0 ? (page - 1) * pageSize + 1 : 0}</span> to{' '}
            <span className="font-semibold text-gray-800">
              {Math.min(page * pageSize, filteredData.length)}
            </span>{' '}
            of <span className="font-semibold text-gray-800">{filteredData.length}</span> tenants
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all inline-flex items-center gap-1 font-medium"
            >
              <ChevronLeft size={14} />
              Previous
            </button>
            <span className="font-semibold text-gray-700 px-2">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(p + 1, totalPages))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all inline-flex items-center gap-1 font-medium"
            >
              Next
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Tenant Detail Modal ── */}
      <Modal
        open={!!selectedBusiness}
        onClose={() => setSelectedBusiness(null)}
        title="Tenant Business Dossier"
        size="lg"
      >
        {selectedBusiness && (
          <div className="space-y-6">
            {/* Top Identity Hero */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100/60">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getAvatarGradient(selectedBusiness.name)} flex items-center justify-center text-white font-display font-black text-xl shadow-md shrink-0`}>
                {selectedBusiness.name?.charAt(0)?.toUpperCase() || 'B'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-extrabold text-xl text-gray-900 truncate">
                    {selectedBusiness.name}
                  </h3>
                  <span className="text-xs font-mono font-bold bg-white text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-200">
                    ID #{selectedBusiness.businessId}
                  </span>
                </div>
                <p className="text-xs text-indigo-900/70 mt-0.5">
                  Tenant Organization registered in SmartBiz Enterprise Cloud
                </p>
              </div>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/60 space-y-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Mail size={13} className="text-indigo-500" />
                  Primary Email
                </span>
                <p className="text-sm font-semibold text-gray-900">{selectedBusiness.email || '—'}</p>
              </div>

              <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/60 space-y-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Phone size={13} className="text-emerald-500" />
                  Phone Number
                </span>
                <p className="text-sm font-semibold text-gray-900">{selectedBusiness.phone || '—'}</p>
              </div>

              <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/60 space-y-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin size={13} className="text-rose-500" />
                  Office Address
                </span>
                <p className="text-sm font-semibold text-gray-900">{selectedBusiness.address || 'Not specified'}</p>
              </div>

              <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/60 space-y-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign size={13} className="text-amber-500" />
                  Operating Currency
                </span>
                <p className="text-sm font-semibold text-gray-900">{selectedBusiness.currency || 'LKR'}</p>
              </div>
            </div>

            {/* Subscription Details Box */}
            <div className="p-5 rounded-2xl border border-amber-200/60 bg-gradient-to-r from-amber-50/40 to-orange-50/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CreditCard size={18} className="text-amber-600" />
                  <span className="font-bold text-sm text-gray-900">Current Subscription Tier</span>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500 text-white shadow-sm">
                  {selectedBusiness.subscription?.planName || 'Free Plan'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center mt-3 pt-3 border-t border-amber-200/40">
                <div>
                  <span className="text-[11px] text-gray-500 font-medium block">Billing Price</span>
                  <span className="text-base font-extrabold text-gray-900 font-display">
                    Rs. {Number(selectedBusiness.subscription?.price || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-gray-500 font-medium block">Cycle Duration</span>
                  <span className="text-base font-extrabold text-gray-900 font-display">
                    {selectedBusiness.subscription?.durationDays || 30} Days
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-gray-500 font-medium block">Plan Status</span>
                  <span className="text-xs font-bold text-emerald-600 inline-flex items-center gap-1 mt-1">
                    <CheckCircle2 size={13} /> Active
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  const target = selectedBusiness;
                  setSelectedBusiness(null);
                  setDeleteTarget(target);
                }}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3.5 py-2 rounded-xl transition-all inline-flex items-center gap-1.5"
              >
                <Trash2 size={14} />
                <span>Delete Tenant Account</span>
              </button>

              <button
                onClick={() => setSelectedBusiness(null)}
                className="px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold transition-all shadow-md"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Confirm Delete Modal ── */}
      <ConfirmDeleteModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Tenant Business"
        itemName={deleteTarget?.name}
        description="Are you sure you want to permanently delete this business account? All associated invoices, customer records, and product inventories will be completely erased."
        loading={deleting}
      />
    </div>
  );
}

