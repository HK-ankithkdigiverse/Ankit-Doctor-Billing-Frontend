import { api } from "./axios";
import { dataOf } from "./http";

export interface GetUploadsParams {
  page?: number;
  limit?: number;
  type?: "image" | "pdf";
}

export interface GetUploadsResponse {
  files: string[];
  state: {
    page: number;
    limit: number;
    totalPages: number;
  };
  totalData: number;
}

export const uploadFilesApi = async (files: File[]): Promise<string[]> => {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  const data = await dataOf<any>(api.post("/upload", formData));
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
  return dataOf<GetUploadsResponse>(api.get("/upload", { params }));
};

export const deleteUploadApi = async (payload: { url?: string; filename?: string }) => {
  return dataOf(api.delete("/upload", { data: payload }));
};
