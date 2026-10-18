import { Search, Plus, Pencil, Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react';
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
  const pageSize = 12;

  const filtered = data.filter((item) => {
    if (!search) return true;
    if (searchKeys.length > 0) {
      return searchKeys.some((key) =>
        String(item[key] || '').toLowerCase().includes(search.toLowerCase())
      );
    }
    return Object.values(item).some((val) =>
      String(val || '').toLowerCase().includes(search.toLowerCase())
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="w-full min-h-full flex flex-col bg-white">
      {/* ── Full-Width Page Header ── */}
      <div className="px-6 sm:px-10 py-6 border-b border-gray-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-black text-gray-900 tracking-tight">
              {title}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
              {filtered.length} {filtered.length === 1 ? title.replace(/s$/, '').toLowerCase() : title.toLowerCase()}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Manage, search, and organize your {title.toLowerCase()} records
          </p>
        </div>

        {onAdd && (
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-extrabold shadow-sm shadow-indigo-600/20 transition-all self-start sm:self-auto"
          >
            <Plus size={16} />
            <span>Add {title.replace(/s$/, '')}</span>
          </button>
        )}
      </div>

      {/* ── Search & Filter Toolbar ── */}
      <div className="px-6 sm:px-10 py-3.5 border-b border-gray-200/80 bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-9 py-2 text-xs font-semibold text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-indigo-600 focus:outline-none transition-all shadow-2xs"
            placeholder={`Search ${title.toLowerCase()}...`}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setPage(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-700 rounded-full"
              title="Clear search"
            >
              <X size={13} />
            </button>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400 font-medium">
          <span>Showing</span>
          <span className="font-bold text-gray-700">
            {filtered.length > 0 ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, filtered.length)}
          </span>
          <span>of</span>
          <span className="font-bold text-gray-700">{filtered.length}</span>
        </div>
      </div>

      {/* ── Full-Width Edge-to-Edge Table ── */}
      <div className="w-full overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-gray-200/80 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              {columns.map((col) => (
                <th key={col.key} className="px-6 sm:px-10 py-3.5 whitespace-nowrap">
                  {col.label}
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th className="px-6 sm:px-10 py-3.5 text-right whitespace-nowrap">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length + (onEdit || onDelete ? 1 : 0)}
                  className="py-24 text-center"
                >
                  <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-xs text-gray-400 font-medium">Loading {title.toLowerCase()}...</p>
                </td>
              </tr>
            ) : paged.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (onEdit || onDelete ? 1 : 0)}
                  className="py-24 text-center"
                >
                  <p className="text-sm font-bold text-gray-700">No {title.toLowerCase()} found</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {search
                      ? 'Try adjusting your search query'
                      : `Get started by clicking "Add ${title.replace(/s$/, '')}" above`}
                  </p>
                </td>
              </tr>
            ) : (
              paged.map((row, i) => (
                <tr
                  key={row.id || row.customerId || row.productId || row.supplierId || row.expenseId || row.invoiceId || i}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="px-6 sm:px-10 py-4 text-xs font-semibold text-gray-800 whitespace-nowrap"
                    >
                      {col.render ? col.render(row) : row[col.key] || '—'}
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td className="px-6 sm:px-10 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100">
                        {onEdit && (
                          <button
                            type="button"
                            onClick={() => onEdit(row)}
                            title="Edit"
                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          >
                            <Pencil size={15} />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            type="button"
                            onClick={() => onDelete(row)}
                            title="Delete"
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Full-Width Bottom Pagination ── */}
      {totalPages > 1 && (
        <div className="px-6 sm:px-10 py-4 border-t border-gray-200/80 bg-white flex items-center justify-between text-xs text-gray-500 font-medium">
          <span>
            Showing page <strong className="text-gray-900">{page}</strong> of <strong className="text-gray-900">{totalPages}</strong>
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              title="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              title="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
