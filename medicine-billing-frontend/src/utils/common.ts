export const OBJECT_ID_REGEX = /^[a-f\d]{24}$/i;

export const isObjectId = (value?: unknown): value is string =>
  typeof value === "string" && OBJECT_ID_REGEX.test(value);

export const clean = (value?: unknown) =>
  typeof value === "string" && value.trim() ? value.trim() : undefined;

export const lower = (value?: unknown) => clean(value)?.toLowerCase();
