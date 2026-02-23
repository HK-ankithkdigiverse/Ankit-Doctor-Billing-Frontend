export const getRole = (): string | null => {
  const match = document.cookie.match(/(^| )role=([^;]+)/);
  return match ? match[2] : null;
};
