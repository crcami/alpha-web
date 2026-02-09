import { apiRequest } from "./http";
import type {
  RawMaterial,
  RawMaterialCreateRequest,
  RawMaterialUpdateRequest,
} from "../types/models";

export const rawMaterialsApi = {
  list: () => apiRequest<RawMaterial[]>("/raw-materials", "GET"),
  create: (req: RawMaterialCreateRequest) =>
    apiRequest<RawMaterial>("/raw-materials", "POST", req),
  update: (id: string, req: RawMaterialUpdateRequest) =>
    apiRequest<RawMaterial>(`/raw-materials/${id}`, "PUT", req),
  remove: (id: string) => apiRequest<void>(`/raw-materials/${id}`, "DELETE"),
};
