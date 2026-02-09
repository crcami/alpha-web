import { apiRequest } from "./http";
import type { ProductBomItem } from "../types/models";

export type Product = {
  id: string;
  code: string;
  name: string;
  unitValue: number;
  bom?: ProductBomItem[];
};

type ProductApi = {
  id: string;
  code: string;
  name: string;
  value: number;
  bom?: ProductBomItem[];
};

export type ProductCreateRequest = {
  code: string;
  name: string;
  unitValue: number;
  bom: ProductBomItem[];
};

type ProductCreateApiRequest = {
  code: string;
  name: string;
  value: number;
  bom: ProductBomItem[];
};

function mapFromApi(p: ProductApi): Product {
  return {
    id: p.id,
    code: p.code,
    name: p.name,
    unitValue: p.value,
    bom: p.bom ?? [],
  };
}

function mapToApi(req: ProductCreateRequest): ProductCreateApiRequest {
  return {
    code: req.code,
    name: req.name,
    value: req.unitValue,
    bom: req.bom,
  };
}

export const productsApi = {
  async list(): Promise<Product[]> {
    const res = await apiRequest<ProductApi[]>("/products", "GET");
    return res.map(mapFromApi);
  },

  create: (req: ProductCreateRequest) =>
    apiRequest<void>("/products", "POST", mapToApi(req)),

  update: (id: string, req: ProductCreateRequest) =>
    apiRequest<void>(`/products/${id}`, "PUT", mapToApi(req)),

  remove: (id: string) => apiRequest<void>(`/products/${id}`, "DELETE"),
};
