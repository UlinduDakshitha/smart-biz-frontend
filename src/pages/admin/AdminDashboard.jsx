import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import { Link } from 'react-router-dom';
import {
  Building2,
  Brain,
  CreditCard,
  Receipt,
  TrendingUp,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Activity,
  Server,
  Database,
  ShieldCheck,
  Mail,
  FileText,
  ShoppingBag,
  BarChart3,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';
import { format } from 'date-fns';

const FEATURE_META = {
  INSIGHTS: { label: 'Business Insights', icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-50', fill: '#3b82f6' },
  EMAIL: { label: 'Email Composer', icon: Mail, color: 'text-emerald-600', bg: 'bg-emerald-50', fill: '#10b981' },
  INVOICE_SUMMARY: { label: 'Invoice Summary', icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50', fill: '#f59e0b' },
  SOCIAL_MEDIA: { label: 'Social Media', icon: ShoppingBag, color: 'text-pink-600', bg: 'bg-pink-50', fill: '#ec4899' },
};

function StatCard({ label, value, icon: Icon, gradient, badge, subtitle, to }) {
  const content = (
    <div className="relative group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      {/* Decorative gradient glow on hover */}
      <div className={`absolute -right-8 -top-8 w-28 h-28 rounded-full bg-gradient-to-br ${gradient} opacity-10 group-hover:opacity-20 blur-xl transition-all duration-300`} />

      <div className="flex items-start justify-between relative z-10 mb-4">
        <div>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
            {label}
          </span>
          <p className="text-3xl font-display font-extrabold text-gray-900 tracking-tight">
            {value}
          </p>
        </div>
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-md shadow-indigo-500/10 group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={22} />
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-50 text-xs">
        <span className="text-gray-500 font-medium truncate">{subtitle}</span>
        {badge && (
          <span className="inline-flex items-center gap-1 font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full shrink-0">
            {badge}
          </span>
        )}
      </div>
    </div>
  );

  return to ? <Link to={to} className="block">{content}</Link> : content;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [aiUsage, setAiUsage] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const [statsRes, bizRes, aiRes, subRes] = await Promise.all([
        adminAPI.getStats().catch(() => ({ data: { data: null } })),
        adminAPI.getBusinesses().catch(() => ({ data: { data: [] } })),
        adminAPI.getAiUsage().catch(() => ({ data: { data: [] } })),
        adminAPI.getSubscriptions().catch(() => ({ data: { data: [] } })),
      ]);

      setStats(statsRes.data.data);
      setBusinesses(bizRes.data.data || []);
      setAiUsage(aiRes.data.data || []);
      setSubscriptions(subRes.data.data || []);
    } catch (err) {
      console.error('Error loading admin dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute AI feature breakdown for charts
  const featureCounts = aiUsage.reduce((acc, log) => {
    const f = log.feature || 'OTHER';
    acc[f] = (acc[f] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.keys(FEATURE_META).map(key => ({
    name: FEATURE_META[key].label,
    feature: key,
    count: featureCounts[key] || 0,
    fill: FEATURE_META[key].fill,
  }));

  // Calculate plan distribution among businesses
  const planDistribution = subscriptions.map(sub => {
    const subscriberCount = businesses.filter(b => b.subscription?.subscriptionId === sub.subscriptionId).length;
    return {
      ...sub,
      count: subscriberCount,
      percentage: businesses.length > 0 ? Math.round((subscriberCount / businesses.length) * 100) : 0,
    };
  });

  // Calculate estimated monthly recurring revenue (MRR)
  const estimatedMRR = businesses.reduce((total, b) => {
    const price = Number(b.subscription?.price || 0);
    return total + price;
  }, 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-3">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm animate-pulse">Loading system overview...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* ── Top Header & Executive Welcome Banner ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1a1a2e] via-[#16213e] to-[#0f3460] p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-32 bottom-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-400 text-xs font-semibold mb-3 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Platform Operational & Live
            </div>
            <h1 className="text-3xl font-display font-extrabold tracking-tight text-white mb-2">
              System Overview & Control
            </h1>
            <p className="text-gray-300 text-sm max-w-xl leading-relaxed">
              {format(new Date(), 'EEEE, MMMM d, yyyy')} — Monitor tenant activity, cloud AI consumption, and platform revenue in real-time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md transition-all border border-white/15 disabled:opacity-50"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              <span>{refreshing ? 'Refreshing…' : 'Refresh'}</span>
            </button>

            <Link
              to="/admin/businesses"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-lg shadow-amber-500/25 transition-all"
            >
              <span>Manage Tenants</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Key Metrics Grid (5 Stat Cards) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          label="Registered Businesses"
          value={stats?.totalBusinesses ?? businesses.length}
          icon={Building2}
          gradient="from-indigo-500 to-blue-600"
          subtitle="Tenant accounts"
          badge="Tenants"
          to="/admin/businesses"
        />

        <StatCard
          label="AI Requests Handled"
          value={stats?.totalAiRequests ?? aiUsage.length}
          icon={Brain}
          gradient="from-purple-500 to-pink-500"
          subtitle="OpenAI completions"
          badge="Tokens Active"
          to="/admin/ai-usage"
        />

        <StatCard
          label="Platform Invoices"
          value={stats?.totalInvoices ?? 0}
          icon={Receipt}
          gradient="from-emerald-500 to-teal-600"
          subtitle="Customer sales records"
          badge="Live Sales"
        />

        <StatCard
          label="Subscription Tiers"
          value={stats?.totalSubscriptions ?? subscriptions.length}
          icon={CreditCard}
          gradient="from-amber-500 to-orange-500"
          subtitle={`Est. MRR: Rs. ${estimatedMRR.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`}
          badge="Active Plans"
          to="/admin/subscriptions"
        />
      </div>

      {/* ── Charts & Plan Analytics Section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: AI Feature Usage Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-display font-bold text-lg text-gray-900 flex items-center gap-2">
                  <Sparkles size={18} className="text-purple-500" />
                  AI Intelligence Invocations
                </h3>
                <p className="text-gray-400 text-xs mt-0.5">
                  Breakdown of AI assistant usage by feature
                </p>
              </div>
              <Link
                to="/admin/ai-usage"
                className="text-xs font-semibold text-purple-600 hover:text-purple-700 inline-flex items-center gap-1 transition-colors"
              >
                <span>View Full Log</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {aiUsage.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#6b7280' }} />
                    <Tooltip
                      formatter={(value) => [`${value} requests`, 'Volume']}
                      contentStyle={{
                        borderRadius: 14,
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                        fontSize: 12
                      }}
                    />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="py-16 text-center text-gray-400 text-sm">
                <Brain size={36} className="mx-auto mb-2 text-gray-300 opacity-60" />
                No AI requests recorded yet
              </div>
            )}
          </div>

          {/* Feature Badge Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 mt-4 border-t border-gray-100">
            {Object.keys(FEATURE_META).map(key => {
              const meta = FEATURE_META[key];
              const count = featureCounts[key] || 0;
              const Icon = meta.icon;
              return (
                <div key={key} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                  <div className={`w-8 h-8 rounded-lg ${meta.bg} flex items-center justify-center shrink-0`}>
                    <Icon size={15} className={meta.color} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[11px] text-gray-500 font-medium truncate">{meta.label}</p>
                    <p className="text-sm font-bold text-gray-900 leading-none">{count}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Subscription Tiers & Health Status */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-display font-bold text-lg text-gray-900 flex items-center gap-2">
                  <CreditCard size={18} className="text-amber-500" />
                  Subscription Plans
                </h3>
                <p className="text-gray-400 text-xs mt-0.5">
                  Available membership tiers & pricing
                </p>
              </div>
              <Link
                to="/admin/subscriptions"
                className="text-xs font-semibold text-amber-600 hover:text-amber-700 inline-flex items-center gap-1 transition-colors"
              >
                <span>Edit</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            <div className="space-y-3.5">
              {subscriptions.length > 0 ? (
                subscriptions.map(plan => (
                  <div
                    key={plan.subscriptionId}
                    className="p-3.5 rounded-2xl border border-gray-100 bg-gray-50/70 hover:bg-gray-50 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gray-900">{plan.planName}</span>
                        <span className="text-[11px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                          {plan.durationDays}d
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {plan.price > 0 ? `Rs. ${Number(plan.price).toLocaleString('en-LK', { minimumFractionDigits: 2 })} / cycle` : 'Free Tier'}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-display font-extrabold text-base text-gray-900">
                        Rs. {Number(plan.price).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-xs text-center py-6">No subscription plans found</p>
              )}
            </div>
          </div>

          {/* Infrastructure Health Status */}
          <div className="pt-5 mt-5 border-t border-gray-100">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              Infrastructure Status
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs py-1">
                <span className="flex items-center gap-2 text-gray-600">
                  <Database size={14} className="text-emerald-500" />
                  MySQL Database
                </span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 size={13} /> Connected
                </span>
              </div>
              <div className="flex items-center justify-between text-xs py-1">
                <span className="flex items-center gap-2 text-gray-600">
                  <Server size={14} className="text-indigo-500" />
                  Spring Boot Gateway
                </span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 size={13} /> Running :8080
                </span>
              </div>
              <div className="flex items-center justify-between text-xs py-1">
                <span className="flex items-center gap-2 text-gray-600">
                  <ShieldCheck size={14} className="text-amber-500" />
                  Security Engine (JWT)
                </span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 size={13} /> Secured
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Recent Businesses & AI Activity Feeds ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Businesses Feed */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display font-bold text-lg text-gray-900 flex items-center gap-2">
                <Building2 size={18} className="text-indigo-500" />
                Latest Registered Tenants
              </h3>
              <p className="text-gray-400 text-xs mt-0.5">
                Newest business accounts on SmartBiz
              </p>
            </div>
            <Link
              to="/admin/businesses"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1 transition-colors"
            >
              <span>View All</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="divide-y divide-gray-50">
            {businesses.length > 0 ? (
              businesses.slice(0, 5).map(b => (
                <div key={b.businessId} className="py-3.5 flex items-center justify-between gap-4 hover:bg-gray-50/50 rounded-xl px-2 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm">
                      {b.name?.charAt(0)?.toUpperCase() || 'B'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{b.name}</p>
                      <p className="text-xs text-gray-400 truncate">{b.email}</p>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {b.subscription?.planName || 'Free'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-xs text-center py-8">No businesses registered yet</p>
            )}
          </div>
        </div>

        {/* Recent AI Logs Feed */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display font-bold text-lg text-gray-900 flex items-center gap-2">
                <Activity size={18} className="text-purple-500" />
                Recent AI Invocations
              </h3>
              <p className="text-gray-400 text-xs mt-0.5">
                Live stream of AI assistant activity
              </p>
            </div>
            <Link
              to="/admin/ai-usage"
              className="text-xs font-semibold text-purple-600 hover:text-purple-700 inline-flex items-center gap-1 transition-colors"
            >
              <span>View All</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="divide-y divide-gray-50">
            {aiUsage.length > 0 ? (
              aiUsage.slice().reverse().slice(0, 5).map(log => {
                const meta = FEATURE_META[log.feature] || { label: log.feature, icon: Sparkles, color: 'text-gray-600', bg: 'bg-gray-100' };
                const Icon = meta.icon;
                return (
                  <div key={log.aiId} className="py-3.5 flex items-start justify-between gap-4 hover:bg-gray-50/50 rounded-xl px-2 transition-colors">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-xl ${meta.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                        <Icon size={16} className={meta.color} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-900 truncate">
                            {log.business?.name || 'Business'}
                          </span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${meta.bg} ${meta.color}`}>
                            {meta.label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1 italic">
                          "{log.prompt}"
                        </p>
                      </div>
                    </div>

                    <span className="text-[11px] text-gray-400 shrink-0 mt-0.5">
                      {log.date ? String(log.date).replace('T', ' ').substring(11, 16) : ''}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-400 text-xs text-center py-8">No AI requests logged yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

