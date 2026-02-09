import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { authApi } from "../api/authApi";

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = useMemo(() => params.get("token") ?? "", [params]);

  const [newPassword, setNewPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (!token) {
      setMessage("Missing token.");
      return;
    }

    setBusy(true);
    try {
      await authApi.resetPassword({ token, newPassword });
      setMessage("Password updated. You can sign in now.");
    } catch {
      setMessage("Unable to reset password. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page center">
      <div className="card">
        <h1>Reset password</h1>
        <p>Set a new password for your account.</p>

        {message ? <div className="alert">{message}</div> : null}

        <form className="form" onSubmit={handleSubmit}>
          <div className="field">
            <label>New password</label>
            <input
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>

          <button
            className="btn primary full"
            disabled={!newPassword || busy}
            type="submit"
          >
            {busy ? "Please wait..." : "Update password"}
          </button>

          <Link className="btn ghost full" to="/auth">
            Back to sign in
          </Link>
        </form>
      </div>
    </div>
  );
}
