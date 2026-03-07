import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import Modal from '../../components/ui/Modal';
import { Plus, Pencil, Trash2, CreditCard } from 'lucide-react';

const emptyForm = { planName: '', price: '', durationDays: '' };

export default function AdminSubscriptions() {
  const [data, setData] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => adminAPI.getSubscriptions().then(res => setData(res.data.data || []));
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(emptyForm); setEditing(null); setModal(true); };
  const openEdit = (row) => {
    setForm({ planName: row.planName, price: row.price, durationDays: row.durationDays });
    setEditing(row.subscriptionId);
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      editing ? await adminAPI.updateSubscription(editing, form) : await adminAPI.createSubscription(form);
      toast.success(editing ? 'Plan updated' : 'Plan created');
      setModal(false);
      load();
    } catch { toast.error('Failed to save'); } finally { setSaving(false); }
  };

  const handleDelete = async (row) => {
    if (!confirm(`Delete plan "${row.planName}"?`)) return;
    try { await adminAPI.deleteSubscription(row.subscriptionId); toast.success('Plan deleted'); load(); }
    catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <CreditCard size={24} className="text-amber-500" />
          <h1 className="text-2xl font-display font-bold text-gray-900">Subscription Plans</h1>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-all" onClick={openAdd}>
          <Plus size={16} /> New Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {data.map(plan => (
          <div key={plan.subscriptionId} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-display font-bold text-lg text-gray-900">{plan.planName}</h3>
              <div className="flex gap-1">
                <button onClick={() => openEdit(plan)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"><Pencil size={14} /></button>
                <button onClick={() => handleDelete(plan)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={14} /></button>
              </div>
            </div>
            <p className="text-3xl font-display font-bold text-indigo-900">${Number(plan.price).toFixed(2)}</p>
            <p className="text-xs text-gray-400 mt-1">{plan.durationDays} days</p>
          </div>
        ))}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Plan' : 'New Plan'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Plan Name *</label>
            <input className="input" value={form.planName} onChange={e => setForm({ ...form, planName: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Price ($) *</label>
              <input type="number" step="0.01" className="input" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
            </div>
            <div>
              <label className="label">Duration (Days) *</label>
              <input type="number" className="input" value={form.durationDays} onChange={e => setForm({ ...form, durationDays: e.target.value })} required />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" className="btn-secondary flex-1" onClick={() => setModal(false)}>Cancel</button>
            <button type="submit" className="w-full flex-1 py-2 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-all" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
