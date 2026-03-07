import type { BillTaxMode } from "../types/bill";

export type BackendTaxType = "INTER" | "INTRA";

type TaxSource = {
  gstType?: string | null;
  taxType?: string | null;
  gstPercent?: unknown;
  gst?: unknown;
};

export const toBillTaxMode = (value?: string | null): BillTaxMode =>
  value === "IGST" ? "IGST" : "CGST_SGST";

export const toBackendTaxType = (gstType: BillTaxMode): BackendTaxType =>
  gstType === "IGST" ? "INTER" : "INTRA";

export const resolveBillTaxMode = (value?: TaxSource | null): BillTaxMode =>
  value?.gstType === "IGST" || value?.taxType === "INTER" ? "IGST" : "CGST_SGST";

export const normalizePercent = (value: unknown): number => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.min(100, Math.max(0, Math.floor(numeric)));
};

export const resolveStoreGstPercent = (value?: TaxSource | null): number =>
  normalizePercent(value?.gstPercent ?? value?.gst ?? 0);

export const toStoreTaxPayload = (gstType: BillTaxMode) => {
  const normalizedGstType = toBillTaxMode(gstType);
  return {
    gstType: normalizedGstType,
    taxType: toBackendTaxType(normalizedGstType),
  };
};
