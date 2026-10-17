import { useEffect } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export default function ConfirmActionModal({
  open,
  onClose,
  onConfirm,
  type = 'success', // 'success' | 'danger' | 'warning' | 'info'
  title = 'Confirm Action',
  itemName,
  description,
  details = [],
  confirmText,
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

  // Configuration map for different modal themes
  const themeConfig = {
    success: {
      accentGradient: 'from-emerald-500 via-teal-500 to-indigo-500',
      iconBg: 'from-emerald-50 to-teal-100/90',
      iconBorder: 'border-emerald-200/80',
      iconColor: 'text-emerald-600',
      badgeBg: 'bg-emerald-50 border-emerald-100 text-emerald-700',
      glow: 'bg-emerald-500/10',
      confirmButton:
        'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-500/25',
      defaultConfirmText: 'Approve & Confirm',
      Icon: CheckCircle2,
    },
    danger: {
      accentGradient: 'from-rose-500 via-red-500 to-amber-500',
      iconBg: 'from-rose-50 to-red-100/90',
      iconBorder: 'border-rose-200/80',
      iconColor: 'text-rose-600',
      badgeBg: 'bg-rose-50 border-rose-100 text-rose-700',
      glow: 'bg-rose-500/10',
      confirmButton:
        'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white shadow-rose-500/25',
      defaultConfirmText: 'Reject & Confirm',
      Icon: XCircle,
    },
    warning: {
      accentGradient: 'from-amber-500 via-orange-500 to-yellow-500',
      iconBg: 'from-amber-50 to-orange-100/90',
      iconBorder: 'border-amber-200/80',
      iconColor: 'text-amber-600',
      badgeBg: 'bg-amber-50 border-amber-100 text-amber-700',
      glow: 'bg-amber-500/10',
      confirmButton:
        'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-amber-500/25',
      defaultConfirmText: 'Confirm',
      Icon: AlertTriangle,
    },
    info: {
      accentGradient: 'from-indigo-500 via-blue-500 to-sky-500',
      iconBg: 'from-indigo-50 to-blue-100/90',
      iconBorder: 'border-indigo-200/80',
      iconColor: 'text-indigo-600',
      badgeBg: 'bg-indigo-50 border-indigo-100 text-indigo-700',
      glow: 'bg-indigo-500/10',
      confirmButton:
        'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-indigo-500/25',
      defaultConfirmText: 'Continue',
      Icon: Info,
    },
  };

  const theme = themeConfig[type] || themeConfig.success;
  const ActiveIcon = theme.Icon;
  const resolvedConfirmText = confirmText || theme.defaultConfirmText;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Blurred Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/65 backdrop-blur-md backdrop-fade-in transition-opacity"
        onClick={() => !loading && onClose()}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        className="relative w-full max-w-md my-auto overflow-hidden bg-white border border-slate-100 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.25)] rounded-3xl p-7 text-center modal-pop-in z-10"
        role="alertdialog"
        aria-modal="true"
      >
        {/* Top Accent Gradient Line */}
        <div
          className={`absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r ${theme.accentGradient}`}
        />

        {/* Ambient Glow */}
        <div
          className={`absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 ${theme.glow} rounded-full blur-2xl pointer-events-none`}
        />

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

        {/* Action Icon */}
        <div
          className={`relative mx-auto mt-2 mb-5 w-16 h-16 rounded-2xl bg-gradient-to-br ${theme.iconBg} border ${theme.iconBorder} flex items-center justify-center shadow-inner`}
        >
          <ActiveIcon size={30} className={theme.iconColor} />
        </div>

        {/* Title */}
        <h3 className="text-xl font-extrabold text-gray-900 font-display mb-2 tracking-tight">
          {title}
        </h3>

        {/* Item Name Badge */}
        {itemName && (
          <div
            className={`inline-flex items-center gap-1.5 px-3.5 py-1 border text-xs font-bold rounded-full max-w-full truncate mb-3 ${theme.badgeBg}`}
          >
            <span className="truncate">{itemName}</span>
          </div>
        )}

        {/* Description */}
        {description && (
          <p className="text-sm text-gray-500 leading-relaxed mb-5 max-w-sm mx-auto">
            {description}
          </p>
        )}

        {/* Details Key-Value Pills */}
        {details.length > 0 && (
          <div className="bg-gray-50 rounded-2xl p-3.5 mb-6 border border-gray-100 text-left space-y-2">
            {details.map((detail, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs"
              >
                <span className="text-gray-400 font-semibold">
                  {detail.label}:
                </span>
                <span className="text-gray-800 font-bold truncate max-w-[200px]">
                  {detail.value}
                </span>
              </div>
            ))}
          </div>
        )}

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
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 active:scale-95 ${theme.confirmButton}`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Processing…</span>
              </>
            ) : (
              <span>{resolvedConfirmText}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
