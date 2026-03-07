import { useState, useEffect } from 'react';
import { customerAPI } from '../../services/api';
import CrudTable from '../../components/ui/CrudTable';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';

const emptyForm = { name: '', email: '', phone: '', address: '' };

export default function Customers() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    customerAPI.getAll().then(res => setData(res.data.data || [])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(emptyForm); setEditing(null); setModal(true); };
  const openEdit = (row) => {
    setForm({ name: row.name, email: row.email || '', phone: row.phone || '', address: row.address || '' });
    setEditing(row.customerId);
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await customerAPI.update(editing, form);
        toast.success('Customer updated');
      } else {
        await customerAPI.create(form);
        toast.success('Customer added');
      }
      setModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row) => {
    if (!confirm(`Delete customer "${row.name}"?`)) return;
    try {
      await customerAPI.delete(row.customerId);
      toast.success('Customer deleted');
      load();
    } catch { toast.error('Failed to delete'); }
  };

  const columns = [
    { key: 'customerId', label: '#' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'address', label: 'Address' },
  ];

  return (
    <>
      <CrudTable
        title="Customers"
        data={data}
        columns={columns}
        loading={loading}
        onAdd={openAdd}
        onEdit={openEdit}
        onDelete={handleDelete}
        searchKeys={['name', 'email', 'phone']}
      />

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Customer' : 'Add Customer'}>
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
          <div>
            <label className="label">Address</label>
            <textarea className="input resize-none h-20" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
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
