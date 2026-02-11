import { useContext, useEffect, useMemo, useState } from "react";
import { User, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { AuthContext } from "../auth/AuthContext";
import { authApi } from "../api/authApi";
import { useToast } from "../context/ToastContext";
import "../css/ProfilePage.css";
import "../css/ProfilePageDark.css";

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

export function ProfilePage() {
  const { logout, userEmail } = useContext(AuthContext);
  const { showToast } = useToast();

  // User info state
  const [name, setName] = useState("");
  const [email, setEmail] = useState(userEmail || "");
  const [isEditingName, setIsEditingName] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
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

  const canChangePassword = useMemo(() => {
    return (
      !busy &&
      currentPassword.length > 0 &&
      allPasswordOk &&
      confirmPassword.length > 0 &&
      confirmPassword === newPassword
    );
  }, [busy, currentPassword, newPassword, confirmPassword, allPasswordOk]);

  useEffect(() => {
    if (userEmail) {
      setEmail(userEmail);
    }
  }, [userEmail]);

  useEffect(() => {
    async function fetchUserData() {
      try {
        const userData = await authApi.getMe();
        setName(userData.name || "");
        setEmail(userData.email || "");
      } catch (err) {
        console.error("Erro ao buscar dados do usuário:", err);
        showToast("error", "Não foi possível carregar os dados do usuário.");
      }
    }

    fetchUserData();
  }, [showToast]);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();

    if (!canChangePassword) {
      if (confirmPassword !== newPassword) {
        showToast("error", "As senhas não conferem.");
      } else if (!allPasswordOk) {
        showToast("error", "Os requisitos de senha não foram atendidos.");
      }
      return;
    }

    setBusy(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showToast("success", "Senha alterada com sucesso!");
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Não foi possível alterar a senha.";
      showToast("error", errorMessage);
    } finally {
      setBusy(false);
    }
  }

  function handleSaveName() {
    setIsEditingName(false);
    showToast("success", "Nome atualizado com sucesso!");
  }

  return (
    <section className="page profile-page">
      <div className="profile-header">
        <div className="profile-header-content">
          <div className="profile-header-icon">
            <User size={32} />
          </div>
          <div className="profile-header-text">
            <h1>Perfil</h1>
            <p className="profile-subtitle">
              Gerencie suas informações pessoais
            </p>
          </div>
        </div>
        <button className="btn-logout" type="button" onClick={logout}>
          <Lock size={18} />
          Sair
        </button>
      </div>

      <div className="profile-card">
        <div className="profile-card-header">
          <h2>Informações Pessoais</h2>
        </div>

        <div className="profile-info-grid">
          <div className="profile-info-item">
            <div className="profile-info-label">
              <User size={16} />
              <span>Nome</span>
            </div>
            {isEditingName ? (
              <div className="profile-info-edit">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Digite seu nome"
                  className="profile-input"
                  autoFocus
                />
                <div className="profile-edit-actions">
                  <button
                    className="btn-save"
                    onClick={handleSaveName}
                    type="button"
                  >
                    Salvar
                  </button>
                  <button
                    className="btn-cancel"
                    onClick={() => setIsEditingName(false)}
                    type="button"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="profile-info-value">
                <span>{name || "Não informado"}</span>
                <button
                  className="btn-edit"
                  onClick={() => setIsEditingName(true)}
                  type="button"
                >
                  Editar
                </button>
              </div>
            )}
          </div>

          <div className="profile-info-item">
            <div className="profile-info-label">
              <Mail size={16} />
              <span>Email</span>
            </div>
            <div className="profile-info-value">
              <span>{email || "Não informado"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Card */}
      <div className="profile-card">
        <div className="profile-card-header">
          <Lock size={20} />
          <h2>Alterar Senha</h2>
        </div>

        <form className="profile-form" onSubmit={handleChangePassword}>
          <div className="profile-field">
            <label className="profile-label" htmlFor="current-password">
              Senha Atual
            </label>
            <div className="profile-input-with-icon">
              <input
                id="current-password"
                className="profile-input"
                placeholder="Digite sua senha atual"
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
                disabled={busy}
              />
              <button
                type="button"
                className="profile-icon-btn"
                onClick={() => setShowCurrentPassword((v) => !v)}
                aria-label={
                  showCurrentPassword ? "Ocultar senha" : "Mostrar senha"
                }
              >
                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="profile-field">
            <label className="profile-label" htmlFor="new-password">
              Nova Senha
            </label>
            <div className="profile-input-with-icon">
              <input
                id="new-password"
                className="profile-input"
                placeholder="Digite sua nova senha"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                disabled={busy}
              />
              <button
                type="button"
                className="profile-icon-btn"
                onClick={() => setShowNewPassword((v) => !v)}
                aria-label={showNewPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="profile-field">
            <label className="profile-label" htmlFor="confirm-password">
              Confirmar Nova Senha
            </label>
            <div className="profile-input-with-icon">
              <input
                id="confirm-password"
                className="profile-input"
                placeholder="Digite sua nova senha novamente"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                disabled={busy}
              />
              <button
                type="button"
                className="profile-icon-btn"
                onClick={() => setShowConfirmPassword((v) => !v)}
                aria-label={
                  showConfirmPassword ? "Ocultar senha" : "Mostrar senha"
                }
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {newPassword.length > 0 && (
            <div className="profile-requirements">
              <div className="profile-requirements-title">
                Requisitos de senha:
              </div>
              <ul className="profile-requirements-list">
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
            className="profile-submit"
            type="submit"
            disabled={!canChangePassword}
          >
            {busy ? "Aguarde..." : "Alterar Senha"}
          </button>
        </form>
      </div>
    </section>
  );
}
