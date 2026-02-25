import { API_ORIGIN } from "../constants";

export const getCompanyDisplayName = (company: any): string =>
  (company?.companyName || company?.name || company?.company || "").trim();

const extractLogoValue = (logo: unknown): string => {
  if (!logo) return "";
  if (typeof logo === "string") return logo;
  if (typeof logo === "object") {
    const asAny = logo as any;
    return asAny.url || asAny.path || asAny.filename || "";
  }
  return "";
};

export const getCompanyLogoUrl = (logo: unknown): string => {
  const rawInput = extractLogoValue(logo);
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

