import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../services/api';
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  Brain,
  LogOut,
  Shield,
  ChevronRight,
  ExternalLink,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';

const adminNavItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'System Overview', badgeKey: null, end: true },
  { to: '/admin/businesses', icon: Building2, label: 'Businesses & Tenants', badgeKey: 'businesses' },
  { to: '/admin/subscriptions', icon: CreditCard, label: 'Subscription Plans', badgeKey: 'subscriptions' },
  { to: '/admin/ai-usage', icon: Brain, label: 'AI Usage Logs', badgeKey: 'aiRequests' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [counts, setCounts] = useState({ businesses: 0, subscriptions: 0, aiRequests: 0 });
  const [currentTime, setCurrentTime] = useState(new Date());

  // Clock tick
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch summary counts for sidebar badges
  useEffect(() => {
    let isMounted = true;
    adminAPI.getStats()
      .then(res => {
        if (isMounted && res.data?.data) {
          const s = res.data.data;
          setCounts({
            businesses: s.totalBusinesses || 0,
            subscriptions: s.totalSubscriptions || 0,
            aiRequests: s.totalAiRequests || 0,
          });
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, [location.pathname]);

  // Derive current page title for breadcrumb
  const currentNav = adminNavItems.find(item =>
    item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
  ) || { label: 'Admin Control Center' };

  return (
    <div className="flex h-screen bg-[#f8f9ff] overflow-hidden text-gray-800">
      {/* ── Left Sidebar ── */}
      <aside className="w-68 bg-gradient-to-b from-[#0f172a] via-[#1a1f37] to-[#0f172a] flex flex-col shrink-0 border-r border-white/5 relative z-20 shadow-2xl">
        {/* Brand Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-amber-500 to-amber-300 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 ring-2 ring-white/10">
              <Shield size={20} className="text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-white font-extrabold text-lg tracking-tight">SmartBiz</h1>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  ADMIN
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-0.5 font-medium">Enterprise Control Suite</p>
            </div>
          </div>
        </div>

        {/* Administrator Profile Card */}
        <div className="mx-4 my-4 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center text-white font-display font-extrabold text-base shadow-md">
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-sm font-bold truncate leading-tight">{user?.name || 'Administrator'}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-slate-400 truncate">Super Admin</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="px-4 py-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3">
            Navigation
          </span>
        </div>

        <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto">
          {adminNavItems.map(({ to, icon: Icon, label, badgeKey, end }) => {
            const count = badgeKey ? counts[badgeKey] : null;
            return (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `group relative flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500/20 to-amber-500/5 text-amber-400 border border-amber-500/30 shadow-sm shadow-amber-500/10'
                      : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon
                        size={19}
                        className={`transition-colors ${
                          isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-200'
                        }`}
                      />
                      <span>{label}</span>
                    </div>

                    {count !== null && count !== undefined && count > 0 && (
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full font-bold transition-colors ${
                          isActive
                            ? 'bg-amber-400/20 text-amber-300'
                            : 'bg-white/10 text-slate-300 group-hover:bg-white/20'
                        }`}
                      >
                        {count}
                      </span>
                    )}

                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-amber-400 rounded-r-full shadow-sm shadow-amber-400" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-3 border-t border-white/10 bg-black/20">
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-300 hover:text-white hover:bg-rose-500/20 w-full transition-all border border-rose-500/20"
          >
            <LogOut size={16} />
            <span>Sign Out Admin</span>
          </button>
        </div>
      </aside>

      {/* ── Main Area with Header ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Executive Header */}
        <header className="h-18 bg-white border-b border-gray-100 px-8 flex items-center justify-between shrink-0 z-10 shadow-sm">
          {/* Breadcrumb & Section Name */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Admin Console
            </span>
            <ChevronRight size={14} className="text-gray-300" />
            <span className="text-sm font-bold text-gray-900 font-display">
              {currentNav.label}
            </span>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-4">
            {/* Live Clock */}
            <div className="hidden md:flex items-center gap-1.5 text-xs text-gray-500 font-medium bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
              <Clock size={13} className="text-gray-400" />
              <span>{format(currentTime, 'EEE, MMM d • h:mm a')}</span>
            </div>

            {/* Platform Live Status */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>System Healthy</span>
            </div>

            {/* Business Portal Preview Link */}
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all border border-indigo-100"
              title="Switch view to Business Tenant Portal"
            >
              <ExternalLink size={13} />
              <span className="hidden sm:inline">Tenant Portal</span>
            </button>
          </div>
        </header>

        {/* Scrollable Page Outlet */}
        <main className="flex-1 overflow-y-auto bg-[#f8f9ff]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

