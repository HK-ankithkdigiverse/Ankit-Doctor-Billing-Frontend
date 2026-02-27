export const PINCODE_REGEX = /^[0-9]{6}$/;
export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

export const pincodeRule = {
  pattern: PINCODE_REGEX,
  message: "Pincode must be exactly 6 digits",
};

export const panRule = {
  pattern: PAN_REGEX,
  message: "PAN card number must match format ABCDE1234F",
};

export const nonWhitespaceRule = (label: string) => ({
  validator: (_: unknown, value: string | undefined) => {
    if (value === undefined || value === null) return Promise.resolve();
    if (typeof value === "string" && value.trim().length === 0) {
      return Promise.reject(new Error(`${label} is required`));
    }
    return Promise.resolve();
  },
});

export const trimIfString = (value?: string) => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
};

export const getErrorMessage = (error: any): string => {
  const responseData = error?.response?.data;
  if (typeof responseData?.message === "string") return responseData.message;
  if (typeof responseData?.error === "string") return responseData.error;
  if (typeof error?.message === "string") return error.message;
  return "";
};

export const isDuplicateEmailError = (error: any) => {
  const errorText = getErrorMessage(error);
  return (
    error?.response?.status === 409 ||
    /duplicate key/i.test(errorText) ||
    (/(already|exists|taken|duplicate)/i.test(errorText) && /(email|user)/i.test(errorText))
  );
};

