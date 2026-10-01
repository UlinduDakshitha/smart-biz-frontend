import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import {
  LayoutDashboard,
  Users,
  Truck,
  Package,
  Receipt,
  DollarSign,
  Sparkles,
  UserCircle,
  LogOut,
  Zap,
} from 'lucide-react';

const navItems = [
  {
    to: '/dashboard',
    icon: LayoutDashboard,
    label: 'Dashboard',
  },
  {
    to: '/customers',
    icon: Users,
    label: 'Customers',
  },
  {
    to: '/suppliers',
    icon: Truck,
    label: 'Suppliers',
  },
  {
    to: '/products',
    icon: Package,
    label: 'Products',
  },
  {
    to: '/invoices',
    icon: Receipt,
    label: 'Invoices',
  },
  {
    to: '/expenses',
    icon: DollarSign,
    label: 'Expenses',
  },
  {
    to: '/ai',
    icon: Sparkles,
    label: 'AI Assistant',
  },

  // Business Profile
  {
    to: '/profile',
    icon: UserCircle,
    label: 'Business Profile',
  },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-[#f8f9ff] overflow-hidden">

      {/* ================= SIDEBAR ================= */}

      <aside className="w-64 bg-gradient-to-b from-[#312e81] to-[#1e1b4b] flex flex-col shrink-0">

        {/* ================= LOGO ================= */}

        <div className="p-6 border-b border-white/10">

          <div className="flex items-center gap-3">

            <div className="
              w-9
              h-9
              bg-gradient-to-br
              from-indigo-400
              to-purple-500
              rounded-xl
              flex
              items-center
              justify-center
              shadow-lg
            ">
              <Zap
                size={18}
                className="text-white"
              />
            </div>

            <div>

              <h1 className="
                font-display
                text-white
                font-bold
                text-lg
                leading-none
              ">
                SmartBiz
              </h1>

              <p className="
                text-indigo-300
                text-xs
                mt-0.5
              ">
                Business Suite
              </p>

            </div>

          </div>

        </div>


        {/* ================= USER INFO ================= */}

        <div className="
          px-4
          py-4
          border-b
          border-white/10
        ">

          <div className="flex items-center gap-3">

            {/* User Avatar */}

            <div className="
              w-9
              h-9
              bg-indigo-500
              rounded-full
              flex
              items-center
              justify-center
              text-white
              font-bold
              text-sm
              shrink-0
            ">
              {user?.name
                ?.charAt(0)
                ?.toUpperCase() || 'U'}
            </div>


            {/* User Details */}

            <div className="overflow-hidden">

              <p className="
                text-white
                text-sm
                font-medium
                truncate
              ">
                {user?.name || 'Business Owner'}
              </p>

              <p className="
                text-indigo-300
                text-xs
                truncate
              ">
                {user?.email || ''}
              </p>

            </div>

          </div>

        </div>


        {/* ================= NAVIGATION ================= */}

        <nav className="
          flex-1
          px-3
          py-4
          space-y-1
          overflow-y-auto
        ">

          {navItems.map(
            ({
              to,
              icon: Icon,
              label,
            }) => (

              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `sidebar-link ${
                    isActive
                      ? 'active'
                      : ''
                  }`
                }
              >

                <Icon size={18} />

                <span>
                  {label}
                </span>

              </NavLink>

            )
          )}

        </nav>


        {/* ================= LOGOUT ================= */}

        <div className="
          p-3
          border-t
          border-white/10
        ">

          <button
            onClick={handleLogout}
            className="
              sidebar-link
              w-full
              text-red-300
              hover:text-red-200
              hover:bg-red-500/10
            "
          >

            <LogOut size={18} />

            <span>
              Logout
            </span>

          </button>

        </div>

      </aside>


      {/* ================= MAIN CONTENT ================= */}

      <main className="
        flex-1
        overflow-y-auto
      ">

        <Outlet />

      </main>

    </div>
  );
}