import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import { Brain, BarChart3, Mail, FileText, ShoppingBag } from 'lucide-react';

const featureIcons = {
  INSIGHTS: BarChart3,
  EMAIL: Mail,
  INVOICE_SUMMARY: FileText,
  SOCIAL_MEDIA: ShoppingBag,
};

const featureColors = {
  INSIGHTS: 'bg-blue-100 text-blue-700',
  EMAIL: 'bg-emerald-100 text-emerald-700',
  INVOICE_SUMMARY: 'bg-amber-100 text-amber-700',
  SOCIAL_MEDIA: 'bg-pink-100 text-pink-700',
};

export default function AdminAiUsage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getAiUsage().then(res => setData(res.data.data || [])).finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <Brain size={24} className="text-purple-500" />
        <h1 className="text-2xl font-display font-bold text-gray-900">AI Usage Logs</h1>
        <span className="ml-auto bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full">{data.length} total</span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">#</th>
              <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Business</th>
              <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Feature</th>
              <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Prompt</th>
              <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={5} className="text-center py-12 text-gray-400">Loading...</td></tr>
            : data.length === 0 ? <tr><td colSpan={5} className="text-center py-12 text-gray-400">No AI usage logs yet</td></tr>
            : data.slice().reverse().map(log => {
              const Icon = featureIcons[log.feature] || Brain;
              const colorClass = featureColors[log.feature] || 'bg-gray-100 text-gray-700';
              return (
                <tr key={log.aiId} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 text-gray-400">{log.aiId}</td>
                  <td className="px-5 py-3 font-medium text-gray-900">{log.business?.name}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colorClass}`}>
                      <Icon size={11} />
                      {log.feature?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-600 max-w-xs truncate">{log.prompt}</td>
                  <td className="px-5 py-3 text-gray-400 text-xs">{log.date?.replace('T', ' ').substring(0, 16)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
