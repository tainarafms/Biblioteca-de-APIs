import React, { useEffect, useRef, useId } from 'react';
import { X } from 'lucide-react';

export interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  titleId?: string;
  variant?: 'modal' | 'drawer';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full';
  children: React.ReactNode;
  hideCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  className?: string;
}

const maxWidthMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  full: 'max-w-full',
};

export const Modal: React.FC<BaseModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  titleId: customTitleId,
  variant = 'modal',
  maxWidth = '2xl',
  children,
  hideCloseButton = false,
  closeOnBackdropClick = true,
  className = '',
}) => {
  const generatedTitleId = useId();
  const effectiveTitleId = customTitleId || (title ? generatedTitleId : undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerElementRef = useRef<HTMLElement | null>(null);

  // Capture trigger element and manage focus trap
  useEffect(() => {
    if (!isOpen) return;

    triggerElementRef.current = document.activeElement as HTMLElement;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus the first focusable element inside the modal or the container itself
    const timer = setTimeout(() => {
      if (containerRef.current) {
        const focusables = containerRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length > 0) {
          focusables[0].focus();
        } else {
          containerRef.current.focus();
        }
      }
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }

      if (e.key === 'Tab' && containerRef.current) {
        const focusables = Array.from(
          containerRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => el.offsetParent !== null);

        if (focusables.length === 0) {
          e.preventDefault();
          return;
        }

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      // Restore focus to trigger element
      if (triggerElementRef.current && typeof triggerElementRef.current.focus === 'function') {
        triggerElementRef.current.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  if (variant === 'drawer') {
    return (
      <div 
        className="fixed inset-0 z-50 flex justify-end"
        role="presentation"
      >
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
          aria-hidden="true"
          onClick={closeOnBackdropClick ? onClose : undefined}
        />

        {/* Drawer Panel */}
        <div
          ref={containerRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={effectiveTitleId}
          tabIndex={-1}
          className={`relative z-10 w-full ${maxWidthMap[maxWidth]} bg-surface text-main border-l border-border-default shadow-2xl flex flex-col h-full overflow-hidden transition-transform duration-200 focus:outline-none ${className}`}
        >
          {(title || !hideCloseButton) && (
            <div className="flex items-start justify-between p-5 border-b border-border-subtle gap-4 shrink-0">
              <div className="min-w-0 flex-1">
                {title && (
                  <h2 id={effectiveTitleId} className="text-lg font-bold text-main tracking-tight">
                    {title}
                  </h2>
                )}
                {description && (
                  <p className="text-sm text-text-muted mt-1 leading-relaxed">
                    {description}
                  </p>
                )}
              </div>
              {!hideCloseButton && (
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Fechar painel lateral"
                  className="min-w-[44px] min-h-[44px] p-2.5 rounded-xl text-text-muted hover:text-text-main hover:bg-surface-hover transition-colors flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              )}
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    );
  }

  // Standard Centered Modal
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="presentation"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
        aria-hidden="true"
        onClick={closeOnBackdropClick ? onClose : undefined}
      />

      {/* Modal Card */}
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={effectiveTitleId}
        tabIndex={-1}
        className={`relative z-10 w-full ${maxWidthMap[maxWidth]} my-auto bg-surface text-main border border-border-default rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden focus:outline-none ${className}`}
      >
        {(title || !hideCloseButton) && (
          <div className="flex items-start justify-between p-5 sm:p-6 border-b border-border-subtle gap-4 shrink-0">
            <div className="min-w-0 flex-1">
              {title && (
                <h2 id={effectiveTitleId} className="text-xl font-bold text-main tracking-tight">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-sm text-text-muted mt-1 leading-relaxed">
                  {description}
                </p>
              )}
            </div>
            {!hideCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar janela"
                className="min-w-[44px] min-h-[44px] p-2.5 rounded-xl text-text-muted hover:text-text-main hover:bg-surface-hover transition-colors flex items-center justify-center shrink-0 cursor-pointer"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
};
