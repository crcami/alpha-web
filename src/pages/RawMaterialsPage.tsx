import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Eye, Pencil, Trash2, X, Plus } from "lucide-react";
import { NumericFormat } from "react-number-format";

import { rawMaterialsApi } from "../api/rawMaterialsApi";
import type { RawMaterial } from "../types/models";
import { OverlayCard } from "../components/OverlayCard";

import "../css/ProductsModal.css";
import "../css/RawMaterialsPage.css";

type ModalMode = "create" | "edit" | "view";

type Draft = {
  id?: string;
  code: string;
  name: string;
  stockQuantity: string;
};

type OverlayState = {
  open: boolean;
  variant: "warning" | "success" | "error" | "info";
  title: string;
  message: React.ReactNode;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  autoCloseMs?: number;
};

type SortOption = "name-asc" | "name-desc" | "stock-asc" | "stock-desc";

export function RawMaterialsPage() {
  const [items, setItems] = useState<RawMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState<SortOption>("name-asc");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");

  const [draft, setDraft] = useState<Draft>({
    code: "",
    name: "",
    stockQuantity: "0",
  });

  const [overlay, setOverlay] = useState<OverlayState>({
    open: false,
    variant: "info",
    title: "",
    message: null,
  });

  const isReadOnly = modalMode === "view";

  const modalTitle = useMemo(() => {
    if (modalMode === "create") return "Nova matéria-prima";
    if (modalMode === "edit") return "Editar matéria-prima";
    return "Visualizar matéria-prima";
  }, [modalMode]);

  const sortedItems = useMemo(() => {
    const sorted = [...items];

    switch (sortOption) {
      case "name-asc":
        sorted.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
      case "name-desc":
        sorted.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
        break;
      case "stock-asc":
        sorted.sort((a, b) => (a.stockQuantity || 0) - (b.stockQuantity || 0));
        break;
      case "stock-desc":
        sorted.sort((a, b) => (b.stockQuantity || 0) - (a.stockQuantity || 0));
        break;
    }

    return sorted;
  }, [items, sortOption]);

  function closeOverlay() {
    setOverlay((s) => ({ ...s, open: false }));
  }

  function showError(title: string, message: React.ReactNode) {
    setOverlay({
      open: true,
      variant: "error",
      title,
      message,
      autoCloseMs: 6000,
    });
  }

  function showSuccess(title: string, message: React.ReactNode) {
    setOverlay({
      open: true,
      variant: "success",
      title,
      message,
      autoCloseMs: 6000,
    });
  }

  function showConfirmDelete(rawMaterial: RawMaterial) {
    setOverlay({
      open: true,
      variant: "warning",
      title: "Atenção!",
      icon: <AlertTriangle size={22} />,
      message: (
        <div>
          <div style={{ marginBottom: 8 }}>
            Caso exclua a matéria-prima <strong>{rawMaterial.name}</strong>, não
            tem como reverter.
          </div>
          <div>Deseja realizar essa ação?</div>
        </div>
      ),
      actions: (
        <>
          <button className="btn ghost" onClick={closeOverlay} type="button">
            Não
          </button>
          <button
            className="btn danger"
            onClick={() => void remove(rawMaterial.id)}
            type="button"
          >
            Sim, excluir
          </button>
        </>
      ),
      autoCloseMs: 6000,
    });
  }

  async function load() {
    setLoading(true);
    try {
      const r = await rawMaterialsApi.list();
      setItems(r);
    } catch {
      showError(
        "Erro ao carregar",
        "Não foi possível carregar as matérias-primas.",
      );
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
    setModalMode("create");
    setDraft({ code: "", name: "", stockQuantity: "0" });
    setModalOpen(true);
  }

  function openEdit(r: RawMaterial) {
    setModalMode("edit");
    setDraft({
      id: r.id,
      code: r.code ?? "",
      name: r.name ?? "",
      stockQuantity: Number.isFinite(r.stockQuantity)
        ? String(r.stockQuantity)
        : "0",
    });
    setModalOpen(true);
  }

  function openView(r: RawMaterial) {
    setModalMode("view");
    setDraft({
      id: r.id,
      code: r.code ?? "",
      name: r.name ?? "",
      stockQuantity: Number.isFinite(r.stockQuantity)
        ? String(r.stockQuantity)
        : "0",
    });
    setModalOpen(true);
  }

  async function save() {
    const code = draft.code.trim();
    const name = draft.name.trim();
    const qty = Number(draft.stockQuantity || "0");

    if (!code) {
      showError("Validação", "O código é obrigatório.");
      return;
    }

    if (!name) {
      showError("Validação", "O nome é obrigatório.");
      return;
    }

    if (!Number.isFinite(qty) || qty < 0 || !Number.isInteger(qty)) {
      showError(
        "Validação",
        "A quantidade em estoque deve ser um inteiro ≥ 0.",
      );
      return;
    }

    try {
      const payload = { code, name, stockQuantity: qty };

      if (draft.id) {
        await rawMaterialsApi.update(draft.id, payload);
        showSuccess("Sucesso", "Matéria-prima atualizada com sucesso.");
      } else {
        await rawMaterialsApi.create(payload);
        showSuccess("Sucesso", "Matéria-prima criada com sucesso.");
      }

      closeModal();
      await load();
    } catch {
      showError("Erro ao salvar", "Não foi possível salvar a matéria-prima.");
    }
  }

  async function remove(id: string) {
    closeOverlay();
    try {
      await rawMaterialsApi.remove(id);
      showSuccess("Sucesso", "Matéria-prima excluída com sucesso.");
      await load();
    } catch {
      showError("Erro ao excluir", "Não foi possível deletar a matéria-prima.");
    }
  }

  return (
    <section className="page raw-materials-page">
      <div className="page-head">
        <h1>Matérias-primas</h1>

        <button
          className="btn primary btn-solid"
          onClick={openCreate}
          type="button"
        >
          <Plus size={18} />
          Nova matéria-prima
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
            <option value="stock-asc">Menor estoque</option>
            <option value="stock-desc">Maior estoque</option>
          </select>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <p>Carregando...</p>
        ) : sortedItems.length === 0 ? (
          <p>Nenhuma matéria-prima encontrada.</p>
        ) : (
          <div className="table-wrap">
            <table className="table table-brand">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nome</th>
                  <th>Estoque</th>
                  <th className="right">Ações</th>
                </tr>
              </thead>

              <tbody>
                {sortedItems.map((r) => (
                  <tr key={r.id}>
                    <td>{r.code}</td>
                    <td>{r.name}</td>
                    <td>{r.stockQuantity}</td>

                    <td className="right">
                      <div className="row-actions">
                        <button
                          className="icon-btn"
                          onClick={() => openView(r)}
                          type="button"
                          aria-label="Visualizar"
                          title="Visualizar"
                          data-tip="Visualizar"
                        >
                          <Eye size={18} />
                        </button>

                        <button
                          className="icon-btn"
                          onClick={() => openEdit(r)}
                          type="button"
                          aria-label="Editar"
                          title="Editar"
                          data-tip="Editar"
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          className="icon-btn danger"
                          onClick={() => showConfirmDelete(r)}
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
              <h2>{modalTitle}</h2>

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
                  className="modal-input"
                  value={draft.code}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, code: e.target.value }))
                  }
                  placeholder="Ex: MP-001"
                  autoComplete="off"
                  disabled={isReadOnly}
                  readOnly={isReadOnly}
                />
              </div>

              <div className="field">
                <label>Nome</label>
                <input
                  className="modal-input"
                  value={draft.name}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, name: e.target.value }))
                  }
                  placeholder="Nome da matéria-prima"
                  disabled={isReadOnly}
                  readOnly={isReadOnly}
                />
              </div>

              <div className="field">
                <label>Quantidade em estoque</label>

                <NumericFormat
                  className="modal-input"
                  value={draft.stockQuantity}
                  valueIsNumericString
                  onValueChange={(values) => {
                    setDraft((d) => ({
                      ...d,
                      stockQuantity: values.value || "0",
                    }));
                  }}
                  allowNegative={false}
                  decimalScale={0}
                  thousandSeparator="."
                  decimalSeparator=","
                  inputMode="numeric"
                  placeholder="0"
                  disabled={isReadOnly}
                />
              </div>
            </div>

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
        open={overlay.open}
        title={overlay.title}
        message={overlay.message}
        variant={overlay.variant}
        icon={overlay.icon}
        actions={overlay.actions}
        autoCloseMs={overlay.autoCloseMs}
        closeOnBackdrop
        onClose={closeOverlay}
      />
    </section>
  );
}
