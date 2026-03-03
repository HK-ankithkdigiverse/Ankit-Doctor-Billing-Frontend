import { api } from "../../common/services/apiClient";
import { dataOf } from "../../common/services/httpService";
import { PRODUCTS_API } from "../../constants";

export interface GetProductsParams {
  page?: number;
  limit?: number;
  category?: string;
  productType?: string;
  companyId?: string;
  medicalStoreId?: string;
  search?: string;
}

export const getProductsApi = (params?: GetProductsParams) =>
  dataOf(api.get(PRODUCTS_API.ROOT, { params }));

export const getProductByIdApi = (id: string) =>
  dataOf<any>(api.get(PRODUCTS_API.BY_ID(id))).then((data) => data?.product ?? data);

export const createProductApi = (payload: any) =>
  dataOf(api.post(PRODUCTS_API.ROOT, payload));

export const updateProductApi = ({
  id,
  data,
}: {
  id: string;
  data: any;
}) => dataOf(api.put(PRODUCTS_API.BY_ID(id), data));

export const deleteProductApi = (id: string) =>
  dataOf(api.delete(PRODUCTS_API.BY_ID(id)));

export const searchProductsApi = (search: string) =>
  getProductsApi({ search, limit: 20 }).then((data: any) => data?.products ?? []);

