import { Search, Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export default function CrudTable({
  title,
  data = [],
  columns = [],
  onAdd,
  onEdit,
  onDelete,
  loading = false,
  searchKeys = [],
}) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filtered = data.filter(item => {
    if (!search) return true;
    return searchKeys.some(key =>
      String(item[key] || '').toLowerCase().includes(search.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold text-indigo-900">{title}</h1>
        <button className="btn-primary flex items-center gap-2" onClick={onAdd}>
          <Plus size={16} />
          Add {title.replace(/s$/, '')}
        </button>
      </div>

      <div className="card">
        {/* Search */}
        <div className="mb-4 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input pl-9"
            placeholder={`Search ${title.toLowerCase()}...`}
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-indigo-50">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                {columns.map(col => (
                  <th key={col.key} className="px-4 py-3 text-left">{col.label}</th>
                ))}
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={columns.length + 1} className="text-center py-12 text-gray-400">Loading...</td></tr>
              ) : paged.length === 0 ? (
                <tr><td colSpan={columns.length + 1} className="text-center py-12 text-gray-400">No data found</td></tr>
              ) : paged.map((row, i) => (
                <tr key={row.id || i} className="border-t border-indigo-50 hover:bg-indigo-50/40 transition-colors">
                  {columns.map(col => (
                    <td key={col.key} className="px-4 py-3 text-gray-700">
                      {col.render ? col.render(row) : row[col.key] || '—'}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(row)}
                          className="p-1.5 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-100 rounded-lg transition-all"
                        >
                          <Pencil size={14} />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(row)}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
            <span>Showing {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 rounded-lg border border-indigo-100 disabled:opacity-40 hover:bg-indigo-50">
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-indigo-100 disabled:opacity-40 hover:bg-indigo-50">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
