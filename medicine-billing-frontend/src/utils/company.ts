import { API_ORIGIN } from "../constants";

export const getCompanyDisplayName = (company: any): string =>
  (company?.companyName || company?.name || company?.company || "").trim();

const extractAssetValue = (asset: unknown): string => {
  if (!asset) return "";
  if (typeof asset === "string") return asset;
  if (typeof asset === "object") {
    const asAny = asset as any;
    return asAny.url || asAny.path || asAny.filename || "";
  }
  return "";
};

export const getUploadFileUrl = (asset: unknown): string => {
  const rawInput = extractAssetValue(asset);
  if (!rawInput) return "";
  const raw = rawInput.trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;

  const normalized = raw.replace(/\\/g, "/").replace(/^\/+/, "");
  const encodedPath = normalized
    .split("/")
    .filter(Boolean)
    .map((part) => encodeURIComponent(part))
    .join("/");

  if (normalized.startsWith("uploads/")) return `${API_ORIGIN}/${encodedPath}`;
  return `${API_ORIGIN}/uploads/${encodedPath}`;
};

export const getCompanyLogoUrl = (logo: unknown): string => getUploadFileUrl(logo);
