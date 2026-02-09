import { useContext, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

import { authApi } from "../api/authApi";
import { AuthContext } from "../auth/AuthContext";

import hero from "../assets/images/auth-hero.jpg";
import logo from "../assets/images/logo-alpha.png";

import "../css/AuthPage.css";

type Mode = "login" | "register";

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

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Renders the authentication page. */
export function AuthPage() {
  const navigate = useNavigate();
  const auth = useContext(AuthContext);

  const [mode, setMode] = useState<Mode>("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const checks = useMemo(() => getPasswordChecks(password), [password]);

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
    if (busy) return false;

    if (mode === "login") {
      return normalizeEmail(email).length > 0 && password.length > 0;
    }

    return (
      name.trim().length > 0 &&
      normalizeEmail(email).length > 0 &&
      allPasswordOk &&
      confirm.length > 0 &&
      confirm === password
    );
  }, [busy, mode, name, email, password, confirm, allPasswordOk]);

  function switchMode(next: Mode) {
    setMessage(null);
    setBusy(false);

    setMode(next);

    setName("");
    setEmail("");
    setPassword("");
    setConfirm("");

    setShowPass(false);
    setShowConfirm(false);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (!canSubmit) {
      if (mode === "register") {
        if (confirm !== password) setMessage("As senhas não conferem.");
        else if (!allPasswordOk) {
          setMessage("Os requisitos de senha não foram atendidos.");
        }
      }
      return;
    }

    const safeEmail = normalizeEmail(email);
    const safeName = name.trim();

    setBusy(true);
    try {
      if (mode === "login") {
        const res = await authApi.login({ email: safeEmail, password });
        auth.login(res.accessToken);
        navigate("/app/products", { replace: true });
        return;
      }

      await authApi.register({ email: safeEmail, password, name: safeName });

      const res = await authApi.login({ email: safeEmail, password });
      auth.login(res.accessToken);

      navigate("/app/products", { replace: true });
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Erro inesperado. Tente novamente.";

      setMessage(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`auth-page ${mode === "register" ? "is-register" : ""}`}>
      <div className="auth-top">
        <div className="auth-brand">
          <img className="auth-logo" src={logo} alt="Alpha Steel" />
        </div>

        <Link className="auth-home-btn" to="/">
          <span className="auth-home-text">Início</span>
        </Link>
      </div>

      <img className="auth-hero" src={hero} alt="" aria-hidden="true" />

      <div className="auth-haze" aria-hidden="true" />
      <div className="auth-softmask" aria-hidden="true" />
      <div className="auth-vignette" aria-hidden="true" />

      <div className="auth-center">
        <div className="auth-card-wrap">
          <div className="auth-card">
            <div className="auth-card-header">
              <h2 className="auth-title">
                {mode === "login" ? "Entrar" : "Criar Conta"}
              </h2>
              <p className="auth-subtitle">
                {mode === "login"
                  ? "Bem-vindo de volta à Alpha Steel"
                  : "Junte-se à Alpha hoje"}
              </p>
            </div>

            <form className="auth-form" onSubmit={onSubmit}>
              {mode === "register" && (
                <div className="auth-field">
                  <label className="auth-label" htmlFor="name">
                    Nome
                  </label>
                  <input
                    id="name"
                    className="auth-input"
                    placeholder="Digite seu nome"
                    value={name}
                    onChange={(ev) => setName(ev.target.value)}
                    autoComplete="name"
                    disabled={busy}
                  />
                </div>
              )}

              <div className="auth-field">
                <label className="auth-label" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  className="auth-input"
                  placeholder="Digite seu email"
                  value={email}
                  onChange={(ev) => setEmail(ev.target.value)}
                  autoComplete="email"
                  disabled={busy}
                />
              </div>

              <div className="auth-field">
                <label className="auth-label" htmlFor="password">
                  Senha
                </label>
                <div className="auth-input-with-icon">
                  <input
                    id="password"
                    className="auth-input"
                    placeholder="Digite sua senha"
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(ev) => setPassword(ev.target.value)}
                    autoComplete={
                      mode === "login" ? "current-password" : "new-password"
                    }
                    disabled={busy}
                  />
                  <button
                    type="button"
                    className="auth-icon-btn"
                    onClick={() => setShowPass((v) => !v)}
                    aria-label={showPass ? "Hide password" : "Show password"}
                    disabled={busy}
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {mode === "register" && (
                <>
                  <div className="auth-field">
                    <label className="auth-label" htmlFor="confirm">
                      Confirmar Senha
                    </label>
                    <div className="auth-input-with-icon">
                      <input
                        id="confirm"
                        className="auth-input"
                        placeholder="Digite sua senha novamente"
                        type={showConfirm ? "text" : "password"}
                        value={confirm}
                        onChange={(ev) => setConfirm(ev.target.value)}
                        autoComplete="new-password"
                        disabled={busy}
                      />
                      <button
                        type="button"
                        className="auth-icon-btn"
                        onClick={() => setShowConfirm((v) => !v)}
                        aria-label={
                          showConfirm
                            ? "Hide confirm password"
                            : "Show password"
                        }
                        disabled={busy}
                      >
                        {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="auth-req-box">
                    <div className="auth-req-title">Requisitos de senha:</div>
                    <ul className="auth-req-list">
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
                </>
              )}

              {message && <div className="auth-message">{message}</div>}

              <button
                className="auth-submit"
                type="submit"
                disabled={!canSubmit}
              >
                {busy
                  ? "Aguarde..."
                  : mode === "login"
                    ? "Entrar"
                    : "Criar Conta"}
              </button>

              <div className="auth-footer">
                {mode === "login" ? (
                  <span>
                    Não tem uma conta?{" "}
                    <button
                      type="button"
                      className="auth-link auth-link--grad"
                      onClick={() => switchMode("register")}
                      disabled={busy}
                    >
                      Criar Conta
                    </button>
                  </span>
                ) : (
                  <span>
                    Já tem uma conta?{" "}
                    <button
                      type="button"
                      className="auth-link auth-link--grad"
                      onClick={() => switchMode("login")}
                      disabled={busy}
                    >
                      Entrar
                    </button>
                  </span>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
