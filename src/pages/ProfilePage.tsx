import { useContext, useState } from "react";
import { AuthContext } from "../auth/AuthContext";
import { authApi } from "../api/authApi";

export function ProfilePage() {
  const { logout } = useContext(AuthContext);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setBusy(true);

    try {
      await authApi.changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setMessage("Password updated successfully.");
    } catch {
      setMessage("Unable to change password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="page">
      <div className="page-head">
        <h1>Profile</h1>
        <button className="btn danger" type="button" onClick={logout}>
          Sign out
        </button>
      </div>

      {message ? <div className="alert">{message}</div> : null}

      <div className="card">
        <h2>Change password</h2>
        <form className="form" onSubmit={handleChangePassword}>
          <div className="grid2">
            <div className="field">
              <label>Current password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <div className="field">
              <label>New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
          </div>

          <button
            className="btn primary"
            disabled={!currentPassword || !newPassword || busy}
            type="submit"
          >
            {busy ? "Please wait..." : "Update password"}
          </button>
        </form>
      </div>
    </section>
  );
}
