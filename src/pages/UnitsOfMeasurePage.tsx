import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Eye, Pencil, Trash2, X, Plus } from "lucide-react";

import { unitsOfMeasureApi } from "../api/unitsOfMeasureApi";
import type { UnitOfMeasure } from "../types/models";

import { OverlayCard } from "../components/OverlayCard";

import "../css/ProductsPage.css";
import "../css/ThemePages.css";

type ModalMode = "create" | "edit" | "view";

type Draft = {
  id?: string;
  code: string;
  name: string;
};

type OverlayState =
  | {
      kind: "confirm-delete";
      unit: UnitOfMeasure;
    }
  | {
      kind: "success" | "error";
      title: string;
      message: string;
    }
  | null;

type SortOption = "name-asc" | "name-desc" | "abbr-asc" | "abbr-desc";

export function UnitsOfMeasurePage() {
  const [items, setItems] = useState<UnitOfMeasure[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState<SortOption>("name-asc");

  const [error, setError] = useState<string | null>(null);
  const [overlay, setOverlay] = useState<OverlayState>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");

  const [draft, setDraft] = useState<Draft>({
    code: "",
    name: "",
  });

  const isReadOnly = modalMode === "view";

  const sortedItems = useMemo(() => {
    const sorted = [...items];

    switch (sortOption) {
      case "name-asc":
        sorted.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
      case "name-desc":
        sorted.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
        break;
      case "abbr-asc":
        sorted.sort((a, b) => (a.code || "").localeCompare(b.code || ""));
        break;
      case "abbr-desc":
        sorted.sort((a, b) => (b.code || "").localeCompare(a.code || ""));
        break;
    }

    return sorted;
  }, [items, sortOption]);

  async function load() {
    setLoading(true);
    setError(null);

    try {
      const units = await unitsOfMeasureApi.list();
      setItems(units);
    } catch {
      setError("Não foi possível carregar as unidades de medida.");
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
    setDraft({
      code: "",
      name: "",
    });
    setModalOpen(true);
  }

  function openEdit(unit: UnitOfMeasure) {
    setError(null);
    setModalMode("edit");
    setDraft({
      id: unit.id,
      code: unit.code ?? "",
      name: unit.name ?? "",
    });
    setModalOpen(true);
  }

  function openView(unit: UnitOfMeasure) {
    setError(null);
    setModalMode("view");
    setDraft({
      id: unit.id,
      code: unit.code ?? "",
      name: unit.name ?? "",
    });
    setModalOpen(true);
  }

  async function save() {
    setError(null);

    const code = draft.code.trim();
    const name = draft.name.trim();

    if (!code) {
      setError("A abreviação é obrigatória.");
      return;
    }

    if (!name) {
      setError("O nome é obrigatório.");
      return;
    }

    const payload = {
      code,
      name,
    };

    try {
      if (draft.id) {
        await unitsOfMeasureApi.update(draft.id, payload);
      } else {
        await unitsOfMeasureApi.create(payload);
      }

      setOverlay({
        kind: "success",
        title: "Sucesso",
        message: "Unidade de medida salva com sucesso!",
      });
      closeModal();
      await load();
    } catch (err: unknown) {
      let errorMessage = "Não foi possível salvar a unidade de medida.";

      // ApiError já contém a mensagem extraída da API
      if (err instanceof Error) {
        errorMessage = err.message;
      }

      setOverlay({
        kind: "error",
        title: "Erro ao salvar",
        message: errorMessage,
      });
    }
  }

  function askDelete(unit: UnitOfMeasure) {
    setError(null);
    setOverlay({ kind: "confirm-delete", unit });
  }

  async function confirmDelete(unit: UnitOfMeasure) {
    try {
      await unitsOfMeasureApi.remove(unit.id);
      await load();
      setOverlay({
        kind: "success",
        title: "Excluído!",
        message: "Unidade de medida excluída com sucesso.",
      });
    } catch (err: unknown) {
      let errorMessage = "Não foi possível deletar a unidade de medida.";

      // ApiError já contém a mensagem extraída da API
      if (err instanceof Error) {
        errorMessage = err.message;
      }

      setOverlay({
        kind: "error",
        title: "Erro ao excluir",
        message: errorMessage,
      });
    }
  }

  const overlayOpen = overlay !== null;

  return (
    <section className="page products-page">
      <div className="page-head">
        <h1>Gerenciar Unidades de Medida</h1>
        <button
          className="btn primary btn-solid"
          onClick={openCreate}
          type="button"
        >
          <Plus size={18} />
          Nova unidade de medida
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
            <option value="abbr-asc">Abreviação (A-Z)</option>
            <option value="abbr-desc">Abreviação (Z-A)</option>
          </select>
        </div>
      </div>

      {error ? <div className="alert">{error}</div> : null}

      <div className="card">
        {loading ? (
          <p>Carregando...</p>
        ) : sortedItems.length === 0 ? (
          <p>Nenhuma unidade de medida encontrada.</p>
        ) : (
          <div className="table-wrap">
            <table className="table table-brand">
              <thead>
                <tr>
                  <th>Abreviação</th>
                  <th>Nome</th>
                  <th className="right">Ações</th>
                </tr>
              </thead>

              <tbody>
                {sortedItems.map((unit) => (
                  <tr key={unit.id}>
                    <td data-label="Abreviação">{unit.code}</td>
                    <td data-label="Nome">{unit.name}</td>

                    <td className="right" data-label="Ações">
                      <div className="row-actions">
                        <button
                          className="icon-btn"
                          onClick={() => openView(unit)}
                          type="button"
                          aria-label="Visualizar"
                          title="Visualizar"
                          data-tip="Visualizar"
                        >
                          <Eye size={18} />
                        </button>

                        <button
                          className="icon-btn"
                          onClick={() => openEdit(unit)}
                          type="button"
                          aria-label="Editar"
                          title="Editar"
                          data-tip="Editar"
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          className="icon-btn danger"
                          onClick={() => askDelete(unit)}
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
                  ? "Nova unidade de medida"
                  : modalMode === "edit"
                    ? "Editar unidade de medida"
                    : "Visualizar unidade de medida"}
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
                <label>Abreviação</label>
                <input
                  value={draft.code}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, code: e.target.value }))
                  }
                  placeholder="Ex: kg, un, ml"
                  autoComplete="off"
                  disabled={isReadOnly}
                  readOnly={isReadOnly}
                />
              </div>

              <div className="field">
                <label>Nome completo</label>
                <input
                  value={draft.name}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, name: e.target.value }))
                  }
                  placeholder="Ex: Quilogramas, Unidades, Mililitros"
                  disabled={isReadOnly}
                  readOnly={isReadOnly}
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
                Caso exclua a unidade de medida, não tem como reverter. Deseja
                realizar essa ação?
              </p>

              <p className="overlay-product-info">
                <strong>Unidade:</strong> {overlay.unit.code} —{" "}
                {overlay.unit.name}
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
                  const target = overlay.unit;
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
