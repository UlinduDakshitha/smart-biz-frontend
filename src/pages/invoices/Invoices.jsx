import { useState, useEffect } from 'react';
import { invoiceAPI, customerAPI, productAPI } from '../../services/api';
import CrudTable from '../../components/ui/CrudTable';
import Modal from '../../components/ui/Modal';
import ConfirmDeleteModal from '../../components/ui/ConfirmDeleteModal';
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
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
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

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await invoiceAPI.delete(deleteTarget.invoiceId);
      toast.success('Invoice deleted');
      setDeleteTarget(null);
      load();
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { key: 'invoiceId', label: 'Invoice #', render: row => <span className="font-mono font-semibold">#{row.invoiceId}</span> },
    { key: 'customer', label: 'Customer', render: row => row.customer?.name || '—' },
    { key: 'totalAmount', label: 'Total', render: row => <span className="font-semibold text-emerald-600">Rs. {Number(row.totalAmount).toLocaleString('en-LK', { minimumFractionDigits: 2 })}</span> },
    { key: 'date', label: 'Date' },
    { key: 'items', label: 'Items', render: row => `${row.items?.length || 0} items` },
  ];

  return (
    <>
      <div className="w-full min-h-full flex flex-col bg-white">
        <div className="px-6 sm:px-10 py-6 border-b border-gray-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-display font-black text-gray-900 tracking-tight">
                Invoices
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                {data.length} {data.length === 1 ? 'invoice' : 'invoices'}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Issue, manage, and track customer billing invoices
            </p>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-extrabold shadow-sm shadow-indigo-600/20 transition-all self-start sm:self-auto"
            onClick={() => setModal(true)}
          >
            <Plus size={16} />
            <span>New Invoice</span>
          </button>
        </div>

        <div className="w-full overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-gray-200/80 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                {columns.map(col => (
                  <th key={col.key} className="px-6 sm:px-10 py-3.5 whitespace-nowrap">{col.label}</th>
                ))}
                <th className="px-6 sm:px-10 py-3.5 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-24 text-center">
                    <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-xs text-gray-400 font-medium">Loading invoices...</p>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-24 text-center">
                    <p className="text-sm font-bold text-gray-700">No invoices yet</p>
                    <p className="text-xs text-gray-400 mt-1">Click "New Invoice" above to create your first customer invoice.</p>
                  </td>
                </tr>
              ) : (
                data.map(row => (
                  <tr key={row.invoiceId} className="hover:bg-slate-50/70 transition-colors group">
                    {columns.map(col => (
                      <td key={col.key} className="px-6 sm:px-10 py-4 text-xs font-semibold text-gray-800 whitespace-nowrap">
                        {col.render ? col.render(row) : row[col.key]}
                      </td>
                    ))}
                    <td className="px-6 sm:px-10 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => navigate(`/invoices/${row.invoiceId}`)}
                          title="View Invoice"
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(row)}
                          title="Delete Invoice"
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
                    {products.map(p => <option key={p.productId} value={p.productId}>{p.name} (Rs. {Number(p.price).toFixed(2)})</option>)}
                  </select>
                  <input type="number" min="1" className="input w-20" value={item.quantity}
                    onChange={e => updateItem(i, 'quantity', e.target.value)} placeholder="Qty" />
                  <span className="text-sm font-semibold text-emerald-600 w-28 text-right">Rs. {getItemSubtotal(item).toFixed(2)}</span>
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
            <span className="text-xl font-display font-bold text-emerald-600">Rs. {total.toLocaleString('en-LK', { minimumFractionDigits: 2 })}</span>
          </div>

          <div className="flex gap-3">
            <button type="button" className="btn-secondary flex-1" onClick={() => setModal(false)}>Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={saving}>{saving ? 'Creating...' : 'Create Invoice'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDeleteModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Invoice"
        itemName={deleteTarget ? `Invoice #${deleteTarget.invoiceId}` : ''}
        description="Are you sure you want to delete this invoice? This will remove the invoice record from your sales history."
        loading={deleting}
      />
    </>
  );
}
