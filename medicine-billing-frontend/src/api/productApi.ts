import { api } from "./axios";
import { PRODUCTS_API } from "../constants";

export const getProductsApi = async (params?: {
  page?: number;
  limit?: number;
  category?: string;
  productType?: string;
  companyId?: string;
  search?: string;
}) => {
  const { data } = await api.get(PRODUCTS_API.ROOT, {
    params,
  });
  return data;
};

// ✅ Get single product
export const getProductByIdApi = async (id: string) => {
  const { data } = await api.get(PRODUCTS_API.BY_ID(id));
  return data;
};


export const createProductApi = async (formData: any) => {
  const { data } = await api.post(PRODUCTS_API.ROOT, formData);
  return data;
};

export const updateProductApi = ({
  id,
  data,
}: {
  id: string;
  data: any;
}) => {
  return api.put(PRODUCTS_API.BY_ID(id), data).then(res => res.data);
};


export const deleteProductApi = async (id: string) => {
  const { data } = await api.delete(PRODUCTS_API.BY_ID(id));
  return data;
};

// api/products.ts
export const searchProductsApi = (search: string) =>
  api.get(PRODUCTS_API.ROOT, { params: { search, limit: 20 } })
     .then(res => res.data.products);
