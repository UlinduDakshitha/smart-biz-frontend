import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import { Building2, Brain, CreditCard, Receipt } from 'lucide-react';

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-display font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`w-11 h-11 ${color} rounded-2xl flex items-center justify-center`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    adminAPI.getStats().then(res => setStats(res.data.data));
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-gray-900">System Overview</h1>
        <p className="text-gray-400 text-sm mt-1">SmartBiz platform statistics</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard label="Total Businesses" value={stats?.totalBusinesses ?? '—'} icon={Building2} color="bg-indigo-500" />
        <StatCard label="AI Requests" value={stats?.totalAiRequests ?? '—'} icon={Brain} color="bg-purple-500" />
        <StatCard label="Total Invoices" value={stats?.totalInvoices ?? '—'} icon={Receipt} color="bg-emerald-500" />
        <StatCard label="Subscriptions" value={stats?.totalSubscriptions ?? '—'} icon={CreditCard} color="bg-amber-500" />
      </div>
    </div>
  );
}
