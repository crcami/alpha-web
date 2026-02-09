import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="page center">
      <div className="card">
        <h1>404</h1>
        <p>Page not found.</p>
        <Link className="btn primary" to="/">
          Back home
        </Link>
      </div>
    </div>
  );
}
