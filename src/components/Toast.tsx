import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { type Toast as ToastType } from "../context/ToastContext";
import "../css/Toast.css";

type ToastProps = {
  toast: ToastType;
  onClose: (id: string) => void;
};

export function Toast({ toast, onClose }: ToastProps) {
  const icons = {
    success: <CheckCircle2 size={20} />,
    error: <XCircle size={20} />,
    info: <Info size={20} />,
  };

  return (
    <div className={`toast toast--${toast.type}`}>
      <div className="toast-icon">{icons[toast.type]}</div>
      <div className="toast-message">{toast.message}</div>
      <button
        className="toast-close"
        onClick={() => onClose(toast.id)}
        aria-label="Fechar"
        type="button"
      >
        <X size={18} />
      </button>
    </div>
  );
}
