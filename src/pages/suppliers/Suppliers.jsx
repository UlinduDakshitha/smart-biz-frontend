import { useState, useEffect } from 'react';
import { supplierAPI } from '../../services/api';
import CrudTable from '../../components/ui/CrudTable';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';

const emptyForm = { name: '', email: '', phone: '' };

export default function Suppliers() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    supplierAPI.getAll().then(res => setData(res.data.data || [])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(emptyForm); setEditing(null); setModal(true); };
  const openEdit = (row) => {
    setForm({ name: row.name, email: row.email || '', phone: row.phone || '' });
    setEditing(row.supplierId);
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      editing ? await supplierAPI.update(editing, form) : await supplierAPI.create(form);
      toast.success(editing ? 'Supplier updated' : 'Supplier added');
      setModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async (row) => {
    if (!confirm(`Delete supplier "${row.name}"?`)) return;
    try { await supplierAPI.delete(row.supplierId); toast.success('Deleted'); load(); }
    catch { toast.error('Failed to delete'); }
  };

  const columns = [
    { key: 'supplierId', label: '#' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
  ];

  return (
    <>
      <CrudTable title="Suppliers" data={data} columns={columns} loading={loading}
        onAdd={openAdd} onEdit={openEdit} onDelete={handleDelete} searchKeys={['name', 'email']} />

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Supplier' : 'Add Supplier'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Name *</label>
            <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
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
