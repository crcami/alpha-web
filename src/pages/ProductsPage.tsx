import { useEffect, useMemo, useState } from "react";
import { NumericFormat } from "react-number-format";
import { AlertTriangle, Eye, Pencil, Trash2, X } from "lucide-react";

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

function formatMoney(value: number): string {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Renders the products page. */
export function ProductsPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [loading, setLoading] = useState(true);

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

  const isReadOnly = modalMode === "view";

  const materialOptions = useMemo(
    () => materials.map((m) => ({ id: m.id, label: `${m.code} - ${m.name}` })),
    [materials],
  );

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
      bom: p.bom ?? [],
    });
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
      bom: p.bom ?? [],
    });
    setModalOpen(true);
  }

  function addBomItem(rawMaterialId: string) {
    if (isReadOnly) return;
    if (!rawMaterialId) return;
    if (draft.bom.some((b) => b.rawMaterialId === rawMaterialId)) return;

    setDraft((d) => ({
      ...d,
      bom: [...d.bom, { rawMaterialId, quantityNeeded: 1 }],
    }));
  }

  function updateBomQty(rawMaterialId: string, qty: number) {
    if (isReadOnly) return;

    setDraft((d) => ({
      ...d,
      bom: d.bom.map((b) =>
        b.rawMaterialId === rawMaterialId ? { ...b, quantityNeeded: qty } : b,
      ),
    }));
  }

  function removeBomItem(rawMaterialId: string) {
    if (isReadOnly) return;

    setDraft((d) => ({
      ...d,
      bom: d.bom.filter((b) => b.rawMaterialId !== rawMaterialId),
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
      !draft.unitValue ||
      !Number.isFinite(draft.unitValue) ||
      draft.unitValue <= 0
    ) {
      setError("O valor unitário deve ser maior que zero.");
      return;
    }

    const payload = {
      code,
      name,
      unitValue: draft.unitValue,
      bom: draft.bom,
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
          Novo produto
        </button>
      </div>

      {error ? <div className="alert">{error}</div> : null}

      <div className="card">
        {loading ? (
          <p>Carregando...</p>
        ) : items.length === 0 ? (
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
                {items.map((p) => (
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

            <h3>Lista de Materiais</h3>
            <p className="muted">
              Adicione matérias-primas usadas para produzir uma unidade deste
              produto.
            </p>

            <div className="grid2">
              <div className="field">
                <label>Adicionar matéria-prima</label>
                <select
                  onChange={(e) => addBomItem(e.target.value)}
                  defaultValue=""
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
              <div className="card subtle">
                {draft.bom.map((b) => {
                  const rm = materials.find((x) => x.id === b.rawMaterialId);
                  return (
                    <div className="bom-row" key={b.rawMaterialId}>
                      <div>
                        <strong>
                          {rm ? `${rm.code} - ${rm.name}` : b.rawMaterialId}
                        </strong>
                      </div>

                      <div className="bom-controls">
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={b.quantityNeeded}
                          onChange={(e) =>
                            updateBomQty(
                              b.rawMaterialId,
                              Number(e.target.value),
                            )
                          }
                          disabled={isReadOnly}
                          readOnly={isReadOnly}
                        />

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
        autoCloseMs={overlay?.kind === "confirm-delete" ? 6000 : 6000}
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
