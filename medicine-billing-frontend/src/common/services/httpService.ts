import type { AxiosResponse } from "axios";

export const dataOf = <T>(request: Promise<AxiosResponse<T>>): Promise<T> =>
  request.then(({ data }) => data);

