import { useEffect } from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';

export default function ConfirmDeleteModal({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  itemName,
  description = 'This action cannot be undone and will permanently remove this item.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  loading = false,
}) {
  // Prevent background scroll and support ESC key
  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !loading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, loading, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={() => !loading && onClose()}
      />

      {/* Modal dialog */}
      <div className="relative w-full max-w-md overflow-hidden bg-white border shadow-2xl rounded-3xl border-rose-100/80 p-7 text-center fade-in">
        {/* Subtle decorative glow */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-48 h-48 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all disabled:opacity-50"
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        {/* Animated Warning / Trash Icon */}
        <div className="relative mx-auto mb-5 w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-50 to-red-100 border border-rose-200/60 flex items-center justify-center shadow-inner">
          <Trash2 size={28} className="text-rose-600" />
          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 rounded-full ring-2 ring-white flex items-center justify-center">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 font-display mb-2">
          {title}
        </h3>

        {/* Item name chip if provided */}
        {itemName && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold rounded-full max-w-full truncate mb-3">
            <span className="truncate">"{itemName}"</span>
          </div>
        )}

        {/* Description */}
        <p className="text-sm text-gray-500 leading-relaxed mb-7 max-w-sm mx-auto">
          {description}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 font-medium text-sm transition-all disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-semibold text-sm shadow-md shadow-rose-500/25 hover:shadow-lg hover:shadow-rose-500/35 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Deleting…</span>
              </>
            ) : (
              <>
                <Trash2 size={16} />
                <span>{confirmText}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
