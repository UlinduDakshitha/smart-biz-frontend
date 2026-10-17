import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  icon: Icon,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
}) {
  // Support ESC key and prevent body scroll when open
  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && closeOnEscape && onClose) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, closeOnEscape, onClose]);

  if (!open) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-5xl',
    full: 'max-w-6xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      {/* Blurred Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/65 backdrop-blur-md backdrop-fade-in transition-opacity"
        onClick={() => closeOnBackdrop && onClose?.()}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        className={`relative w-full ${sizes[size] || sizes.md} my-auto bg-white rounded-3xl shadow-[0_25px_60px_-15px_rgba(15,23,42,0.35)] border border-slate-100/90 overflow-hidden modal-pop-in z-10`}
        role="dialog"
        aria-modal="true"
      >
        {/* Top vibrant brand accent gradient line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-indigo-500 to-purple-600" />

        {/* Modal Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-gray-100 bg-gradient-to-b from-gray-50/60 to-white">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100/80 flex items-center justify-center shrink-0 shadow-sm">
                <Icon size={20} />
              </div>
            )}
            <div>
              <h2 className="font-display text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">
                {title}
              </h2>
              {subtitle && (
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {showCloseButton && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 -mr-1 -mt-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100/80 rounded-xl transition-all active:scale-95"
              aria-label="Close dialog"
            >
              <X size={19} />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 max-h-[calc(88vh-80px)] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
