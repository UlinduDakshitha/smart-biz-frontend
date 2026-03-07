import { useEffect, useState } from 'react';
import { dashboardAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { TrendingUp, TrendingDown, Receipt, Users, Package, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { format } from 'date-fns';

function StatCard({ title, value, icon: Icon, color, subtitle }) {
  return (
    <div className="card fade-in">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-display font-bold text-indigo-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-11 h-11 ${color} rounded-2xl flex items-center justify-center`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    dashboardAPI.get()
      .then(res => setData(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-10 h-10 border-4 border-primary-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const formatCurrency = (val) => `$${Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-indigo-900">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name} 👋
        </h1>
        <p className="text-gray-400 text-sm mt-1">{format(new Date(), 'EEEE, MMMM d yyyy')} — Here's your business overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        <StatCard title="Sales This Month" value={formatCurrency(data?.totalSalesThisMonth)} icon={TrendingUp} color="bg-emerald-500" />
        <StatCard title="Expenses This Month" value={formatCurrency(data?.totalExpensesThisMonth)} icon={TrendingDown} color="bg-rose-500" />
        <StatCard title="Net Profit" value={formatCurrency(data?.netProfitThisMonth)} icon={TrendingUp} color="bg-primary-600" />
        <StatCard title="Total Invoices" value={data?.totalInvoices || 0} icon={Receipt} color="bg-amber-500" />
        <StatCard title="Customers" value={data?.totalCustomers || 0} icon={Users} color="bg-blue-500" />
        <StatCard title="Low Stock" value={data?.lowStockCount || 0} icon={AlertTriangle} color="bg-orange-500" subtitle="Products below 5 units" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <div className="card">
          <h3 className="font-display font-semibold text-indigo-900 mb-4">Top Selling Products</h3>
          {data?.topSellingProducts?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.topSellingProducts} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f4ff" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
                <Tooltip formatter={(val) => [val, 'Qty Sold']} contentStyle={{ borderRadius: 12, border: '1px solid #e0e9ff', fontSize: 12 }} />
                <Bar dataKey="totalQty" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-400 text-sm text-center py-8">No sales data yet</p>}
        </div>

        {/* Recent Invoices */}
        <div className="card">
          <h3 className="font-display font-semibold text-indigo-900 mb-4">Recent Invoices</h3>
          {data?.recentInvoices?.length > 0 ? (
            <div className="space-y-3">
              {data.recentInvoices.map((inv, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-indigo-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-indigo-900">#{inv.invoiceId} — {inv.customerName}</p>
                    <p className="text-xs text-gray-400">{inv.date}</p>
                  </div>
                  <span className="font-semibold text-emerald-600 text-sm">{formatCurrency(inv.totalAmount)}</span>
                </div>
              ))}
            </div>
          ) : <p className="text-gray-400 text-sm text-center py-8">No recent invoices</p>}
        </div>
      </div>
    </div>
  );
}
