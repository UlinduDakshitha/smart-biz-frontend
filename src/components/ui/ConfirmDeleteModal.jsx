import { useEffect } from 'react';
import { Trash2, X, AlertTriangle } from 'lucide-react';

export default function ConfirmDeleteModal({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  itemName,
  description = 'This action cannot be undone and will permanently remove this item.',
  confirmText = 'Delete Permanently',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Blurred Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/65 backdrop-blur-md backdrop-fade-in transition-opacity"
        onClick={() => !loading && onClose()}
        aria-hidden="true"
      />

      {/* Modal dialog */}
      <div
        className="relative w-full max-w-md my-auto overflow-hidden bg-white border shadow-[0_25px_60px_-15px_rgba(225,29,72,0.25)] rounded-3xl border-rose-100 p-7 text-center modal-pop-in z-10"
        role="alertdialog"
        aria-modal="true"
      >
        {/* Top danger accent line */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-rose-500 via-red-500 to-amber-500" />

        {/* Subtle decorative glow */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100/80 rounded-xl transition-all disabled:opacity-50 active:scale-95"
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        {/* Animated Warning / Trash Icon */}
        <div className="relative mx-auto mt-2 mb-5 w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-50 to-red-100/90 border border-rose-200/80 flex items-center justify-center shadow-inner">
          <Trash2 size={28} className="text-rose-600" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full ring-2 ring-white flex items-center justify-center">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-extrabold text-gray-900 font-display mb-2 tracking-tight">
          {title}
        </h3>

        {/* Item name chip if provided */}
        {itemName && (
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-bold rounded-full max-w-full truncate mb-3 shadow-xs">
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
            className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 font-bold text-sm transition-all disabled:opacity-50 active:scale-95"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-bold text-sm shadow-md shadow-rose-500/25 hover:shadow-lg hover:shadow-rose-500/35 transition-all flex items-center justify-center gap-2 disabled:opacity-60 active:scale-95"
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
