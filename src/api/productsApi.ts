import { apiRequest } from "./http";
import type { Product, ProductBomItem } from "../types/models";

type ProductApi = {
  id: string;
  code: string;
  name: string;
  value: number;
  unitOfMeasure?: string;
  bom?: ProductBomItem[];
};

export type ProductCreateRequest = {
  code: string;
  name: string;
  unitValue: number;
  unitOfMeasure: string;
};

type ProductCreateApiRequest = {
  code: string;
  name: string;
  value: number;
  unitOfMeasure: string;
};

function mapFromApi(p: ProductApi): Product {
  return {
    id: p.id,
    code: p.code,
    name: p.name,
    unitValue: p.value,
    unitOfMeasure: p.unitOfMeasure,
    bom: p.bom ?? [],
  };
}

function mapToApi(req: ProductCreateRequest): ProductCreateApiRequest {
  return {
    code: req.code,
    name: req.name,
    value: req.unitValue,
    unitOfMeasure: req.unitOfMeasure,
  };
}

export const productsApi = {
  async list(): Promise<Product[]> {
    const res = await apiRequest<ProductApi[]>("/products", "GET");
    return res.map(mapFromApi);
  },

  async get(id: string): Promise<Product> {
    const res = await apiRequest<ProductApi>(`/products/${id}`, "GET");
    return mapFromApi(res);
  },

  create: (req: ProductCreateRequest) =>
    apiRequest<ProductApi>("/products", "POST", mapToApi(req)),

  update: (id: string, req: ProductCreateRequest) =>
    apiRequest<ProductApi>(`/products/${id}`, "PUT", mapToApi(req)),

  remove: (id: string) => apiRequest<void>(`/products/${id}`, "DELETE"),

  getMaterials: (id: string) =>
    apiRequest<ProductBomItem[]>(`/products/${id}/materials`, "GET"),

  updateMaterials: (
    id: string,
    materials: { rawMaterialId: number; quantityRequired: number }[],
  ) => apiRequest<ProductBomItem[]>(`/products/${id}/materials`, "PUT", materials),
};
