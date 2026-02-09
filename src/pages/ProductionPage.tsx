import { useEffect, useState } from "react";
import { productionApi } from "../api/productionApi";
import type { ProductionSuggestion } from "../types/models";

export function ProductionPage() {
  const [items, setItems] = useState<ProductionSuggestion[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);

    try {
      const res = await productionApi.suggest();
      setItems(res.suggestions);
      setTotal(res.totalValue);
    } catch {
      setError("Unable to load production suggestions.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <section className="page">
      <div className="page-head">
        <h1>Production suggestions</h1>
        <button
          className="btn primary"
          onClick={() => void load()}
          type="button"
        >
          Refresh
        </button>
      </div>

      {error ? <div className="alert">{error}</div> : null}

      <div className="card">
        <div className="stats">
          <div>
            <div className="muted">Total estimated value</div>
            <div className="stat-value">{total.toFixed(2)}</div>
          </div>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : items.length === 0 ? (
          <p>No production can be suggested with current stock.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Unit value</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((s) => (
                  <tr key={s.productId}>
                    <td>
                      <strong>{s.productCode}</strong> — {s.productName}
                    </td>
                    <td>{s.quantity}</td>
                    <td>{s.unitValue.toFixed(2)}</td>
                    <td>{s.totalValue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
