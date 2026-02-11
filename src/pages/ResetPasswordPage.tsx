import { useState, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

import { authApi } from "../api/authApi";
import { useToast } from "../context/ToastContext";

import hero from "../assets/images/auth-hero.jpg";
import logo from "../assets/images/logo-alpha.png";

import "../css/ResetPasswordPage.css";

type PasswordChecks = {
  minLength: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
};

function getPasswordChecks(password: string): PasswordChecks {
  return {
    minLength: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
}

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [busy, setBusy] = useState(false);

  const checks = useMemo(() => getPasswordChecks(newPassword), [newPassword]);

  const allPasswordOk = useMemo(() => {
    return (
      checks.minLength &&
      checks.uppercase &&
      checks.lowercase &&
      checks.number &&
      checks.special
    );
  }, [checks]);

  const canSubmit = useMemo(() => {
    return (
      !busy &&
      token.length > 0 &&
      allPasswordOk &&
      confirmPassword.length > 0 &&
      confirmPassword === newPassword
    );
  }, [busy, token, newPassword, confirmPassword, allPasswordOk]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!token) {
      showToast("error", "Token de recuperação não encontrado.");
      return;
    }

    if (!canSubmit) {
      if (confirmPassword !== newPassword) {
        showToast("error", "As senhas não conferem.");
      } else if (!allPasswordOk) {
        showToast("error", "Os requisitos de senha não foram atendidos.");
      }
      return;
    }

    setBusy(true);
    try {
      await authApi.resetPassword({ token, newPassword });
      showToast(
        "success",
        "Senha redefinida com sucesso! Faça login com sua nova senha.",
      );
      setTimeout(() => {
        navigate("/auth", { replace: true });
      }, 2000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao redefinir senha.";
      showToast("error", errorMessage);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="reset-password-page">
      <div className="reset-top">
        <div className="reset-brand">
          <img className="reset-logo" src={logo} alt="Alpha Steel" />
        </div>

        <Link className="reset-home-btn" to="/">
          <span className="reset-home-text">Início</span>
        </Link>
      </div>

      <img className="reset-hero" src={hero} alt="" aria-hidden="true" />

      <div className="reset-haze" aria-hidden="true" />
      <div className="reset-softmask" aria-hidden="true" />
      <div className="reset-vignette" aria-hidden="true" />

      <div className="reset-center">
        <div className="reset-card-wrap">
          <div className="reset-card">
            <div className="reset-card-header">
              <h2 className="reset-title">Redefinir Senha</h2>
              <p className="reset-subtitle">Digite sua nova senha abaixo</p>
            </div>

            <form className="reset-form" onSubmit={handleSubmit}>
              <div className="reset-field">
                <label className="reset-label" htmlFor="new-password">
                  Nova Senha
                </label>
                <div className="reset-input-with-icon">
                  <input
                    id="new-password"
                    className="reset-input"
                    placeholder="Digite sua nova senha"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(ev) => setNewPassword(ev.target.value)}
                    autoComplete="new-password"
                    disabled={busy}
                  />
                  <button
                    type="button"
                    className="reset-icon-btn"
                    onClick={() => setShowNewPassword((v) => !v)}
                    aria-label={
                      showNewPassword ? "Ocultar senha" : "Mostrar senha"
                    }
                    disabled={busy}
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="reset-field">
                <label className="reset-label" htmlFor="confirm-password">
                  Confirmar Nova Senha
                </label>
                <div className="reset-input-with-icon">
                  <input
                    id="confirm-password"
                    className="reset-input"
                    placeholder="Digite sua senha novamente"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(ev) => setConfirmPassword(ev.target.value)}
                    autoComplete="new-password"
                    disabled={busy}
                  />
                  <button
                    type="button"
                    className="reset-icon-btn"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    aria-label={
                      showConfirmPassword ? "Ocultar senha" : "Mostrar senha"
                    }
                    disabled={busy}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {newPassword.length > 0 && (
                <div className="reset-req-box">
                  <div className="reset-req-title">Requisitos de senha:</div>
                  <ul className="reset-req-list">
                    <li className={checks.minLength ? "ok" : "fail"}>
                      <span className="req-icon" aria-hidden="true" />
                      Min. 8 caracteres
                    </li>
                    <li className={checks.uppercase ? "ok" : "fail"}>
                      <span className="req-icon" aria-hidden="true" />
                      Uma letra maiúscula
                    </li>
                    <li className={checks.lowercase ? "ok" : "fail"}>
                      <span className="req-icon" aria-hidden="true" />
                      Uma letra minúscula
                    </li>
                    <li className={checks.number ? "ok" : "fail"}>
                      <span className="req-icon" aria-hidden="true" />
                      Um número
                    </li>
                    <li className={checks.special ? "ok" : "fail"}>
                      <span className="req-icon" aria-hidden="true" />
                      Um caractere especial
                    </li>
                  </ul>
                </div>
              )}

              <button
                className="reset-submit"
                type="submit"
                disabled={!canSubmit}
              >
                {busy ? "Aguarde..." : "Redefinir Senha"}
              </button>

              <div className="reset-footer">
                <Link className="reset-link" to="/auth">
                  Voltar para o login
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
