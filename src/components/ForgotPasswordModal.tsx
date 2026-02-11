import { useState } from "react";
import { X } from "lucide-react";
import { authApi } from "../api/authApi";
import { useToast } from "../context/ToastContext";
import "../css/ForgotPasswordModal.css";

type ForgotPasswordModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function ForgotPasswordModal({
  isOpen,
  onClose,
}: ForgotPasswordModalProps) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const { showToast } = useToast();

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email.trim()) {
      showToast("error", "Por favor, digite seu email.");
      return;
    }

    setBusy(true);
    try {
      await authApi.forgotPassword({ email: email.trim().toLowerCase() });
      showToast(
        "info",
        "Caso tenha um usuário com esse email, será enviado um link de recuperação.",
      );
      setEmail("");
      onClose();
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erro ao solicitar recuperação de senha.";
      showToast("error", errorMessage);
    } finally {
      setBusy(false);
    }
  }

  function handleClose() {
    if (!busy) {
      setEmail("");
      onClose();
    }
  }

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }

  return (
    <div className="forgot-password-overlay" onClick={handleOverlayClick}>
      <div className="forgot-password-modal">
        <button
          className="forgot-password-close"
          onClick={handleClose}
          aria-label="Fechar"
          type="button"
          disabled={busy}
        >
          <X size={24} />
        </button>

        <div className="forgot-password-header">
          <h2 className="forgot-password-title">Esqueceu a senha?</h2>
          <p className="forgot-password-subtitle">
            Digite seu email para receber o link de recuperação
          </p>
        </div>

        <form className="forgot-password-form" onSubmit={handleSubmit}>
          <label className="forgot-password-label" htmlFor="forgot-email">
            Email
          </label>
          <input
            id="forgot-email"
            className="forgot-password-input"
            type="email"
            placeholder="Digite seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={busy}
            autoFocus
          />

          <button
            className="forgot-password-submit"
            type="submit"
            disabled={busy || !email.trim()}
          >
            {busy ? "Enviando..." : "Enviar Link"}
          </button>
        </form>
      </div>
    </div>
  );
}
