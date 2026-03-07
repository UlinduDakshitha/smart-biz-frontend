import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Trash2, Building2 } from 'lucide-react';

export default function AdminBusinesses() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    adminAPI.getBusinesses().then(res => setData(res.data.data || [])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (b) => {
    if (!confirm(`Delete business "${b.name}"? This cannot be undone.`)) return;
    try { await adminAPI.deleteBusiness(b.businessId); toast.success('Business deleted'); load(); }
    catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center gap-3">
        <Building2 size={24} className="text-indigo-500" />
        <h1 className="text-2xl font-display font-bold text-gray-900">Registered Businesses</h1>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">#</th>
              <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Business</th>
              <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Email</th>
              <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Phone</th>
              <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Plan</th>
              <th className="px-5 py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={6} className="text-center py-12 text-gray-400">Loading...</td></tr>
            : data.length === 0 ? <tr><td colSpan={6} className="text-center py-12 text-gray-400">No businesses registered</td></tr>
            : data.map(b => (
              <tr key={b.businessId} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3 text-gray-500">{b.businessId}</td>
                <td className="px-5 py-3 font-semibold text-gray-900">{b.name}</td>
                <td className="px-5 py-3 text-gray-600">{b.email}</td>
                <td className="px-5 py-3 text-gray-600">{b.phone || '—'}</td>
                <td className="px-5 py-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                    {b.subscription?.planName || 'Free'}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => handleDelete(b)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
