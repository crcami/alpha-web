import { useEffect, useState } from "react";
import { X } from "lucide-react";

import { rawMaterialsApi } from "../api/rawMaterialsApi";
import type { RawMaterial } from "../types/models";

import "../css/ProductsModal.css";

type Draft = {
  id?: string;
  name: string;
  stockQuantity: string;
};

/** Renders the raw materials page. */
export function RawMaterialsPage() {
  const [items, setItems] = useState<RawMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>({ name: "", stockQuantity: "0" });

  async function load() {
    setLoading(true);
    setError(null);

    try {
      const r = await rawMaterialsApi.list();
      setItems(r);
    } catch {
      setError("Não foi possível carregar as matérias-primas.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function openCreate() {
    setDraft({ name: "", stockQuantity: "0" });
    setModalOpen(true);
  }

  function openEdit(r: RawMaterial) {
    setDraft({
      id: r.id,
      name: r.name,
      stockQuantity: String(r.stockQuantity),
    });
    setModalOpen(true);
  }

  async function save() {
    setError(null);

    const qty = Number(draft.stockQuantity);

    if (!draft.name.trim()) {
      setError("Nome é obrigatório.");
      return;
    }

    if (!Number.isFinite(qty) || qty < 0) {
      setError("Quantidade em estoque inválida.");
      return;
    }

    try {
      const payload = {
        name: draft.name.trim(),
        stockQuantity: qty,
      };

      if (draft.id) {
        await rawMaterialsApi.update(draft.id, payload);
      } else {
        await rawMaterialsApi.create(payload);
      }

      setModalOpen(false);
      await load();
    } catch {
      setError("Não foi possível salvar a matéria-prima.");
    }
  }

  async function remove(id: string) {
    setError(null);
    try {
      await rawMaterialsApi.remove(id);
      await load();
    } catch {
      setError("Não foi possível deletar a matéria-prima.");
    }
  }

  return (
    <section className="page">
      <div className="page-head">
        <h1>Matérias-primas</h1>
        <button className="btn primary" onClick={openCreate} type="button">
          Nova matéria-prima
        </button>
      </div>

      {error ? <div className="alert">{error}</div> : null}

      <div className="card">
        {loading ? (
          <p>Carregando...</p>
        ) : items.length === 0 ? (
          <p>Nenhuma matéria-prima encontrada.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nome</th>
                  <th>Estoque</th>
                  <th className="right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.map((r) => (
                  <tr key={r.id}>
                    <td>{r.code}</td>
                    <td>{r.name}</td>
                    <td>{r.stockQuantity}</td>
                    <td className="right">
                      <button
                        className="btn ghost"
                        onClick={() => openEdit(r)}
                        type="button"
                      >
                        Editar
                      </button>
                      <button
                        className="btn danger"
                        onClick={() => remove(r.id)}
                        type="button"
                      >
                        Deletar
                      </button>
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
                {draft.id ? "Editar matéria-prima" : "Nova matéria-prima"}
              </h2>

              <button
                className="modal-close"
                onClick={() => setModalOpen(false)}
                type="button"
                aria-label="Close modal"
                title="Fechar"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid2">
              <div className="field">
                <label>Nome</label>
                <input
                  value={draft.name}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, name: e.target.value }))
                  }
                  placeholder="Nome da matéria-prima"
                />
              </div>

              <div className="field">
                <label>Quantidade em estoque</label>
                <input
                  value={draft.stockQuantity}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      stockQuantity: e.target.value,
                    }))
                  }
                  type="number"
                  min={0}
                  step="1"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="btn ghost"
                onClick={() => setModalOpen(false)}
                type="button"
              >
                Cancelar
              </button>
              <button className="btn primary" onClick={save} type="button">
                Salvar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
