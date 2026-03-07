import { useState, useEffect } from 'react';
import { productAPI, supplierAPI } from '../../services/api';
import CrudTable from '../../components/ui/CrudTable';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';

const emptyForm = { name: '', price: '', stockQty: '', supplierId: '' };

export default function Products() {
  const [data, setData] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([productAPI.getAll(), supplierAPI.getAll()])
      .then(([prodRes, supRes]) => {
        setData(prodRes.data.data || []);
        setSuppliers(supRes.data.data || []);
      }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(emptyForm); setEditing(null); setModal(true); };
  const openEdit = (row) => {
    setForm({ name: row.name, price: row.price, stockQty: row.stockQty, supplierId: row.supplier?.supplierId || '' });
    setEditing(row.productId);
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name: form.name,
      price: parseFloat(form.price),
      stockQty: parseInt(form.stockQty),
      supplier: form.supplierId ? { supplierId: parseInt(form.supplierId) } : null,
    };
    try {
      editing ? await productAPI.update(editing, payload) : await productAPI.create(payload);
      toast.success(editing ? 'Product updated' : 'Product added');
      setModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async (row) => {
    if (!confirm(`Delete "${row.name}"?`)) return;
    try { await productAPI.delete(row.productId); toast.success('Deleted'); load(); }
    catch { toast.error('Failed to delete'); }
  };

  const columns = [
    { key: 'productId', label: '#' },
    { key: 'name', label: 'Product Name' },
    { key: 'price', label: 'Price', render: row => `$${Number(row.price).toFixed(2)}` },
    { key: 'stockQty', label: 'Stock', render: row => (
      <span className={row.stockQty <= 5 ? 'badge-red' : 'badge-green'}>{row.stockQty} units</span>
    )},
    { key: 'supplier', label: 'Supplier', render: row => row.supplier?.name || '—' },
  ];

  return (
    <>
      <CrudTable title="Products" data={data} columns={columns} loading={loading}
        onAdd={openAdd} onEdit={openEdit} onDelete={handleDelete} searchKeys={['name']} />

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Product' : 'Add Product'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Product Name *</label>
            <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Price ($) *</label>
              <input type="number" step="0.01" className="input" value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })} required />
            </div>
            <div>
              <label className="label">Stock Qty *</label>
              <input type="number" className="input" value={form.stockQty}
                onChange={e => setForm({ ...form, stockQty: e.target.value })} required />
            </div>
          </div>
          <div>
            <label className="label">Supplier</label>
            <select className="input" value={form.supplierId} onChange={e => setForm({ ...form, supplierId: e.target.value })}>
              <option value="">None</option>
              {suppliers.map(s => <option key={s.supplierId} value={s.supplierId}>{s.name}</option>)}
            </select>
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
