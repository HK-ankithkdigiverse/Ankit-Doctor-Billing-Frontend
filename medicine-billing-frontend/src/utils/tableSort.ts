const toSafeText = (value: unknown) => String(value ?? "").trim().toLowerCase();

const toSafeNumber = (value: unknown) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const toSafeTime = (value?: string | Date | null) => {
  if (!value) return 0;
  const time = (value instanceof Date ? value : new Date(value)).getTime();
  return Number.isFinite(time) ? time : 0;
};

export const sortText = (left: unknown, right: unknown) =>
  toSafeText(left).localeCompare(toSafeText(right));

export const sortNumber = (left: unknown, right: unknown) =>
  toSafeNumber(left) - toSafeNumber(right);

export const sortDateTime = (left?: string | Date | null, right?: string | Date | null) =>
  toSafeTime(left) - toSafeTime(right);

