import { useEffect, useMemo, useRef, useState } from "react";
import { RotateCw } from "lucide-react";

import { productionApi } from "../api/productionApi";
import type { ProductionSuggestion } from "../types/models";

import "../css/ProductionPage.css";

/** Renders the production suggestions page. */
export function ProductionPage() {
  const [items, setItems] = useState<ProductionSuggestion[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const didInit = useRef(false);

  const money = useMemo(() => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    });
  }, []);

  function toNumber(value: unknown, fallback = 0): number {
    if (typeof value === "number" && Number.isFinite(value)) return value;

    if (typeof value === "string") {
      const normalized = value.replace(",", ".").trim();
      const parsed = Number(normalized);
      if (Number.isFinite(parsed)) return parsed;
    }

    return fallback;
  }

  function normalizeSuggestion(raw: unknown): ProductionSuggestion | null {
    if (!raw || typeof raw !== "object") return null;

    const r = raw as Partial<Record<keyof ProductionSuggestion, unknown>>;

    const productId = String(r.productId ?? "").trim();
    const productCode = String(r.productCode ?? "").trim();
    const productName = String(r.productName ?? "").trim();

    if (!productId) return null;

    const quantity = Math.max(0, Math.floor(toNumber(r.quantity, 0)));
    const unitValue = toNumber(r.unitValue, 0);

    const fallbackTotal = quantity * unitValue;
    const totalValue = toNumber(r.totalValue, fallbackTotal);

    return {
      productId,
      productCode,
      productName,
      quantity,
      unitValue,
      totalValue,
    };
  }

  async function load() {
    setLoading(true);
    setError(null);

    try {
      const res = await productionApi.suggest();

      const rawSuggestions = Array.isArray(res?.suggestions)
        ? res.suggestions
        : [];

      const normalized = rawSuggestions
        .map((s) => normalizeSuggestion(s))
        .filter((s): s is ProductionSuggestion => s !== null);

      const totalValue = toNumber(res?.totalValue, 0);

      setItems(normalized);
      setTotal(totalValue);
    } catch {
      setError("Não foi possível carregar as sugestões de produção.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    void load();
  }, []);

  return (
    <section className="page production-page">
      <div className="page-head">
        <h1>Sugestões de produção</h1>

        <button
          className="icon-btn"
          onClick={() => void load()}
          type="button"
          aria-label="Atualizar"
          title="Atualizar"
          data-tip="Atualizar"
        >
          <RotateCw size={18} />
        </button>
      </div>

      {error ? <div className="alert">{error}</div> : null}

      {loading ? (
        <div className="card">
          <p>Carregando...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="card">
          <p>Nenhuma produção pode ser sugerida com o estoque atual.</p>
        </div>
      ) : (
        <>
          <div className="production-summary-card">
            <div className="summary-label">Valor total estimado</div>
            <div className="summary-value">{money.format(total)}</div>
            <div className="summary-count">
              {items.length} produto{items.length !== 1 ? "s" : ""} sugerido
              {items.length !== 1 ? "s" : ""}
            </div>
          </div>

          <div className="production-grid">
            {items.map((s) => (
              <div className="production-card" key={s.productId}>
                <div className="production-card-header">
                  <div className="production-code">{s.productCode}</div>
                  <div className="production-name">{s.productName}</div>
                </div>

                <div className="production-card-body">
                  <div className="production-metric">
                    <div className="metric-label">Quantidade</div>
                    <div className="metric-value">{s.quantity}</div>
                  </div>

                  <div className="production-metric">
                    <div className="metric-label">Valor unitário</div>
                    <div className="metric-value">
                      {money.format(s.unitValue)}
                    </div>
                  </div>

                  <div className="production-metric highlight">
                    <div className="metric-label">Total</div>
                    <div className="metric-value">
                      {money.format(s.totalValue)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="production-note">
            <p>
              <strong>Observação:</strong> Valores exibidos em{" "}
              <strong>{money.resolvedOptions().currency}</strong>. Quantidades
              são calculadas com base no <strong>BOM</strong> de cada produto e
              no estoque atual.
            </p>
          </div>
        </>
      )}
    </section>
  );
}
