import { useEffect } from "react";
import { Sparkles, X } from "lucide-react";

import "../css/OverlayCard.css";

export type OverlayVariant = "warning" | "success" | "error" | "info";

type OverlayCardProps = {
  open: boolean;
  title: string;
  message: React.ReactNode;
  variant?: OverlayVariant;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  autoCloseMs?: number;
  closeOnBackdrop?: boolean;
  onClose: () => void;
};

/** Renders a centered overlay card for confirmations, errors and success. */
export function OverlayCard({
  open,
  title,
  message,
  variant = "info",
  icon,
  actions,
  autoCloseMs,
  closeOnBackdrop = true,
  onClose,
}: OverlayCardProps) {
  useEffect(() => {
    if (!open) return;
    if (!autoCloseMs || autoCloseMs <= 0) return;

    const timerId = window.setTimeout(() => {
      onClose();
    }, autoCloseMs);

    return () => window.clearTimeout(timerId);
  }, [open, autoCloseMs, onClose]);

  if (!open) return null;

  const isSuccess = variant === "success";

  return (
    <div
      className="overlay-backdrop"
      role="dialog"
      aria-modal="true"
      onMouseDown={() => {
        if (closeOnBackdrop) onClose();
      }}
    >
      <div
        className={`overlay-card overlay-card--${variant}`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div
          className={`overlay-head ${isSuccess ? "overlay-head--center" : ""}`}
        >
          <div className="overlay-title-wrap">
            {isSuccess ? (
              <span className="overlay-title-ornament" aria-hidden="true">
                <Sparkles size={18} />
              </span>
            ) : null}

            <h2 className="overlay-title">{title}</h2>

            {isSuccess ? (
              <span className="overlay-title-ornament" aria-hidden="true">
                <Sparkles size={18} />
              </span>
            ) : null}
          </div>

          <button
            className="overlay-close"
            onClick={onClose}
            type="button"
            aria-label="Close"
            title="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overlay-body">
          {icon ? <div className="overlay-icon">{icon}</div> : null}
          <div className="overlay-content">{message}</div>
        </div>

        <div className="overlay-actions">
          {actions ?? (
            <button className="btn ghost" onClick={onClose} type="button">
              Fechar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
