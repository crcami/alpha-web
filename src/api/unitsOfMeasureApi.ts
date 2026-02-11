import { apiRequest } from "./http";
import type { UnitOfMeasure } from "../types/models";

type UnitOfMeasureApi = {
  id: string;
  code: string;
  name: string;
};

export type UnitOfMeasureCreateRequest = {
  code: string;
  name: string;
};

function mapFromApi(u: UnitOfMeasureApi): UnitOfMeasure {
  return {
    id: u.id,
    code: u.code,
    name: u.name,
  };
}

function mapToApi(req: UnitOfMeasureCreateRequest): UnitOfMeasureCreateRequest {
  return {
    code: req.code,
    name: req.name,
  };
}

export const unitsOfMeasureApi = {
  async list(): Promise<UnitOfMeasure[]> {
    const res = await apiRequest<UnitOfMeasureApi[]>("/units-of-measure", "GET");
    return res.map(mapFromApi);
  },

  async get(id: string): Promise<UnitOfMeasure> {
    const res = await apiRequest<UnitOfMeasureApi>(`/units-of-measure/${id}`, "GET");
    return mapFromApi(res);
  },

  create: (req: UnitOfMeasureCreateRequest) =>
    apiRequest<UnitOfMeasureApi>("/units-of-measure", "POST", mapToApi(req)),

  update: (id: string, req: UnitOfMeasureCreateRequest) =>
    apiRequest<UnitOfMeasureApi>(`/units-of-measure/${id}`, "PUT", mapToApi(req)),

  remove: (id: string) => apiRequest<void>(`/units-of-measure/${id}`, "DELETE"),
};
