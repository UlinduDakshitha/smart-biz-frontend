import { useEffect, useState, useMemo } from 'react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import Modal from '../../components/ui/Modal';
import {
  Brain,
  BarChart3,
  Mail,
  FileText,
  ShoppingBag,
  Sparkles,
  Search,
  Filter,
  RefreshCw,
  Copy,
  Check,
  Eye,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Cpu,
  Layers
} from 'lucide-react';
import { format } from 'date-fns';

const FEATURE_META = {
  INSIGHTS: {
    label: 'Business Insights',
    icon: BarChart3,
    color: 'text-blue-700',
    badge: 'bg-blue-50 border-blue-200 text-blue-700',
    dot: 'bg-blue-500'
  },
  EMAIL: {
    label: 'Email Composer',
    icon: Mail,
    color: 'text-emerald-700',
    badge: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    dot: 'bg-emerald-500'
  },
  INVOICE_SUMMARY: {
    label: 'Invoice Summary',
    icon: FileText,
    color: 'text-amber-700',
    badge: 'bg-amber-50 border-amber-200 text-amber-700',
    dot: 'bg-amber-500'
  },
  SOCIAL_MEDIA: {
    label: 'Social Media',
    icon: ShoppingBag,
    color: 'text-pink-700',
    badge: 'bg-pink-50 border-pink-200 text-pink-700',
    dot: 'bg-pink-500'
  },
};

export default function AdminAiUsage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedFeature, setSelectedFeature] = useState('ALL');
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // Inspect modal & copy state
  const [inspectLog, setInspectLog] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const loadData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await adminAPI.getAiUsage();
      setData(res.data.data || []);
    } catch {
      toast.error('Failed to load AI usage logs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute metrics
  const totalRequests = data.length;

  const featureCounts = useMemo(() => {
    const counts = {};
    data.forEach(log => {
      const f = log.feature || 'OTHER';
      counts[f] = (counts[f] || 0) + 1;
    });
    return counts;
  }, [data]);

  // Find most active feature
  const topFeatureKey = useMemo(() => {
    let top = 'INSIGHTS';
    let max = 0;
    Object.entries(featureCounts).forEach(([k, v]) => {
      if (v > max) {
        max = v;
        top = k;
      }
    });
    return top;
  }, [featureCounts]);

  // Unique businesses utilizing AI
  const uniqueBusinesses = useMemo(() => {
    const set = new Set();
    data.forEach(log => {
      if (log.business?.name) set.add(log.business.name);
      else if (log.business?.businessId) set.add(log.business.businessId);
    });
    return set.size;
  }, [data]);

  // Filtered logs
  const filteredData = useMemo(() => {
    return data
      .slice()
      .reverse()
      .filter(log => {
        const q = search.toLowerCase();
        const matchesSearch =
          (log.business?.name && log.business.name.toLowerCase().includes(q)) ||
          (log.prompt && log.prompt.toLowerCase().includes(q)) ||
          String(log.aiId).includes(q);

        const matchesFeature =
          selectedFeature === 'ALL' ||
          (log.feature && log.feature.toUpperCase() === selectedFeature.toUpperCase());

        return matchesSearch && matchesFeature;
      });
  }, [data, search, selectedFeature]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page]);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Prompt copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* ── Top Header & Actions ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold mb-1 border border-purple-100">
            <Brain size={13} />
            <span>OpenAI Engine Telemetry</span>
          </div>
          <h1 className="text-2xl font-display font-extrabold text-gray-900 tracking-tight">
            AI Assistant Activity Logs
          </h1>
          <p className="text-gray-500 text-xs mt-0.5">
            Audit cloud AI requests, feature consumption patterns, and tenant prompt history
          </p>
        </div>

        <button
          onClick={() => loadData(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-xl border border-gray-200 shadow-sm transition-all disabled:opacity-50"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin text-purple-600' : ''} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh Logs'}</span>
        </button>
      </div>

      {/* ── Executive Metric Highlights ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Invocations</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Brain size={20} />
            </div>
          </div>
          <p className="text-2xl font-display font-extrabold text-gray-900 mt-2">{totalRequests}</p>
          <p className="text-xs text-gray-400 mt-1">Cloud completions handled</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Top Capability</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Sparkles size={20} />
            </div>
          </div>
          <p className="text-xl font-display font-extrabold text-gray-900 mt-2 truncate">
            {FEATURE_META[topFeatureKey]?.label || topFeatureKey}
          </p>
          <p className="text-xs text-blue-600 font-medium mt-1">
            {featureCounts[topFeatureKey] || 0} total requests
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Tenants</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Building2 size={20} />
            </div>
          </div>
          <p className="text-2xl font-display font-extrabold text-gray-900 mt-2">{uniqueBusinesses}</p>
          <p className="text-xs text-gray-400 mt-1">Businesses consuming AI</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Engine Status</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Cpu size={20} />
            </div>
          </div>
          <p className="text-xl font-display font-extrabold text-emerald-600 mt-2 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            Operational
          </p>
          <p className="text-xs text-gray-400 mt-1">GPT-3.5 / GPT-4 Turbo</p>
        </div>
      </div>

      {/* ── Feature Filter Pills ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => { setSelectedFeature('ALL'); setPage(1); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border ${
            selectedFeature === 'ALL'
              ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/20'
              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
          }`}
        >
          All Requests ({data.length})
        </button>

        {Object.keys(FEATURE_META).map(key => {
          const meta = FEATURE_META[key];
          const Icon = meta.icon;
          const count = featureCounts[key] || 0;
          const isSelected = selectedFeature === key;

          return (
            <button
              key={key}
              onClick={() => { setSelectedFeature(key); setPage(1); }}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                isSelected
                  ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/20'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Icon size={14} className={isSelected ? 'text-white' : meta.color} />
              <span>{meta.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Search Bar ── */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
        <Search size={16} className="text-gray-400 shrink-0" />
        <input
          type="text"
          placeholder="Search logs by prompt keyword, business name, or Log ID..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="w-full text-xs bg-transparent focus:outline-none text-gray-800 placeholder-gray-400 font-medium"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="text-xs text-gray-400 hover:text-gray-600 font-semibold px-2"
          >
            Clear
          </button>
        )}
      </div>

      {/* ── Logs Table ── */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                <th className="py-3.5 px-6">ID & Timestamp</th>
                <th className="py-3.5 px-6">Tenant Business</th>
                <th className="py-3.5 px-6">Feature Category</th>
                <th className="py-3.5 px-6">Prompt Summary</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-gray-400 text-sm">
                    <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading AI usage telemetry...
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-gray-400 text-sm">
                    <Brain size={36} className="mx-auto mb-2 text-gray-300 opacity-60" />
                    No AI activity logs match your filter.
                  </td>
                </tr>
              ) : (
                paginatedData.map(log => {
                  const meta = FEATURE_META[log.feature] || {
                    label: log.feature || 'Custom Prompt',
                    icon: Brain,
                    color: 'text-gray-700',
                    badge: 'bg-gray-100 border-gray-200 text-gray-700',
                    dot: 'bg-gray-400'
                  };
                  const Icon = meta.icon;

                  return (
                    <tr
                      key={log.aiId}
                      className="hover:bg-purple-50/30 transition-colors group"
                    >
                      {/* ID & Date */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
                            #{log.aiId}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-1">
                          {log.date ? String(log.date).replace('T', ' ').substring(0, 16) : '—'}
                        </p>
                      </td>

                      {/* Tenant Business */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm">
                            {log.business?.name?.charAt(0)?.toUpperCase() || 'B'}
                          </div>
                          <span className="font-bold text-gray-900 text-xs truncate max-w-[160px]">
                            {log.business?.name || 'Unknown Business'}
                          </span>
                        </div>
                      </td>

                      {/* Feature Category */}
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${meta.badge}`}>
                          <Icon size={12} className={meta.color} />
                          <span>{meta.label}</span>
                        </span>
                      </td>

                      {/* Prompt */}
                      <td className="py-4 px-6">
                        <p className="text-xs text-gray-600 max-w-md line-clamp-1 italic font-medium">
                          "{log.prompt}"
                        </p>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Copy Prompt */}
                          <button
                            onClick={() => copyToClipboard(log.prompt, log.aiId)}
                            className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
                            title="Copy Prompt text"
                          >
                            {copiedId === log.aiId ? (
                              <Check size={15} className="text-emerald-600" />
                            ) : (
                              <Copy size={15} />
                            )}
                          </button>

                          {/* Inspect Modal */}
                          <button
                            onClick={() => setInspectLog(log)}
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                            title="Inspect Full Prompt"
                          >
                            <Eye size={15} />
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
            of <span className="font-semibold text-gray-800">{filteredData.length}</span> invocations
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

      {/* ── Inspect Log Modal ── */}
      <Modal
        open={!!inspectLog}
        onClose={() => setInspectLog(null)}
        title="AI Invocation Telemetry Dossier"
        size="lg"
      >
        {inspectLog && (
          <div className="space-y-5">
            {/* Header info bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100 text-xs">
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Log ID</span>
                <span className="font-mono font-bold text-gray-900">#{inspectLog.aiId}</span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Tenant</span>
                <span className="font-bold text-gray-900 truncate block">{inspectLog.business?.name || '—'}</span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Feature</span>
                <span className="font-bold text-purple-700">{FEATURE_META[inspectLog.feature]?.label || inspectLog.feature}</span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Timestamp</span>
                <span className="text-gray-600 truncate block">
                  {inspectLog.date ? String(inspectLog.date).replace('T', ' ').substring(0, 19) : '—'}
                </span>
              </div>
            </div>

            {/* Prompt Container */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Brain size={14} className="text-purple-600" />
                  Full Prompt Input
                </span>
                <button
                  onClick={() => copyToClipboard(inspectLog.prompt, inspectLog.aiId)}
                  className="text-xs font-semibold text-purple-600 hover:text-purple-700 inline-flex items-center gap-1"
                >
                  <Copy size={13} />
                  <span>Copy Content</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-gray-900 text-gray-100 font-mono text-xs leading-relaxed max-h-64 overflow-y-auto whitespace-pre-wrap selection:bg-purple-500 selection:text-white">
                {inspectLog.prompt}
              </div>
            </div>

            {/* Close Button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInspectLog(null)}
                className="px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold transition-all shadow-md"
              >
                Close Dossier
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

