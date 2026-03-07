import { useState, useEffect } from 'react';
import { invoiceAPI, customerAPI, productAPI } from '../../services/api';
import CrudTable from '../../components/ui/CrudTable';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Eye } from 'lucide-react';

export default function Invoices() {
  const [data, setData] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState([{ productId: '', quantity: 1 }]);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    Promise.all([invoiceAPI.getAll(), customerAPI.getAll(), productAPI.getAll()])
      .then(([invRes, custRes, prodRes]) => {
        setData(invRes.data.data || []);
        setCustomers(custRes.data.data || []);
        setProducts(prodRes.data.data || []);
      }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const addItem = () => setItems([...items, { productId: '', quantity: 1 }]);
  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i, field, value) => setItems(items.map((item, idx) => idx === i ? { ...item, [field]: value } : item));

  const getItemSubtotal = (item) => {
    const product = products.find(p => p.productId === parseInt(item.productId));
    if (!product) return 0;
    return Number(product.price) * Number(item.quantity || 0);
  };

  const total = items.reduce((sum, item) => sum + getItemSubtotal(item), 0);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!customerId) return toast.error('Select a customer');
    const validItems = items.filter(i => i.productId && i.quantity > 0);
    if (validItems.length === 0) return toast.error('Add at least one item');

    setSaving(true);
    try {
      await invoiceAPI.create({
        customerId: parseInt(customerId),
        items: validItems.map(i => ({ productId: parseInt(i.productId), quantity: parseInt(i.quantity) }))
      });
      toast.success('Invoice created');
      setModal(false);
      setCustomerId('');
      setItems([{ productId: '', quantity: 1 }]);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create invoice');
    } finally { setSaving(false); }
  };

  const handleDelete = async (row) => {
    if (!confirm(`Delete Invoice #${row.invoiceId}?`)) return;
    try { await invoiceAPI.delete(row.invoiceId); toast.success('Invoice deleted'); load(); }
    catch { toast.error('Failed to delete'); }
  };

  const columns = [
    { key: 'invoiceId', label: 'Invoice #', render: row => <span className="font-mono font-semibold">#{row.invoiceId}</span> },
    { key: 'customer', label: 'Customer', render: row => row.customer?.name || '—' },
    { key: 'totalAmount', label: 'Total', render: row => <span className="font-semibold text-emerald-600">${Number(row.totalAmount).toFixed(2)}</span> },
    { key: 'date', label: 'Date' },
    { key: 'items', label: 'Items', render: row => `${row.items?.length || 0} items` },
  ];

  return (
    <>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-display font-bold text-indigo-900">Invoices</h1>
          <button className="btn-primary flex items-center gap-2" onClick={() => setModal(true)}>
            <Plus size={16} />New Invoice
          </button>
        </div>
        <div className="card">
          <div className="overflow-x-auto rounded-xl border border-indigo-50">
            <table className="w-full text-sm">
              <thead>
                <tr className="table-header">
                  {columns.map(col => <th key={col.key} className="px-4 py-3 text-left">{col.label}</th>)}
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? <tr><td colSpan={6} className="text-center py-12 text-gray-400">Loading...</td></tr>
                : data.length === 0 ? <tr><td colSpan={6} className="text-center py-12 text-gray-400">No invoices yet</td></tr>
                : data.map(row => (
                  <tr key={row.invoiceId} className="border-t border-indigo-50 hover:bg-indigo-50/40 transition-colors">
                    {columns.map(col => <td key={col.key} className="px-4 py-3 text-gray-700">{col.render ? col.render(row) : row[col.key]}</td>)}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => navigate(`/invoices/${row.invoiceId}`)}
                          className="p-1.5 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-100 rounded-lg transition-all">
                          <Eye size={14} />
                        </button>
                        <button onClick={() => handleDelete(row)}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Create New Invoice" size="lg">
        <form onSubmit={handleCreate} className="space-y-5">
          <div>
            <label className="label">Customer *</label>
            <select className="input" value={customerId} onChange={e => setCustomerId(e.target.value)} required>
              <option value="">Select customer...</option>
              {customers.map(c => <option key={c.customerId} value={c.customerId}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label">Items *</label>
              <button type="button" onClick={addItem} className="text-primary-600 text-xs font-semibold hover:text-primary-700 flex items-center gap-1">
                <Plus size={12} /> Add Item
              </button>
            </div>
            <div className="space-y-2">
              {items.map((item, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <select className="input flex-1" value={item.productId}
                    onChange={e => updateItem(i, 'productId', e.target.value)}>
                    <option value="">Select product...</option>
                    {products.map(p => <option key={p.productId} value={p.productId}>{p.name} (${p.price})</option>)}
                  </select>
                  <input type="number" min="1" className="input w-20" value={item.quantity}
                    onChange={e => updateItem(i, 'quantity', e.target.value)} placeholder="Qty" />
                  <span className="text-sm font-semibold text-emerald-600 w-20 text-right">${getItemSubtotal(item).toFixed(2)}</span>
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeItem(i)} className="p-1.5 text-red-400 hover:text-red-600 rounded-lg">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center border-t border-indigo-50 pt-4">
            <span className="text-sm text-gray-500">Total Amount</span>
            <span className="text-xl font-display font-bold text-emerald-600">${total.toFixed(2)}</span>
          </div>

          <div className="flex gap-3">
            <button type="button" className="btn-secondary flex-1" onClick={() => setModal(false)}>Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={saving}>{saving ? 'Creating...' : 'Create Invoice'}</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
