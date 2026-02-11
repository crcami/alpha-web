import { useEffect, useMemo, useRef, useState } from "react";
import { RotateCw } from "lucide-react";

import { productionApi } from "../api/productionApi";
import { productsApi } from "../api/productsApi";
import { rawMaterialsApi } from "../api/rawMaterialsApi";
import type {
  ProductionSuggestion,
  Product,
  RawMaterial,
} from "../types/models";

import "../css/ProductionPage.css";

export function ProductionPage() {
  const [items, setItems] = useState<ProductionSuggestion[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
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
      unitOfMeasure: String(r.unitOfMeasure ?? "un").toLowerCase(),
    };
  }

  async function load() {
    setLoading(true);
    setError(null);

    try {
      const [res, prodRes, matRes] = await Promise.all([
        productionApi.suggest(),
        productsApi.list(),
        rawMaterialsApi.list(),
      ]);

      const rawSuggestions = Array.isArray(res?.items) ? res.items : [];
      setProducts(prodRes);
      setMaterials(matRes);

      const normalized = rawSuggestions
        .map((s: unknown) => normalizeSuggestion(s))
        .filter(
          (s: ProductionSuggestion | null): s is ProductionSuggestion =>
            s !== null,
        );

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
          className="btn btn-refresh"
          onClick={() => void load()}
          type="button"
        >
          <RotateCw size={18} />
          Atualizar
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
                    <div className="metric-value">
                      {s.quantity} {s.unitOfMeasure?.toUpperCase() || "UN"}
                    </div>
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

                  {/* Materiais Necessários */}
                  {(() => {
                    const product = products.find((p) => p.id === s.productId);
                    if (!product || !product.bom || product.bom.length === 0)
                      return null;

                    return (
                      <div className="needed-materials">
                        <div className="materials-title">
                          Materiais Necessários
                        </div>
                        <div className="materials-list">
                          {product.bom.map((bomItem, idx) => {
                            const rawMat = materials.find(
                              (m) => m.id === bomItem.rawMaterialId,
                            );
                            const unit =
                              rawMat?.unitOfMeasure?.toUpperCase() || "UN";

                            return (
                              <div key={idx} className="material-item">
                                <span className="material-name">
                                  {bomItem.rawMaterialName ||
                                    rawMat?.name ||
                                    "Material"}
                                </span>
                                <span className="material-amount">
                                  {(
                                    bomItem.quantityRequired * s.quantity
                                  ).toLocaleString("pt-BR")}{" "}
                                  {unit}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>

          <div className="production-note">
            <p>
              <strong>Nota:</strong> Todos os valores são exibidos em{" "}
              <strong>Reais (R$)</strong>. As sugestões mostram o máximo que
              pode ser produzido agora, considerando a <strong>receita</strong>{" "}
              de cada produto e o <strong>estoque disponível</strong> de
              matérias-primas.
            </p>
          </div>
        </>
      )}
    </section>
  );
}
