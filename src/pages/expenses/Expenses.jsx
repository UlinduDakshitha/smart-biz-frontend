import { useState, useEffect } from 'react';
import { expenseAPI } from '../../services/api';
import CrudTable from '../../components/ui/CrudTable';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const today = new Date().toISOString().split('T')[0];
const emptyForm = { description: '', amount: '', date: today };

export default function Expenses() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    expenseAPI.getAll().then(res => setData(res.data.data || [])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(emptyForm); setEditing(null); setModal(true); };
  const openEdit = (row) => {
    setForm({ description: row.description || '', amount: row.amount, date: row.date });
    setEditing(row.expenseId);
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      editing ? await expenseAPI.update(editing, form) : await expenseAPI.create(form);
      toast.success(editing ? 'Expense updated' : 'Expense added');
      setModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async (row) => {
    if (!confirm('Delete this expense?')) return;
    try { await expenseAPI.delete(row.expenseId); toast.success('Deleted'); load(); }
    catch { toast.error('Failed to delete'); }
  };

  const totalExpenses = data.reduce((sum, e) => sum + Number(e.amount || 0), 0);

  const columns = [
    { key: 'expenseId', label: '#' },
    { key: 'description', label: 'Description' },
    { key: 'amount', label: 'Amount', render: row => <span className="font-semibold text-rose-600">${Number(row.amount).toFixed(2)}</span> },
    { key: 'date', label: 'Date' },
  ];

  return (
    <>
      <div className="px-8 pt-8">
        <div className="card bg-gradient-to-r from-rose-50 to-red-50 border-rose-100 mb-0">
          <p className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Total Expenses (All Time)</p>
          <p className="text-3xl font-display font-bold text-rose-600 mt-1">${totalExpenses.toFixed(2)}</p>
        </div>
      </div>

      <CrudTable title="Expenses" data={data} columns={columns} loading={loading}
        onAdd={openAdd} onEdit={openEdit} onDelete={handleDelete} searchKeys={['description']} />

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Expense' : 'Add Expense'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Description *</label>
            <textarea className="input resize-none h-20" value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Amount ($) *</label>
              <input type="number" step="0.01" className="input" value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })} required />
            </div>
            <div>
              <label className="label">Date *</label>
              <input type="date" className="input" value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })} required />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" className="btn-secondary flex-1" onClick={() => setModal(false)}>Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
