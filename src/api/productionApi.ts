import { apiRequest } from "./http";
import type { ProductionSuggestion } from "../types/models";

export type ProductionResponse = {
  items: ProductionSuggestion[];
  totalValue: number;
};

export const productionApi = {
  suggest: () => apiRequest<ProductionResponse>("/production/suggestions", "GET"),
};
