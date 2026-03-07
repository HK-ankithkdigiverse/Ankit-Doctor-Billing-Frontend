import { api } from "./axios";
import { buildPagedQueryParams, buildQueryParams } from "./pagination";
import type { GetUploadsParams, GetUploadsResponse } from "../types/api";

export type { GetUploadsParams, GetUploadsResponse } from "../types/api";

type GetAllUploadsParams = Omit<GetUploadsParams, "page" | "limit">;

export const uploadFilesApi = async (files: File[]): Promise<string[]> => {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  const { data } = await api.post("/upload", formData);
  return (data?.files || []) as string[];
};

export const uploadSingleFileApi = async (file: File): Promise<string> => {
  const files = await uploadFilesApi([file]);
  const uploadedPath = files[0];

  if (!uploadedPath) {
    throw new Error("Upload response did not include file path");
  }

  return uploadedPath;
};

export const getUploadsApi = async (
  params?: GetUploadsParams
): Promise<GetUploadsResponse> => {
  const { data } = await api.get<GetUploadsResponse>("/upload", {
    params: buildPagedQueryParams({
      page: params?.page ?? 1,
      limit: params?.limit,
      type: params?.type,
    }),
  });
  return data;
};

export const getAllUploadsApi = async (
  params?: GetAllUploadsParams
): Promise<GetUploadsResponse> => {
  const { data } = await api.get<GetUploadsResponse>("/upload", {
    params: buildQueryParams(params),
  });
  return data;
};

export const deleteUploadApi = async (payload: { url?: string; filename?: string }) => {
  const { data } = await api.delete("/upload", { data: payload });
  return data;
};
