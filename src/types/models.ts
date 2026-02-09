export type ProductBomItem = {
  rawMaterialId: string;
  rawMaterialName?: string;
  quantityNeeded: number;
};

export type Product = {
  id: string;
  code: string;
  name: string;
  unitValue: number;
  bom?: ProductBomItem[];
};

export type RawMaterial = {
  id: string;
  code: string;
  name: string;
  stockQuantity: number;
};

export type ProductCreateRequest = {
  code?: string;
  name: string;
  unitValue: number;
  bom: ProductBomItem[];
};

export type ProductUpdateRequest = ProductCreateRequest;

export type RawMaterialCreateRequest = {
  code?: string;
  name: string;
  stockQuantity: number;
};

export type RawMaterialUpdateRequest = RawMaterialCreateRequest;

export type ProductionSuggestion = {
  productId: string;
  productCode: string;
  productName: string;
  quantity: number;
  unitValue: number;
  totalValue: number;
};
