import { useEffect, useMemo, useState } from "react";
import { NumericFormat } from "react-number-format";
import { AlertTriangle, Eye, Pencil, Trash2, X, Plus } from "lucide-react";

import { productsApi } from "../api/productsApi";
import { rawMaterialsApi } from "../api/rawMaterialsApi";
import type { Product, ProductBomItem, RawMaterial } from "../types/models";

import { OverlayCard } from "../components/OverlayCard";

import "../css/ProductsModal.css";
import "../css/ProductsPage.css";

type ModalMode = "create" | "edit" | "view";

type Draft = {
  id?: string;
  code: string;
  name: string;
  unitValue: number | null;
  bom: ProductBomItem[];
};

type OverlayState =
  | {
      kind: "confirm-delete";
      product: Product;
    }
  | {
      kind: "success" | "error";
      title: string;
      message: string;
    }
  | null;

type SortOption = "name-asc" | "name-desc" | "value-asc" | "value-desc";

/** Formats BRL-style money with 2 decimals. */
function formatMoney(value: number): string {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Normalizes IDs to string to avoid string/number mismatch. */
function toId(value: unknown): string {
  return String(value ?? "");
}

/** Coerces any input number into a valid integer quantity (>= 1). */
function toPositiveInt(value: unknown): number {
  const n =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : Number.NaN;

  if (!Number.isFinite(n)) return 1;

  const int = Math.trunc(n);
  return int < 1 ? 1 : int;
}

/** Renders the products page. */
export function ProductsPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState<SortOption>("name-asc");

  const [error, setError] = useState<string | null>(null);
  const [overlay, setOverlay] = useState<OverlayState>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");

  const [draft, setDraft] = useState<Draft>({
    code: "",
    name: "",
    unitValue: null,
    bom: [],
  });

  const [selectedMaterialId, setSelectedMaterialId] = useState<string>("");

  const isReadOnly = modalMode === "view";

  const materialOptions = useMemo(() => {
    return materials.map((m) => ({
      id: toId(m.id),
      label: `${m.code} - ${m.name}`,
    }));
  }, [materials]);

  const sortedItems = useMemo(() => {
    const sorted = [...items];

    switch (sortOption) {
      case "name-asc":
        sorted.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
      case "name-desc":
        sorted.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
        break;
      case "value-asc":
        sorted.sort((a, b) => (a.unitValue || 0) - (b.unitValue || 0));
        break;
      case "value-desc":
        sorted.sort((a, b) => (b.unitValue || 0) - (a.unitValue || 0));
        break;
    }

    return sorted;
  }, [items, sortOption]);

  async function load() {
    setLoading(true);
    setError(null);

    try {
      const [p, r] = await Promise.all([
        productsApi.list(),
        rawMaterialsApi.list(),
      ]);
      setItems(p);
      setMaterials(r);
    } catch {
      setError("Não foi possível carregar os produtos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function closeModal() {
    setModalOpen(false);
  }

  function openCreate() {
    setError(null);
    setModalMode("create");
    setDraft({ code: "", name: "", unitValue: null, bom: [] });
    setSelectedMaterialId("");
    setModalOpen(true);
  }

  function openEdit(p: Product) {
    setError(null);
    setModalMode("edit");
    setDraft({
      id: p.id,
      code: p.code ?? "",
      name: p.name ?? "",
      unitValue: Number.isFinite(p.unitValue) ? p.unitValue : null,
      bom: (p.bom ?? []).map((b) => ({
        ...b,
        rawMaterialId: toId(b.rawMaterialId),
        quantityNeeded: toPositiveInt(b.quantityNeeded),
      })),
    });
    setSelectedMaterialId("");
    setModalOpen(true);
  }

  function openView(p: Product) {
    setError(null);
    setModalMode("view");
    setDraft({
      id: p.id,
      code: p.code ?? "",
      name: p.name ?? "",
      unitValue: Number.isFinite(p.unitValue) ? p.unitValue : null,
      bom: (p.bom ?? []).map((b) => ({
        ...b,
        rawMaterialId: toId(b.rawMaterialId),
        quantityNeeded: toPositiveInt(b.quantityNeeded),
      })),
    });
    setSelectedMaterialId("");
    setModalOpen(true);
  }

  function addBomItem(rawMaterialId: string) {
    if (isReadOnly) return;

    const id = toId(rawMaterialId);
    if (!id) return;

    setDraft((d) => {
      if (d.bom.some((b) => toId(b.rawMaterialId) === id)) return d;

      return {
        ...d,
        bom: [...d.bom, { rawMaterialId: id, quantityNeeded: 1 }],
      };
    });

    setSelectedMaterialId("");
  }

  function updateBomQty(rawMaterialId: string, qty: number) {
    if (isReadOnly) return;

    const id = toId(rawMaterialId);
    const nextQty = toPositiveInt(qty);

    setDraft((d) => ({
      ...d,
      bom: d.bom.map((b) =>
        toId(b.rawMaterialId) === id ? { ...b, quantityNeeded: nextQty } : b,
      ),
    }));
  }

  function removeBomItem(rawMaterialId: string) {
    if (isReadOnly) return;

    const id = toId(rawMaterialId);

    setDraft((d) => ({
      ...d,
      bom: d.bom.filter((b) => toId(b.rawMaterialId) !== id),
    }));
  }

  async function save() {
    setError(null);

    const code = draft.code.trim();
    const name = draft.name.trim();

    if (!code) {
      setError("O código é obrigatório.");
      return;
    }

    if (!name) {
      setError("O nome é obrigatório.");
      return;
    }

    if (
      draft.unitValue === null ||
      !Number.isFinite(draft.unitValue) ||
      draft.unitValue <= 0
    ) {
      setError("O valor unitário deve ser maior que zero.");
      return;
    }

    if (draft.bom.length === 0) {
      setError("Adicione ao menos uma matéria-prima na receita do produto.");
      return;
    }

    const normalizedBom: ProductBomItem[] = draft.bom.map((b) => ({
      ...b,
      rawMaterialId: toId(b.rawMaterialId),
      quantityNeeded: toPositiveInt(b.quantityNeeded),
    }));

    const payload = {
      code,
      name,
      unitValue: draft.unitValue,
      bom: normalizedBom,
    };

    try {
      if (draft.id) {
        await productsApi.update(draft.id, payload);
      } else {
        await productsApi.create(payload);
      }

      closeModal();
      await load();

      setOverlay({
        kind: "success",
        title: "Sucesso!",
        message: "Produto salvo com sucesso.",
      });
    } catch {
      setOverlay({
        kind: "error",
        title: "Erro!",
        message: "Não foi possível salvar o produto.",
      });
    }
  }

  function askDelete(p: Product) {
    setError(null);
    setOverlay({ kind: "confirm-delete", product: p });
  }

  async function confirmDelete(p: Product) {
    try {
      await productsApi.remove(p.id);
      await load();
      setOverlay({
        kind: "success",
        title: "Excluído!",
        message: "Produto excluído com sucesso.",
      });
    } catch {
      setOverlay({
        kind: "error",
        title: "Erro!",
        message: "Não foi possível deletar o produto.",
      });
    }
  }

  const overlayOpen = overlay !== null;

  return (
    <section className="page products-page">
      <div className="page-head">
        <h1>Produtos</h1>
        <button
          className="btn primary btn-solid"
          onClick={openCreate}
          type="button"
        >
          <Plus size={18} />
          Novo produto
        </button>
      </div>

      <div className="filter-bar">
        <div className="filter-group">
          <label className="filter-label">Ordenar por:</label>
          <select
            className="filter-select"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOption)}
          >
            <option value="name-asc">Nome (A-Z)</option>
            <option value="name-desc">Nome (Z-A)</option>
            <option value="value-asc">Menor valor</option>
            <option value="value-desc">Maior valor</option>
          </select>
        </div>
      </div>

      {error ? <div className="alert">{error}</div> : null}

      <div className="card">
        {loading ? (
          <p>Carregando...</p>
        ) : sortedItems.length === 0 ? (
          <p>Nenhum produto encontrado.</p>
        ) : (
          <div className="table-wrap">
            <table className="table table-brand">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nome</th>
                  <th>Valor unitário</th>
                  <th className="right">Ações</th>
                </tr>
              </thead>

              <tbody>
                {sortedItems.map((p) => (
                  <tr key={p.id}>
                    <td>{p.code}</td>
                    <td>{p.name}</td>
                    <td>
                      {Number.isFinite(p.unitValue)
                        ? formatMoney(p.unitValue)
                        : "0,00"}
                    </td>

                    <td className="right">
                      <div className="row-actions">
                        <button
                          className="icon-btn"
                          onClick={() => openView(p)}
                          type="button"
                          aria-label="Visualizar"
                          title="Visualizar"
                          data-tip="Visualizar"
                        >
                          <Eye size={18} />
                        </button>

                        <button
                          className="icon-btn"
                          onClick={() => openEdit(p)}
                          type="button"
                          aria-label="Editar"
                          title="Editar"
                          data-tip="Editar"
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          className="icon-btn danger"
                          onClick={() => askDelete(p)}
                          type="button"
                          aria-label="Excluir"
                          title="Excluir"
                          data-tip="Excluir"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal">
            <div className="modal-head">
              <h2>
                {modalMode === "create"
                  ? "Novo produto"
                  : modalMode === "edit"
                    ? "Editar produto"
                    : "Visualizar produto"}
              </h2>

              <button
                className="modal-close"
                onClick={closeModal}
                type="button"
                aria-label="Fechar modal"
                title="Fechar"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid2">
              <div className="field">
                <label>Código</label>
                <input
                  value={draft.code}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, code: e.target.value }))
                  }
                  placeholder="Ex: PROD-001"
                  autoComplete="off"
                  disabled={isReadOnly}
                  readOnly={isReadOnly}
                />
              </div>

              <div className="field">
                <label>Nome</label>
                <input
                  value={draft.name}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, name: e.target.value }))
                  }
                  placeholder="Nome do produto"
                  disabled={isReadOnly}
                  readOnly={isReadOnly}
                />
              </div>

              <div className="field">
                <label>Valor unitário</label>

                <NumericFormat
                  value={draft.unitValue ?? undefined}
                  onValueChange={(values) =>
                    setDraft((d) => ({
                      ...d,
                      unitValue: values.floatValue ?? null,
                    }))
                  }
                  thousandSeparator="."
                  decimalSeparator=","
                  decimalScale={2}
                  fixedDecimalScale={false}
                  allowNegative={false}
                  placeholder="0,00"
                  inputMode="decimal"
                  disabled={isReadOnly}
                  className="modal-input"
                />
              </div>
            </div>

            <div className="divider" />

            <h3>Receita do produto (Lista de materiais)</h3>
            <p className="muted">
              Selecione matérias-primas e informe a quantidade necessária para
              produzir <strong>1 unidade</strong> do produto.
            </p>

            <div className="grid2">
              <div className="field">
                <label>Adicionar matéria-prima</label>
                <select
                  value={selectedMaterialId}
                  onChange={(e) => {
                    const id = toId(e.target.value);
                    setSelectedMaterialId(id);
                    addBomItem(id);
                  }}
                  disabled={isReadOnly}
                >
                  <option value="" disabled>
                    Selecione...
                  </option>
                  {materialOptions.map((m) => (
                    <option value={m.id} key={m.id}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {draft.bom.length === 0 ? (
              <p className="muted">Nenhuma matéria-prima vinculada ainda.</p>
            ) : (
              <div className="card subtle bom-card">
                <div className="bom-header" aria-hidden="true">
                  <div className="bom-col bom-col--material">Matéria-prima</div>
                  <div className="bom-col bom-col--qty">Qtd. p/ 1 un.</div>
                  <div className="bom-col bom-col--actions" />
                </div>

                {draft.bom.map((b) => {
                  const rm = materials.find(
                    (x) => toId(x.id) === toId(b.rawMaterialId),
                  );

                  return (
                    <div className="bom-row" key={toId(b.rawMaterialId)}>
                      <div className="bom-col bom-col--material">
                        <strong>
                          {rm
                            ? `${rm.code} - ${rm.name}`
                            : `ID: ${toId(b.rawMaterialId)}`}
                        </strong>
                      </div>

                      <div className="bom-col bom-col--qty">
                        <input
                          type="number"
                          min={1}
                          step={1}
                          inputMode="numeric"
                          value={toPositiveInt(b.quantityNeeded)}
                          onChange={(e) =>
                            updateBomQty(
                              b.rawMaterialId,
                              Number(e.target.value),
                            )
                          }
                          disabled={isReadOnly}
                          readOnly={isReadOnly}
                          aria-label="Quantidade por unidade"
                        />
                      </div>

                      <div className="bom-col bom-col--actions">
                        {isReadOnly ? null : (
                          <button
                            className="btn danger"
                            onClick={() => removeBomItem(b.rawMaterialId)}
                            type="button"
                          >
                            Remover
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="modal-actions">
              <button className="btn ghost" onClick={closeModal} type="button">
                {isReadOnly ? "Fechar" : "Cancelar"}
              </button>

              {isReadOnly ? null : (
                <button
                  className="btn primary btn-solid"
                  onClick={save}
                  type="button"
                >
                  Salvar
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}

      <OverlayCard
        open={overlayOpen}
        title={
          overlay?.kind === "confirm-delete"
            ? "Atenção!"
            : (overlay?.title ?? "Aviso")
        }
        variant={
          overlay?.kind === "confirm-delete"
            ? "warning"
            : overlay?.kind === "success"
              ? "success"
              : overlay?.kind === "error"
                ? "error"
                : "info"
        }
        icon={
          overlay?.kind === "confirm-delete" ? (
            <AlertTriangle size={22} />
          ) : null
        }
        autoCloseMs={6000}
        closeOnBackdrop={overlay?.kind !== "confirm-delete"}
        onClose={() => setOverlay(null)}
        message={
          overlay?.kind === "confirm-delete" ? (
            <div>
              <p style={{ margin: "0 0 8px 0" }}>
                Caso exclua o produto, não tem como reverter. Deseja realizar
                essa ação?
              </p>

              <p style={{ margin: 0, color: "rgba(0,0,0,0.75)" }}>
                <strong>Produto:</strong> {overlay.product.code} —{" "}
                {overlay.product.name}
              </p>
            </div>
          ) : (
            <p style={{ margin: 0 }}>{overlay?.message ?? ""}</p>
          )
        }
        actions={
          overlay?.kind === "confirm-delete" ? (
            <>
              <button
                className="btn ghost"
                onClick={() => setOverlay(null)}
                type="button"
              >
                Não
              </button>
              <button
                className="btn danger"
                onClick={() => {
                  const target = overlay.product;
                  setOverlay(null);
                  void confirmDelete(target);
                }}
                type="button"
              >
                Sim, excluir
              </button>
            </>
          ) : undefined
        }
      />
    </section>
  );
}
