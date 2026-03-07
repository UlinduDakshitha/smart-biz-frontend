import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Building2, CreditCard, Brain, LogOut, Shield } from 'lucide-react';

const adminNavItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/businesses', icon: Building2, label: 'Businesses' },
  { to: '/admin/subscriptions', icon: CreditCard, label: 'Subscriptions' },
  { to: '/admin/ai-usage', icon: Brain, label: 'AI Usage Logs' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-[#f8f9ff] overflow-hidden">
      <aside className="w-64 bg-gradient-to-b from-[#1a1a2e] to-[#16213e] flex flex-col shrink-0">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <Shield size={18} className="text-white" />
            </div>
            <div>
              <h1 className="font-display text-white font-bold text-lg leading-none">SmartBiz</h1>
              <p className="text-amber-400 text-xs mt-0.5 font-semibold">ADMIN PANEL</p>
            </div>
          </div>
        </div>

        <div className="px-4 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <p className="text-white text-sm font-medium">{user?.name}</p>
              <p className="text-gray-400 text-xs">Administrator</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {adminNavItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-white/10">
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 w-full transition-all"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
